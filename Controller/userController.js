import { createNewUserService,getDefaultDataService,insertUserDataService,getAllUserDataService,getUserEmailByIdService,getAllUsersService,getUserDataSuccesModalService,getAdvancedDataService } from '../Service/userService.js';
import { isSubscriptionValidBySubId,getSubscriptionActuallyByUserService,getUserIdBySubscriptionIdService,checkIfUseHasAlreadyHadSubscription } from '../Service/subscriptionService.js';
import { createNewUserPayment} from '../Service/paymentService.js';
import { createPayment } from '../Utils/mollieUtils.js';
import { createS3Folders,uploadProfilePhoto,uploadQrCode,getProfilePhotoUrl } from '../Service/s3Service.js'
import { generateQRCode } from '../Utils/qrCodeUtils.js';
import { insertQrCodeInDb,checkIfValidToken } from '../Service/qrCodeService.js';
import { sendEmail } from '../Utils/emailUtils.js';
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

        if (result.status === 200) {
            return res.status(200).json({ 
                message: 'compte && payment effectué.',
                paymentUrl: result.paymentUrl
            });
        }else if(result.status === 202){
            return res.status(202).json({message: "OK"});
        }else {
            const orderId = new Date().getTime();
            const { paymentId, paymentUrl } = await createPayment(orderId, 'http://180.149.197.7:3000/api/payment/webhook',result.customerId);
    
            if (paymentUrl && paymentId) {

                await createNewUserPayment(result.userId, paymentId, orderId);

                return res.status(201).json({
                    message: 'Test de paiement réussi, redirigez vers cette URL.',
                    paymentUrl,
                });
                
            } else {
                return res.status(500).json({ 
                    message: 'Impossible de générer l\'URL de paiement.' 
                });
            }
        }
    } catch (error) {
        console.error('Erreur lors du test de création de l\'utilisateur :', error);
        return res.status(500).json({ 
            message: 'Erreur interne du serveur.' 
        });
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
        console.log(userData)
        const isAlreadySubscribed = await checkIfUseHasAlreadyHadSubscription(userData.id);
        console.log(isAlreadySubscribed)
        if (userData === null) {return res.status(404).send('Aucun utilisateur trouvé pour ce orderId');}

        return res.status(200).json({
            userData,
            isAlreadySubscribed
        });

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
        if(file !== null){
            await uploadProfilePhoto(userId,file);
        }

        let subId = await getSubscriptionActuallyByUserService(userId);
        
        if(subId !== null){
            let { buffer: qrCodeBuffer, finalToken } = await generateQRCode(subId);
            await uploadQrCode(userId,qrCodeBuffer);
            await insertQrCodeInDb(userId,finalToken);
    
            let userEmail = await getUserEmailByIdService(userId);
            if(userEmail !== null){
                const attachments = [
                    {
                        filename: 'qrcode.png',        
                        content: qrCodeBuffer,         
                        contentType: 'image/png'       
                    }
                ];
                await sendEmail(userEmail,firstName,lastName,attachments);
            }
            let userData = await getUserDataSuccesModalService(userId);
            if(userData !== null){
                return res.status(200).json(userData); 
            }else{
                return res.status(500).json(null); 
            }
        }else{
            return res.status(400).json("Erreur est survenu lors de la récupération de l'id de subscription"); 

        }
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
    const { token, subId } = req.query;

    // Vérification des paramètres requis
    if (!token || !subId) {
        return res.status(400).json({
            error: 'Requête invalide',
            message: 'Les paramètres "token" et "subId" sont requis.'
        });
    }

    try {
        const tokenUrl = token + '_' + subId;
        const userId = await getUserIdBySubscriptionIdService(subId);

        if (userId === null) {
            return res.status(404).json({
                error: 'Utilisateur introuvable',
                message: 'Aucun utilisateur correspondant à cet identifiant d\'abonnement.'
            });
        }

        const isValidToken = await checkIfValidToken(tokenUrl, userId);
        if (!isValidToken) {
            return res.status(403).json({
                error: 'Accès refusé',
                message: 'Le token fourni est invalide ou expiré.'
            });
        }

        const userData = await getAllUserDataService(userId);
        if (!userData) {
            return res.status(404).json({
                error: 'Données non trouvées',
                message: 'Aucune donnée utilisateur disponible pour cet identifiant.'
            });
        }

        const profilPictureUrl = await getProfilePhotoUrl(userId);
        const isValidSubscription = await isSubscriptionValidBySubId(subId);

        return res.status(200).json({
            ...userData,
            profilPictureUrl,
            isValidSubscription
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des données de l\'utilisateur:', error);

        if (error.message === 'Erreur interne du serveur') {
            return res.status(500).json({
                error: 'Erreur serveur',
                message: 'Une erreur interne s\'est produite. Veuillez réessayer plus tard.'
            });
        }

        return res.status(500).json({
            error: 'Erreur inconnue',
            message: 'Une erreur inattendue s\'est produite. Veuillez réessayer plus tard.'
        });
    }
};


export const getAllUsers = async (req, res) => {
    try {
        const allUsers = await getAllUsersService();
        res.status(200).json(allUsers);
    } catch (error) {
        res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération des utilisateurs.' });
    }
};

export const getAdvancedData = async (req,res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: 'userId est requis dans la requête.' });
    }

    try {
        const userData = await getAdvancedDataService(userId);
        console.log(userData)
        if (!userData) {
            return res.status(404).json({ error: 'Utilisateur introuvable.' });
        }

        res.status(200).json(userData);
    } catch (error) {
        console.error('Erreur lors de la récupération des informations utilisateur:', error);
        res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération des informations utilisateur.' });
    }
};