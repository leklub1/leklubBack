import db from '../Config/dbConfig.js';

/**
 * permet de créer un nouvel utilisateur dans la table subscriptions
 * @param {Int} userId
 * @returns {Object}
 */
export const createNewUserSubscription = async (userId,subscriptionId,startDate,statusId,createdAt,nextPaymentDate) => {
    try {
        const [result] = await db.query(
            'INSERT INTO subscriptions (s_UserId, s_SubscriptionId, s_StartDate,s_StatusId,s_CreatedAt,s_NextPaymentDate) VALUES (?, ?, ?, ?, ?, ?)',
            [userId,subscriptionId,startDate,statusId,createdAt,nextPaymentDate] 
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

export const getIdWithLib = (libelle) => {
    switch (libelle) {
        case 'active':
            return 1;
        case 'pending':
            return 2;
        case 'suspended':
            return 3;
        case 'cancelled':
            return 4;
        case 'completed':
            return 5;
        case 'failed':
            return 6;
        default:
            return 7;
    }
};
