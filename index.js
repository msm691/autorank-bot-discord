const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const config = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const DATA_FILE = './data.json';

function loadData() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            const initialData = { tag: null, roleId: null, status: "off" };
            fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 4));
            return initialData;
        }
        return JSON.parse(fs.readFileSync(DATA_FILE));
    } catch (error) {
        console.error(error);
        return { tag: null, roleId: null, status: "off" };
    }
}

function saveData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 4));
    } catch (error) {
        console.error(error);
    }
}

async function sendSafeDM(target, content, fallbackChannel = null) {
    try {
        const user = target.author || target.user || target; 
        await user.send(content);
    } catch (error) {
        if (error.code === 50007 && fallbackChannel) {
            const userId = (target.author || target).id;
            const warning = await fallbackChannel.send(`<@${userId}>, je ne peux pas t'envoyer de MP. Ouvre tes messages privés ! 🔒`);
            setTimeout(() => warning.delete().catch(() => {}), 5000);
        }
    }
}

const commands = [
    new SlashCommandBuilder()
        .setName('set')
        .setDescription('Configuration du bot')
        .addSubcommand(sub => sub.setName('tag').setDescription('Tag à chercher').addStringOption(o => o.setName('valeur').setDescription('Tag (ex: ★)').setRequired(true)))
        .addSubcommand(sub => sub.setName('role').setDescription('Rôle à donner').addRoleOption(o => o.setName('role').setDescription('Rôle cible').setRequired(true))),
    new SlashCommandBuilder()
        .setName('autorank')
        .setDescription('Activer/Désactiver le système')
        .addStringOption(o => o.setName('etat').setDescription('État').setRequired(true).addChoices({ name: 'ON', value: 'on' }, { name: 'OFF', value: 'off' }))
].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(config.token);

client.once('ready', async () => {
    console.log(`Connecté en tant que ${client.user.tag}!`);
    try {
        await rest.put(Routes.applicationCommands(config.clientId), { body: commands });
    } catch (error) { console.error(error); }

    const data = loadData();
    if (data.status === 'on' && data.tag && data.roleId) {
        for (const guild of client.guilds.cache.values()) {
            try {
                const members = await guild.members.fetch();
                for (const member of members.values()) {
                    if (member.roles.cache.has(data.roleId) && !member.displayName.includes(data.tag)) {
                        try {
                            await member.roles.remove(data.roleId);
                        } catch (err) {}
                    }
                }
            } catch (err) {}
        }
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (!config.adminIds.includes(interaction.user.id)) return interaction.reply({ content: "⛔ Permissions insuffisantes.", ephemeral: true });

    const data = loadData();

    if (interaction.commandName === 'set') {
        const sub = interaction.options.getSubcommand();
        if (sub === 'tag') {
            data.tag = interaction.options.getString('valeur');
            saveData(data);
            await interaction.reply({ content: `✅ Tag défini sur : **${data.tag}**`, ephemeral: true });
        } else if (sub === 'role') {
            const role = interaction.options.getRole('role');
            data.roleId = role.id;
            saveData(data);
            await interaction.reply({ content: `✅ Rôle défini sur : **${role.name}**`, ephemeral: true });
        }
    } else if (interaction.commandName === 'autorank') {
        data.status = interaction.options.getString('etat');
        saveData(data);
        await interaction.reply({ content: `Système passé sur **${data.status.toUpperCase()}**`, ephemeral: true });
    }
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
    const data = loadData();
    if (data.status !== 'on' || !data.tag || !data.roleId) return;
    if (oldMember.displayName === newMember.displayName) return;

    if (newMember.roles.cache.has(data.roleId) && !newMember.displayName.includes(data.tag)) {
        try {
            await newMember.roles.remove(data.roleId);
            await sendSafeDM(newMember, `⚠️ Tu as retiré le tag **"${data.tag}"**. Le rôle associé t'a été retiré.`);
        } catch (error) {}
    }
});

client.on('messageCreate', async message => {
    if (message.author.bot || !message.mentions.has(client.user)) return;
    try { if (message.deletable) await message.delete(); } catch (err) {}

    const data = loadData();
    if (data.status !== 'on') return; 
    if (!data.tag || !data.roleId) {
        if (config.adminIds.includes(message.author.id)) sendSafeDM(message, "⚠️ Config incomplète.");
        return;
    }

    const member = message.member;
    
    if (member.displayName.includes(data.tag)) {
        if (member.roles.cache.has(data.roleId)) {
            return sendSafeDM(message, `Tu as déjà le rôle lié au tag **"${data.tag}"**. Tout est bon ! 😉`, message.channel);
        }
        try {
            await member.roles.add(data.roleId);
            return sendSafeDM(message, `🎉 Pseudo validé ! Je t'ai donné le rôle car tu portes le tag **"${data.tag}"**.`, message.channel);
        } catch (error) {
            return sendSafeDM(message, "❌ Erreur de permission. Vérifie ma hiérarchie.", message.channel);
        }
    } else {
        if (member.roles.cache.has(data.roleId)) {
            await member.roles.remove(data.roleId);
            return sendSafeDM(message, `❌ Ton pseudo ne contient plus le tag. Rôle retiré.`, message.channel);
        }
        return sendSafeDM(message, `Salut ! Ajoute **"${data.tag}"** dans ton pseudo pour obtenir le rôle.`, message.channel);
    }
});

client.login(config.token);