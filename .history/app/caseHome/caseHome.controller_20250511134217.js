import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma.js';

export const getCaseHomes = asyncHandler(async (req, res) => {
  try {
    const { range, sort, filter } = req.query;

    // Пагинация: по умолчанию 20 записей
    const rangeStart = range ? JSON.parse(range)[0] : 0;
    const rangeEnd = range ? JSON.parse(range)[1] : 19; // max 20 записей

    // Сортировка
    const sortField = sort ? JSON.parse(sort)[0] : 'createdAt';
    const sortOrder = sort ? JSON.parse(sort)[1].toLowerCase() : 'desc';

    // Фильтрация
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

    const caseHomes = await prisma.caseHome.findMany({
      where,
      skip: rangeStart,
      take: rangeEnd - rangeStart + 1,
      orderBy: { [sortField]: sortOrder },
      include: {
        developers: { select: { id: true, name: true } },
        categories: { select: { id: true, title: true } },
      },
    });

    // Если используешь React Admin или что-то, что требует total
    const totalCaseHomes = await prisma.caseHome.count({ where });
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
