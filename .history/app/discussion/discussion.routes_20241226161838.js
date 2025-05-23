import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  createDis,
  deleteFeedback,
  getFeedback,
  getFeedbacks,
} from './discussion.controller.js';

const router = express.Router();

// Получить все отзывы
router.route('/').get(getFeedbacks).post(createFeedback);

// Получить один отзыв по ID
router.route('/:id').get(getFeedback).delete(deleteFeedback);

export default router;
