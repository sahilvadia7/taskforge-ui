import { apiClient } from "@/lib/api-client";
import { SearchResultResponse } from "./types";

export async function searchAll(query: string): Promise<SearchResultResponse> {
    const response = await apiClient.get<SearchResultResponse>(`/search?q=${encodeURIComponent(query)}`);
    return response.data;
}
