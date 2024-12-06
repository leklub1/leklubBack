import { createNewUserService,getDefaultDataService,insertUserDataService,getAllUserDataService } from '../Service/userService.js';
import { createNewUserSubscription } from '../Service/subscriptionService.js';
import { createNewUserPayment } from '../Service/paymentService.js';
import { createMonthlySubscription } from '../Utils/mollieUtils.js';
import { createS3Folders,uploadProfilePhoto,uploadQrCode,getProfilePhotoUrl } from '../Service/s3Service.js'
import { generateQRCode } from '../Utils/qrCodeUtils.js';
import { insertQrCodeInDb } from '../Service/qrCodeService.js';

/**
 * permet d'initialiser l'utilisateur et d'initialiser le payement avec mollie
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export const createNewUser = async (req, res) => {
    const { email } = req.body;

    try {

        const result = await createNewUserService(email);
        const orderId = new Date().getTime();
        const { paymentId, paymentUrl } = await createMonthlySubscription(orderId, 'http://180.149.197.7:3000/api/payment/webhook');

        if (paymentUrl && paymentId) {
            await createNewUserPayment(result.userId, paymentId,orderId);

            return res.status(201).json({
                message: 'Test de paiement réussi, redirigez vers cette URL.',
                paymentUrl,
            });

        } else {
            return res.status(500).json({ message: 'Impossible de générer l\'URL de paiement.' });
        }

    } catch (error) {
        console.error('Erreur lors du test de création de l\'utilisateur :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
};

/**
 * Permet de récupérer les informations de base de l'utilisateur mail + id
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export const getDefaultData = async (req, res) => {
    const { orderId } = req.query;

    if (!orderId) {return res.status(400).send('orderId est requis');}

    try {

        const userData = await getDefaultDataService(orderId);

        if (userData === null) {return res.status(404).send('Aucun utilisateur trouvé pour ce orderId');}

        return res.status(200).json(userData);

    } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error);
        return res.status(500).send('Erreur interne du serveur');
    }
};

export const insertUserData = async (req, res) => {

    const { firstName, lastName, email, phone, userId, file } = req.body;

    try {
        const statement = await insertUserDataService(firstName, lastName, email, phone, userId);

        await createS3Folders(userId);
        await uploadProfilePhoto(userId,file);

        let qrCodeBuffer = await generateQRCode(userId);
        await uploadQrCode(userId,qrCodeBuffer);
        await insertQrCodeInDb(userId);

        return res.status(200).json(statement); 
    } catch (error) {
        console.error('Erreur lors de la mise à jour des données utilisateur:', error);
        return res.status(500).json(false); 
    }
};
/**
 * Controller qui permet d'envoyer les datas du qrCode
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export const getAllUserData = async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).send('User ID manquant');
    }

    try {

        const userData = await getAllUserDataService(userId);
        
        if (!userData) {
            return res.status(404).send('Utilisateur non trouvé');
        }

        const profilPictureUrl = await getProfilePhotoUrl(userId);

        const response = {
            ...userData,
            profilPictureUrl,
        };

        return res.status(200).json(response);

    } catch (error) {
        console.error('Erreur lors de la récupération des données de l\'utilisateur:', error);

        if (error.message === 'Erreur interne du serveur') {
            return res.status(500).send('Erreur serveur');
        }

        return res.status(500).send('Erreur inconnue');
    }
};

