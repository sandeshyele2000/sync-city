import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  try {
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
  } catch (error) {
    console.log(error)
    return res.status(500);
  }
}
