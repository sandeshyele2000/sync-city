import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  verifyToken(req, res, async () => {
    const { id } = req.query;

    try {
      const room = await prisma.room.findUnique({
        where: {
          id,
        },
        include: {
          videos: true,
        },
      });

      if (!room) {
        return res.status(404).json({ msg: "Room not found", status: false });
      }

      return res.status(200).json(room.videos);
    } catch (error) {
      console.error("Error fetching room videos:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
}
