import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma.js';

// @desc    Get developers with pagination, sorting, and filtering
// @route   GET /api/developers
// @access  Private
export const getDevelopers = asyncHandler(async (req, res) => {
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

    const totalDevelopers = await prisma.developer.count({ where });

    const developers = await prisma.developer.findMany({
      where,
      skip: rangeStart,
      take: rangeEnd - rangeStart + 1,
      orderBy: { [sortField]: sortOrder },
      include: {
        cases: true, // Включаем связанные cases
        caseHomes: true, // Включаем связанные case homes
      },
    });

    res.set(
      'Content-Range',
      `developers ${rangeStart}-${Math.min(rangeEnd, totalDevelopers - 1)}/${totalDevelopers}`
    );

    res.json(developers);
  } catch (error) {
    console.error('Error fetching developers:', error);
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
});

// @desc    Get single developer by ID
// @route   GET /api/developers/:id
// @access  Public
export const getDeveloper = asyncHandler(async (req, res) => {
  const developer = await prisma.developer.findUnique({
    where: { id: +req.params.id },
    include: {
      cases: true, // Включаем связанные cases
      caseHomes: true, // Включаем связанные case homes
    },
  });

  if (!developer) {
    res.status(404);
    throw new Error('Developer not found!');
  }

  res.json(developer);
});

// @desc    Create new developer
// @route   POST /api/developers
// @access  Private
export const createNewDeveloper = asyncHandler(async (req, res) => {
  const { name, position, img, telegram, instagram, whatsapp, vk, tiktok, behance, pinterest, artstation } = req.body;

  if (!name || !position) {
    res.status(400);
    throw new Error('Name and position are required!');
  }

  try {
    const developer = await prisma.developer.create({
      data: {
        name,
        position,
        img,
        telegram,
        instagram,
        whatsapp,
        vk,
        tiktok,
        behance,
        pinterest,
        artstation,
      },
    });

    res.status(201).json(developer);
  } catch (error) {
    console.error('Error creating developer:', error);
    res.status(500);
    throw new Error('Failed to create developer');
  }
});

// @desc    Update developer
// @route   PUT /api/developers/:id
// @access  Private
export const updateDeveloper = asyncHandler(async (req, res) => {
  const { name, position, img, telegram, instagram, whatsapp, vk, tiktok, behance, pinterest, artstation } = req.body;

  const updateData = {
    ...(name && { name }),
    ...(position && { position }),
    ...(img && { img }),
    ...(telegram && { telegram }),
    ...(instagram && { instagram }),
    ...(whatsapp && { whatsapp }),
    ...(vk && { vk }),
    ...(tiktok && { tiktok }),
    ...(behance && { behance }),
    ...(pinterest && { pinterest }),
    ...(artstation && { artstation }),
  };

  try {
    const developer = await prisma.developer.update({
      where: { id: parseInt(req.params.id, 10) },
      data: updateData,
    });

    res.status(200).json(developer);
  } catch (error) {
    console.error('Error updating developer:', error);
    res.status(500).json({
      error: 'Failed to update developer',
      message: error.message,
    });
  }
});

// @desc    Delete developer
// @route   DELETE /api/developers/:id
// @access  Private
export const deleteDeveloper = asyncHandler(async (req, res) => {
  try {
    await prisma.developer.delete({
      where: { id: +req.params.id },
    });

    res.json({ message: 'Developer deleted!' });
  } catch (error) {
    console.error('Error deleting developer:', error);
    res
      .status(500)
      .json({ message: 'Error deleting developer', error: error.message });
  }
});
