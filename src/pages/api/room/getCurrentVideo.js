import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  try {
    const { id } = req.query;

    const room = await prisma.room.findUnique({
      where: { id },
      select: {
        currentVideoId: true,
      },
    });

    if (!room) {
      return res.status(404).json({
        msg: "Room not found",
        status: false,
      });
    }

    return res.status(200).json(room.currentVideoId);
  } catch (error) {
    return res.status(500).json({
      msg: "Internal server error",
      status: false,
      error: error.message,
    });
  }
}
