import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma.js';

// Повторяем аналогичные действия для модели CaseHome
// @desc    Get caseHomes with pagination, sorting, and filtering
// @route   GET /api/casehomes
// @access  Private
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

    const caseHomes = await prisma.caseHome.findMany({
      where,
      skip: rangeStart,
      take: rangeEnd - rangeStart + 1,
      orderBy: { [sortField]: sortOrder },
      include: {
        developer: true,
        categories: true,
      },
    });

    res.set(
      'Content-Range',
      `caseHomes ${rangeStart}-${Math.min(rangeEnd, totalCaseHomes - 1)}/${totalCaseHomes}`
    );

    res.json(caseHomes);
  } catch (error) {
    console.error('Error fetching case homes:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// @desc    Get single caseHome by ID
// @route   GET /api/casehomes/:id
// @access  Public
export const getCaseHome = asyncHandler(async (req, res) => {
  const caseHome = await prisma.caseHome.findUnique({
    where: { id: +req.params.id },
    include: {
      developer: true,
      Сategories: true,
    },
  });

  if (!caseHome) {
    res.status(404);
    throw new Error('Case Home not found!');
  }

  res.json(caseHome);
});

// @desc    Create new caseHome
// @route   POST /api/casehomes
// @access  Private
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
        developer: { connect: { id: developerId } },
        categories: {
          connect: categoryIds.map((id) => ({ id: parseInt(id, 10) })),
        },
      },
    });

    res.status(201).json(caseHome);
  } catch (error) {
    console.error('Error creating case home:', error);
    res.status(500);
    throw new Error('Failed to create case home');
  }
});

// @desc    Update caseHome
// @route   PUT /api/casehomes/:id
// @access  Private
export const updateCaseHome = asyncHandler(async (req, res) => {
  const { name, price, img, categoryIds, developerId } = req.body;

  const updateData = {
    ...(name && { name }),
    ...(price && { price: parseFloat(price) }),
    ...(img && { img }),
    ...(developerId && { developer: { connect: { id: developerId } } }),
    ...(categoryIds && {
      categories: {
        set: categoryIds.map((id) => ({ id })),
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
    res.status(500).json({ error: 'Failed to update case home', message: error.message });
  }
});

// @desc    Delete caseHome
// @route   DELETE /api/casehomes/:id
// @access  Private
export const deleteCaseHome = asyncHandler(async (req, res) => {
  try {
    await prisma.caseHome.delete({
      where: { id: +req.params.id },
    });

    res.json({ message: 'Case Home deleted!' });
  } catch (error) {
    console.error('Error deleting case home:', error);
    res.status(500).json({ message: 'Error deleting case home', error: error.message });
  }
});
