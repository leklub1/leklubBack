import { createMollieClient } from '@mollie/api-client';
import { handlePaymentWebhookService } from '../Service/paymentService.js';
import dotenv from 'dotenv';

dotenv.config();
const mollieClient = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY });

/**
 * Controller qui recois les webhook de mollie
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export const handlePaymentWebhook = async (req, res) => {

    const { id: mollieId } = req.body;

    try {
        const payment = await mollieClient.payments.get(mollieId);
        console.log('MollieId:', mollieId); 
        console.log('Status:', payment.status);  

        await handlePaymentWebhookService(mollieId, payment.status);

    } catch (error) {
        console.error('Erreur lors du traitement du webhook:', error);
        return res.status(500).send('Erreur serveur');
    }
};
