// Rangs selon points
function getRank(points) {
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
        mainTitle.innerHTML = `Joyeux Anniversaire, ${user.firstName}! 🎉🎂`;
    } else {
        document.body.classList.remove('birthday-mode');
        mainTitle.textContent = `Bonjour, ${user.firstName}!`;
    }

    userInfoList.innerHTML = '';

    const sortedUsers = [...usersData].sort((a, b) => b.points - a.points);
    const userRank = sortedUsers.findIndex(u => u.firstName === user.firstName && u.lastName === user.lastName) + 1;

    const sanctionMessage = getSanctionWarning(user.points);
    if (sanctionMessage) {
        const warningItem = document.createElement('li');
        warningItem.className = 'sanction-warning';
        warningItem.textContent = sanctionMessage;
        userInfoList.appendChild(warningItem);
    }

    userInfoList.innerHTML += `
        <li><span class="label">Nom complet :</span><span class="value">${user.firstName} ${user.lastName}</span></li>
        <li><span class="label">Points d’amitié :</span><span class="value">${user.points}</span></li>
        <li><span class="label">Rang :</span><span class="value">${getRank(user.points)}</span></li>
        <li><span class="label">Votre place :</span><span class="value">${userRank} / ${usersData.length}</span></li>
        <li><span class="label">Date de naissance :</span><span class="value">${user.dateOfBirth || 'Non renseignée'}</span></li>
        <li><span class="label">Adresse :</span><span class="value">${user.address || 'Non renseignée'}</span></li>
        <li><span class="label">Numéro de téléphone :</span><span class="value">${user.phoneNumber || 'Non renseigné'}</span></li>
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
                <span class="name">${user.firstName} ${user.lastName}</span>
                <span class="points">${user.points} pts</span>
                <span class="rank-name">${getRank(user.points)}</span>
            </div>
            <button onclick="directLogin('${user.firstName}', '${user.lastName}')">Se connecter</button>
        `;
        adminRankingList.appendChild(rankItem);
    });

    document.getElementById('user-login-section').style.display = 'none';
    document.getElementById('user-result-section').style.display = 'none';
    document.getElementById('admin-result-section').style.display = 'block';
    document.getElementById('main-title').textContent = `Bonjour, Gianni! (Admin)`;
}

// Gère la connexion directe depuis l'admin
function directLogin(firstName, lastName) {
    const userToLogin = usersData.find(user =>
        user.firstName === firstName && user.lastName === lastName
    );

    if (userToLogin) {
        localStorage.setItem('currentUser', JSON.stringify(userToLogin));
        displayFriendshipFile(userToLogin);
    }
}


// Gère la connexion
function accessFriendshipFile() {
    const inputFirstName = document.getElementById('input-first-name').value.trim();
    const inputLastName = document.getElementById('input-last-name').value.trim();
    const inputPassword = document.getElementById('input-password').value.trim();
    const loginError = document.getElementById('login-error');

    loginError.textContent = '';

    if (!inputFirstName || !inputLastName || !inputPassword) {
        loginError.textContent = 'Veuillez remplir tous les champs.';
        return;
    }

    const foundUser = usersData.find(user =>
        user.firstName.toLowerCase() === inputFirstName.toLowerCase() &&
        user.lastName.toLowerCase() === inputLastName.toLowerCase() &&
        user.password === inputPassword
    );

    if (foundUser) {
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        if (foundUser.firstName.toLowerCase() === 'gianni' && foundUser.lastName.toLowerCase() === 'blaz') {
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
        if (user.firstName.toLowerCase() === 'gianni' && user.lastName.toLowerCase() === 'blaz') {
            displayAdminRanking();
        } else {
            displayFriendshipFile(user);
        }
    }
};
