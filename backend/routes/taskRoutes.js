const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');

// Get All Tasks GET /api/tasks
// Query params: page, limit, status, priority, search
router.get('/', auth, async (req, res) => {
  const { page = 1, limit = 10, status, priority, search, sortBy = 'dueDate', order = 'asc' } = req.query;
  const skip = (page - 1) * limit;

  const filter = { userId: req.user.id };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (search) filter.title = { $regex: search, $options: 'i' };

  try {
    const tasks = await Task.find(filter)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(filter);
    res.json({ tasks, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Create Task POST /api/tasks
router.post('/', auth, async (req, res) => {
  const { title, description, status, priority, dueDate } = req.body;

  try {
    const task = new Task({ userId: req.user.id, title, description, status, priority, dueDate });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update Task PUT /api/tasks/:id
router.put('/:id', auth, async (req, res) => {
  const { title, description, status, priority, dueDate } = req.body;

  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: { title, description, status, priority, dueDate, updatedAt: Date.now() } },
      { new: true }
    );

    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Delete Task DELETE /api/tasks/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get Stats GET /api/tasks/stats
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await Task.aggregate([
      { $match: { userId: new (require('mongoose').Types.ObjectId)(req.user.id) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'Done'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $ne: ['$status', 'Done'] }, 1, 0] } }
        }
      }
    ]);

    const result = stats[0] || { total: 0, completed: 0, pending: 0 };
    result.percentage = result.total > 0 ? (result.completed / result.total) * 100 : 0;

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
