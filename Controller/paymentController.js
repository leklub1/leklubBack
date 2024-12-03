import mollie from '@mollie/api-client'; // Importer le module Mollie (en tant qu'importation par défaut)
import dotenv from 'dotenv';

dotenv.config();  // Charger les variables d'environnement (notamment l'API Key)

const mollieClient = mollie.createMollieClient({ apiKey: process.env.MOLLIE_API_KEY }); // Créer une instance de mollieClient avec la clé API

// Fonction pour gérer le webhook envoyé par Mollie
export const handlePaymentWebhook = async (req, res) => {
    const paymentId = req.body.id;  // Récupérer l'ID du paiement envoyé par Mollie

    try {
        // Récupérer les informations du paiement depuis Mollie
        const payment = await mollieClient.payments.get(paymentId);

        // Vérifiez si le paiement a été effectué
        if (payment.isPaid()) {
            // Logique si le paiement est réussi
            console.log('Le paiement a été effectué avec succès !');
            res.status(200).send('Paiement validé');
        } else {
            // Logique si le paiement est échoué ou en attente
            console.log('Le paiement a échoué ou est en attente');
            res.status(200).send('Paiement échoué ou en attente');
        }
    } catch (error) {
        console.error('Erreur lors du traitement du webhook:', error);
        res.status(500).send('Erreur serveur');
    }
}
