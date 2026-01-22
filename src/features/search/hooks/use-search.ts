import { useQuery } from "@tanstack/react-query";
import { searchAll } from "../api";
import { SearchResultResponse } from "../types";

export function useSearch(query: string) {
    return useQuery<SearchResultResponse>({
        queryKey: ["search", query],
        queryFn: () => searchAll(query),
        enabled: query.length >= 2,
        staleTime: 30000, // Cache for 30 seconds
    });
}
