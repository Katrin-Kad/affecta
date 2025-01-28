const express = require('express');
const router = express.Router();
const EmotionEntry = require('../models/EmotionEntry');
const authMiddleware = require('../middlewares/auth');

/**
 * @swagger
 * /api/emotion-diary:
 *   post:
 *     summary: Добавить запись о ситуации в дневник эмоций
 *     tags: [Emotion Diary]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Дата записи
 *               situation:
 *                 type: string
 *                 description: Описание ситуации
 *               emotion:
 *                 type: string
 *                 description: Испытываемая эмоция
 *               bodySensation:
 *                 type: string
 *                 description: Телесное ощущение
 *               thoughts:
 *                 type: string
 *                 description: Мысли, связанные с ситуацией
 *     responses:
 *       201:
 *         description: Запись добавлена успешно
 *       400:
 *         description: Ошибка запроса
 *       401:
 *         description: Неавторизован
 */
router.post('/', authMiddleware, async (req, res) => {
    try {
      const { date, situation, emotion, bodySensation, thoughts } = req.body;
  
      if (!date || !situation || !emotion || !bodySensation || !thoughts) {
        return res.status(400).json({ error: 'Заполните все обязательные поля' });
      }
  
      let entry = await EmotionEntry.findOne({ user: req.user.id, date });
  
      if (!entry) {
        entry = new EmotionEntry({
          user: req.user.id,
          date,
          entries: [],
        });
      }
  
      const newEntry = { situation, emotion, bodySensation, thoughts };
      entry.entries.push(newEntry);
      await entry.save();
  
      res.status(201).json({ message: 'Запись добавлена успешно', entry });
    } catch (err) {
      res.status(400).json({ error: 'Ошибка при добавлении записи' });
    }
  });
  

/**
 * @swagger
 * /api/emotion-diary/{date}:
 *   get:
 *     summary: Получить записи за указанную дату
 *     tags: [Emotion Diary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Дата для просмотра записей
 *     responses:
 *       200:
 *         description: Записи получены успешно
 *       404:
 *         description: Записи на указанную дату не найдены
 *       401:
 *         description: Неавторизован
 */
router.get('/:date', authMiddleware, async (req, res) => {
  try {
    const { date } = req.params;

    // Найти запись по дате
    const entry = await EmotionEntry.findOne({ user: req.user.id, date });
    if (!entry) {
      return res.status(404).json({ message: 'Записи на указанную дату не найдены' });
    }

    res.json(entry);
  } catch (err) {
    res.status(400).json({ error: 'Ошибка при получении записей' });
  }
});

/**
 * @swagger
 * /api/emotion-diary/{date}/{index}:
 *   put:
 *     summary: Изменить запись в дневнике эмоций
 *     tags: [Emotion Diary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Дата записи
 *       - in: path
 *         name: index
 *         required: true
 *         schema:
 *           type: integer
 *         description: Индекс записи в массиве entries
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               situation:
 *                 type: string
 *               emotion:
 *                 type: string
 *               bodySensation:
 *                 type: string
 *               thoughts:
 *                 type: string
 *     responses:
 *       200:
 *         description: Запись изменена успешно
 *       404:
 *         description: Запись или дата не найдены
 *       401:
 *         description: Неавторизован
 */
router.put('/:date/:index', authMiddleware, async (req, res) => {
  try {
    const { date, index } = req.params;
    const { situation, emotion, bodySensation, thoughts } = req.body;

    const entry = await EmotionEntry.findOne({ user: req.user.id, date });
    if (!entry) {
      return res.status(404).json({ message: 'Записи на указанную дату не найдены' });
    }

    if (index < 0 || index >= entry.entries.length) {
      return res.status(404).json({ message: 'Запись с указанным индексом не найдена' });
    }

    // Обновляем запись
    const updatedEntry = {
      situation: situation || entry.entries[index].situation,
      emotion: emotion || entry.entries[index].emotion,
      bodySensation: bodySensation || entry.entries[index].bodySensation,
      thoughts: thoughts || entry.entries[index].thoughts,
    };

    entry.entries[index] = updatedEntry;
    await entry.save();

    res.status(200).json({ message: 'Запись изменена успешно', entry });
  } catch (err) {
    res.status(400).json({ error: 'Ошибка при изменении записи' });
  }
});

/**
 * @swagger
 * /api/emotion-diary/{date}/{index}:
 *   delete:
 *     summary: Удалить запись из дневника эмоций
 *     tags: [Emotion Diary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Дата записи
 *       - in: path
 *         name: index
 *         required: true
 *         schema:
 *           type: integer
 *         description: Индекс записи в массиве entries
 *     responses:
 *       200:
 *         description: Запись удалена успешно
 *       404:
 *         description: Запись или дата не найдены
 *       401:
 *         description: Неавторизован
 */
router.delete('/:date/:index', authMiddleware, async (req, res) => {
  try {
    const { date, index } = req.params;

    const entry = await EmotionEntry.findOne({ user: req.user.id, date });
    if (!entry) {
      return res.status(404).json({ message: 'Записи на указанную дату не найдены' });
    }

    if (index < 0 || index >= entry.entries.length) {
      return res.status(404).json({ message: 'Запись с указанным индексом не найдена' });
    }

    entry.entries.splice(index, 1); // Удаляем запись по индексу
    await entry.save();

    res.status(200).json({ message: 'Запись удалена успешно', entry });
  } catch (err) {
    res.status(400).json({ error: 'Ошибка при удалении записи' });
  }
});

module.exports = router;
