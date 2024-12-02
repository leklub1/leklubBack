import { createNewUserService } from '../Service/userService.js';
import {createNewUserSubscription} from '../Service/subscriptionService.js';
import {createNewUserPayment} from '../Service/paymentService.js';

/**
 * Controller qui permet de créer un nouvel utilisateur
 * @param {*} req 
 * @param {*} res 
 */
export const createNewUser = async (req, res) => {
    const { email } = req.body;

    try {
        const result = await createNewUserService(email);

        if (result.success) {

            let statementPayment = await createNewUserPayment(result.userId);
            let statementSubscription = await createNewUserSubscription(result.userId,statementPayment.paymentId);

            if(statementPayment.success && statementSubscription.success){
                res.status(201).json({
                    message: 'Utilisateur enregistré avec succès.',
                });
            }else{
                res.status(500).json({ message: "Erreur interne du serveur." });
            }

        } else {
            res.status(result.status).json({ message: result.message });
        }
    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur :', error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};
