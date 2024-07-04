import { getSession } from "next-auth/react";

const middlewareCheck = (handler) => async (req, res) => {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ msg: "Unauthorized", status: false });
  }

  // You can add more middleware logic here
  // For example, logging the request
  console.log(`API Request: ${req.method} ${req.url}`);

  // Call the original handler
  return handler(req, res);
};

export default middlewareCheck;