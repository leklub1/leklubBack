import express from 'express';
import {handlePaymentWebhook,getPaymentStatus,getEmailIdByOrderId} from '../Controller/paymentController.js';

const router = express.Router();

router.post('/webhook', handlePaymentWebhook);
router.get('/getStatusPayment',getPaymentStatus)
router.get('/getEmailIdByOrderId',getEmailIdByOrderId)

export default router;