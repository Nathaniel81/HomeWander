import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "./queryKeys";



const getProducts = async (filter) => {
  const response = await fetch(`/api/listings/${filter}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return data;
};

export const useGetListings = (filter) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_LISTINGS],
    queryFn: () => getProducts(filter),
    enabled: !!filter,
  });
};
