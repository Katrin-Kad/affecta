const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../models/User'); // модель пользователя
const router = express.Router();

const transporter = nodemailer.createTransport({
  service: 'mail.ru', // Укажите свой сервис, если не Gmail
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
* @swagger
* /api/register:
*  post:
*    summary: Регистрация нового пользователя
*    description: Создает нового пользователя с email, паролем, аватаркой и дополнительными данными.
*    tags:
*      - Authentication
*    requestBody:
*      required: true
*      content:
*        application/json:
*          schema:
*            type: object
*            properties:
*              email:
*                type: string
*                format: email
*                example: "user@example.com"
*              password:
*                type: string
*                format: password
*                example: "securePassword123"
*              firstName:
*                type: string
*                example: "Иван"
*              lastName:
*                type: string
*                example: "Иванов"
*              gender:
*                type: string
*                enum: ["male", "female", "other"]
*                example: "male"
*              birthDate:
*                type: string
*                format: date
*                example: "2000-01-01"
*    responses:
*      201:
*        description: Пользователь успешно зарегистрирован
*        content:
*         application/json:
*            schema:
*              type: object
*              properties:
*                message:
*                  type: string
*                  example: "Пользователь зарегистрирован"
*      400:
*        description: Пользователь с таким email уже существует
*        content:
*          application/json:
*            schema:
*              type: object
*              properties:
*                message:
*                  type: string
*                  example: "Пользователь с таким email уже существует"
*      500:
*        description: Ошибка на сервере
*        content:
*          application/json:
*            schema:
*              type: object
*              properties:
*                message:
*                  type: string
*                  example: "Ошибка на сервере"
*/
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, gender, birthDate } = req.body;

    // Проверка наличия email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    // Хэширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Генерация URL для аватара
    const randomAvatarUrl = `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(email)}`; 
    console.log('Сгенерированный URL аватарки:', randomAvatarUrl);

    // Создание нового пользователя
    const user = new User({
      email,
      password: hashedPassword,
      avatar: randomAvatarUrl,
      firstName,
      lastName,
      gender,
      birthDate: new Date(birthDate),
      role: 'user'
    });

    // Сохранение пользователя в базе данных
    await user.save();

    res.status(201).json({ message: 'Пользователь зарегистрирован' });
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    res.status(500).json({ message: 'Ошибка на сервере' });
  }
});

/**
* @swagger
* /api/login:
*  post:
*    summary: Авторизация пользователя
*    description: Выполняет вход пользователя по email и паролю.
*    tags:
*      - Authentication
*    requestBody:
*      required: true
*      content:
*        application/json:
*          schema:
*            type: object
*            properties:
*              email:
*                type: string
*                format: email
*                example: "user@example.com"
*              password:
*                type: string
*                format: password
*                example: "securePassword123"
*    responses:
*      200:
*        description: Успешная авторизация
*        content:
*          application/json:
*            schema:
*              type: object
*              properties:
*                token:
*                  type: string
*                  example: "jwt-token-example"
*                userId:
*                  type: string
*                  example: "6730bd0ececedaac652cd9aa"
*                email:
*                  type: string
*                  example: "user@example.com"
*                avatar:
*                  type: string
*                  example: "https://example.com/default-avatar.png"
*      400:
*        description: Неверный email или пароль
*        content:
*          application/json:
*            schema:
*              type: object
*              properties:
*                message:
*                  type: string
*                  example: "Неверный email или пароль"
*      500:
*        description: Ошибка на сервере
*        content:
*          application/json:
*            schema:
*              type: object
*              properties:
*                message:
*                  type: string
*                  example: "Ошибка на сервере"
*/
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Поиск пользователя по email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }

    // Создание JWT токена
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, userId: user._id, email: user.email, avatar: user.avatar });
  } catch (error) {
    console.error('Ошибка при авторизации:', error);
    res.status(500).json({ message: 'Ошибка на сервере' });
  }
});

// Запрос восстановления пароля
/**
* @swagger
* /api/forgot-password:
*  post:
*    summary: Запрос восстановления пароля
*    tags:
*      - Authentication
*    requestBody:
*      required: true
*      content:
*        application/json:
*          schema:
*            type: object
*            properties:
*              email:
*                type: string
*                example: "user@example.com"
*    responses:
*      200:
*        description: Письмо для восстановления пароля отправлено
*      404:
*        description: Пользователь не найден
*      500:
*        description: Ошибка на сервере
*/
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Поиск пользователя
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Пользователь с таким email не найден' });
    }

    // Генерация токена восстановления
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 10);
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // Токен действителен 1 час
    await user.save();

    // URL для сброса пароля
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Отправка письма
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Восстановление пароля',
      html: `<p>Вы запросили восстановление пароля. Перейдите по <a href="${resetUrl}">ссылке</a>, чтобы установить новый пароль.</p>`,
    });

    res.status(200).json({ message: 'Письмо для восстановления пароля отправлено' });
  } catch (error) {
    console.error('Ошибка при запросе восстановления пароля:', error);
    res.status(500).json({ message: 'Ошибка на сервере' });
  }
});

// Сброс пароля
/**
* @swagger
* /api/reset-password/{token}:
*  post:
*    summary: Сброс пароля
*    tags:
*      - Authentication
*    parameters:
*      - name: token
*        in: path
*        required: true
*        schema:
*          type: string
*    requestBody:
*      required: true
*      content:
*        application/json:
*          schema:
*            type: object
*            properties:
*              password:
*                type: string
*                example: "newSecurePassword123"
*    responses:
*      200:
*        description: Пароль успешно изменён
*      400:
*        description: Токен недействителен или истёк
*      500:
*        description: Ошибка на сервере
*/
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    
    // Ищем всех пользователей с неистекшими токенами
    const users = await User.find({
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!users.length) {
      return res.status(400).json({ message: 'Токен недействителен или истёк' });
    }

    // Проверяем каждый найденный токен
    let matchedUser = null;
    for (const user of users) {
      const isValid = await bcrypt.compare(token, user.resetPasswordToken);
      if (isValid) {
        matchedUser = user;
        break;
      }
    }

    if (!matchedUser) {
      return res.status(400).json({ message: 'Неверный токен' });
    }

    // Сброс пароля
    matchedUser.password = await bcrypt.hash(password, 10);
    matchedUser.resetPasswordToken = undefined;
    matchedUser.resetPasswordExpires = undefined;
    await matchedUser.save();

    res.status(200).json({ message: 'Пароль успешно изменён' });
  } catch (error) {
    console.error('Ошибка при сбросе пароля:', error);
    res.status(500).json({ message: 'Ошибка на сервере' });
  }
});

module.exports = router;
