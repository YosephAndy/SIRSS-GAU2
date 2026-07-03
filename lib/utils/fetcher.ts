/**
 * Generic SWR fetcher for client-side data fetching.
 * Used with useSWR hook for all API calls.
 */
export const fetcher = (url: string) => fetch(url).then((res) => res.json())
