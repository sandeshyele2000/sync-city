import jwt from "jsonwebtoken";

export const checkValidUser = () => {
  try {
    let token = localStorage.getItem("token");
    console.log(token)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return true;
  } catch (err) {
    console.log("invalid token redirecting")

    return false;
  }
};
