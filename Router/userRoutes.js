import express from 'express';
import {registerEmailUser} from '../Controller/userController.js';

const router = express.Router();

router.post('/registerEmail', registerEmailUser);

export default router;