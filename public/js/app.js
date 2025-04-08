// Fichier: public/app.js
document.addEventListener('DOMContentLoaded', function() {
    // Éléments du DOM
    const loginForm = document.getElementById('form-login');
    const registerForm = document.getElementById('form-register');
    const loginTab = document.getElementById('tab-login');
    const registerTab = document.getElementById('tab-register');
    const loginFormContainer = document.getElementById('login-form');
    const registerFormContainer = document.getElementById('register-form');
    const profileSection = document.getElementById('profile-section');
    const authStatus = document.getElementById('auth-status');
    const profileData = document.getElementById('profile-data');
    const logoutButton = document.getElementById('logout-button');
    const adminPanel = document.getElementById('admin-panel');
    const getUsersButton = document.getElementById('get-users-button');
    const usersList = document.getElementById('users-list');

    // API URL
    const API_URL = '/api';

    // Fonction pour basculer entre les formulaires
    loginTab.addEventListener('click', function() {
        loginFormContainer.style.display = 'block';
        registerFormContainer.style.display = 'none';
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
    });

    registerTab.addEventListener('click', function() {
        loginFormContainer.style.display = 'none';
        registerFormContainer.style.display = 'block';
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
    });

    // Fonction pour définir le token dans le localStorage
    function setToken(token) {
        localStorage.setItem('jwt_token', token);
    }

    // Fonction pour récupérer le token
    function getToken() {
        return localStorage.getItem('jwt_token');
    }

    // Fonction pour supprimer le token
    function removeToken() {
        localStorage.removeItem('jwt_token');
    }

    // Fonction pour vérifier si l'utilisateur est connecté
    function isLoggedIn() {
        return !!getToken();
    }

    // Fonction pour effectuer des requêtes authentifiées
    async function authenticatedFetch(url, options = {}) {
        const token = getToken();
        if (!token) {
            throw new Error('Token non disponible');
        }

        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        const response = await fetch(url, {
            ...options,
            headers
        });

        // Si le token est expiré ou invalide
        if (response.status === 401) {
            removeToken();
            showLoginForm();
            throw new Error('Session expirée. Veuillez vous reconnecter.');
        }

        return response;
    }

    // Fonction pour afficher un message d'erreur ou de succès
    function showMessage(message, isError = false) {
        authStatus.textContent = message;
        authStatus.className = isError ? 'error' : 'success';
        authStatus.style.display = 'block';

        // Masquer le message après 5 secondes
        setTimeout(() => {
            authStatus.style.display = 'none';
        }, 5000);
    }

    // Fonction pour afficher le formulaire de connexion
    function showLoginForm() {
        profileSection.style.display = 'none';
        loginFormContainer.style.display = 'block';
        registerFormContainer.style.display = 'none';
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
    }

    // Fonction pour afficher le profil
    function showProfile() {
        loginFormContainer.style.display = 'none';
        registerFormContainer.style.display = 'none';
        profileSection.style.display = 'block';
    }

    // Vérifier si l'utilisateur est déjà connecté au chargement de la page
    function checkAuth() {
        if (isLoggedIn()) {
            loadProfile();
        } else {
            showLoginForm();
        }
    }

    // Charger les données du profil
    async function loadProfile() {
        try {
            const response = await authenticatedFetch(`${API_URL}/users/profile`);
            const data = await response.json();

            if (data.success) {
                // Afficher les données du profil
                profileData.innerHTML = `
          <p><strong>Nom d'utilisateur:</strong> ${data.user.username}</p>
          <p><strong>Email:</strong> ${data.user.email}</p>
          <p><strong>Rôle:</strong> ${data.user.role}</p>
          <p><strong>Créé le:</strong> ${new Date(data.user.createdAt).toLocaleDateString()}</p>
        `;

                // Afficher le panneau admin si l'utilisateur est admin
                if (data.user.role === 'admin') {
                    adminPanel.style.display = 'block';
                } else {
                    adminPanel.style.display = 'none';
                }

                showProfile();
            } else {
                showMessage(data.message, true);
                removeToken();
                showLoginForm();
            }
        } catch (error) {
            console.error('Erreur lors du chargement du profil:', error);
            showMessage(error.message, true);
            removeToken();
            showLoginForm();
        }
    }

    // Gestionnaire de soumission du formulaire d'inscription
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (data.success) {
                // Stocker le token JWT
                setToken(data.token);
                showMessage('Inscription réussie! Redirection vers votre profil...');

                // Charger le profil
                setTimeout(() => {
                    loadProfile();
                }, 1000);
            } else {
                showMessage(data.message || 'Erreur lors de l\'inscription', true);
            }
        } catch (error) {
            console.error('Erreur lors de l\'inscription:', error);
            showMessage('Erreur lors de la communication avec le serveur', true);
        }
    });

    // Gestionnaire de soumission du formulaire de connexion
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                // Stocker le token JWT
                setToken(data.token);
                showMessage('Connexion réussie! Redirection vers votre profil...');

                // Charger le profil
                setTimeout(() => {
                    loadProfile();
                }, 1000);
            } else {
                showMessage(data.message || 'Identifiants invalides', true);
            }
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            showMessage('Erreur lors de la communication avec le serveur', true);
        }
    });

    // Gestionnaire pour la déconnexion
    logoutButton.addEventListener('click', function() {
        removeToken();
        showMessage('Vous avez été déconnecté avec succès');
        showLoginForm();
    });

    // Gestionnaire pour récupérer tous les utilisateurs (admin)
    getUsersButton.addEventListener('click', async function() {
        try {
            const response = await authenticatedFetch(`${API_URL}/users/admin/all`);
            const data = await response.json();

            if (data.success) {
                let html = '<h4>Liste des utilisateurs</h4><ul>';

                data.users.forEach(user => {
                    html += `<li>
            <strong>${user.username}</strong> (${user.email}) -
            Rôle: ${user.role}
          </li>`;
                });

                html += '</ul>';
                usersList.innerHTML = html;
            } else {
                showMessage(data.message, true);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error);
            showMessage(error.message, true);
        }
    });

    // Vérifier l'authentification au chargement de la page
    checkAuth();
});
