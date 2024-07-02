import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  try {
    const { username, nickname, email } = req.body;
    const user = await prisma.user.update({
      where: {
        email,
      },
      data: {
        username,
        nickname,
      },
      include:{
        rooms:true,
        messages: true
      }
    });

    return res.status(201).json(user);
  } catch (error) {
    console.error("User update error:", error);
    return res.status(500).json({
      msg: "Internal server error",
      status: false,
      error: error.message,
    });
  }
}
