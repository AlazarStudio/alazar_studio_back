import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma.js';

// Получить caseHomes с пагинацией, сортировкой и фильтрацией
export const getCaseHomes = asyncHandler(async (req, res) => {
  try {
    const { range, sort, filter } = req.query;

    const rangeStart = range ? JSON.parse(range)[0] : 0;
    const rangeEnd = range ? JSON.parse(range)[1] : 1000;

    const sortField = sort ? JSON.parse(sort)[0] : 'createdAt';
    const sortOrder = sort ? JSON.parse(sort)[1].toLowerCase() : 'desc';

    const filters = filter ? JSON.parse(filter) : {};
    const where = Object.entries(filters).reduce((acc, [field, value]) => {
      if (typeof value === 'string') {
        acc[field] = { contains: value, mode: 'insensitive' };
      } else if (Array.isArray(value)) {
        acc[field] = { in: value };
      } else if (typeof value === 'number') {
        acc[field] = { equals: value };
      }
      return acc;
    }, {});

    const totalCaseHomes = await prisma.caseHome.count({ where });

    // Исправляем запрос с правильными связями
    const caseHomes = await prisma.caseHome.findMany({
      where,
      skip: rangeStart,
      take: rangeEnd - rangeStart + 1,
      orderBy: { [sortField]: sortOrder },
      include: {
        developers: { select: { id: true, name: true } },
        categories: true, // Категории остаются как есть
      },
    });

    res.set(
      'Content-Range',
      `caseHomes ${rangeStart}-${Math.min(rangeEnd, totalCaseHomes - 1)}/${totalCaseHomes}`
    );

    res.json(caseHomes);
  } catch (error) {
    console.error('Error fetching case homes:', error);
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
});

// Получить один caseHome по ID
export const getCaseHome = asyncHandler(async (req, res) => {
  try {
    const caseHome = await prisma.caseHome.findUnique({
      where: { id: +req.params.id },
      include: {
        developers: true, // Исправлено, чтобы было правильно связано через developerId
        categories: true, // Привязываем категории
      },
    });

    if (!caseHome) {
      res.status(404);
      throw new Error('Case Home not found!');
    }

    res.json(caseHome);
  } catch (error) {
    console.error('Error fetching case home:', error);
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
});

// Создать новый caseHome
export const createNewCaseHome = asyncHandler(async (req, res) => {
  const { name, price, img, developerId, categoryIds } = req.body;

  if (!name || !categoryIds || categoryIds.length === 0) {
    res.status(400);
    throw new Error('Name and at least one categoryId are required!');
  }

  try {
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds.map((id) => parseInt(id, 10)) } },
      select: { title: true },
    });

    const images = (img || []).map((image) =>
      typeof image === 'object' ? `/uploads/${image.rawFile.path}` : image
    );

    const caseHome = await prisma.caseHome.create({
      data: {
        name,
        img: images,
        price: parseFloat(price),
        developers: { connect: { id: developerId } }, // Связываем через developerId
        categories: {
          connect: categoryIds.map((id) => ({ id: parseInt(id, 10) })), // Привязываем категории
        },
      },
    });

    res.status(201).json(caseHome);
  } catch (error) {
    console.error('Error creating case home:', error);
    res
      .status(500)
      .json({ message: 'Failed to create case home', error: error.message });
  }
});

// Обновить caseHome
export const updateCaseHome = asyncHandler(async (req, res) => {
  const { name, price, img, categoryIds, developerId } = req.body;

  const updateData = {
    ...(name && { name }),
    ...(price && { price: parseFloat(price) }),
    ...(img && { img }),
    ...(developerId && { developer: { connect: { id: developerId } } }), // Связываем через developerId
    ...(categoryIds && {
      categories: {
        set: categoryIds.map((id) => ({ id })), // Привязываем новые категории
      },
    }),
  };

  try {
    const caseHome = await prisma.caseHome.update({
      where: { id: parseInt(req.params.id, 10) },
      data: updateData,
    });

    res.status(200).json(caseHome);
  } catch (error) {
    console.error('Error updating case home:', error);
    res
      .status(500)
      .json({ message: 'Failed to update case home', error: error.message });
  }
});

// Удалить caseHome
export const deleteCaseHome = asyncHandler(async (req, res) => {
  try {
    await prisma.caseHome.delete({
      where: { id: +req.params.id },
    });

    res.json({ message: 'Case Home deleted!' });
  } catch (error) {
    console.error('Error deleting case home:', error);
    res
      .status(500)
      .json({ message: 'Error deleting case home', error: error.message });
  }
});
