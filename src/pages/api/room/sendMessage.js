import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  const { message, roomId, userId } = req.body;

  if (req.method === 'POST') {
    try {
      const newMessage = await prisma.message.create({
        data: {
          content: message,
          roomId,
          userId,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              nickname: true,
              profileImage: true,
            },
          },
        },
      });

      const formattedMessage = {
        id: newMessage.id,
        content: newMessage.content,
        createdAt: newMessage.createdAt,
        user: {
          id: newMessage.user.id,
          username: newMessage.user.username,
          nickname: newMessage.user.nickname,
          profileImage: newMessage.user.profileImage,
        },
      };

      res.status(201).json(formattedMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Error sending message" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}