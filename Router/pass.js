import express from 'express';
import {generatePassHandler} from '../Controller/passController.js';

const router = express.Router();

router.get('/generate-pass', generatePassHandler);

export default router;