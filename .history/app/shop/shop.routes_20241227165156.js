import express from 'express';
// import { uploadMultiple } from '../middleware/upload.middleware.js';
import {
  createNewShop,
  deleteShop,
  getShop,
  getShops,
  updateShop,
} from './product.controller.js';

const router = express.Router();

router.route('/').get(getProducts).post(createNewShop);

router.route('/:id').get(getShop).put(updateShop).delete(deleteShop);

export default router;
