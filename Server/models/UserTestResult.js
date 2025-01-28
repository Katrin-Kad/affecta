const mongoose = require('mongoose');

const userTestResultSchema = new mongoose.Schema({
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  totalPoints: { type: Number, required: true },
  result: { type: String, required: true },
});

module.exports = mongoose.model('UserTestResult', userTestResultSchema);
