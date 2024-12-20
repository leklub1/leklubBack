import { createMollieClient } from '@mollie/api-client';
import dotenv from 'dotenv';
import db from '../Config/dbConfig.js';

dotenv.config();

const mollieClient = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY });

/**
 * Crée une souscription mensuelle pour un utilisateur Mollie (test avec userId uniquement).
 *
 * @param {string} userId - L'ID utilisateur associé.
 * @param {string} webhookUrl - L'URL pour les notifications de paiement.
 * @returns {Promise<string>} - URL de redirection pour le paiement.
 */
export async function createPayment(orderId, webhookUrl,customerId) {
    try {


        const payment = await mollieClient.payments.create({
            amount: { value: '4.80', currency: 'EUR' },
            description: `Abonnement mensuel : ${orderId}`,
            redirectUrl: `https://leklubtoulouse.fr/checkPayment.html?paymentId=${orderId}`,
            webhookUrl,
            metadata: { orderId }, 
            customerId: customerId,
            method: 'creditcard',
            sequenceType: 'first',
        });

        const paymentId = payment.id;

        if (payment && payment._links && payment._links.checkout) {
            return {
                paymentId, 
                paymentUrl: payment._links.checkout.href,
            };
        } else {
            throw new Error('Erreur lors de la génération de l\'URL de paiement.');
        }
    } catch (error) {
        console.error('Erreur lors de la création de la souscription :', error);
        throw error;
    }
}

/**
 * Permet de crée une subscription une fois le payement effectuer le formulaire remplit
 * @param {*} userId 
 * @returns 
 */
export const createSubscriptionPayments = async (userId) => {
    try {
        let [rows] = await db.query(
            'SELECT u_CustomerId FROM users WHERE u_Id = ?',
            [userId]
        );
        if (rows.length === 0) {
            return null;
        } else {

            const startSubscrition = new Date();
            const isoStartDate = startSubscrition.toISOString().split('T')[0]; 
            
            const subscription = await mollieClient.customerSubscriptions.create({
                customerId: rows[0].u_CustomerId,
                amount: { value: '4.80', currency: 'EUR' },
                times: null,
                interval: '1 months',
                description: 'subscription payment',
                webhookUrl: 'https://leklubtoulouse.fr/api/subscription/webhook',
                startDate: isoStartDate,
            });
            
          
            const subscriptionId = subscription.id;
            const createdAt = subscription.createdAt;
            const nextPaymentDate = subscription.nextPaymentDate;
            const startDate = subscription.startDate;
            const status = subscription.status;

            const result = {
                subscriptionId,
                createdAt,
                nextPaymentDate,
                startDate,
                status,
            };

            return result;
        }
    } catch (error) {
        console.error(`Erreur lors de la subscription ${userId} :`, error);
        throw new Error('Erreur interne du serveur');
    }
}
/**
 * Permet de crée un identifiant Mollie
 * @param {*} email 
 * @returns 
 */
export const createMollieCustomer = async (email) => {
    try {
        const customer = await mollieClient.customers.create({
            email: email,  
        });

        console.log('Customer created with ID:', customer.id);
        return customer.id;
    } catch (error) {
        console.error('Error creating Mollie customer:', error);
        throw error;
    }
};
/**
 * Permet d'arreter un abonnement
 * @param {*} subscriptionId 
 * @param {*} customerId 
 */
export const cancelSubscriptionMollis = async (subscriptionId, customerId) => {
    try {

        const subscription = await mollieClient.customerSubscriptions.delete(subscriptionId, { customerId });
        return { success: true, data: subscription };
        
    } catch (error) {
        console.warn('Error cancelling subscription:', error);
        return { success: false, error };
    }
};
