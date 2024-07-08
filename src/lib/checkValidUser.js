import jwt from "jsonwebtoken";

export const checkValidUser = () => {
  try {
    let token = localStorage.getItem("token");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return true;
  } catch (err) {

    return false;
  }
};
