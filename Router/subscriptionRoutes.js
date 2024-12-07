import express from 'express';
import {handleSubscriptionWebhook} from '../Controller/subscriptionController.js';

const router = express.Router();

router.post('/webhook', handleSubscriptionWebhook);

export default router;