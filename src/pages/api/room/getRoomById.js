import { verifyToken } from "@/lib/auth";
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  verifyToken(req, res, async () => {
    try {
      const { id } = req.query;

      const room = await prisma.room.findUnique({
        where: { id },
        include: {
          videos: true,
        },
      });

      if (!room) {
        return res.status(404).json({ msg: "Room not found", status: false });
      }

      return res.status(200).json({ msg: "Room fetched", status: true, room });
    } catch (error) {
      console.error("Room fetch error:", error);
      return res.status(500).json({
        msg: "Internal server error",
        status: false,
        error: error.message,
      });
    }
  });
}
