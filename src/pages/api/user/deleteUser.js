import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  verifyToken(req, res, async () => {
    const { userId } = req.body;

    try {
      const rooms = await prisma.room.findMany({
        where: {
          hostId: userId,
        },
      });

      const roomIds = rooms.map((room) => room.id);

      console.log(roomIds);

      for (const roomId of roomIds) {
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
      }

      await prisma.room.deleteMany({
        where: {
          id: {
            in: roomIds,
          },
        },
      });

      await prisma.user.delete({
        where: {
          id: userId,
        },
      });

      res
        .status(200)
        .json({ message: "User and associated data deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });
}
