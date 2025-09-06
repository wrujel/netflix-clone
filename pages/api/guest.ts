import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../libs/prismadb";
import bcrypt from "bcrypt";

// This endpoint returns credentials for a shared guest account.
// It creates the guest account if it doesn't exist. The password is set to a random value
// so callers must sign in using the returned email/password pair.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  try {
    const guestEmail = process.env.GUEST_EMAIL || "guest@example.com";

    // Reuse a fixed guest user row to avoid creating many users.
    let user = await prisma.user.findUnique({
      where: { email: guestEmail },
    });

    // Always generate a fresh password so anyone hitting the endpoint can use the returned
    // credentials immediately. We update the stored hashedPassword so the credentials work.
    const rawPassword = Math.random().toString(36).slice(2, 10);
    const hashedPassword = await bcrypt.hash(rawPassword, 12);

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: guestEmail,
          name: "Guest",
          hashedPassword,
          image: "",
          emailVerified: new Date(),
        },
      });
    } else {
      await prisma.user.update({
        where: { email: guestEmail },
        data: { hashedPassword },
      });
    }

    return res.status(200).json({ email: guestEmail, password: rawPassword });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: "Unable to retrieve guest user" });
  }
}
