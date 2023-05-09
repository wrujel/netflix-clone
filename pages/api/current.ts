import { NextApiRequest, NextApiResponse } from "next";

import serverAuth from "../../libs/serverAuth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  try {
    const { user } = await serverAuth(req, res);

    return res.status(200).json(user);
  } catch (error: any) {
    return res.status(400).end();
  }
}
