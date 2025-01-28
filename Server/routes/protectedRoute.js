const express = require('express');
const authMiddleware = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');
const router = express.Router();

// Проверка токена
/**
 * @swagger
 * /api/protected:
 *   get:
 *     summary: Проверка соединения
 *     tags: [Protected]
 *     security:
 *         - bearerAuth: []
 *     responses:
 *       200:
 *         description: Доступ разрешен — защищенный контент
 *       401:
 *         description: Неавторизован — токен отсутствует или недействителен
 *       403:
 *         description: Доступ запрещен — недостаточно прав
 */
router.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// Защищенный маршрут только для администраторов
/**
 * @swagger
 * /api/admin:
 *   get:
 *     summary: Доступ только для администраторов
 *     tags: [Protected]
 *     security:
 *         - bearerAuth: []
 *     responses:
 *       200:
 *         description: Доступ разрешен — администраторский контент
 *       401:
 *         description: Неавторизован — токен отсутствует или недействителен
 *       403:
 *         description: Доступ запрещен — недостаточно прав
 */
router.get('/admin', authMiddleware, checkRole("admin"), (req, res) => {
  res.json({ message: 'Добро пожаловать, администратор!', user: req.user });
});


module.exports = router;
