import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma.js';

// Получить список Cases с пагинацией, сортировкой и фильтрацией
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
        developers: { select: { id: true, name: true } }, // ✅ исправлено
        categories: true,
      }
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

// Получить один Case по ID
export const getCase = asyncHandler(async (req, res) => {
  try {
    const singleCase = await prisma.case.findUnique({
      where: { id: +req.params.id },
      include: {
        developers: true,
        categories: true,
      },
    });

    if (!singleCase) {
      res.status(404);
      throw new Error('Case not found!');
    }

    res.json(singleCase);
  } catch (error) {
    console.error('Error fetching case:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Создать новый Case
export const createNewCase = asyncHandler(async (req, res) => {
  const { name, price, img, developerId, categoryIds, website } = req.body;

  if (!name || !categoryIds || categoryIds.length === 0) {
    res.status(400);
    throw new Error('Name and at least one categoryId are required!');
  }

  try {
    const images = (img || []).map((image) =>
      typeof image === 'object' ? `/uploads/${image.rawFile.path}` : image
    );

    const createdCase = await prisma.case.create({
      data: {
        name,
        img: images,
        price: price ? parseFloat(price) : null,
        website,
        developer: developerId ? { connect: { id: developerId } } : undefined,
        categories: {
          connect: categoryIds.map((id) => ({ id: parseInt(id, 10) })),
        },
      },
    });

    res.status(201).json(createdCase);
  } catch (error) {
    console.error('Error creating case:', error);
    res.status(500).json({ message: 'Failed to create case', error: error.message });
  }
});

// Обновить Case
export const updateCase = asyncHandler(async (req, res) => {
  const { name, price, img, categoryIds, developerId, website } = req.body;

  const updateData = {
    ...(name && { name }),
    ...(price !== undefined && { price: parseFloat(price) }),
    ...(img && { img }),
    ...(website && { website }),
    ...(developerId && {
      developer: { connect: { id: developerId } },
    }),
    ...(categoryIds && {
      categories: {
        set: categoryIds.map((id) => ({ id })),
      },
    }),
  };

  try {
    const updatedCase = await prisma.case.update({
      where: { id: parseInt(req.params.id, 10) },
      data: updateData,
    });

    res.status(200).json(updatedCase);
  } catch (error) {
    console.error('Error updating case:', error);
    res.status(500).json({ message: 'Failed to update case', error: error.message });
  }
});

// Удалить Case
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
