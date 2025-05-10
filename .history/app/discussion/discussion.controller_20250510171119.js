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
    const rangeEnd = range ? JSON.parse(range)[1] : 19; // Конечная позиция для диапазона

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

    res.json(discussions); // Отправляем список фидбэков
  } catch (error) {
    console.error('Error fetching discussions:', error);
    res.status(500).json({ message: 'Error fetching discussions', error });
  }
});

// @desc    Get a single feedback
// @route   GET /api/feedbacks/:id
// @access  Private
export const getDiscussion = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const discussion = await prisma.discussion.findUnique({
    where: { id: parseInt(id, 10) },
  });

  if (!discussion) {
    res.status(404).json({ error: 'Discussion not found!' });
    return;
  }

  res.json(discussion);
});

// @desc    Create a new feedback
// @route   POST /api/feedbacks
// @access  Private
export const createDiscussion = asyncHandler(async (req, res) => {
  const { name, phone, email, company, budget, message } = req.body;

  // Проверка обязательных полей
  if (!name || !phone || !email || !company || !budget || !message) {
    console.error('Missing fields:', {
      name,
      phone,
      email,
      company,
      budget,
      message,
    });
    res.status(400).json({
      error: 'Missing name, phone, email, company, budget, or message!',
    });
    return;
  }

  // Преобразование budget в число
  const parsedBudget = parseInt(budget, 10);

  if (isNaN(parsedBudget)) {
    console.error('Invalid budget value:', budget);
    res.status(400).json({ error: 'Budget must be a valid number!' });
    return;
  }

  try {
    // Создание нового обсуждения
    const discussion = await prisma.discussion.create({
      data: {
        name,
        phone,
        email,
        company,
        budget: parsedBudget, // Передаем число
        message,
      },
    });

    res.status(201).json(discussion);
  } catch (error) {
    console.error('Error creating discussion:', error);
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
});



// @desc    Update a discussion
// @route   PUT /api/feedbacks/:id
// @access  Private
export const updateDiscussion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, phone, email, company, budget, message } = req.body;

  try {
    // Проверяем существование обсуждения
    const existingDiscussion = await prisma.discussion.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!existingDiscussion) {
      res.status(404).json({ error: 'Discussion not found!' });
      return;
    }

    // Обновляем обсуждение
    const updatedDiscussion = await prisma.discussion.update({
      where: { id: parseInt(id, 10) },
      data: {
        name: name ?? existingDiscussion.name, // Если поле отсутствует, оставляем старое значение
        phone: phone ?? existingDiscussion.phone,
        email: email ?? existingDiscussion.email,
        company: company ?? existingDiscussion.company,
        budget: budget ?? existingDiscussion.budget,
        message: message ?? existingDiscussion.message,
      },
    });

    res.json(updatedDiscussion); // Возвращаем обновленное обсуждение
  } catch (error) {
    console.error('Error updating discussion:', error);
    res.status(500).json({ message: 'Error updating discussion', error });
  }
});

// @desc    Delete a feedback
// @route   DELETE /api/feedbacks/:id
// @access  Private
export const deleteDiscussion = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const discussion = await prisma.discussion.delete({
      where: {
        id: parseInt(id, 10),
      },
    });

    res.json({ message: 'Discussion deleted!' });
  } catch (error) {
    console.error('Error deleting discussion:', error);
    res.status(404).json({ error: 'Discussion not found!' });
  }
});
