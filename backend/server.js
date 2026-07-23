const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());


mongoose.connect(process.env.DATABASE_URI || 'mongodb://127.0.0.1:27017/taskcraft')
  .then(() => console.log('MongoDB Connected successfully.'))
  .catch((err) => console.error('Database connection error:', err));

// Routes
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.json({ message: "TaskCraft API Server Active Running." });
});

if (process.env.NODE_ENV !== 'production') {
app.listen(PORT, () => {
  console.log(`Server executing safely on port ${PORT}`);
});
}


module.exports = app;
