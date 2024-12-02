import db from '../Config/dbConfig.js';

/**
 * permet de créer un nouvel utilisateur dans la table paymentService
 * @param {Int} userId 
 * @returns {Object}
 */
export const createNewUserPayment = async (userId) => {
    try {

        const [result] = await db.query(
            'INSERT INTO payments (p_UserId, p_StatusId) VALUES (?, ?)',
            [userId, 4] 
        );

        return {
            success: true,
            paymentId: result.insertId,
        };

    } catch (error) {
        console.error('Erreur dans le service de création de l\'utilisateur :', error);
        throw new Error('Erreur interne du serveur');
    }
};
