import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  try {
    const { email } = req.query;
    const user = await prisma.user.findUnique({
      where: {
        email,
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

    return res.status(201).json({ msg: "User found", status: true, user });
  } catch (error) {
    console.error("User Fetch error:", error);
    return res.status(500).json({
      msg: "Internal server error",
      status: false,
      error: error.message,
    });
  }
}
