import { createMollieClient } from '@mollie/api-client';
import dotenv from 'dotenv';

dotenv.config();

const mollieClient = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY });

export const handlePaymentWebhook = async (req, res) => {
    console.log('En-têtes de la requête:', req.headers); 
    console.log('Webhook reçu:', req.body);  
  
    const { id: paymentId } = req.body;
  
    if (!paymentId) {
        console.error('ID de paiement manquant dans le webhook');
        return res.status(400).send('ID de paiement manquant');
    }
  
    try {

        const payment = await mollieClient.payments.get(paymentId);
        const isPaid = payment.isPaid();
  
        if (isPaid) {
            console.log('Le paiement a été effectué avec succès !');
            res.status(200).send('Paiement validé');
        } else {
            console.log(`Le paiement n'a pas été effectué, il est actuellement : ${payment.status}`);
            res.status(200).send(`Paiement non validé, statut actuel : ${payment.status}`);
        }
    } catch (error) {
        console.error('Erreur lors du traitement du webhook:', error);
        res.status(500).send('Erreur serveur');
    }
};
