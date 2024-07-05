
import { verifyToken } from "@/lib/auth";
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    verifyToken(req, res, async () => {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          username: true,
          nickname: true,
          profileImage: true,
          rooms: true,
          roomIds: true,
          messages: true,
          isAdmin: true,
        },
      });
      
      return res.status(200).json(users);
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Failed to fetch users' });
  }
}
