import { createNewUserService } from '../Service/userService.js';
import { createNewUserSubscription } from '../Service/subscriptionService.js';
import { createNewUserPayment } from '../Service/paymentService.js';
import { createMonthlySubscription } from '../Utils/mollieUtils.js';

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
