import { Decimal } from "decimal.js";

import { parseAmount } from "./number";

type DocumentLine = Record<string, unknown> & {
  IOdurum?: number | string;
  nettutar?: number | string;
  satirtltutar?: number | string;
};

type Document = {
  STK_STOKSATIR?: DocumentLine[];
  STK_STOKBASLIK?: Record<string, unknown>;
};

export type DashboardSummary = {
  totalSales: number;
  totalPurchases: number;
  profit: number;
  transactionCount: number;
};

export function buildDashboardSummary(documents: Document[] = []): DashboardSummary {
  let totalSales = new Decimal(0);
  let totalPurchases = new Decimal(0);
  let transactionCount = 0;

  for (const document of documents) {
    const lines = document.STK_STOKSATIR ?? [];
    let documentSales = new Decimal(0);
    let documentPurchases = new Decimal(0);
    let hasTransaction = false;

    for (const line of lines) {
      const amount = resolveAmount(line);
      if (!amount) continue;
      hasTransaction = true;
      if (line.IOdurum === -1) {
        documentSales = documentSales.plus(amount);
      } else if (line.IOdurum === 1) {
        documentPurchases = documentPurchases.plus(amount);
      }
    }

    if (!hasTransaction || (documentSales.isZero() && documentPurchases.isZero())) {
      const headerAmount = resolveHeaderAmount(document.STK_STOKBASLIK);
      const direction = resolveDirection(document);
      if (headerAmount !== null && direction !== null) {
        const decimalAmount = new Decimal(headerAmount);
        hasTransaction = true;
        if (direction === -1) {
          documentSales = decimalAmount;
          documentPurchases = new Decimal(0);
        } else if (direction === 1) {
          documentPurchases = decimalAmount;
          documentSales = new Decimal(0);
        }
      }
    }

    if (hasTransaction) {
      transactionCount += 1;
      totalSales = totalSales.plus(documentSales);
      totalPurchases = totalPurchases.plus(documentPurchases);
    }
  }

  const profit = totalSales.minus(totalPurchases);

  return {
    totalSales: Number(totalSales.toFixed(2)),
    totalPurchases: Number(totalPurchases.toFixed(2)),
    profit: Number(profit.toFixed(2)),
    transactionCount,
  };
}

export function getDocumentAmount(document: any): number | null {
  const lines: DocumentLine[] = document?.STK_STOKSATIR ?? [];
  let total = 0;
  let hasLineAmount = false;

  for (const line of lines) {
    const amount = resolveAmount(line);
    if (!amount) continue;
    hasLineAmount = true;
    total += Number(amount.toFixed(2));
  }

  if (hasLineAmount) {
    return Number(total.toFixed(2));
  }

  const headerAmount = resolveHeaderAmount(document?.STK_STOKBASLIK);
  if (headerAmount === null) return null;
  return Number(headerAmount.toFixed(2));
}

export function getDocumentDirection(document: any): number | null {
  return resolveDirection(document);
}

function resolveAmount(line: DocumentLine): Decimal | null {
  const primary = parseAmount(line.nettutar ?? line.satirtltutar);
  if (primary !== null) {
    try {
      return new Decimal(primary);
    } catch {}
  }

  for (const [key, value] of Object.entries(line)) {
    if (typeof value === "number") {
      if (Number.isFinite(value) && value !== 0) {
        return new Decimal(value);
      }
      continue;
    }
    if (typeof value === "string") {
      const parsed = parseAmount(value);
      if (parsed !== null && parsed !== 0) {
        try {
          return new Decimal(parsed);
        } catch {}
      }
    }
  }

  return null;
}

function resolveHeaderAmount(header: Record<string, unknown> | undefined): number | null {
  if (!header) return null;
  const entries = Object.entries(header);
  for (const [key, value] of entries) {
    const lower = key.toLowerCase();
    if (!/(toplam|tutar)/.test(lower)) continue;
    if (/adet|tip|kod|no/.test(lower)) continue;
    const parsed = parseAmount(value);
    if (parsed !== null && parsed !== 0) {
      return parsed;
    }
  }
  return null;
}

function resolveDirection(document: any): number | null {
  const header = document?.STK_STOKBASLIK ?? {};
  const candidates = [header.IOdurum, header.IODurum, header.alisSatis, header.AlisSatis, document?.IOdurum];
  for (const candidate of candidates) {
    if (typeof candidate === "number") {
      if (candidate > 0) return 1;
      if (candidate < 0) return -1;
    }
    if (typeof candidate === "string") {
      const parsed = parseInt(candidate, 10);
      if (!Number.isNaN(parsed)) {
        if (parsed > 0) return 1;
        if (parsed < 0) return -1;
      }
      if (candidate.toLowerCase() === "alis") return 1;
      if (candidate.toLowerCase() === "satis") return -1;
    }
  }
  const firstLine = (document?.STK_STOKSATIR ?? [])[0];
  if (firstLine && typeof firstLine.IOdurum === "number") {
    return firstLine.IOdurum;
  }
  return null;
}
