import userRoutes from './Router/userRoutes.js';
import paymentRoutes from './Router/paymentRoutes.js';
import subscriptionRoutes from './Router/subscriptionRoutes.js'
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { initCronJobs } from './cron/index.js';

const app = express();
app.use(cors());

const PORT = 3000;

app.use(express.urlencoded({ extended: true })); 
app.use(bodyParser.json({ limit: '50mb' }));  // 50 Mo pour les JSON
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(express.json()); 
app.use(cors({
    origin: 'https://leklubtoulouse.fr',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/subscription', subscriptionRoutes);

app.get('/test', (req, res) => {
    res.send('Serveur Node.js fonctionne correctement !');
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

initCronJobs();