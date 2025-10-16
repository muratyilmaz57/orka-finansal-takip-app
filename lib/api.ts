import axios from "axios";
import Constants from "expo-constants";

const { orkaBaseUrl } = Constants.expoConfig?.extra ?? {};

export type OrkaResponse<T> = {
  Data: T;
  ErrorCode?: number | null;
  ErrorMessage?: string | null;
  ErrorCodeDescription?: string | null;
  Message?: string | null;
};

export type OrkaLoginPayload = {
  apiKey: string;
  entegrApp?: string;
  entegrUserName?: string;
  connection?: string;
};

export type OrkaUser = {
  Key: string;
  KullaniciAdi?: string;
  Token: string;
  FirmaKodu?: string;
  Connection?: string;
  EntegreApp?: string;
  EntegreUserName?: string;
};

export type OrkaCompany = {
  ID: number;
  veritabaniadi: string;
  unvan1?: string;
  unvan2?: string;
  vergidairekod?: number;
  vergidairesi?: string;
};

export type OrkaSetCompanyResult = {
  Key: string;
  KullaniciAdi?: string;
  Token: string;
  FirmaKodu: string;
  Connection?: string;
  FirmaTanim?: OrkaCompany;
};

const orkaClient = axios.create({
  baseURL: typeof orkaBaseUrl === "string" && orkaBaseUrl.length > 0 ? orkaBaseUrl : "https://admin.orka.com.tr",
  timeout: 20000,
  headers: {
    accept: "application/json",
  },
});

function assertSuccess<T>(response: OrkaResponse<T>): T {
  if (response.ErrorCode) {
    const message = response.ErrorMessage || response.ErrorCodeDescription || "Orka API error";
    throw new Error(message);
  }
  return response.Data;
}

export async function login(payload: OrkaLoginPayload): Promise<OrkaUser> {
  const params: Record<string, string> = {
    ApiKey: payload.apiKey,
    EntegreApp: payload.entegrApp ?? "Orka Mobil",
    EntegreUserName: payload.entegrUserName ?? "Mobil Kullanıcı",
  };
  if (payload.connection) {
    params.Connection = payload.connection;
  }

  const { data } = await orkaClient.post<OrkaResponse<OrkaUser>>("/Auth/Login", undefined, { params });
  return assertSuccess(data);
}

export async function getCompanyCodes(token: string, year: number): Promise<OrkaCompany[]> {
  const { data } = await orkaClient.get<OrkaResponse<OrkaCompany[]>>("/Auth/GetCompanyCodes", {
    params: { CompanyDataBaseYear: year },
    headers: { Authorization: token },
  });
  return assertSuccess(data) ?? [];
}

export async function setCompanyCode(token: string, veritabaniadi: string): Promise<OrkaSetCompanyResult> {
  const { data } = await orkaClient.get<OrkaResponse<OrkaSetCompanyResult>>("/Auth/SetCompanyCode", {
    params: { VeritabaniKodu: veritabaniadi },
    headers: { Authorization: token },
  });
  return assertSuccess(data);
}

export type OrkaDocumentsResponse = any[];

export async function getDocuments(token: string, params?: Record<string, unknown>): Promise<OrkaDocumentsResponse> {
  const { data } = await orkaClient.get<OrkaResponse<OrkaDocumentsResponse>>("/ERP/Documents/GetAll", {
    params,
    headers: { Authorization: token },
  });
  return assertSuccess(data) ?? [];
}

export async function getAccountingReceipts(token: string, params?: Record<string, unknown>): Promise<any[]> {
  const { data } = await orkaClient.get<OrkaResponse<any[]>>("/ERP/Accounting/GetAllReceipts", {
    params,
    headers: { Authorization: token },
  });
  return assertSuccess(data) ?? [];
}

export async function getPayroll(token: string, params?: Record<string, unknown>): Promise<any[]> {
  const { data } = await orkaClient.get<OrkaResponse<any[]>>("/HRM/Reports/GetAllPayment", {
    params,
    headers: { Authorization: token },
  });
  return assertSuccess(data) ?? [];
}
