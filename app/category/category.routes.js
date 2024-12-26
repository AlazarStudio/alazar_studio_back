import express from 'express';
import {
  getCategories,
  getCategory,
  createNewCategory,
  updateCategory,
  deleteCategory,
} from './category.controller.js';

const router = express.Router();

router.route('/').get(getCategories).post(createNewCategory);
router
  .route('/:id')
  .get(getCategory)
  .put(updateCategory)
  .delete(deleteCategory);

export default router;
