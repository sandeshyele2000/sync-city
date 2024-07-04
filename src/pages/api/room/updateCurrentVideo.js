import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  try {
    const { id, videoId } = req.body;

    const updatedRoom = await prisma.room.update({
      where: { id },
      data: {
        currentVideoId: videoId,
      },
    });

    return res.status(200).json(updatedRoom);
  } catch (error) {
    return res.status(500).json({
      msg: "Internal server error",
      status: false,
      error: error.message,
    });
  }
}
