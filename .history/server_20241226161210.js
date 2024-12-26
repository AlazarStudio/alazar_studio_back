import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import multer from 'multer';
import xml2js from 'xml2js'; // Импорт для парсинга XML
import sharp from 'sharp';
import { errorHandler, notFound } from './app/middleware/error.middleware.js';
import { prisma } from './app/prisma.js';

import cors from 'cors';
import { errorHandler, notFound } from './app/middleware/error.middleware.js';
import { prisma } from './app/prisma.js';

import authRoutes from './app/auth/auth.routes.js';
import userRoutes from './app/user/user.routes.js';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: ['http://127.0.0.1:5173', 'http://localhost:5000'], // Источники фронтенда
    credentials: true, // Включение поддержки куки
    exposedHeaders: ['Content-Range'], // Если требуется для API
  })
);

const storage1 = multer.memoryStorage();

// Настройка `multer` для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    fs.mkdirSync(uploadDir, { recursive: true }); // Создаем папку, если она не существует
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

async function main() {
  if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

  app.use(express.json());

  const __dirname = path.resolve();

  app.use('/uploads', express.static(path.join(__dirname, '/uploads/')));

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);

  app.use(notFound);
  app.use(errorHandler);

  const PORT = process.env.PORT || 5000;

  app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`)
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
