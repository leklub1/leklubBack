import express from 'express';
import {handleSubscriptionWebhook,cancelSubscription,checkIfUserHasAlreadySubscribed} from '../Controller/subscriptionController.js';

const router = express.Router();

router.post('/webhook', handleSubscriptionWebhook);
router.post('/cancel',cancelSubscription)
router.get('/checkIfUserHasAlreadySubscribed',checkIfUserHasAlreadySubscribed)

export default router;