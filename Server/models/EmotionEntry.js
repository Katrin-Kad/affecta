const mongoose = require('mongoose');

const emotionEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ссылка на пользователя
  date: { type: Date, required: true }, // дата записи
  entries: [
    {
      situation: { type: String, required: true },
      emotion: { type: String, required: true },
      bodySensation: { type: String, required: true },
      thoughts: { type: String, required: true },
    }
  ],
});

module.exports = mongoose.model('EmotionEntry', emotionEntrySchema);
