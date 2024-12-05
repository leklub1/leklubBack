import express from 'express';
import {createNewUser,getDefaultData,insertUserData} from '../Controller/userController.js';

const router = express.Router();

router.post('/createNewUser', createNewUser);
router.get('/getDefaultData', getDefaultData);
router.post('/insertUserData',insertUserData);

export default router;