import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  verifyToken(req, res, async () => {
    try {
      const { room, video } = req.body;

      const updatedRoom = await prisma.room.update({
        where: { id: room.id },
        data: {
          videoIds: {
            set: room.videoIds.filter((id) => id !== video.id),
          },
          videos: {
            disconnect: { id: video.id },
          },
        },
        include: { videos: true },
      });

      if (updatedRoom) {
        await prisma.video.update({
          where: { id: video.id },
          data: {
            roomIds: {
              set: video.roomIds.filter((roomId) => roomId != updatedRoom.id),
            },
          },
        });
      }

      return res
        .status(200)
        .json({ message: "Video deleted successfully", room: updatedRoom });
    } catch (error) {
      console.error("Error deleting video from playlist:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
}
