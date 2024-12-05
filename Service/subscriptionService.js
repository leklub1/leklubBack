import db from '../Config/dbConfig.js';

/**
 * permet de créer un nouvel utilisateur dans la table subscriptions
 * @param {Int} userId
 * @param {Int} paymentId 
 * @returns {Object}
 */
export const createNewUserSubscription = async (userId,paymentId) => {
    try {
        const [result] = await db.query(
            'INSERT INTO subscriptions (s_UserId, s_StatusId, s_PaymentId) VALUES (?, ?, ?)',
            [userId, 3, paymentId] 
        );

        return {
            success: true,
            subscriptionId: result.insertId,
        };
    } catch (error) {
        console.error('Erreur dans le service de création de l\'abonnement :', error);
        throw new Error('Erreur interne du serveur');
    }
};
