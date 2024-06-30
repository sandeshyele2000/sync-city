import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { roomId } = req.query; 

  if (!roomId) {
    return res.status(400).json({ error: "Missing roomId" });
  }

  try {
    const videos = await prisma.room.findMany({
      where: {
        id: roomId,
      },
      include: {
        videos: true,
      },
    });

    console.log(videos);
    return res.status(200).json(videos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
