import jwt from "jsonwebtoken";

export const checkValidUser = () => {
  try {
    let token = localStorage.getItemm("token");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    return true;
  } catch (err) {
    return false;
  }
};
