import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma.js';

// Получить список магазинов с пагинацией, сортировкой и фильтрацией
export const getShops = asyncHandler(async (req, res) => {
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

    const totalShops = await prisma.shop.count({ where });

    const shops = await prisma.shop.findMany({
      where,
      skip: rangeStart,
      take: rangeEnd - rangeStart + 1,
      orderBy: { [sortField]: sortOrder },
      include: {
        categories: true,
      },
    });

    res.set(
      'Content-Range',
      `shops ${rangeStart}-${Math.min(rangeEnd, totalShops - 1)}/${totalShops}`
    );

    res.json(shops);
  } catch (error) {
    console.error('Error fetching shops:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Получить один магазин по ID
export const getShop = asyncHandler(async (req, res) => {
  try {
    const shop = await prisma.shop.findUnique({
      where: { id: +req.params.id },
      include: {
        categories: true,
      },
    });

    if (!shop) {
      res.status(404);
      throw new Error('Shop not found!');
    }

    res.json(shop);
  } catch (error) {
    console.error('Error fetching shop:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Создать новый магазин
export const createNewShop = asyncHandler(async (req, res) => {
  const { name, price, img, categoryIds, website } = req.body;

  if (!name || !categoryIds || categoryIds.length === 0) {
    res.status(400);
    throw new Error('Name and at least one categoryId are required!');
  }

  try {
    const images = (img || []).map((image) =>
      typeof image === 'object' ? `/uploads/${image.rawFile.path}` : image
    );

    const shop = await prisma.shop.create({
      data: {
        name,
        img: images,
        price: price ? parseFloat(price) : null,
        website,
        categories: {
          connect: categoryIds.map((id) => ({ id: parseInt(id, 10) })),
        },
      },
    });

    res.status(201).json(shop);
  } catch (error) {
    console.error('Error creating shop:', error);
    res.status(500).json({ message: 'Failed to create shop', error: error.message });
  }
});

// Обновить магазин
export const updateShop = asyncHandler(async (req, res) => {
  const { name, price, img, categoryIds, website } = req.body;

  const updateData = {
    ...(name && { name }),
    ...(price !== undefined && { price: parseFloat(price) }),
    ...(img && { img }),
    ...(website && { website }),
    ...(categoryIds && {
      categories: {
        set: categoryIds.map((id) => ({ id })),
      },
    }),
  };

  try {
    const shop = await prisma.shop.update({
      where: { id: parseInt(req.params.id, 10) },
      data: updateData,
    });

    res.status(200).json(shop);
  } catch (error) {
    console.error('Error updating shop:', error);
    res.status(500).json({ message: 'Failed to update shop', error: error.message });
  }
});

// Удалить магазин
export const deleteShop = asyncHandler(async (req, res) => {
  try {
    await prisma.shop.delete({
      where: { id: +req.params.id },
    });

    res.json({ message: 'Shop deleted!' });
  } catch (error) {
    console.error('Error deleting shop:', error);
    res.status(500).json({ message: 'Error deleting shop', error: error.message });
  }
});
