import express from 'express';
import {handlePaymentWebhook,getPaymentStatus} from '../Controller/paymentController.js';

const router = express.Router();

router.post('/webhook', handlePaymentWebhook);
router.get('/getStatusPayment',getPaymentStatus)

export default router;