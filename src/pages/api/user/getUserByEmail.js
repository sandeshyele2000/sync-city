import { verifyToken } from "@/lib/auth";
import prisma from "../../../lib/prisma";
import { sign } from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email } = req.query;

    const user = await prisma.user.findUnique({
      where: { email },
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

    if (user) {
      let token = sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      return res
        .status(200)
        .json({ msg: "User found", status: true, user, token });
    } else {
      return res.status(200).json({ msg: "User not found", status: false });
    }
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return res.status(500).json({ message: "Failed to fetch user" });
  }
}
