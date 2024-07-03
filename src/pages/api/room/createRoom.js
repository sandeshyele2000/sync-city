import prisma from "../../../lib/prisma";
import axios from "axios";

export default async function handler(req, res) {
  

  const { roomName, hostId } = req.body;

  if (!roomName || !hostId) {
    return res
      .status(400)
      .json({ message: "Room name and host ID are required" });
  }

  try {
    const room = await prisma.room.create({
      data: {
        name: roomName,
        hostId,
        userIds: [hostId],
        videoIds: [],
      },
    });

    const liveblocksApiKey = process.env.NEXT_PUBLIC_LIVEBLOCKS_API_KEY;
    
    if (!liveblocksApiKey) {
      throw new Error("Liveblocks API key is missing");
    }

    const liveblocksUrl = "https://api.liveblocks.io/v2/rooms";

    await axios.post(
      liveblocksUrl,
      { id: room.id, defaultAccesses: ["room:write"] },
      {
        headers: {
          Authorization: `Bearer ${liveblocksApiKey}`,
        },
      }
    );

    await prisma.user.update({
      where: { id: hostId },
      data: {
        roomIds: {
          push: room.id,
        },
      },
    });

    return res.status(201).json({ msg: "Room created", status: true, room });
  } catch (error) {
    console.error("Room creation error:", error);
    return res.status(500).json({
      msg: "Internal server error",
      status: false,
      error: error.message,
    });
  }
}
