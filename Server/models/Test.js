const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  isArchived: { type: Boolean, default: false },
  questions: [
    {
      questionText: { type: String, required: true },
      options: [
        {
          optionText: { type: String, required: true },
          points: { type: Number, required: true },
        },
      ],
    },
  ],
  results: [
    {
      minPoints: { type: Number, required: true },
      maxPoints: { type: Number, required: true },
      description: { type: String, required: true },
    },
  ],
});

module.exports = mongoose.model('Test', testSchema);
