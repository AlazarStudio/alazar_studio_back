import express from 'express';
// import { uploadMultiple } from '../middleware/upload.middleware.js';
import {
  createNewShop,
  deleteShop,
  getShop,
  getShops,
  updateShop,
} from './shop.controller.js';

const router = express.Router();

router.route('/').get(getShops).post(createNewShop);

router.route('/:id').get(getShop).put(updateShop).delete(deleteShop);

export default router;
