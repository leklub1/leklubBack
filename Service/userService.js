import db from '../Config/dbConfig.js';

/**
 * permet de créer un nouvel utilisateur dans la table users
 * @param {String} email 
 * @returns {Object}
 */
export const createNewUserService = async (email) => {
    try {

        const [existingUser] = await db.query('SELECT * FROM users WHERE u_Email = ?', [email]);
        if (existingUser.length > 0) {
            return {
                success: false,
                status: 409,
                message: 'Cet email est déjà enregistré.',
            };
        }

        const [result] = await db.query('INSERT INTO users (u_Email) VALUES (?)', [email]);

        return {
            success: true,
            userId: result.insertId,
        };

    } catch (error) {
        console.error('Erreur dans le service de création de l\'utilisateur :', error);
        throw new Error('Erreur interne du serveur');
    }
};

export const getDefaultDataService = async (orderId) => {
    try {
        let [rows] = await db.query(
            'SELECT u_id, u_Email FROM users INNER JOIN payments ON users.u_Id = payments.p_UserId WHERE payments.p_OrderId = ?',
            [orderId]
        );
        if (rows.length === 0) {
            return null;
        } else {
            return {
                id: rows[0].u_id,
                email: rows[0].u_Email,
            }
        }
    } catch (error) {
        console.error(`Erreur lors de la récupération du status de l'utilisateur ${orderId} :`, error);
        throw new Error('Erreur interne du serveur');
    }
}