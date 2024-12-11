import db from '../Config/dbConfig.js';
import {createMollieCustomer} from '../Utils/mollieUtils.js';
import { checkIfUserHasSubscription,checkIfuserHasSubscriptionValid } from './subscriptionService.js'
import { checkIfUserHasQrCode } from './qrCodeService.js';
/**
 * permet de créer un nouvel utilisateur dans la table users
 * @param {String} email 
 * @returns {Object}
 */
export const createNewUserService = async (email) => {
    try {

        const [existingUser] = await db.query('SELECT u_Id FROM users WHERE u_Email = ?', [email]);
        if (existingUser.length > 0) {

            let hasSubscription = await checkIfUserHasSubscription(existingUser[0].u_Id);
            if(hasSubscription){
                // Si l'utilisateur n'as pas de qrcode --> il n'as pas remplit le formulaire

                    // Vérification si un utilisateur a un abonnement valide
                let hasSubscriptionValid = await checkIfuserHasSubscriptionValid(existingUser[0].u_Id);
                if(hasSubscriptionValid){
                    let isFormValid = await checkIfUserHasQrCode(existingUser[0].u_Id);
                    if(isFormValid){
                        return {status: 202};
                    }else{
                        return {
                            status: 200,
                            paymentUrl: `http://180.149.197.7/redirectForm.html?email=${email}&id=${existingUser[0].u_Id}`, // redirige direct sur le form
                        };
                    }
                }else{
                    // Si abonnement est plus valide alors redirection vers le payement
                    let customerId = await getCustomerIdByuserId(existingUser[0].u_Id);
                    console.log(customerId);
                    return {
                        success: true,
                        userId: existingUser[0].u_Id,
                        customerId: customerId
                    };
                }

            }else{
                // Cas ou un utilisateur a un compte mais pas d'abonnement
                let customerId = await getCustomerIdByuserId(existingUser[0].u_Id);
                return {
                    success: true,
                    userId: existingUser[0].u_Id,
                    customerId: customerId
                };
            }
        }

        const customerId = await createMollieCustomer(email);
        const [result] = await db.query('INSERT INTO users (u_Email,u_CustomerId) VALUES (?,?)', [email,customerId]);

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
/**
 * Permet de récupérer le customerId via le userId
 * @param {*} userId 
 * @returns 
 */
export const getCustomerIdByuserId = async (userId) => {
    try {
        let [rows] = await db.query(
            'SELECT u_CustomerId FROM users WHERE u_Id = ?',
            [userId]
        );
        if (rows.length === 0) {
            return null;
        } else {
            return rows[0].u_CustomerId;
        }
    } catch (error) {
        console.error(`Erreur lors de la récupération des data de l'utilisateur ${userId} :`, error);
        throw new Error('Erreur interne du serveur');
    }
}