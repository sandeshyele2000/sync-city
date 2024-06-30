import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  try {
    const { email, firebaseId, username, profileImage } = req.body;

    if (!email || !firebaseId || !username ) {
      return res
        .status(400)
        .json({ msg: "All fields required", status: false });
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        firebaseId,
        username,
      },
      create: {
        email,
        firebaseId,
        username,
        nickname: "nickname", // user can change this form accounts page,
        profileImage
      },
      select:{
        id:true,
        email:true,
        username:true,
        nickname:true,
        profileImage:true,
        rooms:true,
        roomIds:true,
        messages: true
      }
    });

    console.log(user)

    return res.status(201).json({ msg: "User created", status: true, user });
  } catch (error) {
    return res
      .status(500)
      .json({
        msg: "Internal server error",
        status: false,
        error: error.message,
      });
  }
}
