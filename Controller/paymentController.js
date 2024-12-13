import { createMollieClient } from '@mollie/api-client';
import { handlePaymentWebhookService,getPaymentStatusService,getUserIdByOrderId,getEmailByOrderIdService } from '../Service/paymentService.js';
import { createNewUserSubscription,getIdWithLib } from '../Service/subscriptionService.js';
import { createSubscriptionPayments } from '../Utils/mollieUtils.js';

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
        console.log(payment);
        console.log('MollieId:', mollieId); 
        console.log('Status:', payment.status);  
        console.log("==================================================")

        await handlePaymentWebhookService(mollieId, payment.status);
        return res.status(200).send('OK');
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

        if(status === 2){
            let userId = await getUserIdByOrderId(orderId);
            const { subscriptionId, createdAt, nextPaymentDate, startDate, status } = await createSubscriptionPayments(userId);
            let statusId = getIdWithLib(status);
            await createNewUserSubscription(userId,subscriptionId,startDate,statusId,createdAt,nextPaymentDate);
        }

        if (status === null) {return res.status(404).send('Statut de paiement non trouvé');}

        return res.status(200).json({ status });

    } catch (error) {
        console.error('Erreur lors du traitement du webhook:', error);
        return res.status(500).send('Erreur serveur');
    }
};

export const getEmailIdByOrderId = async (req, res) => {
    const { paymentId } = req.query;

    if (!paymentId) {
        return res.status(400).json({ message: 'Le paramètre paymentId est requis.' });
    }

    try {
        const email = await getEmailByOrderIdService(paymentId);

        if (email) {
            return res.status(200).json({ email });
        } else {
            return res.status(404).json({ message: 'Aucun utilisateur trouvé pour ce paymentId.' });
        }
    } catch (error) {
        console.error('Erreur lors du traitement du webhook:', error);
        return res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
};
