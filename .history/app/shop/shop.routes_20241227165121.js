import express from 'express';
// import { uploadMultiple } from '../middleware/upload.middleware.js';
import {
  createNewShopt,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from './product.controller.js';

const router = express.Router();

router.route('/').get(getProducts).post(createNewProduct);

router.route('/:id').get(getProduct).put(updateProduct).delete(deleteProduct);

export default router;
