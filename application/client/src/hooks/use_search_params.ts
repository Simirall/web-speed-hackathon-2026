import { useLocation } from "react-router";

export function useSearchParams(): [URLSearchParams] {
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);

  return [searchParams];
}
