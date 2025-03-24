import express from 'express';
import {
  createNewDeveloper,
  deleteDeveloper,
  getDeveloper,
  getDevelopers,
  updateDeveloper,
} from './developer.controller.js';

const router = express.Router();

router.route('/').get(getDevelopers).post(createNewDeveloper);

router.route('/:id').get(getDeveloper).put(updateDeveloper).delete(deleteDeveloper);

export default router;
