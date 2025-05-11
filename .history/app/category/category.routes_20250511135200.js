import express from 'express';
import {
  createNewCategory,
  deleteCategory,
  getCategory,
  getCategories,
  updateCategory,
} from './category.controller.js';

const router = express.Router();

router.route('/').get(getCategories).post(createNewCategory);
router
  .route('/:id')
  .get(getCategory)
  .put(updateCategory)
  .delete(deleteCategory);

export default router;
