import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  try {
    const { userId } = req.query;

    const userRooms = await prisma.user.findUnique({
      where: {
        id:userId,
      },
      include:{
        rooms: true
      }
    });

    console.log(userRooms)

    return res.status(201).json(userRooms.rooms);
  } catch (error) {
    console.error("User Fetch error:", error);
    return res.status(500).json({
      msg: "Internal server error",
      status: false,
      error: error.message,
    });
  }
}
