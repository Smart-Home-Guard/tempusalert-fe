import { paths } from "@/types/openapi-spec";
import createClient from "openapi-fetch";

export const apiClient = createClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
  credentials: 'include'
});