import { createMollieClient } from '@mollie/api-client';
import dotenv from 'dotenv';

dotenv.config();

const mollieClient = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY });

/**
 * Crée une souscription mensuelle pour un utilisateur Mollie (test avec userId uniquement).
 *
 * @param {string} userId - L'ID utilisateur associé.
 * @param {string} webhookUrl - L'URL pour les notifications de paiement.
 * @returns {Promise<string>} - URL de redirection pour le paiement.
 */
export async function createMonthlySubscription(userId, webhookUrl) {
    try {
        const payment = await mollieClient.payments.create({
            amount: { value: '4.80', currency: 'EUR' },
            description: `Subscription for user ${userId}`,
            redirectUrl: `http://localhost/LeKlub/LeKlubFront/payment.html`, 
            webhookUrl,
            metadata: { userId }, 
        });

        const paymentId = payment.id;

        if (payment && payment._links && payment._links.checkout) {
            return {
                paymentId, 
                paymentUrl: payment._links.checkout.href
            };
        } else {
            throw new Error('Erreur lors de la génération de l\'URL de paiement.');
        }
    } catch (error) {
        console.error('Erreur lors de la création de la souscription :', error);
        throw error;
    }
}
