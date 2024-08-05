import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import axios from "axios";

export default async function handler(req, res) {
  verifyToken(req, res, async () => {
    const { roomId } = req.body;

    try {
      // Start a transaction to ensure all operations are performed or none
      await prisma.$transaction(async (prisma) => {
        // Delete all messages in the room
        await prisma.message.deleteMany({
          where: {
            roomId: roomId,
          },
        });

        // Find users with the room and update their roomIds
        const usersToUpdate = await prisma.user.findMany({
          where: {
            roomIds: {
              has: roomId,
            },
          },
          select: {
            id: true,
            roomIds: true,
          },
        });

        for (const user of usersToUpdate) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              roomIds: user.roomIds.filter(id => id !== roomId),
            },
          });
        }

        // Find videos with the room and update their roomIds
        const videosToUpdate = await prisma.video.findMany({
          where: {
            roomIds: {
              has: roomId,
            },
          },
          select: {
            id: true,
            roomIds: true,
          },
        });

        for (const video of videosToUpdate) {
          await prisma.video.update({
            where: { id: video.id },
            data: {
              roomIds: video.roomIds.filter(id => id !== roomId),
            },
          });
        }

        // Finally, delete the room
        await prisma.room.delete({
          where: {
            id: roomId,
          },
        });
      });

      // Delete the Liveblocks room
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