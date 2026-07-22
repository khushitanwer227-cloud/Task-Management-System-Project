const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Task = require('../models/Task'); 


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: "Access Token missing." });

  jwt.verify(token, process.env.JWT_SECRET || 'SECRET_KEY', (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid or expired session token." });
    req.user = user;
    next();
  });
};

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, status } = req.query;
    let queryConfig = { user: req.user.id };

    if (search) {
      queryConfig.title = { $regex: search, $options: 'i' };
    }
    if (status) {
      queryConfig.status = status;
    }

    const datasets = await Task.find(queryConfig).sort({ createdAt: -1 });
    res.json(datasets);
  } catch (err) {
    res.status(500).json({ message: "Server registry indexing failed." });
  }
});


router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, priority, dueDate, assignee, tags } = req.body;
    
    const newTask = new Task({
      title,
      description,
      priority,
      dueDate,
      assignee: assignee || 'Unassigned',
      tags: tags || [],
      user: req.user.id
    });

    const savedDoc = await newTask.save();
    res.status(201).json(savedDoc);
  
  
  } catch (err) {
     console.error("Task Save Error:", err);
    res.status(400).json({ message: "Failed to persist document records." });
  }
});


router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const updatedDoc = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!updatedDoc) return res.status(404).json({ message: "Task reference not found." });
    res.json(updatedDoc);
  } catch (err) {
    res.status(400).json({ message: "Modification cycle broken." });
  }
});


router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const destroyedDoc = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!destroyedDoc) return res.status(404).json({ message: "Document not found." });
    res.json({ message: "Record wiped permanently." });
  } catch (err) {
    res.status(500).json({ message: "Deletion execution error." });
  }
});

module.exports = router;