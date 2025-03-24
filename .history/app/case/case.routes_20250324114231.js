import express from 'express';
import {
  createNewCase,
  deleteCase,
  getCase,
  getCases,
  updateCase,
} from './case.controller.js';

const router = express.Router();

router.route('/').get(getCases).post(createNewCase);
router.route('/:id').get(getCase).put(updateCase).delete(deleteCase);

export default router;
