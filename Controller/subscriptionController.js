import { createMollieClient } from '@mollie/api-client';
import dotenv from 'dotenv';
import {updateSubscriptionUserService} from '../Service/subscriptionService.js'

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

        const subscription = await mollieClient.customerSubscriptions.get(subscriptionId, {customerId,});

        const { nextPaymentDate,status } = subscription;

        let result = await updateSubscriptionUserService(subscriptionId, status, nextPaymentDate);
        console.log("result",result)
        res.status(200).send('OK');
    } catch (error) {
        console.error('Erreur lors du traitement du webhook de souscription:', error);
        res.status(500).send('Erreur serveur');
    }
};


