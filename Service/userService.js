import db from '../Config/dbConfig.js';
import {createMollieCustomer} from '../Utils/mollieUtils.js';
/**
 * permet de créer un nouvel utilisateur dans la table users
 * @param {String} email 
 * @returns {Object}
 */
export const createNewUserService = async (email) => {
    try {

        const [existingUser] = await db.query('SELECT u_Id FROM users WHERE u_Email = ?', [email]);
        if (existingUser.length > 0) {

            // Vérifier si un utilisateur à un paiement open
            let customerUser = await checkIfUserAsPaid(existingUser[0].u_Id);
            if(customerUser !== null){
                return {
                    success: true,
                    userId: existingUser[0].u_Id,
                    customerId: customerUser
                };
            }
            // Vérifier si un utilisateur à remplit le formulaire
            let orderId = await checkIfUserAsPaidWithNoSubscription(existingUser[0].u_Id);
            if(orderId !== null){
                return {
                    status: 200,
                    paymentUrl: `http://180.149.197.7/checkPayment.html?paymentId=${orderId}`,
                };
            }else{
                return {status: 202};
            }
        }

        const customerId = await createMollieCustomer(email);
        const [result] = await db.query('INSERT INTO users (u_Email) VALUES (?)', [email]);

        return {
            success: true,
            userId: result.insertId,
            customerId:customerId
        };

    } catch (error) {
        console.error('Erreur dans le service de création de l\'utilisateur :', error);
        throw new Error('Erreur interne du serveur');
    }
};

/**
 * Fonction qui permet de vérifier un utilisateur a payer puis n'as pas remplit le formulaire
 * @param {*} userId 
 * @returns 
 */
const checkIfUserAsPaidWithNoSubscription = async (userId) => {
    try {
        const [status] = await db.query(`
            SELECT p_StatusId,p_OrderId
            FROM payments p
            INNER JOIN users u ON p.p_UserId = u.u_Id
            WHERE p.p_UserId = ? AND p.p_StatusId = ? 
            AND u.u_FirstName IS NULL AND u.u_LastName IS NULL
        `, [userId, 2]);

        if (status.length > 0) {
            console.log(status[0].p_OrderId)

            return status[0].p_OrderId;
        }else{
            return null;
        }

    } catch (error) {
        console.error('Erreur lors de la vérification si l\'utilisateur à remplit le formulaire :', error);
        throw new Error('Erreur interne du serveur');
    }
}
/**
 * Fonction qui permet de vérifier un utilisateur a payer puis n'as pas remplit le formulaire
 * @param {*} userId 
 * @returns 
 */
const checkIfUserAsPaid = async (userId) => {
    try {
        const [status] = await db.query(`
            SELECT p_CustomerId
            FROM payments p
            INNER JOIN users u ON p.p_UserId = u.u_Id
            WHERE p.p_UserId = ? AND p.p_StatusId = ? 
            AND u.u_FirstName IS NULL AND u.u_LastName IS NULL
        `, [userId, 1]);

        if (status.length > 0) {
            console.log(status[0].p_CustomerId)

            return status[0].p_CustomerId;
        }else{
            return null;
        }

    } catch (error) {
        console.error('Erreur lors de la vérification si l\'utilisateur à remplit le formulaire :', error);
        throw new Error('Erreur interne du serveur');
    }
}

/**
 * Service qui permet d'avoir les infos de base => mail + id
 * @param {*} orderId 
 * @returns 
 */
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
/**
 * Permet d'inserer les données du formulaire
 * @param {*} firstName 
 * @param {*} lastName 
 * @param {*} email 
 * @param {*} phone 
 * @param {*} userId 
 * @returns 
 */
export const insertUserDataService = async (firstName, lastName, email, phone, userId) => {
    try {
        const termsAccepted = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const [rows] = await db.query(
            'UPDATE users SET u_FirstName = ?, u_LastName = ?, u_DateAcceptationCGU = ?, u_Email = ?, u_Phone = ? WHERE u_Id = ?',
            [firstName, lastName, termsAccepted, email, phone, userId]
        );
        if (rows.affectedRows === 0) {
            return false;
        } else {
            return true;
        }
    } catch (error) {
        console.error(`Erreur lors de la mise à jour des données de l'utilisateur ${userId} :`, error);
        throw new Error('Erreur interne du serveur');
    }
};
/**
 * Permet de récupérer les datas de l'utilisauteurs pour le qr code 
 */
export const getAllUserDataService = async (userId) => {
    try {
        let [rows] = await db.query(
            'SELECT u_FirstName, u_LastName,u_Email FROM users WHERE u_Id = ?',
            [userId]
        );
        if (rows.length === 0) {
            return null;
        } else {
            return {
                firstName: rows[0].u_FirstName,
                lastName: rows[0].u_LastName,
                email: rows[0].u_Email
            }
        }
    } catch (error) {
        console.error(`Erreur lors de la récupération des data de l'utilisateur ${userId} :`, error);
        throw new Error('Erreur interne du serveur');
    }
}

export const getUserEmailByIdService = async (userId) => {
    try {
        let [rows] = await db.query(
            'SELECT u_Email FROM users WHERE u_Id = ?',
            [userId]
        );
        if (rows.length === 0) {
            return null;
        } else {
            return rows[0].u_Email;
        }
    } catch (error) {
        console.error(`Erreur lors de la récupération des data de l'utilisateur ${userId} :`, error);
        throw new Error('Erreur interne du serveur');
    }
}
