import { verifyToken } from "@/lib/auth";
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    verifyToken(req, res, async () => {
      const { message, roomId, userId, replyToId } = req.body;

      if (!message || !roomId || !userId) {
        return res.status(400).json({ error: "Message, roomId, and userId are required" });
      }

      const newMessage = await prisma.message.create({
        data: {
          content: message,
          roomId,
          userId,
          replyToId: replyToId || null,
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
          replyTo: {
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
        replyTo: newMessage.replyTo
          ? {
              id: newMessage.replyTo.id,
              content: newMessage.replyTo.content,
              user: {
                id: newMessage.replyTo.user.id,
                username: newMessage.replyTo.user.username,
                nickname: newMessage.replyTo.user.nickname,
                profileImage: newMessage.replyTo.user.profileImage,
              },
            }
          : null,
      };

      res.status(201).json(formattedMessage);
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Error sending message" });
  }
}