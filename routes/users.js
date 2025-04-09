// Fichier: routes/users.js
const express = require('express');
const router = express.Router();
const Users = require('../models/User');
const { authenticateUser, requireAdmin } = require('../middleware/auth');

// Route pour obtenir le profil de l'utilisateur connecté
router.get('/profile', authenticateUser, async (req, res) => {
    try {
        // Rechercher l'utilisateur complet avec toutes les informations
        const user = await Users.findById(req.user.userId).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        // Retourner les informations de l'utilisateur
        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
});

// Route admin pour lister tous les utilisateurs
router.get('/admin/all', authenticateUser, requireAdmin, async (req, res) => {
    try {
        // Récupérer tous les utilisateurs sans leur mot de passe
        const users = await Users.find().select('-password');

        res.json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
});

module.exports = router;
