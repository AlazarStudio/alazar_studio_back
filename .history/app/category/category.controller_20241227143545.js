import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma.js';

// @desc    Get categories with pagination, sorting, and filtering
// @route   GET /api/categories
// @access  Private
export const getCategories = asyncHandler(async (req, res) => {
  try {
    const { range, sort, filter } = req.query;

    // Извлекаем диапазон, сортировку и фильтры
    const rangeStart = range ? JSON.parse(range)[0] : 0;
    const rangeEnd = range ? JSON.parse(range)[1] : 1000; // Конечная позиция для диапазона

    const sortField = sort ? JSON.parse(sort)[0] : 'createdAt';
    const sortOrder = sort ? JSON.parse(sort)[1].toLowerCase() : 'desc';

    const filters = filter ? JSON.parse(filter) : {};

    // Формируем условия фильтрации
    const where = Object.keys(filters).reduce((acc, field) => {
      const value = filters[field];
      if (Array.isArray(value)) {
        acc[field] = { in: value };
      } else if (typeof value === 'string') {
        acc[field] = { contains: value, mode: 'insensitive' };
      } else {
        acc[field] = { equals: value };
      }
      return acc;
    }, {});

    // Получаем количество категорий с учетом фильтров
    const totalCategories = await prisma.category.count({ where });

    // Получаем категории с учетом пагинации
    const categories = await prisma.category.findMany({
      where,
      skip: rangeStart, // Сколько пропустить (начальный индекс)
      take: rangeEnd - rangeStart + 1, // Сколько записей взять
      orderBy: { [sortField]: sortOrder },
      include: {
        products: true,
      },
    });

    // console.log('Categories fetched:', categories); // Лог для отладки

    // Устанавливаем заголовок Content-Range
    res.set(
      'Content-Range',
      `categories ${rangeStart}-${Math.min(rangeEnd, totalCategories - 1)}/${totalCategories}`
    );
    res.json(categories); // Отправляем список категорий
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories', error });
  }
});

// @desc    Get single category by ID
// @route   GET /api/categories/:id
// @access  Private
export const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await prisma.category.findUnique({
    where: { id: parseInt(id, 10) },
  });

  if (!category) {
    res.status(404).json({ error: 'Category not found!' });
    return;
  }

  res.json(category);
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private
// export const createNewCategory = asyncHandler(async (req, res) => {
//   const { title } = req.body;

//   if (!title) {
//     res.status(400).json({ error: 'Title is required' });
//     return;
//   }

//   const category = await prisma.category.create({
//     data: {
//       title,
//     },
//   });

//   res.status(201).json(category);
// });

export const createNewCategory = asyncHandler(async (req, res) => {
  const { title} = req.body;

  

  if (!title ) {
    res.status(400).json({ error: 'Title are required' });
    return;
  }

  const category = await prisma.category.create({
    data: {
      title,
      img, // img теперь одиночная строка
    },
  });

  res.status(201).json(category);
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, img } = req.body;

  console.log(req.body);
  

  if (!title || !img) {
    res.status(400).json({ error: 'Title is required for update' });
    return;
  }

  try {
    const updatedCategory = await prisma.category.update({
      where: { id: parseInt(id, 10) },
      data: { title, img },
    });

    res.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(404).json({ error: 'Category not found!' });
  }
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.category.delete({
      where: { id: parseInt(id, 10) },
    });

    res.json({ message: 'Category deleted successfully!' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(404).json({ error: 'Category not found!' });
  }
});
