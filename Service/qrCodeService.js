import db from '../Config/dbConfig.js';

/**
 * permet de créer un nouvel utilisateur dans la table subscriptions
 * @param {Int} userId
 * @param {Int} paymentId 
 * @returns {Object}
 */
export const insertQrCodeInDb = async (userId) => {
    try {
        const [result] = await db.query(
            'INSERT INTO qrcode (q_UserId) VALUES (?)',
            [userId] 
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
 * Permet de vérifier un utilisateur à un qrCode
 * @param {*} userId 
 * @returns 
 */
export const checkIfUserHasQrCode = async (userId) => {
    try {
        const [result] = await db.query(
            'SELECT * FROM qrcode WHERE q_UserId = ?',
            [userId] 
        );

        return result.length > 0;

    } catch (error) {
        console.error('Erreur dans le service de création de l\'abonnement :', error);
        throw new Error('Erreur interne du serveur');
    }
}