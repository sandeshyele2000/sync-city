import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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

    console.log(room.videos);
    return res.status(200).json(room.videos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
