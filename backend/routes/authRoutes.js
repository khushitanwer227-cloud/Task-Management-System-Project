const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const MOCK_USER = {
  id: "64bf12345678901234567890", 
  name: "Khushi Sharma",
  email: "khushi@company.com",
  password: "password123"
};

// Register API
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All form inputs are required." });
  }
  
  const token = jwt.sign({ id: MOCK_USER.id, email }, process.env.JWT_SECRET || 'SECRET_KEY', { expiresIn: '24h' });
  res.status(201).json({ token, user: { id: MOCK_USER.id, name, email } });
});

// Login API
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === MOCK_USER.email && password === MOCK_USER.password) {
    const token = jwt.sign({ id: MOCK_USER.id, email: MOCK_USER.email }, process.env.JWT_SECRET || 'SECRET_KEY', { expiresIn: '24h' });
    return res.json({ token, user: { id: MOCK_USER.id, name: MOCK_USER.name, email: MOCK_USER.email } });
  }
  
  res.status(401).json({ message: "Invalid credentials. Try khushi@company.com / password123" });
});

module.exports = router;