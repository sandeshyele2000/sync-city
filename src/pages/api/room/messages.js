import { verifyToken } from "@/lib/auth";
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  const { id: roomId } = req.query;

  if (req.method === "GET") {
    try {
      verifyToken(req, res, async () => {
        const messages = await prisma.message.findMany({
          where: { roomId },
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
          orderBy: {
            createdAt: "asc",
          },
        });

        const formattedMessages = messages.map((message) => ({
          id: message.id,
          content: message.content,
          createdAt: message.createdAt,
          user: {
            id: message.user.id,
            username: message.user.username,
            nickname: message.user.nickname,
            profileImage: message.user.profileImage,
          },
          replyTo: message.replyTo
            ? {
                id: message.replyTo.id,
                content: message.replyTo.content,
                user: {
                  id: message.replyTo.user.id,
                  username: message.replyTo.user.username,
                  nickname: message.replyTo.user.nickname,
                  profileImage: message.replyTo.user.profileImage,
                },
              }
            : null,
        }));

        res.status(200).json(formattedMessages);
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Error fetching messages" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}