import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/context/AuthContext";
import { getAccountingReceipts, getDocuments, getPayroll } from "@/lib/api";

export function useDocumentsQuery(params?: Record<string, unknown>) {
  const { state, ensureFirmToken } = useAuth();
  const companyCode = state.selectedCompany?.veritabaniadi;
  return useQuery({
    queryKey: ["documents", companyCode, params],
    enabled: state.status === "companySelected",
    queryFn: async () => {
      const { token } = await ensureFirmToken();
      return getDocuments(token, params);
    },
  });
}

export function useReceiptsQuery(params?: Record<string, unknown>) {
  const { state, ensureFirmToken } = useAuth();
  const companyCode = state.selectedCompany?.veritabaniadi;
  return useQuery({
    queryKey: ["receipts", companyCode, params],
    enabled: state.status === "companySelected",
    queryFn: async () => {
      const { token } = await ensureFirmToken();
      return getAccountingReceipts(token, params);
    },
  });
}

export function usePayrollQuery(params?: Record<string, unknown>) {
  const { state, ensureFirmToken } = useAuth();
  const companyCode = state.selectedCompany?.veritabaniadi;
  return useQuery({
    queryKey: ["payroll", companyCode, params],
    enabled: state.status === "companySelected",
    queryFn: async () => {
      const { token } = await ensureFirmToken();
      return getPayroll(token, params);
    },
  });
}
