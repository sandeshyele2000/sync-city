import { getSession } from "next-auth/react";

const middlewareCheck = (handler) => async (req, res) => {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ msg: "Unauthorized", status: false });
  }
  return handler(req, res);
};

export default middlewareCheck;