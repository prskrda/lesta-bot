// ═══════════════════════════════════════════════════════════════
// LESTA BOT - CYBER ENGINE V5.2
// Discord Bot - Key Drop Sistemi (Yeni)
// ═══════════════════════════════════════════════════════════════

const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const WORKER_URL = process.env.WORKER_URL || "https://lesta-hub.prskrda.workers.dev";
const PASSWORD = "lesta4ever437713";

const ALLOWED_IDS = [
  "1433119562454401056",
  "1505609149487124480",
  "1482307799948984402",
  "1399802460649947207"
];

if (!TOKEN || !CLIENT_ID) {
  console.error("❌ DISCORD_TOKEN veya DISCORD_CLIENT_ID eksik!");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ]
});

// ═══════════════════════════════════════════════════════════════
// SLASH KOMUTLAR
// ═══════════════════════════════════════════════════════════════

const commands = [
  new SlashCommandBuilder().setName('script-yukle').setDescription('Yeni script yükle')
    .addStringOption(o => o.setName('isim').setDescription('Script adı').setRequired(true))
    .addStringOption(o => o.setName('kod').setDescription('Lua kodu').setRequired(true)),
  new SlashCommandBuilder().setName('script-listele').setDescription('Tüm scriptleri listele'),
  new SlashCommandBuilder().setName('script-sil').setDescription('Script sil')
    .addStringOption(o => o.setName('hash').setDescription('Script hash').setRequired(true)),
  new SlashCommandBuilder().setName('script-goster').setDescription('Script kullanıcı kodunu göster (KEY-EKLE ile)')
    .addStringOption(o => o.setName('script').setDescription('Script adı veya hash').setRequired(true)),
  new SlashCommandBuilder().setName('script-keyli-goster').setDescription('Script kodunu seçtiğin key ile göster')
    .addStringOption(o => o.setName('script').setDescription('Script adı veya hash').setRequired(true))
    .addStringOption(o => o.setName('key').setDescription('Kullanılacak key').setRequired(true)),
  new SlashCommandBuilder().setName('key-olustur').setDescription('Yeni key oluştur')
    .addStringOption(o => o.setName('script').setDescription('Script adı veya hash').setRequired(true))
    .addIntegerOption(o => o.setName('sure').setDescription('Süre').setRequired(true))
    .addStringOption(o => o.setName('birim').setDescription('Birim').setRequired(true)
      .addChoices(
        { name: 'Dakika', value: '1' },
        { name: 'Saat', value: '60' },
        { name: 'Gün', value: '1440' },
        { name: 'Hafta', value: '10080' },
        { name: 'Ay', value: '43200' }
      ))
    .addStringOption(o => o.setName('not').setDescription('Not').setRequired(false)),
  new SlashCommandBuilder().setName('key-listele').setDescription('Tüm keyleri listele'),
  new SlashCommandBuilder().setName('key-sil').setDescription('Key sil')
    .addStringOption(o => o.setName('key').setDescription('Silinecek key').setRequired(true)),
  new SlashCommandBuilder().setName('trial-olustur').setDescription('Trial key oluştur')
    .addStringOption(o => o.setName('script').setDescription('Script adı veya hash').setRequired(true)),
  new SlashCommandBuilder().setName('istatistik').setDescription('Sistem istatistikleri'),
  new SlashCommandBuilder().setName('yardim').setDescription('Yardım menüsü'),

  new SlashCommandBuilder().setName('key-drop').setDescription('Key drop başlat (sadece yetkililer)')
    .addStringOption(o => o.setName('script').setDescription('Script adı veya hash').setRequired(true))
    .addStringOption(o => o.setName('yontem').setDescription('Drop yöntemi').setRequired(true)
      .addChoices(
        { name: 'Sayı Tahmin (0-50)', value: 'sayi' },
        { name: 'İlk Basan Kazanır (buton)', value: 'buton' }
      ))
    .addIntegerOption(o => o.setName('sure').setDescription('Key süresi').setRequired(true))
    .addStringOption(o => o.setName('birim').setDescription('Süre birimi').setRequired(true)
      .addChoices(
        { name: 'Dakika', value: '1' },
        { name: 'Saat', value: '60' },
        { name: 'Gün', value: '1440' },
        { name: 'Hafta', value: '10080' },
        { name: 'Ay', value: '43200' }
      ))
    .addChannelOption(o => o.setName('kanal').setDescription('Drop hangi kanala gitsin').setRequired(true))
    .addStringOption(o => o.setName('not').setDescription('Key notu').setRequired(false)),

  new SlashCommandBuilder().setName('key-drop-iptal').setDescription('Aktif key drop\'u iptal et')
].map(c => c.toJSON());

const UNIT_NAMES = { "1": "dakika", "60": "saat", "1440": "gün", "10080": "hafta", "43200": "ay" };

// ═══════════════════════════════════════════════════════════════
// AKTİF DROPLAR
// ═══════════════════════════════════════════════════════════════

const activeDrops = new Map();
// key: dropId
// value: { guildId, channelId, method, secretNumber, winnerId, scriptHash, scriptName, sure, birim, not, messageId, startedAt, handler }

// ═══════════════════════════════════════════════════════════════
// API YARDIMCILAR
// ═══════════════════════════════════════════════════════════════

async function apiGet() {
  const r = await fetch(WORKER_URL + "/api/list");
  return await r.json();
}

async function apiPost(endpoint, data) {
  const r = await fetch(WORKER_URL + endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pass: PASSWORD, ...data })
  });
  return await r.json();
}

function findScript(scripts, input) {
  for (const [h, s] of Object.entries(scripts)) {
    if (s.name.toLowerCase() === input.toLowerCase() || h.startsWith(input)) {
      return { hash: h, name: s.name };
    }
  }
  return null;
}

function findKey(keys, input) {
  for (const k of Object.keys(keys)) {
    if (k === input || k.startsWith(input)) return k;
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════
// KEY OLUŞTUR + DM
// ═══════════════════════════════════════════════════════════════

async function createKeyAndDM(client, userId, scriptHash, scriptName, sure, birim, note, kanal) {
  const result = await apiPost("/api/create_key", {
    scriptHash,
    num: sure,
    unit: birim,
    note: note || "Key Drop"
  });

  if (!result.ok) {
    if (kanal) await kanal.send({ content: `❌ Key oluşturulamadı: ${result.err}` }).catch(() => {});
    return null;
  }

  const luaUrl = WORKER_URL + "/scripts/" + scriptHash + ".lua";
  const dmEmbed = new EmbedBuilder()
    .setTitle("🏆 Key Drop Kazandın!")
    .setColor(0x3fb950)
    .addFields(
      { name: "📦 Script", value: scriptName, inline: true },
      { name: "⏱️ Süre", value: `${sure} ${UNIT_NAMES[birim]}`, inline: true },
      { name: "🔑 Key", value: "`" + result.key + "`", inline: false }
    )
    .setDescription("**📜 Kullanıcı Scripti:**\n```lua\nscript_key = \"" + result.key + "\"\nloadstring(game:HttpGet(\"" + luaUrl + "\"))()\n```")
    .setFooter({ text: "LestaSec Cyber Engine v5.2" })
    .setTimestamp();

  try {
    const user = await client.users.fetch(userId);
    await user.send({ embeds: [dmEmbed] });
    return { key: result.key, dmOk: true };
  } catch (e) {
    if (kanal) await kanal.send({ content: `⚠️ <@${userId}> DM'i kapalı! Key: \`${result.key}\`` }).catch(() => {});
    return { key: result.key, dmOk: false };
  }
}

// ═══════════════════════════════════════════════════════════════
// BOT HAZIR
// ═══════════════════════════════════════════════════════════════

client.once('ready', async () => {
  console.log(`✅ ${client.user.tag} hazır!`);
  const rest = new REST({ version: '10' }).setToken(TOKEN);
  try {
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log(`✅ ${commands.length} slash komut kaydedildi!`);
  } catch (e) { console.error("❌ Komut kayıt hatası:", e); }
});

// ═══════════════════════════════════════════════════════════════
// MESAJ DİNLEYİCİ (SAYI TAHMİN İÇİN)
// ═══════════════════════════════════════════════════════════════

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  // Aktif sayı drop'ları kontrol et
  for (const [dropId, drop] of activeDrops.entries()) {
    if (drop.method !== 'sayi') continue;
    if (drop.winnerId) continue;
    if (message.channel.id !== drop.channelId) continue;

    const num = parseInt(message.content.trim());
    if (isNaN(num)) continue;

    if (num === drop.secretNumber) {
      // KAZANAN!
      drop.winnerId = message.author.id;

      // Drop mesajını güncelle
      await updateDropMessage(drop, message.author);

      // Key oluştur + DM
      const channel = await client.channels.fetch(drop.channelId).catch(() => null);
      const keyResult = await createKeyAndDM(
        client,
        message.author.id,
        drop.scriptHash,
        drop.scriptName,
        drop.sure,
        drop.birim,
        drop.note,
        channel
      );

      if (keyResult && channel) {
        // Kazanma mesajı
        const winEmbed = new EmbedBuilder()
          .setTitle("🎉 KAZANAN!")
          .setColor(0x3fb950)
          .setDescription(
            `🏆 <@${message.author.id}> sayıyı doğru bildi!\n\n` +
            `**Doğru Sayı:** ${drop.secretNumber}\n` +
            `**Script:** ${drop.scriptName}\n\n` +
            `${keyResult.dmOk ? "📬 DM kutusuna script gönderildi!" : "⚠️ DM kapalıydı, key kanala yazıldı."}`
          )
          .setFooter({ text: "LestaSec Cyber Engine v5.2" })
          .setTimestamp();
        await channel.send({ embeds: [winEmbed] }).catch(() => {});
      }

      activeDrops.delete(dropId);
    }
  }
});

// ═══════════════════════════════════════════════════════════════
// DROP MESAJINI GÜNCELLE
// ═══════════════════════════════════════════════════════════════

async function updateDropMessage(drop, winner) {
  try {
    const channel = await client.channels.fetch(drop.channelId);
    const message = await channel.messages.fetch(drop.messageId);

    let desc = "";
    if (drop.method === 'sayi') {
      desc =
        `**Script:** ${drop.scriptName}\n` +
        `**Key Süresi:** ${drop.sure} ${UNIT_NAMES[drop.birim]}\n\n` +
        `🔒 **KAZANILDI! (${winner.username})**\n\n` +
        `**Doğru Sayı:** ${drop.secretNumber}`;
    } else if (drop.method === 'buton') {
      desc =
        `**Script:** ${drop.scriptName}\n` +
        `**Key Süresi:** ${drop.sure} ${UNIT_NAMES[drop.birim]}\n\n` +
        `🔒 **KAZANILDI! (${winner.username})**`;
    }

    const embed = new EmbedBuilder()
      .setTitle(drop.method === 'sayi' ? "🎯 KEY DROP - SAYI TAHMİN" : "⚡ KEY DROP - İLK BASAN KAZANIR")
      .setColor(drop.method === 'sayi' ? 0xa855f7 : 0xf85149)
      .setDescription(desc)
      .setFooter({ text: "LestaSec Cyber Engine v5.2" })
      .setTimestamp();

    let components = [];
    if (drop.method === 'buton') {
      const lockedBtn = new ButtonBuilder()
        .setCustomId(`drop_locked_${drop.messageId}`)
        .setLabel(`🔒 KAZANILDI! (${winner.username})`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);
      components = [new ActionRowBuilder().addComponents(lockedBtn)];
    }

    await message.edit({ embeds: [embed], components });
  } catch (e) {
    console.error("Drop mesajı güncellenemedi:", e);
  }
}

// ═══════════════════════════════════════════════════════════════
// KOMUT HANDLER
// ═══════════════════════════════════════════════════════════════

client.on('interactionCreate', async interaction => {
  // Buton tıklamaları
  if (interaction.isButton()) {
    for (const [dropId, drop] of activeDrops.entries()) {
      if (drop.method !== 'buton') continue;
      if (drop.winnerId) {
        return interaction.reply({ content: "😔 Çok geç! Başkası kaptı.", ephemeral: true });
      }
      if (interaction.customId !== `drop_buton_${dropId}`) continue;

      // KAZANAN!
      drop.winnerId = interaction.user.id;

      await updateDropMessage(drop, interaction.user);

      await interaction.reply({ content: "🎉 KAZANDIN! Key DM'den gönderiliyor...", ephemeral: true });

      const channel = await client.channels.fetch(drop.channelId).catch(() => null);
      const keyResult = await createKeyAndDM(
        client,
        interaction.user.id,
        drop.scriptHash,
        drop.scriptName,
        drop.sure,
        drop.birim,
        drop.note,
        channel
      );

      if (keyResult && channel) {
        const winEmbed = new EmbedBuilder()
          .setTitle("⚡ KAZANAN!")
          .setColor(0x3fb950)
          .setDescription(
            `🏆 <@${interaction.user.id}> butona ilk bastı!\n\n` +
            `**Script:** ${drop.scriptName}\n` +
            `**Ödül:** ${drop.sure} ${UNIT_NAMES[drop.birim]} key\n\n` +
            `${keyResult.dmOk ? "📬 DM kutusuna script gönderildi!" : "⚠️ DM kapalıydı, key kanala yazıldı."}`
          )
          .setFooter({ text: "LestaSec Cyber Engine v5.2" })
          .setTimestamp();
        await channel.send({ embeds: [winEmbed] }).catch(() => {});
      }

      activeDrops.delete(dropId);
      return;
    }
    return;
  }

  if (!interaction.isChatInputCommand()) return;
  const { commandName } = interaction;

  // YETKİ KONTROLÜ
  if (!ALLOWED_IDS.includes(interaction.user.id)) {
    return interaction.reply({
      content: "🔒 **Yetkin yok!**\n\nBu komutları sadece yetkili kişiler kullanabilir.",
      ephemeral: true
    });
  }

  try {
    // ═══ SCRIPT YÜKLE ═══
    if (commandName === 'script-yukle') {
      await interaction.deferReply();
      const name = interaction.options.getString('isim');
      const script = interaction.options.getString('kod');
      const result = await apiPost("/api/upload_script", { script, name });
      if (result.ok) {
        const luaUrl = WORKER_URL + "/scripts/" + result.hash + ".lua";
        const userScript = 'script_key = "KEY-EKLE"\nloadstring(game:HttpGet("' + luaUrl + '"))()';
        const embed = new EmbedBuilder().setTitle("✅ Script Yüklendi").setColor(0x3fb950)
          .addFields(
            { name: "📦 İsim", value: name, inline: true },
            { name: "🔗 Hash", value: "`" + result.hash.substring(0, 24) + "...`", inline: false }
          )
          .setDescription("**📋 Kullanıcı Scripti:**\n```lua\n" + userScript + "\n```")
          .setFooter({ text: "LestaSec Cyber Engine v5.2" }).setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      } else await interaction.editReply({ content: "❌ " + result.err });
    }

    // ═══ SCRIPT LİSTELE ═══
    if (commandName === 'script-listele') {
      await interaction.deferReply();
      const data = await apiGet();
      const scripts = data.scripts || {};
      if (Object.keys(scripts).length === 0) return await interaction.editReply({ content: "📭 Henüz script yüklenmemiş." });
      const embed = new EmbedBuilder().setTitle("📦 Yüklü Scriptler").setColor(0x58a6ff)
        .setDescription("Toplam: **" + Object.keys(scripts).length + "** script")
        .setFooter({ text: "LestaSec Cyber Engine v5.2" }).setTimestamp();
      Object.entries(scripts).slice(0, 10).forEach(([hash, s]) => {
        const keyCount = Object.values(data.keys || {}).filter(k => k.scriptHash === hash).length;
        embed.addFields({ name: "📦 " + s.name, value: "Hash: `" + hash.substring(0, 16) + "...`\nKey: **" + keyCount + "**", inline: false });
      });
      await interaction.editReply({ embeds: [embed] });
    }

    // ═══ SCRIPT SİL ═══
    if (commandName === 'script-sil') {
      await interaction.deferReply();
      const hash = interaction.options.getString('hash');
      const result = await apiPost("/api/delete_script", { hash });
      if (result.ok) await interaction.editReply({ content: "🗑️ Script silindi." });
      else await interaction.editReply({ content: "❌ Silinemedi." });
    }

    // ═══ SCRIPT GÖSTER ═══
    if (commandName === 'script-goster') {
      await interaction.deferReply();
      const scriptInput = interaction.options.getString('script');
      const data = await apiGet();
      const found = findScript(data.scripts || {}, scriptInput);
      if (!found) return await interaction.editReply({ content: "❌ Script bulunamadı." });
      const luaUrl = WORKER_URL + "/scripts/" + found.hash + ".lua";
      const userScript = 'script_key = "KEY-EKLE"\nloadstring(game:HttpGet("' + luaUrl + '"))()';
      const embed = new EmbedBuilder().setTitle("📜 " + found.name).setColor(0x58a6ff)
        .setDescription("**Kullanıcıya Verilecek Kod:**\n```lua\n" + userScript + "\n```")
        .setFooter({ text: "LestaSec Cyber Engine v5.2" }).setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }

    // ═══ SCRIPT KEYLİ GÖSTER ═══
    if (commandName === 'script-keyli-goster') {
      await interaction.deferReply();
      const scriptInput = interaction.options.getString('script');
      const keyInput = interaction.options.getString('key');
      const data = await apiGet();
      const found = findScript(data.scripts || {}, scriptInput);
      if (!found) return await interaction.editReply({ content: "❌ Script bulunamadı." });
      const keys = data.keys || {};
      const realKey = findKey(keys, keyInput);
      if (!realKey) return await interaction.editReply({ content: "❌ Key bulunamadı." });
      if (keys[realKey].scriptHash !== found.hash) return await interaction.editReply({ content: "❌ Bu key bu script'e ait değil!" });
      const luaUrl = WORKER_URL + "/scripts/" + found.hash + ".lua";
      const userScript = 'script_key = "' + realKey + '"\nloadstring(game:HttpGet("' + luaUrl + '"))()';
      const embed = new EmbedBuilder().setTitle("📜 " + found.name + " • 🔑 Keyli").setColor(0x3fb950)
        .setDescription("**Kullanıcıya Verilecek Kod:**\n```lua\n" + userScript + "\n```")
        .addFields(
          { name: "🔑 Key", value: "`" + realKey + "`", inline: false },
          { name: "📦 Script", value: found.name, inline: true },
          { name: "📅 Bitiş", value: keys[realKey].isTrial ? "Sınırsız" : new Date(keys[realKey].expires).toLocaleString("tr-TR"), inline: true }
        )
        .setFooter({ text: "LestaSec Cyber Engine v5.2" }).setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }

    // ═══ KEY OLUŞTUR ═══
    if (commandName === 'key-olustur') {
      await interaction.deferReply();
      const scriptInput = interaction.options.getString('script');
      const sure = interaction.options.getInteger('sure');
      const birim = interaction.options.getString('birim');
      const not = interaction.options.getString('not') || '';
      const data = await apiGet();
      const found = findScript(data.scripts || {}, scriptInput);
      if (!found) return await interaction.editReply({ content: "❌ Script bulunamadı." });
      const result = await apiPost("/api/create_key", { scriptHash: found.hash, num: sure, unit: birim, note: not });
      if (result.ok) {
        const luaUrl = WORKER_URL + "/scripts/" + found.hash + ".lua";
        const embed = new EmbedBuilder().setTitle("🔑 Key Oluşturuldu").setColor(0x3fb950)
          .addFields(
            { name: "🔑 Key", value: "`" + result.key + "`", inline: false },
            { name: "📦 Script", value: found.name, inline: true },
            { name: "⏱️ Süre", value: sure + " " + UNIT_NAMES[birim], inline: true },
            { name: "📝 Not", value: not || "—", inline: false }
          )
          .setDescription("**📜 Kullanıcı Scripti:**\n```lua\nscript_key = \"" + result.key + "\"\nloadstring(game:HttpGet(\"" + luaUrl + "\"))()\n```")
          .setFooter({ text: "LestaSec Cyber Engine v5.2" }).setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      } else await interaction.editReply({ content: "❌ " + result.err });
    }

    // ═══ KEY LİSTELE ═══
    if (commandName === 'key-listele') {
      await interaction.deferReply();
      const data = await apiGet();
      const keys = data.keys || {};
      if (Object.keys(keys).length === 0) return await interaction.editReply({ content: "📭 Henüz key yok." });
      const embed = new EmbedBuilder().setTitle("🔑 Key Listesi").setColor(0x58a6ff)
        .setDescription("Toplam: **" + Object.keys(keys).length + "** key")
        .setFooter({ text: "LestaSec Cyber Engine v5.2" }).setTimestamp();
      const now = Date.now();
      Object.entries(keys).slice(0, 15).forEach(([key, v]) => {
        const scriptName = data.scripts[v.scriptHash] ? data.scripts[v.scriptHash].name : "Silinmiş";
        let status = "✅ Aktif";
        if (v.isTrial) status = "🎁 Trial";
        else if (v.expires > 0 && v.expires < now) status = "⏰ Süresi Dolmuş";
        else if (v.usedBy) status = "❌ Kullanılmış";
        const exp = (v.isTrial || v.expires === 0) ? "Sınırsız" : new Date(v.expires).toLocaleString("tr-TR");
        embed.addFields({ name: "🔑 `" + key.substring(0, 20) + "`", value: "📦 " + scriptName + "\n" + status + " • " + exp, inline: false });
      });
      await interaction.editReply({ embeds: [embed] });
    }

    // ═══ KEY SİL ═══
    if (commandName === 'key-sil') {
      await interaction.deferReply();
      const key = interaction.options.getString('key');
      const result = await apiPost("/api/delete_key", { key });
      if (result.ok) await interaction.editReply({ content: "🗑️ Key silindi: `" + key + "`" });
      else await interaction.editReply({ content: "❌ Silinemedi." });
    }

    // ═══ TRIAL OLUŞTUR ═══
    if (commandName === 'trial-olustur') {
      await interaction.deferReply();
      const scriptInput = interaction.options.getString('script');
      const data = await apiGet();
      const found = findScript(data.scripts || {}, scriptInput);
      if (!found) return await interaction.editReply({ content: "❌ Script bulunamadı." });
      const result = await apiPost("/api/create_trial", { scriptHash: found.hash });
      if (result.ok) {
        const luaUrl = WORKER_URL + "/scripts/" + found.hash + ".lua";
        const embed = new EmbedBuilder().setTitle("🎁 Trial Key Oluşturuldu").setColor(0xa855f7)
          .addFields(
            { name: "🔑 Key", value: "`trial`", inline: true },
            { name: "📦 Script", value: found.name, inline: true },
            { name: "⏱️ Süre", value: "Sınırsız", inline: true }
          )
          .setDescription("**📜 Kullanıcı Scripti:**\n```lua\nscript_key = \"trial\"\nloadstring(game:HttpGet(\"" + luaUrl + "\"))()\n```")
          .setFooter({ text: "LestaSec Cyber Engine v5.2" }).setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      } else await interaction.editReply({ content: "❌ " + result.err });
    }

    // ═══ İSTATİSTİK ═══
    if (commandName === 'istatistik') {
      await interaction.deferReply();
      const data = await apiGet();
      const keys = Object.values(data.keys || {});
      const scripts = Object.values(data.scripts || {});
      const now = Date.now();
      let active = 0, used = 0, expired = 0, trial = 0;
      keys.forEach(k => {
        if (k.isTrial) trial++;
        else if (k.expires > 0 && k.expires < now) expired++;
        else if (k.usedBy) used++;
        else active++;
      });
      const embed = new EmbedBuilder().setTitle("📊 LestaSec İstatistikleri").setColor(0x58a6ff)
        .addFields(
          { name: "📦 Toplam Script", value: "**" + scripts.length + "**", inline: true },
          { name: "🔑 Toplam Key", value: "**" + keys.length + "**", inline: true },
          { name: "✅ Aktif", value: "**" + active + "**", inline: true },
          { name: "❌ Kullanılmış", value: "**" + used + "**", inline: true },
          { name: "⏰ Süresi Dolmuş", value: "**" + expired + "**", inline: true },
          { name: "🎁 Trial", value: "**" + trial + "**", inline: true }
        )
        .setFooter({ text: "LestaSec Cyber Engine v5.2" }).setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }

    // ═══ YARDIM ═══
    if (commandName === 'yardim') {
      const embed = new EmbedBuilder().setTitle("📖 Lesta Bot Komutları").setColor(0x58a6ff)
        .setDescription("LestaSec Cyber Engine v5.2 - Slash Komutları")
        .addFields(
          { name: "📦 Script Komutları", value: "`/script-yukle` - Yeni script yükle\n`/script-listele` - Scriptleri listele\n`/script-sil` - Script sil\n`/script-goster` - KEY-EKLE formatında göster\n`/script-keyli-goster` - Keyli format göster", inline: false },
          { name: "🔑 Key Komutları", value: "`/key-olustur` - Yeni key oluştur\n`/key-listele` - Keyleri listele\n`/key-sil` - Key sil", inline: false },
          { name: "🎁 Trial", value: "`/trial-olustur` - Trial key oluştur", inline: false },
          { name: "🎯 Drop", value: "`/key-drop` - Key drop başlat (sayı/buton)\n`/key-drop-iptal` - Aktif drop'u iptal et", inline: false },
          { name: "📊 Diğer", value: "`/istatistik` - İstatistikler\n`/yardim` - Bu menü", inline: false }
        )
        .setFooter({ text: "LestaSec Cyber Engine v5.2" }).setTimestamp();
      await interaction.reply({ embeds: [embed] });
    }

    // ═══════════════════════════════════════════════════════
    // KEY DROP
    // ═══════════════════════════════════════════════════════
    if (commandName === 'key-drop') {
      await interaction.deferReply({ ephemeral: true });

      // Aynı sunucuda aktif drop var mı?
      const existing = Array.from(activeDrops.values()).find(d => d.guildId === interaction.guildId);
      if (existing) {
        return await interaction.editReply({ content: "⚠️ Bu sunucuda zaten aktif bir drop var! Önce onu iptal et: `/key-drop-iptal`" });
      }

      const scriptInput = interaction.options.getString('script');
      const yontem = interaction.options.getString('yontem');
      const sure = interaction.options.getInteger('sure');
      const birim = interaction.options.getString('birim');
      const kanal = interaction.options.getChannel('kanal');
      const not = interaction.options.getString('not') || "Key Drop";

      const data = await apiGet();
      const found = findScript(data.scripts || {}, scriptInput);
      if (!found) return await interaction.editReply({ content: "❌ Script bulunamadı." });

      if (!kanal.isTextBased || !kanal.isTextBased()) {
        return await interaction.editReply({ content: "❌ Geçersiz kanal." });
      }

      const dropId = Date.now().toString(36);

      // ═══ SAYI YÖNTEMİ ═══
      if (yontem === 'sayi') {
        const secretNumber = Math.floor(Math.random() * 51); // 0-50

        const embed = new EmbedBuilder()
          .setTitle("🎯 KEY DROP - SAYI TAHMİN")
          .setColor(0xa855f7)
          .setDescription(
            `**Script:** ${found.name}\n` +
            `**Key Süresi:** ${sure} ${UNIT_NAMES[birim]}\n\n` +
            `**Nasıl oynanır?**\n` +
            `1️⃣ 0 ile 50 arasında bir sayı tuttum\n` +
            `2️⃣ Bu kanala tahminini yaz\n` +
            `3️⃣ **Doğru bilen ilk kişi kazanır!**\n\n` +
            `⚡ İstediğin kadar tahmin yapabilirsin!`
          )
          .setFooter({ text: "LestaSec Cyber Engine v5.2" })
          .setTimestamp();

        const dropMsg = await kanal.send({ embeds: [embed] });

        // Drop'u kaydet
        activeDrops.set(dropId, {
          guildId: interaction.guildId,
          channelId: kanal.id,
          messageId: dropMsg.id,
          method: 'sayi',
          secretNumber,
          winnerId: null,
          scriptHash: found.hash,
          scriptName: found.name,
          sure,
          birim,
          note: not,
          startedAt: Date.now()
        });

        await interaction.editReply({
          content: `✅ **Sayı Drop Başlatıldı!**\n\n🎯 Gizli Sayı: **${secretNumber}** (kimseye söyleme!)\n📢 Kanal: ${kanal}\n⚡ Kimse bulamazsa süresiz açık kalır. İptal: \`/key-drop-iptal\``
        });
      }

      // ═══ BUTON YÖNTEMİ ═══
      if (yontem === 'buton') {
        const embed = new EmbedBuilder()
          .setTitle("⚡ KEY DROP - İLK BASAN KAZANIR")
          .setColor(0xf85149)
          .setDescription(
            `**Script:** ${found.name}\n` +
            `**Key Süresi:** ${sure} ${UNIT_NAMES[birim]}\n\n` +
            `**Nasıl oynanır?**\n` +
            `Aşağıdaki **KAPIYORUM!** butonuna **İLK BASAN** kazanır!\n` +
            `⚡ Hızlı ol, key seni bekliyor!`
          )
          .setFooter({ text: "LestaSec Cyber Engine v5.2" })
          .setTimestamp();

        const kapBtn = new ButtonBuilder()
          .setCustomId(`drop_buton_${dropId}`)
          .setLabel("⚡ KAPIYORUM!")
          .setStyle(ButtonStyle.Danger);

        const dropMsg = await kanal.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents(kapBtn)] });

        activeDrops.set(dropId, {
          guildId: interaction.guildId,
          channelId: kanal.id,
          messageId: dropMsg.id,
          method: 'buton',
          secretNumber: null,
          winnerId: null,
          scriptHash: found.hash,
          scriptName: found.name,
          sure,
          birim,
          note: not,
          startedAt: Date.now()
        });

        await interaction.editReply({ content: `✅ **Buton Drop Başlatıldı!**\n\n📢 Kanal: ${kanal}` });
      }
    }

    // ═══ KEY DROP İPTAL ═══
    if (commandName === 'key-drop-iptal') {
      await interaction.deferReply({ ephemeral: true });

      const drops = Array.from(activeDrops.entries()).filter(([id, d]) => d.guildId === interaction.guildId);
      if (drops.length === 0) {
        return await interaction.editReply({ content: "📭 Bu sunucuda aktif drop yok." });
      }

      for (const [dropId, drop] of drops) {
        try {
          const channel = await client.channels.fetch(drop.channelId);
          const message = await channel.messages.fetch(drop.messageId);
          const cancelledEmbed = new EmbedBuilder()
            .setTitle("🚫 DROP İPTAL EDİLDİ")
            .setColor(0xf85149)
            .setDescription(`**Script:** ${drop.scriptName}\n\nYetkili tarafından iptal edildi.`)
            .setFooter({ text: "LestaSec Cyber Engine v5.2" })
            .setTimestamp();

          let components = [];
          if (drop.method === 'buton') {
            const cancelledBtn = new ButtonBuilder()
              .setCustomId(`drop_cancelled_${dropId}`)
              .setLabel("🚫 İPTAL EDİLDİ")
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(true);
            components = [new ActionRowBuilder().addComponents(cancelledBtn)];
          }

          await message.edit({ embeds: [cancelledEmbed], components });
        } catch(e) {}
        activeDrops.delete(dropId);
      }

      await interaction.editReply({ content: `✅ ${drops.length} drop iptal edildi.` });
    }

  } catch (err) {
    console.error("Komut hatası:", err);
    try {
      if (interaction.deferred) await interaction.editReply({ content: "❌ Hata: " + err.message });
      else await interaction.reply({ content: "❌ Hata: " + err.message, ephemeral: true });
    } catch (e) {}
  }
});

client.login(TOKEN);

// ═══════════════════════════════════════════════════════════════
// WEB SUNUCUSU (Render uyanık kalsın)
// ═══════════════════════════════════════════════════════════════
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Lesta Bot Aktif!');
}).listen(process.env.PORT || 3000, () => {
  console.log("✅ Web sunucusu: Port " + (process.env.PORT || 3000));
});
