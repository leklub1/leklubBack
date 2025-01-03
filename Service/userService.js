
import db from '../Config/dbConfig.js';
import {createMollieCustomer} from '../Utils/mollieUtils.js';
import { checkIfUserHasSubscription,checkIfuserHasSubscriptionValid,checkIfSubscriptionIsValidService } from './subscriptionService.js'
import { getProfilePhotoUrl } from './s3Service.js';
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

                let hasSubscriptionValid = await checkIfuserHasSubscriptionValid(existingUser[0].u_Id);
                if(hasSubscriptionValid){

                    let isFormValid = await checkIfSubscriptionIsValidService(existingUser[0].u_Id);
                    console.log(isFormValid)
                    if(isFormValid){
                        return {status: 202};
                    }else{
                        return {
                            status: 200,
                            paymentUrl: `https://leklubtoulouse.fr/redirectForm.html?email=${email}&id=${existingUser[0].u_Id}`, // redirige direct sur le form
                        };
                    }
                }else{

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

export const getAllUsersService = async () => {
    try {
        let [rows] = await db.query(
            `SELECT 
                users.u_Email,
                users.u_CreatedAt,
                users.u_CustomerId,
                subscriptions.s_SubscriptionId,
                subscriptions.s_StatusId,
                subscriptions.s_NextPaymentDate,
                subscriptions.s_StartDate,
                subscriptions.s_EndSubscription
            FROM 
                users
            LEFT JOIN 
                subscriptions 
            ON 
                users.u_Id = subscriptions.s_UserId`);
    
        return rows;
    } catch (error) {
        throw new Error('Erreur interne du serveur getAllUsersService',error);
    }

};
/**
 * Permet de récupérer les informations nécessaire pour l'affichage de la fenetre modal de succes
 * @param {*} userId 
 */
export const getUserDataSuccesModalService = async (userId) => {
    try {
        let [rows] = await db.query(
            `SELECT 
                users.u_FirstName,
                users.u_lastName,
                users.u_id,
                subscriptions.s_NextPaymentDate
            FROM 
                users
            LEFT JOIN 
                subscriptions 
            ON 
                users.u_Id = subscriptions.s_UserId
            WHERE users.u_id = ?`, [userId]);
            
        if (rows.length > 0) {
            return rows;
        } else {
            return null;
        }
    } catch (error) {
        throw new Error(`Erreur interne du serveur dans getUserDataSuccesModalService: ${error.message}`);
    }
}
/**
 * permet d'avoir les informations de mail - tel - nom - prenom quand un utilisateur a un deja souscrit à un abonnement
 * @param {*} userId 
 * @returns 
 */
export const getAdvancedDataService = async (userId) => {
    try {

        let [rows] = await db.query(
            'SELECT users.u_Email, users.u_FirstName, users.u_LastName, users.u_Phone, subscriptions.s_NextPaymentDate ' +
            'FROM users ' +
            'INNER JOIN subscriptions ON subscriptions.s_UserId = users.u_Id ' +
            'WHERE users.u_Id = ? AND subscriptions.s_StatusId = 1',
            [userId]
        );
        

        let profilPictureUrl = await getProfilePhotoUrl(userId);

        if (rows.length === 0) {
            return null;
        } else {
            return {
                userData: rows[0],
                profilePictureUrl: profilPictureUrl,
            };
        }
    } catch (error) {
        console.error(`Erreur lors de la récupération des informations de l'utilisateur ${userId} :`, error);
        throw new Error('Erreur interne du serveur');
    }
};

export const getUserNameByEmailService = async (email) => {
    try {
        console.log(email)
        let [rows] = await db.query(
            'SELECT u_FirstName, u_LastName FROM users WHERE u_Email = ?',
            [email] 
        );

        if (rows.length === 0) {
            return null;
        } else {

            return rows[0];
        }
    } catch (error) {

    }
}

export const getUserIdByEmail = async (email) => {
    try {
        console.log(email)
        let [rows] = await db.query(
            'SELECT u_Id FROM users WHERE u_Email = ?',
            [email] 
        );

        if (rows.length === 0) {
            return null;
        } else {
            return rows[0].u_Id;
        }
    } catch (error) {
        console.error(`Erreur lors de la récupération des informations de l'utilisateur ${email} :`, error);
        throw new Error('Erreur interne du serveur');
    }
}

export const getUserWalletData = async (userId) => {
    try {
        const [rows] = await db.query('SELECT q_Token FROM qrcode WHERE q_UserId = ?', [userId]);
        const [rows2] = await db.query('SELECT s_CreatedAt FROM subscriptions WHERE s_UserId = ? AND (s_StatusId = 1 OR s_StatusId = 2)', [userId]);
        const [rows3] = await db.query('SELECT u_FirstName, u_LastName FROM users WHERE u_Id = ?', [userId]);

        if (!rows.length || !rows2.length || !rows3.length) {
            throw new Error('Data not found for the given userId');
        }

        const token = `https://leklubtoulouse.fr/valider.html?token=${rows[0].q_Token}`;

        return {
            token,
            subscriptionCreatedAt: rows2[0].s_CreatedAt,
            firstName: rows3[0].u_FirstName,
            lastName: rows3[0].u_LastName
        };
    } catch (error) {
        console.error(`Erreur lors de la récupération des informations de l'utilisateur ${userId}:`, error);
        throw new Error('Erreur interne du serveur');
    }
};
