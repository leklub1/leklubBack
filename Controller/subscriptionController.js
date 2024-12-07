import { createMollieClient } from '@mollie/api-client';
import dotenv from 'dotenv';

dotenv.config();
const mollieClient = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY });

/**
 * Controller qui recois les webhook de mollie
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export const handleSubscriptionWebhook = async (req, res) => {
    const { id: molliePaymentId } = req.body; // ID de paiement reçu dans le webhook

    try {

        const payment = await mollieClient.payments.get(molliePaymentId);

        console.log("================== SUBSCRIPTION REÇU ======================");
        console.log('Détails du paiement:', payment);
        console.log("=======================================================");

        res.status(200).send('OK');
    } catch (error) {
        console.error('Erreur lors du traitement du webhook de souscription:', error);
        res.status(500).send('Erreur serveur');
    }
};
