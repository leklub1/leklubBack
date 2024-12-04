import { createNewUserService } from '../Service/userService.js';
import { createNewUserSubscription } from '../Service/subscriptionService.js';
import { createNewUserPayment } from '../Service/paymentService.js';
import { createMonthlySubscription } from '../Utils/mollieUtils.js';

export const createNewUser = async (req, res) => {
    const { email } = req.body;

    try {
        const result = await createNewUserService(email);

        // const statementSubscription = await createNewUserSubscription(userId, null);

        // if (statementPayment.success && statementSubscription.success) {
            const { paymentId, paymentUrl } = await createMonthlySubscription(result.userId, 'https://0a2b-2a02-842a-14c-3601-fc81-a0d-ccb-3815.ngrok-free.app/api/payment/webhook');

            if (paymentUrl && paymentId) {
                await createNewUserPayment(result.userId, paymentId);

                return res.status(201).json({
                    message: 'Test de paiement réussi, redirigez vers cette URL.',
                    paymentUrl,
                });

            } else {
                return res.status(500).json({ message: 'Impossible de générer l\'URL de paiement.' });
            }

        // } else {
        //     return res.status(500).json({ message: 'Erreur interne lors de l\'initialisation des données.' });
        // }
    } catch (error) {
        console.error('Erreur lors du test de création de l\'utilisateur :', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
};
