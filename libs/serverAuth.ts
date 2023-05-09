import { NextApiRequest } from "next";
import { getSession } from "next-auth/react";

import prismadb from "./prismadb";

const serverAuth = async (req: NextApiRequest) => {
  const session = await getSession({ req });

  if (!session?.user?.email) {
    throw new Error("Not authenticated");
  }

  const user = await prismadb.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  if (!user) {
    throw new Error("Not authenticated");
  }

  return { user };
};

export default serverAuth;
