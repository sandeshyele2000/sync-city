import { verifyToken } from "@/lib/auth";
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    verifyToken(req, res, async () => {
      const { id, videoId } = req.body;

      const updatedRoom = await prisma.room.update({
        where: { id },
        data: {
          currentVideoId: videoId,
        },
      });

      return res.status(200).json(updatedRoom);
    });
  } catch (error) {
    console.error('Error updating current video ID:', error);
    return res.status(500).json({ message: 'Failed to update current video ID' });
  }
}
