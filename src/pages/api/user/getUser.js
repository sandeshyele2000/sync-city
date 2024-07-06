// handler.js
import { verifyToken } from "@/lib/auth";
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id } = req.query;


    const user = await prisma.user.findUnique({
      where: { id },
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

    if (!user) {
      return res.status(404).json({ msg: "User not found", status: false });
    }

    return res.status(200).json({ msg: "User found", status: true, user });
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return res.status(500).json({ message: "Failed to fetch user" });
  }

}