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
 * @param {*} subId 
 * @returns 
 */
export const isSubscriptionValidBySubId = async (subId) => {
    try {
        const [rows] = await db.query(
            'SELECT s_StatusId FROM subscriptions WHERE s_SubscriptionId = ? LIMIT 1',
            [subId]
        );

        if (rows.length === 0) {
            console.warn(`Aucune subscription trouvée pour l'utilisateur avec l'ID ${subId}`);
            return false;
        }

        const { s_StatusId } = rows[0];
        return s_StatusId === 1;

    } catch (error) {
        console.error('Erreur lors de la vérification de l\'abonnement :', error);
        throw new Error('Erreur interne du serveur');
    }
};

/**
 * Fonction qui permet si un utilisateur a un abonnement
 * @param {*} userId 
 * @returns 
 */
export const checkIfUserHasSubscription = async (userId) => {
    try {
        const [rows] = await db.query(`
            SELECT * FROM subscriptions WHERE s_UserId = ?
        `, [userId]);

        return rows.length > 0;
    } catch (error) {
        console.error('Erreur lors de la vérification si l\'utilisateur a une souscription :', error);
        throw new Error('Erreur interne du serveur');
    }
};
/**
 * Permet de vérifier si un utilisateur à un abonnement valide
 * @param {*} userId 
 * @returns 
 */
export const checkIfuserHasSubscriptionValid = async (userId) => {
    try {
        const [rows] = await db.query(`
        SELECT * FROM subscriptions WHERE s_UserId = ? AND s_StatusId = 1 
        `, [userId]);

        return rows.length > 0;
    } catch (error) {
        console.error('Erreur lors de la vérification si l\'utilisateur a une souscription :', error);
        throw new Error('Erreur interne du serveur');
    }
}
/**
 * Permet de mettre a jour quand le bouton stopper est cliquer sur le dashboard
 * @param {*} subscriptionId 
 * @returns 
 */
export const cancelSubscriptionService = async (subscriptionId) => {
    try {
        const [result] = await db.query(
            'UPDATE subscriptions SET s_EndSubscription = s_NextPaymentDate, s_NextPaymentDate = NULL WHERE s_SubscriptionId = ?',
            [subscriptionId] 
        );

        return result.affectedRows > 0;
    } catch (error) {
        console.error('Erreur lors de l\'annulation de la souscription :', error); 
        throw new Error('Erreur interne du serveur');
    }
};
/**
 * Permet de récupérer la subscription active
 * @param {*} userId 
 * @returns 
 */
export const getSubscriptionActuallyByUserService = async (userId) => {
    try {
        const [rows] = await db.query(`
        SELECT s_SubscriptionId FROM subscriptions WHERE s_UserId = ? AND (s_StatusId = 1 OR s_StatusId = 2)
        `, [userId]);

        if(rows.length > 0){
            return rows[0].s_SubscriptionId;
        }else{
            return null
        }
    } catch (error) {
        console.error('Erreur lors de la vérification si l\'utilisateur a une souscription :', error);
        throw new Error('Erreur interne du serveur');
    }
}
/**
 * Permet de récupérer l'id de l'utilisateur par rapport a son subID
 * @param {*} subId 
 * @returns 
 */
export const getUserIdBySubscriptionIdService = async (subId) => {
    try {
        const [rows] = await db.query(`
        SELECT s_UserId FROM subscriptions WHERE s_SubscriptionId = ?
        `, [subId]);

        if(rows.length > 0){
            return rows[0].s_UserId;
        }else{
            return null
        }
    } catch (error) {
        console.error('Erreur lors de la vérification si l\'utilisateur a une souscription :', error);
        throw new Error('Erreur interne du serveur');
    }
}
/**
 * Permet de voir le nombre total d'abonnement qu'il a eu 
 */
export const checkIfUseHasAlreadyHadSubscription = async (userId) => {
    try {
        const [rows] = await db.query(`
            SELECT COUNT(*) AS count 
            FROM subscriptions 
            WHERE s_UserId = ?
        `, [userId]);
        return rows[0].count > 1;
    } catch (error) {
        console.error('Erreur lors de la vérification si l\'utilisateur a une souscription :', error);
        throw new Error('Erreur interne du serveur');
    }
}

export const updateValidSubscription = async (subId) => {
    try {
        const [result] = await db.query(
            'UPDATE subscriptions SET s_IsValid = 1 WHERE s_SubscriptionId = ?',
            [subId] 
        );

        return result.affectedRows > 0;
    } catch (error) {
        console.error('Erreur lors de l\'annulation de la souscription :', error); 
        throw new Error('Erreur interne du serveur');
    }
}
/**
 * Permet de voir si les données on était rentrer afin de valider l'abonnement
 * @param {*} userId 
 * @returns 
 */
export const checkIfSubscriptionIsValidService = async (userId) => {
    try {
        console.log(userId)
        if (!userId) {
            throw new Error("L'ID de l'utilisateur est requis.");
        }

        const [rows] = await db.query(
            `
            SELECT s_IsValid
            FROM subscriptions 
            WHERE s_UserId = ?
              AND s_StatusId = 1
            LIMIT 1
            `,
            [userId]
        );

        if (rows.length > 0) {
            return !!rows[0].s_IsValid;
       }else{
            return false; 
        }

    } catch (error) {
        console.error("Erreur lors de la vérification de l'abonnement :", error.message);
        throw new Error("Erreur interne du serveur.");
    }
};
