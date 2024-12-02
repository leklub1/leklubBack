import mysql from 'mysql2';

class Database {
    constructor(config) {
        this.connection = mysql.createConnection(config);
    }

    connect() {
        this.connection.connect((err) => {
            if (err) {
                console.error('Erreur de connexion à la base de données :', err);
                throw err;
            }
            console.log('Connecté à la base de données MySQL');
        });
    }

    query(sql, args) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, args, (err, results) => {
                if (err) {
                    console.error('Erreur lors de l\'exécution de la requête SQL :', err);
                    return reject(err);
                }
                resolve(results);
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            this.connection.end((err) => {
                if (err) {
                    console.error('Erreur lors de la fermeture de la connexion :', err);
                    return reject(err);
                }
                resolve();
            });
        });
    }
}

export default Database;