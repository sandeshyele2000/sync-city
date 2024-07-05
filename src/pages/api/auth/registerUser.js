
import prisma from "@/lib/prisma";
import { sign } from "jsonwebtoken";

export default async function handler(req, res) {
  try {
    const { email, firebaseId, username, profileImage } = req.body;

    if (!email || !firebaseId || !username) {
      return res.status(400).json({ msg: "All fields required", status: false });
    }


    // Upsert user in database
    let user = await prisma.user.upsert({
      where: { email },
      update: {
        firebaseId,
        username,
        profileImage,
      },
      create: {
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

    // Generate JWT token
    const token = sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d", // Token expires in 1 day
    });

    console.log("Token: ",token)

    // Send token and user data in response
    return res.status(201).json({user, token });
  } catch (error) {

    console.log(error)
    return res.status(500).json({
      msg: "Internal server error",
      status: false,
      error: error.message,
    });
  }
}
