import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  
  const token = req.cookies.token; // Ensure token is coming from cookies
  console.log("Token from cookies , now verifying:", token); // ✅ Debugging line
  if (!token) return res.json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded); // ✅ Debugging line
    req.user = { userId: decoded.userId }; // ✅ Attach userId to req.user
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.json({ message: "Invalid token" });
  }
};

export default verifyToken;
