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
