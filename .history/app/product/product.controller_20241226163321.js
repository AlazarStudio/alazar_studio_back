import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma.js';

// @desc    Get products with pagination, sorting, and filtering
// @route   GET /api/products
// @access  Private
export const getProducts = asyncHandler(async (req, res) => {
  try {
    const { range, sort, filter } = req.query;

    const rangeStart = range ? JSON.parse(range)[0] : 0;
    const rangeEnd = range ? JSON.parse(range)[1] : 1000;

    const sortField = sort ? JSON.parse(sort)[0] : 'createdAt';
    const sortOrder = sort ? JSON.parse(sort)[1].toLowerCase() : 'desc';

    const filters = filter ? JSON.parse(filter) : {};
    const where = Object.entries(filters).reduce((acc, [field, value]) => {
      // Обработка фильтров
      if (typeof value === 'string') {
        acc[field] = { contains: value, mode: 'insensitive' }; // Для строк
      } else if (Array.isArray(value)) {
        acc[field] = { in: value }; // Для массивов
      } else if (typeof value === 'number') {
        acc[field] = { equals: value }; // Для чисел
      }
      return acc;
    }, {});

    // Подсчёт общего количества продуктов с фильтром
    const totalProducts = await prisma.product.count({ where });

    // Получение продуктов с пагинацией, сортировкой и фильтрацией
    const products = await prisma.product.findMany({
      where,
      skip: rangeStart,
      take: rangeEnd - rangeStart + 1,
      orderBy: { [sortField]: sortOrder },
      include: {
        // category: true, // Если нужно, добавьте связанные поля
        // subCategory: true,
        // businessSolution: true,
      },
    });

    // Установка заголовка Content-Range для пагинации
    res.set(
      'Content-Range',
      `products ${rangeStart}-${Math.min(rangeEnd, totalProducts - 1)}/${totalProducts}`
    );

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
});

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProduct = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: +req.params.id },
    include: {
      // characteristics: true,
      // category: true,
      // subCategory: true,
      // businessSolution: true,
    },
  });

  if (!product) {
    res.status(404);
    throw new Error('Product not found!');
  }

  res.json(product);
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private
export const createNewProduct = asyncHandler(async (req, res) => {
  const { name, price, img, description } = req.body;

  // Обработка изображений
  const images = img.map((image) =>
    typeof image === 'object' ? `/uploads/${image.rawFile.path}` : image
  );

  if (!name || !price || !categoryId) {
    res.status(400);
    throw new Error('Name, price, and categoryId are required!');
  }

  // Создание нового продукта
  const product = await prisma.product.create({
    data: {
      name,
      img: images,
      price: parseFloat(price),
      description,
      characteristics,
      categoryId: parseInt(categoryId, 10),
      subCategoryId: subCategoryId ? parseInt(subCategoryId, 10) : null,
      businessSolutionId: businessSolutionId
        ? parseInt(businessSolutionId, 10)
        : null,
    },
  });

  res.status(201).json(product);
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
export const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    description,
    characteristics,
    categoryId,
    img,
    subCategoryId,
    businessSolutionId,
  } = req.body;

  // Формируем объект для обновления данных продукта
  const updateData = {
    ...(name && { name }),
    img,
    ...(price && { price: parseFloat(price) }),
    ...(description && { description }),
    ...(characteristics && {
      characteristics: { update: characteristics }, // Обработка характеристик
    }),
    ...(categoryId && {
      Category: { connect: { id: parseInt(categoryId, 10) } }, // Обновление категории через связь
    }),
    ...(subCategoryId && {
      SubCategory: { connect: { id: parseInt(subCategoryId, 10) } }, // Обновление подкатегории через связь
    }),
    ...(businessSolutionId && {
      BusinessSolution: { connect: { id: parseInt(businessSolutionId, 10) } }, // Обновление бизнес-решения через связь
    }),
  };

  try {
    // Обновление продукта в базе данных
    const product = await prisma.product.update({
      where: { id: +req.params.id }, // Идентификатор продукта
      data: updateData,
    });

    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res
      .status(500)
      .json({ error: 'Error updating product', message: error.message });
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
export const deleteProduct = asyncHandler(async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: +req.params.id },
    });

    res.json({ message: 'Product deleted!' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res
      .status(500)
      .json({ message: 'Error deleting product', error: error.message });
  }
});
