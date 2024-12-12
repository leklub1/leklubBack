import { createMollieClient } from '@mollie/api-client';
import dotenv from 'dotenv';
import {updateSubscriptionUserService,cancelSubscriptionService} from '../Service/subscriptionService.js';
import {cancelSubscriptionMollis} from '../Utils/mollieUtils.js';

dotenv.config();
const mollieClient = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY });

/**
 * Controller qui recois les webhook de mollie
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export const handleSubscriptionWebhook = async (req, res) => {
    const { id: molliePaymentId } = req.body;

    try {
        const payment = await mollieClient.payments.get(molliePaymentId);
        const { subscriptionId, customerId } = payment;
        console.log(payment);
        const subscription = await mollieClient.customerSubscriptions.get(subscriptionId, {customerId,});
        console.log("subscription :", subscription);
        const { nextPaymentDate,status } = subscription;

        let result = await updateSubscriptionUserService(subscriptionId, status, nextPaymentDate);
        console.log("result",result)
        res.status(200).send('OK');
    } catch (error) {
        console.error('Erreur lors du traitement du webhook de souscription:', error);
        res.status(500).send('Erreur serveur');
    }
};

export const cancelSubscription = async (req, res) => {
    const { subscriptionId, customerId } = req.body;

    if (!subscriptionId || !customerId) {
        return res.status(400).json({ error: 'subscriptionId and customerId are required' });
    }

    try {
        const result = await cancelSubscriptionMollis(subscriptionId, customerId);

        if (result.success) {
            let resultbd = await cancelSubscriptionService(subscriptionId);
            if (resultbd) {
                res.status(200).json({ message: 'Subscription cancelled successfully' });
            } else {
                res.status(400).json({ error: 'Error update bdd' });
            }
        } else {
            console.error('Error details:', result.error);
            res.status(500).json({ error: 'Failed to cancel subscription' });
        }
    } catch (error) {
        console.error('Error processing the subscription cancellation:', error);
        res.status(500).json({ error: 'Server error' });
    }
};


