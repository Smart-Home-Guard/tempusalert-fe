import { paths } from "@/types/openapi-spec";
import createClient, { HeadersOptions } from "openapi-fetch";

function getHeaders(): HeadersOptions {
  if (typeof window !== "undefined") {
    return { jwt: localStorage.getItem("jwt")?.slice(1, -1) || "" };
  }
  return {};
}

export const apiClient = createClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
  credentials: "include",
  headers: getHeaders(),
});
