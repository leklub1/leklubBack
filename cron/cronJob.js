import db from '../Config/dbConfig.js';

/**
 * Permet de disable une fois la date s_EndSubscription atteinte
 */
export const disableSubscriptionCronService = async () => {
    try {

        const today = new Date();
        
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); 
        const day = String(today.getDate()).padStart(2, '0');
        const todayDateString = `${year}-${month}-${day}`;

        const [result] = await db.query(
            `UPDATE subscriptions 
             SET s_StatusId = 4 
             WHERE s_EndSubscription IS NOT NULL AND s_StatusId = 1
               AND DATE(s_EndSubscription) = ?`,
            [todayDateString]
        );

        console.log(`${result.affectedRows} souscription(s) ont été désactivée(s).`);
    } catch (error) {
        console.error('Erreur lors de la mise à jour des souscriptions :', error);
        throw new Error('Erreur interne du serveur');
    }
};
