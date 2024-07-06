import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import axios from "axios";

export default async function handler(req, res) {
  verifyToken(req, res, async () => {
    const { roomId } = req.body;

    try {
      const users = await prisma.user.findMany({
        where: {
          roomIds: {
            has: roomId,
          },
        },
      });

      for (const user of users) {
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            roomIds: user.roomIds.filter((id) => id !== roomId),
          },
        });
      }

      const videos = await prisma.video.findMany({
        where: {
          roomIds: {
            has: roomId,
          },
        },
      });

      for (const video of videos) {
        await prisma.video.update({
          where: {
            id: video.id,
          },
          data: {
            roomIds: video.roomIds.filter((id) => id !== roomId),
          },
        });
      }

      await prisma.room.delete({
        where: {
          id: roomId,
        },
      });

      await axios.delete(`https://api.liveblocks.io/v2/rooms/${roomId}`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_LIVEBLOCKS_API_KEY}`,
        },
      });

      res.status(200).json({ message: "Room deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });
}
