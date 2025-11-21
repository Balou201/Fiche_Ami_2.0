// Fonction asynchrone pour hacher le mot de passe en utilisant SHA-256 (API SubtleCrypto)
// C'est essentiel pour ne pas stocker/comparer les mots de passe en clair.
async function hashPassword(password) {
    // 1. Convertir la chaîne en ArrayBuffer
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    
    // 2. Calculer le hachage SHA-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    // 3. Convertir l'ArrayBuffer en chaîne hexadécimale
    const hashArray = Array.from(new Uint8Array(hashBuffer)); 
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); 
    
    return hashHex;
}

// Rangs selon points
function getRank(user) {
    if (user.identifiant === 'g.voida') return '👑 Admin';
    if (user.points <= 0) return '❌ Suspendue';
    if (user.points <= 9) return '🕶️ Connaissance';
    if (user.points <= 24) return '👋 Camarade';
    if (user.points <= 49) return '😊 Pote';
    if (user.points <= 74) return '🤗 Bon ami';
    if (user.points <= 99) return '💛 Ami proche';
    if (user.points <= 124) return '💎 Ami précieux';
    if (user.points <= 149) return '🔒 Ami fidèle';
    if (user.points <= 174) return '🔥 Ami de cœur';
    if (user.points <= 199) return '🌟 Ami d’exception';
    if (user.points >= 200) return '👑 Amitié légendaire';
    return 'Inconnu';
}

function getSanctionWarning(points) {
    if (points < 50) {
        return `⚠️ Attention : Si tes points restent trop longtemps en dessous de 50 ou que tu perds un rang, une sanction peut être appliquée !`;
    }
    return '';
}

function checkBirthday(user) {
    const today = new Date();
    // Utilise toLocaleString pour un format fiable JJ/MM ou MM/JJ
    const currentMonthDay = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return user.birthday === currentMonthDay;
}

// Affiche la fiche de l'utilisateur
function displayFriendshipFile(user) {
    const userInfoList = document.getElementById('user-info-list');
    const mainTitle = document.getElementById('main-title');
    const isBirthday = checkBirthday(user);
    
    if (isBirthday) {
        document.body.classList.add('birthday-mode');
        mainTitle.innerHTML = `Joyeux Anniversaire, ${user.identifiant}! 🎉🎂`;
    } else {
        document.body.classList.remove('birthday-mode');
        mainTitle.textContent = `Bonjour, ${user.identifiant}!`;
    }

    userInfoList.innerHTML = '';

    const sortedUsers = [...usersData].sort((a, b) => b.points - a.points);
    const userRank = sortedUsers.findIndex(u => u.identifiant === user.identifiant) + 1;

    const sanctionMessage = getSanctionWarning(user.points);
    if (sanctionMessage) {
        const warningItem = document.createElement('li');
        warningItem.className = 'sanction-warning';
        warningItem.textContent = sanctionMessage;
        userInfoList.appendChild(warningItem);
    }
    
    if (user.blocage === 1) {
        const blockageItem = document.createElement('li');
        blockageItem.className = 'blockage-warning';
        blockageItem.textContent = `🚫 Vous êtes actuellement bloqué(e) à ce rang et ne pouvez pas progresser.`;
        userInfoList.appendChild(blockageItem);
    }

    const crosses = '❌'.repeat(user.numberOfCrosses || 0);

    userInfoList.innerHTML += `
        <li><span class="label">Identifiant :</span><span class="value">${user.identifiant}</span></li>
        <li><span class="label">Points d’amitié :</span><span class="value">${user.points}</span></li>
        <li><span class="label">Rang :</span><span class="value">${getRank(user)}</span></li>
        <li><span class="label">Votre place :</span><span class="value">${userRank} / ${usersData.length}</span></li>
        <li><span class="label">Notes :</span><span class="value">${user.notes || 'Aucune note'}</span></li>
        <li><span class="label">Nombre de croix :</span><span class="value">${crosses}</span></li>
    `;

    document.getElementById('user-login-section').style.display = 'none';
    document.getElementById('admin-result-section').style.display = 'none';
    document.getElementById('user-result-section').style.display = 'block';
}

// Affiche la vue administrateur
function displayAdminRanking() {
    const adminRankingList = document.getElementById('admin-ranking-list');
    adminRankingList.innerHTML = '';
    document.body.classList.remove('birthday-mode');

    // Filtre les utilisateurs, exclut l'admin et inclut les suspendus (points >= 0)
    const filteredUsers = usersData.filter(user => user.identifiant !== 'g.voida' && user.points >= 0);
    const sortedUsers = [...filteredUsers].sort((a, b) => b.points - a.points);

    sortedUsers.forEach((user, index) => {
        const rankItem = document.createElement('li');
        
        if (user.points === 0) {
            rankItem.classList.add('compte-suspendu'); 
        }

        rankItem.innerHTML = `
            <div class="ranking-item-content">
                <span class="rank">${index + 1}.</span>
                <span class="name">${user.identifiant}</span>
                <span class="points">${user.points} pts</span>
                <span class="rank-name">${getRank(user)}</span>
            </div>
            <button onclick="directLogin('${user.identifiant}')">Se connecter</button>
        `;
        adminRankingList.appendChild(rankItem);
    });

    document.getElementById('user-login-section').style.display = 'none';
    document.getElementById('user-result-section').style.display = 'none';
    document.getElementById('admin-result-section').style.display = 'block';
    document.getElementById('main-title').textContent = `Bonjour, g.voida! (Admin)`;
}

// Gère la connexion directe depuis l'admin
// CONSEIL : Cette fonction devrait être désactivée ou très sécurisée 
// car elle permet de se connecter sans mot de passe.
function directLogin(identifiant) {
    const userToLogin = usersData.find(user =>
        user.identifiant === identifiant
    );

    if (userToLogin) {
        localStorage.setItem('currentUser', JSON.stringify(userToLogin));
        displayFriendshipFile(userToLogin);
    }
}


// Gère la connexion (RENDU ASYNCHRONE pour le hachage)
async function accessFriendshipFile() {
    const inputIdentifiant = document.getElementById('input-identifiant').value.trim();
    const inputPassword = document.getElementById('input-password').value.trim();
    const loginError = document.getElementById('login-error');

    loginError.textContent = '';

    if (!inputIdentifiant || !inputPassword) {
        loginError.textContent = 'Veuillez remplir tous les champs.';
        return;
    }

    // Hacher le mot de passe entré par l'utilisateur
    // Ceci s'assure que le mot de passe entré n'est JAMAIS comparé en clair
    let hashedInputPassword;
    try {
        hashedInputPassword = await hashPassword(inputPassword);
    } catch (e) {
        // En cas d'erreur de hachage (par exemple, navigateur non compatible SubtleCrypto)
        console.error("Erreur de hachage:", e);
        loginError.textContent = 'Une erreur de sécurité est survenue. Veuillez réessayer.';
        return;
    }

    // Trouver l'utilisateur par identifiant
    const foundUser = usersData.find(user =>
        user.identifiant.toLowerCase() === inputIdentifiant.toLowerCase()
    );

    // Vérification de l'utilisateur ET du mot de passe haché
    if (foundUser && foundUser.password === hashedInputPassword) {
        
        // Redirige vers la page de classement si c'est l'administrateur
        if (foundUser.identifiant.toLowerCase() === 'g.voida') {
            localStorage.setItem('currentUser', JSON.stringify(foundUser));
            displayAdminRanking();
            return;
        }

        // Bloque l'accès si le compte est suspendu (points <= 0)
        if (foundUser.points <= 0) {
            loginError.textContent = 'Votre compte a été suspendu. Vous ne pouvez pas vous connecter.';
            return;
        }

        // Affiche la fiche pour les utilisateurs non suspendus
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        displayFriendshipFile(foundUser);
    } else {
        // Le message d'erreur reste générique pour éviter l'énumération des utilisateurs
        loginError.textContent = 'Informations de connexion incorrectes.';
    }
}

// Gère la déconnexion
function logout() {
    localStorage.removeItem('currentUser');
    location.reload();
}

// Vérifie au chargement de la page si un utilisateur est déjà connecté
window.onload = function() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const user = JSON.parse(currentUser);
        if (user.identifiant.toLowerCase() === 'g.voida') {
            displayAdminRanking();
        } else {
            // Empêche les utilisateurs suspendus de rester connectés
            if (user.points <= 0) {
                logout();
                return;
            }
            displayFriendshipFile(user);
        }
    }
    
    // Attache l'écouteur d'événement à la soumission du formulaire
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        // Écouteur d'événement pour le bouton/formulaire de connexion
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Empêche le rechargement de la page
            accessFriendshipFile(); // Appelle la fonction de connexion asynchrone
        });
    }
};
