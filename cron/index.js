import cron from 'node-cron';
import {disableSubscriptionCronService} from './cronJob.js';

export const initCronJobs = () => {
    console.log('Initialisation des tâches cron...');
    
    cron.schedule('* * * * *', disableSubscriptionCronService);

};
