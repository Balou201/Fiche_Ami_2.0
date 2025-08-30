// Rangs selon points
function getRank(points) {
    if (points <= 0) return 'Admin';
    if (points === 0) return '❌ Suspendue';
    if (points <= 9) return '🕶️ Connaissance';
    if (points <= 24) return '👋 Camarade';
    if (points <= 49) return '😊 Pote';
    if (points <= 74) return '🤗 Bon ami';
    if (points <= 99) return '💛 Ami proche';
    if (points <= 124) return '💎 Ami précieux';
    if (points <= 149) return '🔒 Ami fidèle';
    if (points <= 174) return '🔥 Ami de cœur';
    if (points <= 199) return '🌟 Ami d’exception';
    if (points >= 200) return '👑 Amitié légendaire';
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
    const currentMonthDay = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return user.birthday === currentMonthDay;
}

// Affiche la fiche de l'utilisateur
function displayFriendshipFile(user) {
    const userInfoList = document.getElementById('user-info-list');
    const mainTitle = document.getElementById('main-title');
    const isBirthday = checkBirthday(user);
    
    // Ajoute la classe 'birthday-mode' au body si c'est l'anniversaire
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

    const crosses = '❌'.repeat(user.numberOfCrosses || 0);

    userInfoList.innerHTML += `
        <li><span class="label">Identifiant :</span><span class="value">${user.identifiant}</span></li>
        <li><span class="label">Points d’amitié :</span><span class="value">${user.points}</span></li>
        <li><span class="label">Rang :</span><span class="value">${getRank(user.points)}</span></li>
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
    document.body.classList.remove('birthday-mode'); // S'assure de retirer le mode anniversaire pour l'admin

    const sortedUsers = [...usersData].sort((a, b) => b.points - a.points);

    sortedUsers.forEach((user, index) => {
        const rankItem = document.createElement('li');
        rankItem.innerHTML = `
            <div class="ranking-item-content">
                <span class="rank">${index + 1}.</span>
                <span class="name">${user.identifiant}</span>
                <span class="points">${user.points} pts</span>
                <span class="rank-name">${getRank(user.points)}</span>
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
function directLogin(identifiant) {
    const userToLogin = usersData.find(user =>
        user.identifiant === identifiant
    );

    if (userToLogin) {
        localStorage.setItem('currentUser', JSON.stringify(userToLogin));
        displayFriendshipFile(userToLogin);
    }
}


// Gère la connexion
function accessFriendshipFile() {
    const inputIdentifiant = document.getElementById('input-identifiant').value.trim();
    const inputPassword = document.getElementById('input-password').value.trim();
    const loginError = document.getElementById('login-error');

    loginError.textContent = '';

    if (!inputIdentifiant || !inputPassword) {
        loginError.textContent = 'Veuillez remplir tous les champs.';
        return;
    }

    const foundUser = usersData.find(user =>
        user.identifiant.toLowerCase() === inputIdentifiant.toLowerCase() &&
        user.password === inputPassword
    );

    if (foundUser) {
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        if (foundUser.identifiant.toLowerCase() === 'g.voida') {
            displayAdminRanking();
        } else {
            displayFriendshipFile(foundUser);
        }
    } else {
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
            displayFriendshipFile(user);
        }
    }
};
