# 🏷️ Discord Username Tag Bot

Un bot Discord simple et efficace codé en **Node.js** et **Discord.js v14**.
Il attribue automatiquement un rôle spécifique aux utilisateurs qui ajoutent un "tag" (ex: `★`) dans leur pseudo.

## 🚀 Fonctionnalités

- **Attribution automatique** : L'utilisateur mentionne le bot pour recevoir son rôle s'il porte le tag.
- **Retrait automatique (Temps réel)** : Si un utilisateur retire le tag de son pseudo, le bot lui retire le rôle instantanément et le notifie en MP.
- **Nettoyage au démarrage** : À chaque redémarrage, le bot scanne tous les membres pour retirer les rôles illégitimes (anti-cheat).
- **Configuration persistante** : Les réglages sont sauvegardés localement (`data.json`).
- **Commandes Slash** : Déploiement automatique des commandes `/` au lancement.
- **Chat propre** : Le bot supprime les messages de demande et répond exclusivement en Message Privé (DM).

## 📋 Prérequis

- [Node.js](https://nodejs.org/) (version 16.9.0 ou supérieure).
- Un Bot créé sur le [Discord Developer Portal](https://discord.com/developers/applications).
- **Intents requis** : `Message Content Intent` et `Server Members Intent` doivent être activés sur le portail développeur.

## 🛠️ Installation

1. **Cloner le repo ou télécharger les fichiers**
   ```bash
   git clone https://github.com/msm691/autorank-bot-discord.git
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration**
   Créez un fichier `config.json` à la racine du projet et remplissez-le avec vos informations :
   ```json
   {
     "token": "VOTRE_BOT_TOKEN",
     "clientId": "VOTRE_CLIENT_ID",
     "adminIds": [
       "ID_ADMIN_1",
       "ID_ADMIN_2"
     ]
   }
   ```
   > **Note** : Seuls les IDs listés dans `adminIds` peuvent utiliser les commandes de configuration.

4. **Lancer le bot**
   ```bash
   node index.js
   ```

## ⚙️ Commandes de Configuration (Admin)

Le bot utilise des commandes Slash (`/`). Elles sont réservées aux administrateurs définis dans `config.json`.

| Commande | Description |
| :--- | :--- |
| `/set tag [valeur]` | Définit le symbole ou le texte à chercher dans le pseudo (ex: `★` ou `[TEAM]`). |
| `/set role [role]` | Définit le rôle qui sera donné aux utilisateurs. |
| `/autorank [on/off]` | Active ou désactive le système globalement. |

## 🎮 Utilisation pour les membres

1. L'utilisateur ajoute le tag configuré dans son pseudo (ex: `Pseudo ★`).
2. L'utilisateur mentionne le bot dans n'importe quel salon : `@NomDuBot`.
3. Le bot :
   - Supprime le message de mention.
   - Vérifie le pseudo.
   - Donne le rôle.
   - Envoie une confirmation en MP.

## ⚠️ Permissions Importantes

Pour que le bot fonctionne correctement, assurez-vous que :

1. Le rôle du Bot est placé **au-dessus** du rôle qu'il doit distribuer dans la liste des rôles du serveur (Hiérarchie Discord).
2. Le bot possède la permission **"Gérer les messages"** (pour supprimer les commandes des utilisateurs).
3. Le bot possède la permission **"Gérer les rôles"**.

## 📂 Structure du projet

- `index.js` : Cœur du bot (Logique, Events, Commandes).
- `config.json` : Clés API et IDs des admins (À ne pas partager).
- `data.json` : Base de données locale (générée automatiquement au premier lancement).