import type { NextPage, NextPageContext } from "next";
import { getSession, signOut } from "next-auth/react";
import useCurrentUser from "../hooks/useCurrentUser";
import Navbar from "../components/Navbar";
import Billboard from "../components/Billboard";
import MovieList from "../components/MovieList";
import useMovies from "../hooks/useMovies";
import useFavorites from "../hooks/useFavorites";

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/auth",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

const Home: NextPage = () => {
  const { data: movies = [] } = useMovies();
  const { data: favorites = [] } = useFavorites();

  return (
    <>
      <Navbar />
      <Billboard />
      <div className="pb-40">
        <MovieList title="Trending Now" data={movies} />
        <MovieList title="My List" data={favorites} />
      </div>
    </>
  );
};

export default Home;
