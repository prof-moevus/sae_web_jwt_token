// Fichier: routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken } = require('../services/authService');
const { body, validationResult } = require('express-validator');

// Route d'inscription
router.post('/register', [
    // Validation des données
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 }).withMessage('Le nom d\'utilisateur doit contenir entre 3 et 30 caractères')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et underscores'),
    body('email')
        .trim()
        .isEmail().withMessage('Email invalide'),
    body('password')
        .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule et un chiffre')
], async (req, res) => {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    try {
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({
            $or: [
                { email: req.body.email },
                { username: req.body.username }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Cet email ou nom d\'utilisateur est déjà utilisé'
            });
        }

        // Créer un nouvel utilisateur
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            role: req.body.role || 'user' // Par défaut, le rôle est 'user'
        });

        // Sauvegarder l'utilisateur (le mot de passe sera haché dans le hook pre-save)
        await newUser.save();

        // Générer un token JWT
        const token = generateToken(newUser);

        // Réponse de succès
        res.status(201).json({
            success: true,
            message: 'Utilisateur créé avec succès',
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'inscription'
        });
    }
});

// Route de connexion
router.post('/login', [
    // Validation minimale
    body('email').trim().isEmail().withMessage('Email invalide'),
    body('password').notEmpty().withMessage('Mot de passe requis')
], async (req, res) => {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    try {
        // Rechercher l'utilisateur par email
        const user = await User.findOne({ email: req.body.email });

        // Vérifier si l'utilisateur existe
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Identifiants invalides'
            });
        }

        // Vérifier le mot de passe
        const isMatch = await user.comparePassword(req.body.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Identifiants invalides'
            });
        }

        // Générer un token JWT
        const token = generateToken(user);

        // Réponse de succès
        res.json({
            success: true,
            message: 'Connexion réussie',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la connexion'
        });
    }
});

module.exports = router;
