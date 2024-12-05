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