import { deleteRoomById } from "@/lib/api";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  verifyToken(req, res, async () => {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    try {
      // Fetch the user to check if they exist
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Fetch rooms created by the user
      const userRooms = await prisma.room.findMany({
        where: { hostId: userId },
      });

      for (const room of userRooms) {
        await deleteRoomById(room.id);
        console.log(room);
      }
      /*
      // Delete the user
      await prisma.user.delete({
        where: { id: userId },
      });*/

      return res
        .status(200)
        .json({ message: "User and their rooms deleted successfully" });
    } catch (error) {
      console.error("Error deleting user and related data:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
}
