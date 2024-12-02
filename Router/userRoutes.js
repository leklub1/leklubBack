import express from 'express';
import {createNewUser} from '../Controller/userController.js';

const router = express.Router();

router.post('/createNewUser', createNewUser);

export default router;