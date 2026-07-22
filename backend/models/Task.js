const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['To Do', 'In Progress', 'Done'], default: 'To Do' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  dueDate: { type: Date },
  assignee: { type: String, default: 'Unassigned' },
  tags: [{ type: String }],
  subtasks: [
    {
      text: String,
      isCompleted: { type: Boolean, default: false }
    }
  ],

  user: { type: mongoose.Schema.Types.Mixed, required: false }
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);