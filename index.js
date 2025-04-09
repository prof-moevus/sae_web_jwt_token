const fs = require('fs');
const path = require('path');

const bcrypt = require('bcrypt');
const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose");

// Création de l'application Express
const app = express();

// Configuration de l'environnement
require('dotenv').config(); // Chargement des variables d'environnement

// Middleware pour parser le JSON et les données de formulaire
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware pour servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Connexion à MongoDB
const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_SERVER}`;
//console.log(uri)
mongoose.connect(uri)
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(err => console.error('Erreur de connexion à MongoDB :', err));

// Importation des routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

// Utilisation des routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});

