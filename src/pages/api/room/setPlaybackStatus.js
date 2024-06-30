import prisma from "@/lib/prisma";


export default async function handler(req, res) {
  const { videoId, roomId } = req.body;

  try {
    await prisma.video.updateMany({
      where: { roomIds: roomId },
      data: { isPlaying: false },
    });

    const updatedVideo = await prisma.video.update({
      where: { videoId },
      data: { isPlaying: true },
    });

    res.status(200).json(updatedVideo);
  } catch (error) {
    console.error('Error setting playback status:', error);
    res.status(500).json({ message: 'Failed to set playback status' });
  }
}
