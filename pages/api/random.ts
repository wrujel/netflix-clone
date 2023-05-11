import { NextApiRequest, NextApiResponse } from "next";

import prismadb from "../../libs/prismadb";
import serverAuth from "../../libs/serverAuth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  try {
    await serverAuth(req, res);

    const randomIndex = Math.floor(Math.random() * 4);

    const randomMovie = await prismadb.movie.findMany({
      where: {
        videoUrl: {
          startsWith: "https://commondatastorage",
        },
      },
      take: 1,
      skip: randomIndex,
    });

    return res.status(200).json(randomMovie[0]);
  } catch (error: any) {
    return res.status(400).end();
  }
}
