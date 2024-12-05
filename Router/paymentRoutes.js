import express from 'express';
import {handlePaymentWebhook} from '../Controller/paymentController.js';

const router = express.Router();

router.post('/webhook', handlePaymentWebhook);

export default router;