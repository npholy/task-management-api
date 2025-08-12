import jwt from 'jsonwebtoken';

export function verifyToken(handler) {
  return async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      console.log('Authorization Header:', authHeader); // Debug log
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization token missing or invalid' });
      }

      const token = authHeader.split(' ')[1];
      console.log('Token:', token); // Debug log
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded Token:', decoded); // Debug log

      // Handle both `id` and `userId` for compatibility
      const userId = decoded.id || decoded.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Token missing user ID' });
      }

      // Attach user info to req.user
      req.user = { id: userId, email: decoded.email };
      console.log('req.user:', req.user); // Debug log

      return handler(req, res);
    } catch (err) {
      console.error('Token Verification Error:', err.message); // Debug log
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
}