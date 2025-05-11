import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma.js';

// @desc    Get categories with pagination, sorting, and filtering
// @route   GET /api/categories
// @access  Private
export const getCategories = asyncHandler(async (req, res) => {
  try {
    const { range, sort, filter } = req.query;

    const rangeStart = range ? JSON.parse(range)[0] : 0;
    const rangeEnd = range ? JSON.parse(range)[1] : 19;

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

    const totalCategories = await prisma.category.count({ where });

    const categories = await prisma.category.findMany({
      where,
      skip: rangeStart,
      take: rangeEnd - rangeStart + 1,
      orderBy: { [sortField]: sortOrder },
      include: {
        cases: true, // Заменили на правильное имя поля
        caseHomes: true, // Заменили на правильное имя поля
      },
    });

    res.set(
      'Content-Range',
      `categories ${rangeStart}-${Math.min(rangeEnd, totalCategories - 1)}/${totalCategories}`
    );

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
});

// @desc    Get single category by ID
// @route   GET /api/categories/:id
// @access  Public
export const getCategory = asyncHandler(async (req, res) => {
  const category = await prisma.category.findUnique({
    where: { id: +req.params.id },
    include: {
      cases: true, // Заменили на правильное имя поля
      caseHomes: true, // Заменили на правильное имя поля
    },
  });

  if (!category) {
    res.status(404);
    throw new Error('Category not found!');
  }

  res.json(category);
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private
export const createNewCategory = asyncHandler(async (req, res) => {
  const { title, caseIds, caseHomeIds } = req.body; // Обновлено для связи с несколькими кейсами

  if (!title) {
    res.status(400);
    throw new Error('Title is required!');
  }

  try {
    const category = await prisma.category.create({
      data: {
        title,
        cases: {
          connect: caseIds?.map((id) => ({ id })) || [], // Связь с кейсами
        },
        caseHomes: {
          connect: caseHomeIds?.map((id) => ({ id })) || [], // Связь с caseHomes
        },
      },
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500);
    throw new Error('Failed to create category');
  }
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
export const updateCategory = asyncHandler(async (req, res) => {
  const { title, caseIds, caseHomeIds } = req.body;

  const updateData = {
    ...(title && { title }),
    ...(caseIds && {
      cases: {
        set: caseIds.map((id) => ({ id })),
      },
    }),
    ...(caseHomeIds && {
      caseHomes: {
        set: caseHomeIds.map((id) => ({ id })),
      },
    }),
  };

  try {
    const category = await prisma.category.update({
      where: { id: parseInt(req.params.id, 10) },
      data: updateData,
    });

    res.status(200).json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res
      .status(500)
      .json({ error: 'Failed to update category', message: error.message });
  }
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
export const deleteCategory = asyncHandler(async (req, res) => {
  try {
    await prisma.category.delete({
      where: { id: +req.params.id },
    });

    res.json({ message: 'Category deleted!' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res
      .status(500)
      .json({ message: 'Error deleting category', error: error.message });
  }
});
