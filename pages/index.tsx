import type { NextPage, NextPageContext } from "next";
import { getSession, signOut } from "next-auth/react";
import useCurrentUser from "../hooks/useCurrentUser";

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
  const { data: user } = useCurrentUser();

  return (
    <>
      <h1 className="text-2xl text-green-500">Netflix</h1>
      <p className="text-white">Logged in as : {user?.name}</p>
      <p className="text-white">Logged in as : {user?.email}</p>
      <button onClick={() => signOut()} className="h-10 w-full bg-white">
        Log out
      </button>
    </>
  );
};

export default Home;
