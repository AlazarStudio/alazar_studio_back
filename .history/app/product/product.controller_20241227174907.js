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
      if (typeof value === 'string') {
        acc[field] = { contains: value, mode: 'insensitive' };
      } else if (Array.isArray(value)) {
        acc[field] = { in: value };
      } else if (typeof value === 'number') {
        acc[field] = { equals: value };
      }
      return acc;
    }, {});

    const totalProducts = await prisma.product.count({ where });

    const products = await prisma.product.findMany({
      where,
      skip: rangeStart,
      take: rangeEnd - rangeStart + 1,
      orderBy: { [sortField]: sortOrder },
      include: {
        categories: true, // Включаем связанные категории
      },
    });

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
      categories: true, // Включаем связанные категории
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
  console.log('Request body:', req.body);

  const { name, price, img, description, categoryIds, organization, website } =
    req.body;

  if (!name || !price || !categoryIds || categoryIds.length === 0) {
    res.status(400);
    throw new Error('Name, price, and at least one categoryId are required!');
  }

  try {
    // Получаем названия категорий по их ID
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds.map((id) => parseInt(id, 10)) } },
      select: { title: true }, // Только названия категорий
    });

    const tags = categories.map((category) => category.title);

    console.log('Generated tags:', tags);

    // Обработка изображений
    const images = (img || []).map((image) =>
      typeof image === 'object' ? `/uploads/${image.rawFile.path}` : image
    );

    console.log('Processed images:', images);

    // Создаем продукт
    const product = await prisma.product.create({
      data: {
        name,
        img: images,
        price: parseFloat(price),
        description,
        organization,
        tags,
        website, // Добавляем теги как названия категорий
        categories: {
          connect: categoryIds.map((id) => ({ id: parseInt(id, 10) })), // Привязываем категории
        },
      },
    });

    console.log('Product created:', product);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500);
    throw new Error('Failed to create product');
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
export const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, img, categoryIds, website } = req.body;

  // Формируем объект данных для обновления
  const updateData = {
    ...(name && { name }), // Обновляем имя, если оно передано
    ...(price && { price: parseFloat(price) }), // Преобразуем цену в число
    ...(description && { description }), // Обновляем описание
    ...(img && { img }),
    ...(website && { website }),
    ...(categoryIds && {
      categories: {
        set: categoryIds.map((id) => ({ id })), // Устанавливаем новые категории, удаляя старые связи
      },
    }),
  };

  try {
    // Обновление продукта в базе данных
    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id, 10) }, // Идентификатор продукта
      data: updateData,
    });

    res.status(200).json(product); // Возвращаем обновленный продукт
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      error: 'Failed to update product',
      message: error.message,
    });
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
