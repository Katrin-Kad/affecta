const express = require('express');
const router = express.Router();
const Test = require('../models/Test');
const UserTestResult = require('../models/UserTestResult');
const authMiddleware = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');
const jwt = require('jsonwebtoken');
const multer = require('multer');

// Настройка хранилища
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/tests/'); // Папка для сохранения изображений
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueSuffix);
  },
});

const upload = multer({ storage });

/**
* @swagger
* /api/tests:
*   post:
*     summary: Создание нового теста
*     description: Создает тест с заголовком, описанием, вопросами, результатами, тегами и (опционально) изображением.
*     tags:
*       - Tests
*     security:
*       - bearerAuth: []
*     requestBody:
*       required: true
*       content:
*         multipart/form-data:
*           schema:
*             type: object
*             properties:
*               title:
*                 type: string
*                 example: "Тест на знание JavaScript"
*               description:
*                 type: string
*                 example: "Этот тест проверяет ваши знания основ JavaScript."
*               questions:
*                 type: array
*                 items:
*                   type: object
*                   properties:
*                     questionText:
*                       type: string
*                       example: "Как ты себя чувствуешь?"
*                     options:
*                       type: array
*                       items:
*                         type: object
*                         properties:
*                           optionText:
*                             type: string
*                             example: "Хорошо!"
*                           points:
*                             type: integer
*                             example: 5
*               tags:
*                 type: array
*                 items:
*                   type: string
*                 example: ["sadness"]
*               image:
*                 type: string
*                 format: binary
*                 description: "Изображение для теста (опционально)"
*               results:
*                 type: array
*                 items:
*                   type: object
*                   properties:
*                     minPoints:
*                       type: integer
*                       example: 0
*                     maxPoints:
*                       type: integer
*                       example: 10
*                     description:
*                       type: string
*                       example: "Хорошее настроение"
*     responses:
*       201:
*         description: Тест успешно создан
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 _id:
*                   type: string
*                   example: "60d3b41abdacab002f85e0f7"
*                 title:
*                   type: string
*                   example: "Тест на знание JavaScript"
*                 description:
*                   type: string
*                   example: "Этот тест проверяет ваши знания основ JavaScript."
*                 questions:
*                   type: array
*                   items:
*                     type: object
*                     properties:
*                       questionText:
*                         type: string
*                         example: "Как ты себя чувствуешь?"
*                       options:
*                         type: array
*                         items:
*                           type: object
*                           properties:
*                             optionText:
*                               type: string
*                               example: "Хорошо!"
*                             points:
*                               type: integer
*                               example: 5
*                 tags:
*                   type: array
*                   items:
*                     type: string
*                   example: ["sadness"]
*                 image:
*                   type: string
*                   example: "/uploads/tests/example-image.jpg"
*                 results:
*                   type: array
*                   items:
*                     type: object
*                     properties:
*                       minPoints:
*                         type: integer
*                         example: 0
*                       maxPoints:
*                         type: integer
*                         example: 10
*                       description:
*                         type: string
*                         example: "Хорошее настроение"
*                 createdAt:
*                   type: string
*                   format: date-time
*                   example: "2025-01-09T12:34:56Z"
*       400:
*         description: Ошибка при создании теста
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 error:
*                   type: string
*                   example: "Ошибка при создании теста"
*       500:
*         description: Внутренняя ошибка сервера
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 error:
*                   type: string
*                   example: "Ошибка сервера"
*/
router.post('/', authMiddleware, checkRole("admin"), upload.single('image'), async (req, res) => {
  try {
    let { title, description, questions, results, tags } = req.body;

    if (typeof tags === 'string') {
      tags = tags.split(',').map(tag => tag.trim());
    }
    if (typeof questions === 'string') {
      questions = JSON.parse(questions);
    }
    if (typeof results === 'string') {
      results = JSON.parse(results);
    }

    const imagePath = req.file ? `/uploads/tests/${req.file.filename}` : '';
  

    const newTest = new Test({
      title,
      description,
      questions,
      results,
      tags,
      image: imagePath,
    });

    await newTest.save();
    res.status(201).json({ message: 'Тест успешно создан', test: newTest });
  } catch (err) {
    console.log(err)
    res.status(400).json({ error: 'Ошибка при создании теста' });
  }
});

/**
* @swagger
* /api/tests:
*   get:
*     summary: Получить список всех тестов
*     description: Возвращает список всех тестов, исключая архивные.
*     tags:
*       - Tests
*     parameters:
*       - name: page
*         in: query
*         required: false
*         schema:
*           type: integer
*           example: 1
*       - name: limit
*         in: query
*         required: false
*         schema:
*           type: integer
*           example: 10
*     responses:
*       200:
*         description: Список тестов
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 type: object
*       500:
*         description: Ошибка при получении тестов
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 error:
*                   type: string
*                   example: "Ошибка при получении тестов"
*/
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const tests = await Test.find({ isArchived: false })
                            .skip((page - 1) * limit)
                            .limit(Number(limit));;
    res.status(200).json(tests);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при получении тестов' });
  }
});

/**
 * @swagger
 * /api/tests/done:
 *   get:
 *     summary: Получить все ID тестов, которые прошел пользователь
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список ID тестов, которые прошел пользователь
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 testIds:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Массив ID тестов
 *       401:
 *         description: Неавторизован — токен отсутствует или недействителен
 *       500:
 *         description: Ошибка при получении тестов пользователя
 */
router.get('/done', authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
  
      const userResults = await UserTestResult.find({ userId }).select('testId -_id');
      const testIds = userResults.map((result) => result.testId);
  
      res.json({ testIds });
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Ошибка при получении тестов пользователя' });
    }
  });

/**
* @swagger
* /api/tests/{testId}:
*   get:
*     summary: Получить один тест по ID
*     description: Возвращает тест по указанному ID, если он не архивирован.
*     tags:
*       - Tests
*     parameters:
*       - name: testId
*         in: path
*         required: true
*         schema:
*           type: string
*           example: "63f8a4e1f4b5c70e78ef0a11"
*     responses:
*       200:
*         description: Тест найден
*         content:
*           application/json:
*             schema:
*               type: object
*       404:
*         description: Тест не найден или архивирован
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 error:
*                   type: string
*                   example: "Тест не найден или архивирован"
*/
router.get('/:testId', async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await Test.findById(testId);
    if (!test || test.isArchived) {
      return res.status(404).json({ error: 'Тест не найден или архивирован' });
    }

    res.status(200).json(test);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при получении теста' });
  }
});

/**
* @swagger
* /api/tests/{testId}:
*   put:
*     summary: Изменить тест
*     description: Изменяет тест по ID. Доступно только администраторам.
*     tags:
*       - Tests
*     security:
*       - bearerAuth: []
*     parameters:
*       - name: testId
*         in: path
*         required: true
*         schema:
*           type: string
*           example: "63f8a4e1f4b5c70e78ef0a11"
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               title:
*                 type: string
*                 example: "Тест на хорошее настроение"
*               description:
*                 type: string
*                 example: "Этот тест проверяет ваше настроение."
*               questions:
*                 type: array
*                 items:
*                   type: object
*                   properties:
*                     questionText:
*                       type: string
*                       example: "Как ты себя чувствуешь?"
*                     options:
*                       type: array
*                       items:
*                         type: object
*                         properties:
*                           optionText:
*                             type: string
*                             example: "Хорошо!"
*                           points:
*                             type: integer
*                             example: 5
*                 tags:
*                   type: array
*                   items:
*                     type: string
*                   example: 
*                     - "sadness"
*                 image:
*                   type: string
*                   format: binary
*                   description: "Изображение для теста (опционально)"
*               results:
*                 type: array
*                 items:
*                   type: object
*                   properties:
*                     minPoints:
*                       type: integer
*                       example: 0
*                     maxPoints:
*                       type: integer
*                       example: 10
*                     description:
*                       type: string
*                       example: "Хорошее настроение"
*     responses:
*       200:
*         description: Тест успешно обновлен
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 message:
*                   type: string
*                   example: "Тест успешно обновлен"
*       404:
*         description: Тест не найден
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 error:
*                   type: string
*                   example: "Тест не найден"
*/
router.put('/:testId', authMiddleware, checkRole("admin"), async (req, res) => {
  try {
    const { testId } = req.params;
    const { title, description, questions, results, tags, image } = req.body;

    const updatedTest = await Test.findByIdAndUpdate(
          testId,
          { title, description, questions, results, tags, image },
          { new: true }
        );

    if (!updatedTest) {
      return res.status(404).json({ error: 'Тест не найден' });
    }

    res.status(200).json({ message: 'Тест успешно обновлен', test: updatedTest });
  } catch (err) {
    res.status(400).json({ error: 'Ошибка при обновлении теста' });
  }
});

/**
 * @swagger
 * /api/tests/{testId}:
 *   delete:
 *     summary: Удалить тест (только для администраторов)
 *     tags: [Tests]
 *     security:
 *         - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: testId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID теста
 *     responses:
 *       204:
 *         description: Тест успешно удален
 *       404:
 *         description: Тест не найден
 *       500:
 *         description: Ошибка при удалении теста
 */
router.delete('/:testId', authMiddleware, checkRole("admin"), async (req, res) => {
  try {
    const { testId } = req.params;

    const deletedTest = await Test.findByIdAndDelete(testId);
    if (!deletedTest) {
      return res.status(404).json({ error: 'Тест не найден' });
    }

    res.status(204).json({ message: 'Тест успешно удален' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при удалении теста' });
  }
});

/**
 * @swagger
 * /api/tests/{testId}/archive:
 *   put:
 *     summary: Архивирует или разархивирует тест
 *     description: Обновляет статус `isArchived` теста по его id.
 *     tags:
 *       - Tests
 *     parameters:
 *       - in: path
 *         name: testId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID теста
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isArchived:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Удачно обновлен статус архивации
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 testId:
 *                   type: string
 *                   description: ID теста
 *                   example: "63f8a1119fa3fbb6f7c70c12"
 *                 isArchived:
 *                   type: boolean
 *                   description: Обновлен статус архивации
 *                   example: true
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Время последнего обновления
 *                   example: "2025-01-12T10:00:00Z"
 *       400:
 *         description: Неверный формат данных
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Неверный ID теста или тело запроса."
 *       500:
 *         description: Ошибка на сервере
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Ошибка при обновлении статуса архивации"
 */
router.put('/:testId/archive', authMiddleware, checkRole('admin'), async (req, res) => {
    try {
        const { testId } = req.params;
        const { isArchived } = req.body;

        if (typeof isArchived !== 'boolean') {
            return res.status(400).json({ error: 'Invalid value for isArchived. Must be true or false.' });
        }

        const updatedTest = await Test.findByIdAndUpdate(
            testId,
            { isArchived },
            { new: true }
        );

        if (!updatedTest) {
            return res.status(404).json({ error: 'Test not found.' });
        }

        res.status(200).json(updatedTest);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при обновлении статуса архивации' });
    }
});

/**
 * @swagger
 * /api/tests/{testId}/submit:
 *   post:
 *     summary: Пройти тест
 *     tags: [Tests]
 *     parameters:
 *       - in: path
 *         name: testId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID теста
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answers:
 *                 type: string
 *                 example: "[0,1,2]"
 *                 description: Строка, представляющая массив ответов пользователя
 *     responses:
 *       200:
 *         description: Тест пройден
 *       404:
 *         description: Тест не найден
 *       500:
 *         description: Ошибка при прохождении теста
 */
router.post('/:testId/submit', async (req, res) => {
    const { testId } = req.params;
    const answers = JSON.parse(req.body.answers);
  
    try {
      const test = await Test.findById(testId);
      if (!test) {
        return res.status(404).json({ error: 'Тест не найден' });
      }
  
      let totalPoints = 0;
      test.questions.forEach((question, index) => {
        const answerIndex = answers[index];
        if (answerIndex !== undefined) {
          totalPoints += question.options[answerIndex].points;
        }
      });

      const result = test.results.find(
        (r) => totalPoints >= r.minPoints && totalPoints <= r.maxPoints
      );

      const testResult = {
        totalPoints,
        result: result ? result.description : 'Результат не определен',
      };
  
      // Сохраняем результат, если пользователь авторизован
      if (req.headers.authorization) {
        try {
          const user = jwt.verify(req.headers.authorization?.split(' ')[1], process.env.JWT_SECRET); // Проверяем токен вручную
          if (user) {
            const existingResult = await UserTestResult.findOne({ userId: user.id, testId });

            if (existingResult) {
              // Если результат существует, обновляем его
              existingResult.totalPoints = totalPoints;
              existingResult.result = testResult.result;
              await existingResult.save();
            } else {
              // Если результата нет, создаем новый
              await UserTestResult.create({
                userId: user.id,
                testId,
                totalPoints,
                result: testResult.result,
              });
            }
          }
        } catch (err) {
          console.error('Ошибка авторизации:', err.message);
        }
      }
  
      res.json({ totalPoints, result: testResult.result });
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Ошибка при обработке результата теста' });
    }
  });
  

/**
 * @swagger
 * /api/tests/{testId}/result:
 *   get:
 *     summary: Получить сохраненные результаты теста для авторизованного пользователя
 *     tags: [Tests]
 *     security:
 *         - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: testId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID теста
 *     responses:
 *       200:
 *         description: Результаты теста
 *       404:
 *         description: Результат не найден
 *       500:
 *         description: Ошибка при получении результата теста
 */
router.get('/:testId/result', authMiddleware, async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.user.id;

    const userResult = await UserTestResult.findOne({ testId, userId });
    if (!userResult) {
      return res.status(404).json({ error: 'Результат не найден' });
    }

    res.status(200).json(userResult);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при получении результата теста' });
  }
});

module.exports = router;

  