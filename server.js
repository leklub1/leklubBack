import userRoutes from './Router/userRoutes.js';
import express from 'express';

const app = express(); 

const PORT = 3000;

app.use(express.json());
app.use('/api/users', userRoutes);


app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
