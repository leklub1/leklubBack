import express from 'express';
import {handleSubscriptionWebhook,cancelSubscription} from '../Controller/subscriptionController.js';

const router = express.Router();

router.post('/webhook', handleSubscriptionWebhook);
router.post('/cancel',cancelSubscription)

export default router;