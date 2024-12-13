import db from '../Config/dbConfig.js';

/**
 * permet de créer un nouvel utilisateur dans la table paymentService
 * @param {Int} userId 
 * @returns {Object}
 */
export const createNewUserPayment = async (userId,mollieId,orderId) => {
    try {

        const [result] = await db.query('INSERT INTO payments (p_UserId, p_StatusId,p_MollieId,p_OrderId) VALUES (?, ?, ?, ?)',[userId, 1,mollieId,orderId] );

        return {
            success: true,
            paymentId: result.insertId,
        };

    } catch (error) {
        console.error('Erreur dans le service de création de l\'utilisateur :', error);
        throw new Error('Erreur interne du serveur');
    }
};

/**
 * service permettant de gérer le webhook de mollie et modifier les etats en base de données
 * @param {*} mollieId 
 * @param {*} status 
 */
export const handlePaymentWebhookService = async (mollieId, status) => {
    let statement;

    switch (status) {
        case 'open':
            statement = updatePaymentStatus(mollieId, 1);
            break;
        case 'paid':
            statement = updatePaymentStatus(mollieId, 2);
            break;
        case 'failed':
            statement = updatePaymentStatus(mollieId, 3);
            break;
        case 'canceled':
            statement = updatePaymentStatus(mollieId, 4);
            break;
        case 'expired':
            statement = updatePaymentStatus(mollieId, 5);
            break;
        case 'refunded':
            statement = updatePaymentStatus(mollieId, 6);
            break;
        default:    
        statement = updatePaymentStatus(mollieId, 7);
            break;
    }
    return statement;
};
/**
 * permet de mettre à jour le statut du paiement
 * @param {String} mollieId 
 * @param {Int} statusId 
 * @returns {Boolean}
 */
export const updatePaymentStatus = async (mollieId, statusId) => {
    try {
        let [row] = await db.query('UPDATE payments SET p_StatusId = ? WHERE p_MollieId = ?',[statusId, mollieId]);
        if(row.affectedRows === 0) {
            return false;
        }else{
            return true;
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut du paiement :', error);
        throw new Error('Erreur interne du serveur');
    }
}
/**
 * permet de récupérer le status du payement
 * @param {*} orderId 
 * @returns 
 */
export const getPaymentStatusService = async (orderId) => {
    try {
        let [rows] = await db.query('SELECT p_StatusId FROM payments WHERE p_OrderId = ?', [orderId]);

        if (rows.length === 0) {
            return null;
        } else {
            return rows[0].p_StatusId;
        }
    } catch (error) {
        console.error(`Erreur lors de la récupération du status de l'utilisateur ${orderId} :`, error);
        throw new Error('Erreur interne du serveur');
    }
};
/**
 * Permet de récupérer le userID a partir du orderId
 * @param {*} orderId 
 * @returns 
 */
export const getUserIdByOrderId = async (orderId) => {
    try {
        let [rows] = await db.query('SELECT p_UserId FROM payments WHERE p_OrderId = ?', [orderId]);

        if (rows.length === 0) {
            return null;
        } else {
            return rows[0].p_UserId;
        }
    } catch (error) {
        console.error(`Erreur lors de la récupération du status de l'utilisateur ${orderId} :`, error);
        throw new Error('Erreur interne du serveur');
    }
}

export const getEmailByOrderIdService = async (orderId) => {
    try {
        let [rows] = await db.query(
            'SELECT u.u_Email FROM users u INNER JOIN payments p ON u.u_Id = p.p_UserId WHERE p.p_OrderId = ?', 
            [orderId]
        );

        if (rows.length > 0) {
            return rows[0].u_Email;
        } else {
            return null;
        }
    } catch (error) {
        console.error(`Erreur lors de la récupération de l'utilisateur pour le paymentId ${orderId} :`, error);
        throw new Error('Erreur interne du serveur');
    }
}