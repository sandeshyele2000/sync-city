import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const  roomId  = req.body;

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
            roomIds: user.roomIds.filter(id => id !== roomId),
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
            roomIds: video.roomIds.filter(id => id !== roomId),
          },
        });
      }

      await prisma.room.delete({
        where: {
          id: roomId,
        },
      });
    

    res.status(200).json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
