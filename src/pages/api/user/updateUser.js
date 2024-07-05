import { verifyToken } from "@/lib/auth";
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    verifyToken(req, res, async () => {
      const { username, nickname, email } = req.body;

      const user = await prisma.user.update({
        where: { email },
        data: { username, nickname },
        include: { rooms: true, messages: true },
      });

      return res.status(200).json(user);
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
}
