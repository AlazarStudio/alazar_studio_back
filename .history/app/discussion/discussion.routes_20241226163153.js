import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  createDiscussion,
  deleteDiscussion,
  getDiscussion,
  getDiscussions,
  updateDiscussion,
} from './discussion.controller.js';

const router = express.Router();

// Получить все отзывы
router.route('/').get(getDiscussions).post(createDiscussion);

// Получить один отзыв по ID
router
  .route('/:id')
  .get(getDiscussion)
  .put(updateDiscussion)
  .delete(deleteDiscussion);

export default router;
