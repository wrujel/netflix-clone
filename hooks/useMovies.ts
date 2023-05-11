import useSWR from "swr";
import fetcher from "../libs/fetcher";

const useMovies = () => {
  const { data, error, isLoading } = useSWR("/api/movies", fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const actionList = data?.filter((movie: any) => movie.genre === "Action");
  const scifiList = data?.filter((movie: any) => movie.genre === "Sci-Fi");
  const otherList = data?.filter(
    (movie: any) => movie.genre !== "Sci-Fi" && movie.genre !== "Action"
  );

  return {
    actionList,
    scifiList,
    otherList,
    error,
    isLoading,
  };
};

export default useMovies;
