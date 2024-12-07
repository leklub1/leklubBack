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
/**
 * Permet de retourner l'id correspondant au libelle
 */
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
/**
 * Permet de mettre à jour la subscription lors de la réception d'un webhook
 * @param {string} subscriptionId - L'ID de la souscription (format Mollie)
 * @param {string} status - Le statut de la souscription (ex: 'active', 'cancelled', etc.)
 * @param {string} nextPaymentDate - La prochaine date de paiement, par ex: '2025-01-07'
 */
export const updateSubscriptionUserService = async (subscriptionId, status, nextPaymentDate) => {
    try {
        const statusId = getIdWithLib(status);

        if (!statusId) {
            console.error(`Statut inconnu: ${status}`);
            return { success: false, message: 'Statut inconnu' };
        }

        const [result] = await db.query(
            'UPDATE subscriptions SET s_StatusId = ?, s_NextPaymentDate = ? WHERE s_SubscriptionId = ?',
            [statusId, nextPaymentDate, subscriptionId]
        );

        if (result.affectedRows === 0) {
            return { success: false, message: 'Aucun abonnement trouvé avec cet ID' };
        }

        return { success: true };
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la subscription :', error);
        throw new Error('Erreur interne du serveur');
    }
};
/**
 * Permet de vérifier si un abonnement est valide
 * @param {*} userId 
 * @returns 
 */
export const isSubscriptionValid = async (userId) => {
    try {
        const [rows] = await db.query(
            'SELECT s_StatusId FROM subscriptions WHERE s_UserId = ? LIMIT 1',
            [userId]
        );

        if (rows.length === 0) {
            console.warn(`Aucune subscription trouvée pour l'utilisateur avec l'ID ${userId}`);
            return false;
        }

        const { s_StatusId } = rows[0];
        return s_StatusId === 1;

    } catch (error) {
        console.error('Erreur lors de la vérification de l\'abonnement :', error);
        throw new Error('Erreur interne du serveur');
    }
};
