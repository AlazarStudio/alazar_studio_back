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

router.route('/:id').get(getProduct).put(updateProduct).delete(deleteProduct);

export default router;
