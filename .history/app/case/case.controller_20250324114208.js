import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma.js';

// @desc    Get cases with pagination, sorting, and filtering
// @route   GET /api/cases
// @access  Private
export const getCases = asyncHandler(async (req, res) => {
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

    const totalCases = await prisma.case.count({ where });

    const cases = await prisma.case.findMany({
      where,
      skip: rangeStart,
      take: rangeEnd - rangeStart + 1,
      orderBy: { [sortField]: sortOrder },
      include: {
        developer: true, // Включаем связанные данные разработчика
        categories: true, // Включаем связанные категории
      },
    });

    res.set(
      'Content-Range',
      `cases ${rangeStart}-${Math.min(rangeEnd, totalCases - 1)}/${totalCases}`
    );

    res.json(cases);
  } catch (error) {
    console.error('Error fetching cases:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// @desc    Get single case by ID
// @route   GET /api/cases/:id
// @access  Public
export const getCase = asyncHandler(async (req, res) => {
  const caseData = await prisma.case.findUnique({
    where: { id: +req.params.id },
    include: {
      developer: true,
      categories: true,
    },
  });

  if (!caseData) {
    res.status(404);
    throw new Error('Case not found!');
  }

  res.json(caseData);
});

// @desc    Create new case
// @route   POST /api/cases
// @access  Private
export const createNewCase = asyncHandler(async (req, res) => {
  const { name, price, img, website, categoryIds, developerId } = req.body;

  if (!name || !price || !categoryIds || categoryIds.length === 0) {
    res.status(400);
    throw new Error('Name, price, and at least one categoryId are required!');
  }

  try {
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds.map((id) => parseInt(id, 10)) } },
      select: { title: true },
    });

    const tags = categories.map((category) => category.title);

    const images = (img || []).map((image) =>
      typeof image === 'object' ? `/uploads/${image.rawFile.path}` : image
    );

    const caseData = await prisma.case.create({
      data: {
        name,
        img: images,
        price: parseFloat(price),
        website,
        developer: { connect: { id: developerId } },
        categories: {
          connect: categoryIds.map((id) => ({ id: parseInt(id, 10) })),
        },
      },
    });

    res.status(201).json(caseData);
  } catch (error) {
    console.error('Error creating case:', error);
    res.status(500);
    throw new Error('Failed to create case');
  }
});

// @desc    Update case
// @route   PUT /api/cases/:id
// @access  Private
export const updateCase = asyncHandler(async (req, res) => {
  const { name, price, img, categoryIds, website, developerId } = req.body;

  const updateData = {
    ...(name && { name }),
    ...(price && { price: parseFloat(price) }),
    ...(img && { img }),
    ...(website && { website }),
    ...(developerId && { developer: { connect: { id: developerId } } }),
    ...(categoryIds && {
      categories: {
        set: categoryIds.map((id) => ({ id })),
      },
    }),
  };

  try {
    const caseData = await prisma.case.update({
      where: { id: parseInt(req.params.id, 10) },
      data: updateData,
    });

    res.status(200).json(caseData);
  } catch (error) {
    console.error('Error updating case:', error);
    res.status(500).json({ error: 'Failed to update case', message: error.message });
  }
});

// @desc    Delete case
// @route   DELETE /api/cases/:id
// @access  Private
export const deleteCase = asyncHandler(async (req, res) => {
  try {
    await prisma.case.delete({
      where: { id: +req.params.id },
    });

    res.json({ message: 'Case deleted!' });
  } catch (error) {
    console.error('Error deleting case:', error);
    res.status(500).json({ message: 'Error deleting case', error: error.message });
  }
});
