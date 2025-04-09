// Fichier: middleware/auth.js
const { verifyToken } = require('../services/authService');

// Middleware pour vérifier l'authentification
const authenticateUser = (req, res, next) => {
    // Récupérer le token de l'en-tête Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Accès non autorisé. Token manquant.'
        });
    }

    // Extraire le token sans le préfixe "Bearer "
    const token = authHeader.split(' ')[1];

    // Vérifier le token
    const { valid, expired, data } = verifyToken(token);

    if (!valid) {
        return res.status(401).json({
            success: false,
            message: expired ? 'Token expiré.' : 'Token invalide.'
        });
    }

    // Ajouter les données utilisateur décodées à la requête
    req.user = data;

    // Passer à la route suivante
    next();
};

// Middleware pour vérifier le rôle admin
const requireAdmin = (req, res, next) => {
    // Le middleware authenticateUser doit être exécuté avant
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Utilisateur non authentifié.'
        });
    }

    // Vérifier si l'utilisateur a le rôle admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Accès refusé. Droits administrateur requis.'
        });
    }

    // Passer à la route suivante
    next();
};

module.exports = {
    authenticateUser,
    requireAdmin
};
