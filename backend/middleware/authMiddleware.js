const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
   
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: "Access Denied. No token provided or invalid format." 
      });
    }

    
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: "Authentication token missing." });
    }

    const secretKey = process.env.JWT_SECRET || 'SECRET_KEY';
    const decoded = jwt.verify(token, secretKey);

    
    req.user = decoded;
 
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Session expired. Please login again." });
    }
    
    return res.status(403).json({ message: "Invalid or tampered token." });
  }
};

module.exports = authMiddleware;