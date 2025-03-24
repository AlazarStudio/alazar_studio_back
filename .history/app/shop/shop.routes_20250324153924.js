import express from 'express';
import {
  getShops,
  getShop,
  createNewShop,
  updateShop,
  deleteShop,
} from '../shop.controller.js';

const router = express.Router();

router.route('/').get(getShops).post(createNewShop);
router.route('/:id').get(getShop).put(updateShop).delete(deleteShop);

export default router;
