import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    verifyToken(req, res, async () => {
      const { videoId, roomId } = req.body;

      await prisma.video.updateMany({
        where: { roomIds: roomId },
        data: { isPlaying: false },
      });

      const updatedVideo = await prisma.video.update({
        where: { videoId },
        data: { isPlaying: true },
      });

      return res.status(200).json(updatedVideo);
    });
  } catch (error) {
    console.error("Error setting playback status:", error);
    return res
      .status(500)
      .json({ message: "Failed to set playback status", error: error.message });
  }
}
