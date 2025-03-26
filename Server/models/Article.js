const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Заголовок статьи
  shortDescription: { type: String, required: true }, // Краткое описание
  content: { type: String, required: true }, // Полный текст статьи
  tags: [{type: String}],
  isExercise: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }, // Дата создания
  updatedAt: { type: Date, default: Date.now }, // Дата последнего обновления
  isArchived: { type: Boolean, default: false },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Автор
  image: { type: String, default: '' }, // Путь к изображению
});

module.exports = mongoose.model('Article', ArticleSchema);
