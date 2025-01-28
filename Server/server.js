require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const path = require('path');
const cors = require('cors');

// Настройки для Swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'Документация для API',
    },
    components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "Просто введите сам токен без префикса Bearer",
          },
        },
      },          
    security: [
        {
          bearerAuth: [],
        },
    ],
    servers: [
      {
        url: 'http://localhost:8080',
      },
    ],
  },
  apis: ['./routes/*.js'], // Путь к файлам с документируемыми маршрутами
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


const PORT = process.env.PORT || 5000;

app.use(cors());

// Middleware
app.use(express.json()); // Для работы с JSON-данными

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

// Основной маршрут
app.get('/', (req, res) => {
  res.send("API работает");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


const authRoutes = require('./routes/auth');
app.use('/api', authRoutes);


const protectedRoutes = require('./routes/protectedRoute.js');
app.use('/api', protectedRoutes);


const emotionDiaryRoutes = require('./routes/emotionDiary');
app.use('/api/emotion-diary', emotionDiaryRoutes);

const articles = require('./routes/articles');
app.use('/api/articles', articles);

const tests = require('./routes/tests');
app.use('/api/tests', tests);

// Настраиваем статическую папку
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));