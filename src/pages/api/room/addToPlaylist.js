import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { roomId, video } = req.body;

    const { videoId, thumbnailImage, channelName, publishedAt, title } = video;

    const newVideo = await prisma.video.create({
      data: {
        videoId,
        thumbnailImage,
        channelName,
        publishedAt,
        title,
      },
    });

    await prisma.room.update({
      where: {
        id: roomId,
      },
      data: {
        videoIds: {
          push: newVideo.id,
        },
      },
    });

    return res.status(200).json(newVideo);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
