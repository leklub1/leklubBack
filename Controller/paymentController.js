import { createMollieClient } from '@mollie/api-client';
import { handlePaymentWebhookService,getPaymentStatusService } from '../Service/paymentService.js';
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
        console.log("================== PAYEMENT=======================")
        console.log('MollieId:', mollieId); 
        console.log('Status:', payment.status);  
        console.log("==================================================")

        await handlePaymentWebhookService(mollieId, payment.status);

    } catch (error) {
        console.error('Erreur lors du traitement du webhook:', error);
        return res.status(500).send('Erreur serveur');
    }
};
/**
 * Controller qui permet d'envoyer le status par rapport a un orderId
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export const getPaymentStatus = async (req, res) => {
    const { orderId } = req.query;

    try {
        const status = await getPaymentStatusService(orderId);

        if (status === null) {return res.status(404).send('Statut de paiement non trouvé');}

        return res.status(200).json({ status });

    } catch (error) {
        console.error('Erreur lors du traitement du webhook:', error);
        return res.status(500).send('Erreur serveur');
    }
};