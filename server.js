import userRoutes from './Router/userRoutes.js';
import paymentRoutes from './Router/paymentRoutes.js';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

const PORT = 3000;

app.use(express.urlencoded({ extended: true })); 

app.use(express.json()); 

app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoutes);

app.get('/test', (req, res) => {
    res.send('Serveur Node.js fonctionne correctement !');
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
