import express from 'express';
import {createNewUser,getDefaultData,insertUserData,getAllUserData,getAllUsers,getAdvancedData,getUserNameByEmail,reSendQrCode} from '../Controller/userController.js';

const router = express.Router();

router.post('/createNewUser', createNewUser);
router.get('/getDefaultData', getDefaultData);
router.post('/insertUserData',insertUserData);
router.get('/getAllUserData', getAllUserData);
router.get('/getAllusers',getAllUsers)
router.get('/getAdvancedData',getAdvancedData);
router.get('/getUserName',getUserNameByEmail);
router.post('/reSendQrCode',reSendQrCode)

export default router;