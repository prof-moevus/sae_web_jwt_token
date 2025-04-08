// Fichier: services/authService.js
const jwt = require('jsonwebtoken');

// Configuration du JWT
const JWT_SECRET = process.env.JWT_SECRET || 'votre_clé_secrète_pour_le_dev'; // À remplacer en production !
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Générer un token JWT
const generateToken = (user) => {
    // Créer le payload avec les données utilisateur minimales nécessaires
    const payload = {
        userId: user._id,
        username: user.username,
        role: user.role
    };

    // Générer et signer le token
    return jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

// Vérifier un token JWT
const verifyToken = (token) => {
    try {
        // Vérifier et décoder le token
        const decoded = jwt.verify(token, JWT_SECRET);
        return { valid: true, expired: false, data: decoded };
    } catch (error) {
        // Gestion des erreurs spécifiques
        return {
            valid: false,
            expired: error.name === 'TokenExpiredError',
            data: null
        };
    }
};

module.exports = {
    generateToken,
    verifyToken
};
