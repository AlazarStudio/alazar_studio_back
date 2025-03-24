import express from 'express';
import {
  createNewCaseHome,
  deleteCaseHome,
  getCaseHome,
  getCaseHomes,
  updateCaseHome,
} from './caseHome.controller.js';

const router = express.Router();

router.route('/').get(getCaseHomes).post(createNewCaseHome);
router.route('/:id').get(getCaseHome).put(updateCaseHome).delete(deleteCaseHome);

export default router;
