import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  createDiscussion,
  deleteDiscussion,
  getDiscussion,
  getDiscussions,
} from './discussion.controller.js';

const router = express.Router();

// Получить все отзывы
router.route('/').get(getFeedbacks).post(createDiscussion);

// Получить один отзыв по ID
router.route('/:id').get(getFeedback).delete(deleteFeedback);

export default router;
