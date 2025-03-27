const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const UserTaskResult = require('../models/UserTaskResult');
const authMiddleware = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole'); // Middleware для проверки роли admin
const multer = require('multer');

// Настройка хранилища
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/articles/'); // Папка для сохранения изображений
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueSuffix);
  },
});

const upload = multer({ storage });


/**
* @swagger
* /api/articles:
*  post:
*    summary: Создание новой статьи или задания
*    description: Создает статью или задание с указанным заголовком, кратким описанием, содержанием, 
*                 тегами и (опционально) изображением.
*    tags:
*      - Articles
*    security:
*      - bearerAuth: []
*    requestBody:
*      required: true
*      content:
*        multipart/form-data:
*          schema:
*            type: object
*            properties:
*              title:
*                type: string
*                example: "Заголовок статьи"
*              shortDescription:
*                type: string
*                example: "Краткое описание статьи"
*              content:
*                type: string
*                example: "Полное содержание статьи"
*              tags:
*                type: array
*                items:
*                  type: string
*                example: 
*                  - "sadness"
*              isExercise:
*                type: boolean
*                example: true
*              image:
*                type: string
*                format: binary
*                description: "Изображение для статьи (опционально)"
*    responses:
*      201:
*        description: Статья успешно создана
*        content:
*          application/json:
*            schema:
*              type: object
*              properties:
*                _id:
*                  type: string
*                  example: "60d3b41abdacab002f85e0f7"
*                title:
*                  type: string
*                  example: "Заголовок статьи"
*                shortDescription:
*                  type: string
*                  example: "Краткое описание статьи"
*                content:
*                  type: string
*                  example: "Полное содержание статьи"
*                tags:
*                  type: array
*                  items:
*                    type: string
*                  example: ["тег1", "тег2"]
*                isExercise:
*                  type: boolean
*                  example: true
*                image:
*                  type: string
*                  example: "/uploads/articles/example-image.jpg"
*                createdAt:
*                  type: string
*                  format: date-time
*                  example: "2025-01-09T12:34:56Z"
*      500:
*        description: Ошибка при создании статьи
*        content:
*          application/json:
*            schema:
*              type: object
*              properties:
*                error:
*                  type: string
*                  example: "Ошибка при создании статьи"
*/
router.post('/', authMiddleware, checkRole('admin'), upload.single('image'), async (req, res) => {
      try {
        const { title, shortDescription, content, isExercise } = req.body;
        let { tags } = req.body;

        if (typeof tags === 'string') {
          tags = tags.split(',').map(tag => tag.trim());
        }

        const imagePath = req.file ? `/uploads/articles/${req.file.filename}` : '';
  
        const newArticle = new Article({
          title,
          shortDescription,
          content,
          tags,
          isExercise,
          image: imagePath,
          createdAt: Date.now(),
          author: req.user.id,
        });
  
        await newArticle.save();
        res.status(201).json(newArticle);
      } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Ошибка при создании статьи' });
      }
    }
  );
  
/**
* @swagger
* /api/articles/{id}:
*  put:
*    summary: Обновление статьи или задания по ID
*    description: Обновляет статью или задание по указанному ID с новыми данными.
*    tags:
*      - Articles
*    security:
*      - bearerAuth: []
*    parameters:
*      - in: path
*        name: id
*        required: true
*        schema:
*          type: string
*          example: "60d3b41abdacab002f85e0f7"
*    requestBody:
*      required: true
*      content:
*        application/json:
*          schema:
*            type: object
*            properties:
*              title:
*                type: string
*                example: "Обновленный заголовок"
*              shortDescription:
*                type: string
*                example: "Обновленное краткое описание"
*              content:
*                type: string
*                example: "Обновленное содержание"
*              tags:
*                type: array
*                items:
*                  type: string
*                example: ["новый тег"]
*              isExercise:
*                type: boolean
*                example: true
*    responses:
*      200:
*        description: Статья/задание успешно обновлена(о)
*        content:
*          application/json:
*            schema:
*              type: object
*              properties:
*                _id:
*                  type: string
*                  example: "60d3b41abdacab002f85e0f7"
*                title:
*                  type: string
*                  example: "Обновленный заголовок"
*                shortDescription:
*                  type: string
*                  example: "Обновленное краткое описание"
*                content:
*                  type: string
*                  example: "Обновленное содержание"
*                tags:
*                  type: array
*                  items:
*                    type: string
*                  example: ["новый тег"]
*                isExercise:
*                  type: boolean
*                  example: true
*                updatedAt:
*                  type: string
*                  format: date-time
*                  example: "2025-01-09T14:15:16Z"
*      500:
*        description: Ошибка при обновлении статьи/задания
*        content:
*          application/json:
*            schema:
*              type: object
*              properties:
*                error:
*                  type: string
*                  example: "Ошибка при обновлении статьи/задания"
*/
router.put('/:id', authMiddleware, checkRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, shortDescription, content, tags, isExercise, image } = req.body;
    const updatedArticle = await Article.findByIdAndUpdate(
      id,
      { title, shortDescription, content, tags, image, isExercise, updatedAt: Date.now() },
      { new: true }
    );
    res.status(200).json(updatedArticle);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении статьи/задания' });
  }
});

/**
* @swagger
* /api/articles/{id}:
*  delete:
*    summary: Удаление статьи/задания
*    description: Удаляет статью/задание по указанному ID.
*    tags:
*      - Articles
*    security:
*      - bearerAuth: []
*    parameters:
*      - in: path
*        name: id
*        required: true
*        schema:
*          type: string
*          example: "60d3b41abdacab002f85e0f7"
*    responses:
*      204:
*        description: Статья/задание успешно удалена(о)
*      500:
*        description: Ошибка при удалении статьи/задания
*        content:
*          application/json:
*            schema:
*              type: object
*              properties:
*                error:
*                  type: string
*                  example: "Ошибка при удалении статьи/задания"
*/
router.delete('/:id', authMiddleware, checkRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    await Article.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении статьи/задания' });
  }
});

/**
 * @swagger
 * /api/articles/{id}/archive:
 *   put:
 *     summary: Архивирует или разархивирует статью/задание
 *     description: Обновляет статус `isArchived` статьи/задания по его id.
 *     tags:
 *       - Articles
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID статьи/задания
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
 *                 _id:
 *                   type: string
 *                   description: ID статьи/задания
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
 *                   example: "Неверный ID статьи/задания или тело запроса."
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
router.put('/:id/archive', authMiddleware, checkRole('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { isArchived } = req.body;

        if (typeof isArchived !== 'boolean') {
            return res.status(400).json({ error: 'Invalid value for isArchived. Must be true or false.' });
        }

        const updatedArticle = await Article.findByIdAndUpdate(
            id,
            { isArchived, updatedAt: Date.now() },
            { new: true }
        );

        if (!updatedArticle) {
            return res.status(404).json({ error: 'Article not found.' });
        }

        res.status(200).json(updatedArticle);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при обновлении статуса архивации' });
    }
});


/**
* @swagger
* /api/articles:
*  get:
*    summary: Получить все статьи
*    description: Получает все статьи с фильтрацией по статусу.
*    tags:
*      - Articles
*    parameters:
*      - in: query
*        name: page
*        required: false
*        schema:
*          type: integer
*          default: 1
*      - in: query
*        name: limit
*        required: false
*        schema:
*          type: integer
*          default: 10
*    responses:
*      200:
*        description: Список статей
*        content:
*          application/json:
*            schema:
*              type: array
*              items:
*                type: object
*                properties:
*                  _id:
*                    type: string
*                    example: "60d3b41abdacab002f85e0f7"
*                  title:
*                    type: string
*                    example: "Заголовок статьи"
*                  shortDescription:
*                    type: string
*                    example: "Краткое описание статьи"
*                  content:
*                    type: string
*                    example: "Полное содержание статьи"
*                  tags:
*                    type: array
*                    items:
*                      type: string
*                    example: ["тег1", "тег2"]
*                  isExercise:
*                    type: boolean
*                    example: true
*                  isArchived:
*                     type: boolean
*                     example: true
*      500:
*        description: Ошибка при получении статей
*        content:
*          application/json:
*            schema:
*              type: object
*              properties:
*                error:
*                  type: string
*                  example: "Ошибка при получении статей"
*/
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const articles = await Article.find({ isArchived: false, isExercise: false })
                                  .skip((page - 1) * limit)
                                  .limit(Number(limit));;
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении статей' });
  }
});

/**
* @swagger
* /api/articles/exercise:
*  get:
*    summary: Получить все задания
*    description: Получает все задания с фильтрацией по статусу.
*    tags:
*      - Articles
*    parameters:
*      - in: query
*        name: page
*        required: false
*        schema:
*          type: integer
*          default: 1
*      - in: query
*        name: limit
*        required: false
*        schema:
*          type: integer
*          default: 10
*    responses:
*      200:
*        description: Список статей
*        content:
*          application/json:
*            schema:
*              type: array
*              items:
*                type: object
*                properties:
*                  _id:
*                    type: string
*                    example: "60d3b41abdacab002f85e0f7"
*                  title:
*                    type: string
*                    example: "Заголовок статьи"
*                  shortDescription:
*                    type: string
*                    example: "Краткое описание статьи"
*                  content:
*                    type: string
*                    example: "Полное содержание статьи"
*                  tags:
*                    type: array
*                    items:
*                      type: string
*                    example: ["тег1", "тег2"]
*                  isExercise:
*                    type: boolean
*                    example: true
*                  isArchived:
*                     type: boolean
*                     example: true
*      500:
*        description: Ошибка при получении заданий
*        content:
*          application/json:
*            schema:
*              type: object
*              properties:
*                error:
*                  type: string
*                  example: "Ошибка при получении заданий"
*/
router.get('/exercise', async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const articles = await Article.find({ isArchived: false, isExercise: true })
                                    .skip((page - 1) * limit)
                                    .limit(Number(limit));;
      res.status(200).json(articles);
    } catch (error) {
      res.status(500).json({ error: 'Ошибка при получении заданий' });
    }
  });

/**
 * @swagger
 * /api/articles/done:
 *   get:
 *     summary: Получить все ID заданий, которые прошел пользователь
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список ID заданий, которые прошел пользователь
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 testIds:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Массив ID заданий
 *       401:
 *         description: Неавторизован — токен отсутствует или недействителен
 *       500:
 *         description: Ошибка при получении заданий пользователя
 */
router.get('/done', authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
  
      const userResults = await UserTaskResult.find({ userId }).select('taskId -_id');
      const taskIds = userResults.map((result) => result.taskId);
  
      res.json({ taskIds });
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Ошибка при получении заданий пользователя' });
    }
  });

/**
* @swagger
* /api/articles/{id}:
*  get:
*    summary: Получить статью/задание по ID
*    description: Получает статью/задание по указанному ID.
*    tags:
*      - Articles
*    parameters:
*      - in: path
*        name: id
*        required: true
*        schema:
*          type: string
*          example: "60d3b41abdacab002f85e0f7"
*    responses:
*      200:
*        description: Статья/задание найдена(о)
*        content:
*          application/json:
*            schema:
*              type: object
*              properties:
*                _id:
*                  type: string
*                  example: "60d3b41abdacab002f85e0f7"
*                title:
*                  type: string
*                  example: "Заголовок статьи"
*                shortDescription:
*                  type: string
*                  example: "Краткое описание статьи"
*                content:
*                  type: string
*                  example: "Полное содержание статьи"
*                tags:
*                  type: array
*                  items:
*                    type: string
*                  example: ["тег1", "тег2"]
*      404:
*        description: Статья/задание не найдена(о)
*        content:
*          application/json:
*            schema:
*              type: object
*              properties:
*                error:
*                  type: string
*                  example: "Статьязадание не найдена(о)"
*      500:
*        description: Ошибка при получении статьи/задания
*        content:
*          application/json:
*            schema:
*              type: object
*              properties:
*                error:
*                  type: string
*                  example: "Ошибка при получении статьи/задания"
*/
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id);
    if (!article) return res.status(404).json({ error: 'Статья/задание не найдена' });
    res.status(200).json(article);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении статьи/задания' });
  }
});

/**
 * @swagger
 * /api/articles/save-task-result/{id}:
 *   post:
 *     summary: Сохранение результата задания
 *     description: Сохранение нового результата задания с user ID, временем и комментарием.
 *     tags:
 *       - Articles
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID задания
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *                 description: Комментарий о выполнении задания
 *                 example: "Задача выполнена успешно."
 *     responses:
 *       201:
 *         description: Результат задания сохранен успешно
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Task result saved successfully."
 *                 taskResult:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "63f8a1119fa3fbb6f7c70c12"
 *                     date:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-12T10:00:00Z"
 *                     comment:
 *                       type: string
 *                       example: "Задача выполнена успешно."
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "All fields are required."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error."
 */
router.post('/save-task-result/:id', authMiddleware, async (req, res) => {
    try {
        const { comment } = req.body; // Получаем comment из тела запроса
        const { id } = req.params; // Получаем id задания из параметров пути

        // Проверяем, что все обязательные поля присутствуют
        if (!id || !comment) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        // Создаём новую запись
        const taskResult = new UserTaskResult({
            userId: req.user.id, // ID пользователя из authMiddleware
            taskId: id, // ID задания из параметров пути
            date: Date.now(),
            comment,
        });

        // Сохраняем запись в базу данных
        await taskResult.save();

        res.status(201).json({ message: 'Task result saved successfully.', taskResult });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});


/**
 * @swagger
 * /api/articles/task-results/{taskId}:
 *   get:
 *     summary: Получить результаты выполнения задания для конкретного пользователя
 *     description: Возвращает список результатов выполнения задания для указанного пользователя и задания.
 *     tags:
 *       - Articles
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID задания
 *     responses:
 *       200:
 *         description: Успешное получение результатов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Уникальный идентификатор результата
 *                   userId:
 *                     type: string
 *                     description: ID пользователя
 *                   taskId:
 *                     type: string
 *                     description: ID задания
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     description: Дата выполнения задания
 *                   comment:
 *                     type: string
 *                     description: Комментарий к результату
 *       400:
 *         description: Неверные параметры запроса
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Параметры userId и taskId обязательны."
 *       404:
 *         description: Результаты не найдены
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Результаты для данного задания не найдены."
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Ошибка сервера."
 */
router.get('/task-results/:taskId', authMiddleware, async (req, res) => {
    try {
        const { taskId } = req.params;

        if ( !taskId ) {
            return res.status(400).json({ error: 'Параметры userId и taskId обязательны.' });
        }

        const results = await UserTaskResult.find({ userId: req.user.id, taskId });

        if (!results || results.length === 0) {
            return res.status(404).json({ error: 'Результаты для данного задания не найдены.' });
        }

        res.status(200).json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера.' });
    }
});

module.exports = router;