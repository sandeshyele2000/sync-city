import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {

  const token = req.headers.authorization?.split(' ')[1]; // Get the token from the Authorization header
  
  console.log("Token: ",token)
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach the decoded token to the request
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized', error: err.message });
  }
};
