import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma.js';

// @desc    Get all feedbacks with pagination, sorting, and filtering
// @route   GET /api/feedbacks
// @access  Private
export const getDiscussions = asyncHandler(async (req, res) => {
  try {
    const { range, sort, filter } = req.query;

    // Извлекаем диапазон, сортировку и фильтры
    const rangeStart = range ? JSON.parse(range)[0] : 0;
    const rangeEnd = range ? JSON.parse(range)[1] : 1000; // Конечная позиция для диапазона

    const sortField = sort ? JSON.parse(sort)[0] : 'createdAt';
    const sortOrder = sort ? JSON.parse(sort)[1].toLowerCase() : 'desc';

    const filters = filter ? JSON.parse(filter) : {};

    // Формируем условия фильтрации
    const where = Object.keys(filters).reduce((acc, field) => {
      const value = filters[field];
      if (Array.isArray(value)) {
        acc[field] = { in: value };
      } else if (typeof value === 'string') {
        acc[field] = { contains: value, mode: 'insensitive' };
      } else {
        acc[field] = { equals: value };
      }
      return acc;
    }, {});

    // Получаем количество фидбэков с учетом фильтров
    const totalDiscussions = await prisma.discussion.count({ where });

    // Получаем фидбэки с учетом пагинации
    const discussions = await prisma.discussion.findMany({
      where,
      skip: rangeStart, // Сколько пропустить (начальный индекс)
      take: rangeEnd - rangeStart + 1, // Сколько записей взять
      orderBy: { [sortField]: sortOrder },
    });

    // Устанавливаем заголовок Content-Range
    res.set(
      'Content-Range',
      `feedbacks ${rangeStart}-${Math.min(rangeEnd, totalDiscussions - 1)}/${totalDiscussions}`
    );

    res.json(feedbacks); // Отправляем список фидбэков
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({ message: 'Error fetching feedbacks', error });
  }
});

// @desc    Get a single feedback
// @route   GET /api/feedbacks/:id
// @access  Private
export const getFeedback = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const feedback = await prisma.feedBack.findUnique({
    where: { id: parseInt(id, 10) },
  });

  if (!feedback) {
    res.status(404).json({ error: 'Feedback not found!' });
    return;
  }

  res.json(feedback);
});

// @desc    Create a new feedback
// @route   POST /api/feedbacks
// @access  Private
export const createFeedback = asyncHandler(async (req, res) => {
  const { comment, phone, userId } = req.body;

  if (!comment || !phone || !userId) {
    console.error('Missing fields:', { comment, phone, userId });
    res.status(400).json({ error: 'Missing comment, phone, or userId!' });
    return;
  }

  try {
    const feedback = await prisma.feedBack.create({
      data: {
        comment,
        phone,
        userId, // Сохраняем userId в базе данных
      },
    });

    res.status(201).json(feedback);
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// @desc    Delete a feedback
// @route   DELETE /api/feedbacks/:id
// @access  Private
export const deleteFeedback = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const feedback = await prisma.feedBack.delete({
      where: {
        id: parseInt(id, 10),
      },
    });

    res.json({ message: 'Feedback deleted!' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(404).json({ error: 'Feedback not found!' });
  }
});
