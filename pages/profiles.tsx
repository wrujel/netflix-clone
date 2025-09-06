import { NextPageContext } from "next";
import { getSession } from "next-auth/react";
import useCurrentUser from "../hooks/useCurrentUser";
import { useRouter } from "next/navigation";
import Avatar from "../components/Avatar";

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

const Profiles = () => {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const isLoading = user === undefined;

  return (
    <div className="flex items-center h-screen justify-center">
      <div className="flex flex-col">
        <h1 className="text-3xl md:text-6xl text-white text-center">
          Who is watching
        </h1>
        <div className="flex items-center justify-center gap-8 mt-10">
          <div onClick={() => !isLoading && router.push("/")}>
            <div className="group flex-row w-44 mx-auto">
              {isLoading ? (
                <div
                  className="flex flex-col items-center"
                  aria-busy="true"
                  aria-live="polite"
                >
                  <div className="w-44 h-44 rounded-full overflow-hidden bg-gradient-to-r from-neutral-700 via-neutral-600 to-neutral-700 animate-pulse shadow-inner" />
                  <div className="mt-4 w-full flex flex-col items-center gap-2">
                    <div className="h-4 bg-neutral-700 rounded w-36" />
                    <div className="h-3 bg-neutral-700 rounded w-24" />
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className="
                      w-44
                      h-44
                      rounded-md
                      flex
                      items-center
                      justify-center
                      border-2
                      border-transparent
                      group-hover:border-white
                      group-hover:cursor-pointer
                      overflow-hidden
                    "
                  >
                    <Avatar />
                  </div>
                  <div
                    className="
                      mt-4
                      text-gray-400
                      text-2xl
                      text-center
                      group-hover:text-white
                    "
                  >
                    {user?.name}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profiles;
