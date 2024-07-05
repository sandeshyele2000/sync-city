
import { verifyToken } from "@/lib/auth";
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  verifyToken(req, res, async () => {
    try {

      console.log(req.user)
      const rooms = await prisma.room.findMany();

      return res.status(200).json({ msg: "Rooms fetched", status: true, rooms });
    } catch (error) {
      console.error("Room fetch error:", error);
      return res.status(500).json({
        msg: "Internal server error",
        status: false,
        error: error.message,
      });
    }
  });
}
