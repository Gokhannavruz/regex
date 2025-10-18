// Vercel API Route: /api/auth/login
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;
    
    // In a real app, you'd check against database
    // For now, we'll just generate a token
    const token = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ 
      token, 
      user: { email, username: email.split('@')[0] } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
}
