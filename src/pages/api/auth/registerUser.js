import prisma from "@/lib/prisma";
import { sign } from "jsonwebtoken";

export default async function handler(req, res) {
  try {
    const { email, firebaseId, username, profileImage } = req.body;

    if (!email || !firebaseId || !username) {
      return res
        .status(400)
        .json({ msg: "All fields required", status: false });
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          firebaseId,
          username,
          nickname: "nickname",
          profileImage,
          isAdmin: false,
        },
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
    } 

    const token = sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(201).json({ user, token });
  } catch (error) {
    return res.status(500).json({
      msg: "Internal server error",
      status: false,
      error: error.message,
    });
  }
}
