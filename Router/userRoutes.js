import express from 'express';
import {createNewUser,getDefaultData,insertUserData,getAllUserData} from '../Controller/userController.js';

const router = express.Router();

router.post('/createNewUser', createNewUser);
router.get('/getDefaultData', getDefaultData);
router.post('/insertUserData',insertUserData);
router.get('/getAllUserData', getAllUserData);

export default router;