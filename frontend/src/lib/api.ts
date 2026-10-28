export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1").replace(/\/$/, "");
export type ApiEnvelope<T> = { data: T };
export type PaginationMeta = { page: number; pageSize: number; total: number; totalPages: number };
export type ApiResult<T> = ApiEnvelope<T> & { pagination?: PaginationMeta };
export type ApiErrorBody = { error?: { code?: string; message?: string; details?: unknown } };
export class ApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly code?: string) { super(message); this.name = "ApiError"; }
}
type ApiRequestOptions = { method?: "GET" | "POST" | "PATCH"; body?: unknown; token?: string | null; signal?: AbortSignal };
export async function apiRequestResult<T>(path: string, options: ApiRequestOptions = {}): Promise<ApiResult<T>> {
  const headers = new Headers({ Accept: "application/json" });
  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  if (options.token) headers.set("Authorization", "Bearer " + options.token);
  let response: Response;
  try {
    response = await fetch(API_BASE_URL + path, { method: options.method ?? "GET", headers, credentials: "include", cache: "no-store", body: options.body === undefined ? undefined : JSON.stringify(options.body), signal: options.signal });
  } catch {
    throw new ApiError("We couldn't reach Wisey Tutors right now. Please try again in a moment.", 0, "NETWORK_ERROR");
  }
  if (response.status === 204) return { data: undefined as T };
  const payload = await response.json().catch(() => null) as ApiResult<T> & ApiErrorBody | null;
  if (!response.ok) throw new ApiError(payload?.error?.message ?? "Something went wrong. Please try again.", response.status, payload?.error?.code);
  return payload as ApiResult<T>;
}
export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  return (await apiRequestResult<T>(path, options)).data;
}
export type AdminUser = { id: string; email: string; displayName: string; role: string };
export type AuthResponse = { accessToken: string; tokenType: "Bearer"; expiresIn: number; user: AdminUser };
export type InquiryStatus = "NEW" | "CONTACTED" | "CONVERTED" | "CLOSED";
export type BookingRequestStatus = "NEW" | "CONTACTED" | "OFFERED" | "ACCEPTED" | "DECLINED" | "CLOSED";
export type Inquiry = { id: string; contactName: string; email: string; phone: string | null; learnerAgeGroup: string; subjectInterest: string; message: string; status: InquiryStatus; createdAt: string; updatedAt: string };
export type BookingRequest = { id: string; contactName: string; email: string; phone: string | null; learnerAgeGroup: string; subjectInterest: string; curriculum: string | null; mode: string; timezone: string; preferredStart: string | null; preferredEnd: string | null; message: string | null; status: BookingRequestStatus; createdAt: string; updatedAt: string };
export type Paginated<T> = { data: T[]; pagination: PaginationMeta };
