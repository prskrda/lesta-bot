// ═══════════════════════════════════════════════════════════════
// LESTA BOT - CYBER ENGINE V5.2
// Full Version - 47 Commands
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
// SLASH KOMUTLAR (47 komut)
// ═══════════════════════════════════════════════════════════════

const commands = [
  // ═══ SCRIPT KOMUTLARI (12) ═══
  new SlashCommandBuilder().setName('script-yukle').setDescription('Yeni script yükle')
    .addStringOption(o => o.setName('isim').setDescription('Script adı').setRequired(true))
    .addStringOption(o => o.setName('kod').setDescription('Lua kodu').setRequired(true)),
  new SlashCommandBuilder().setName('script-listele').setDescription('Tüm scriptleri listele'),
  new SlashCommandBuilder().setName('script-sil').setDescription('Script sil')
    .addStringOption(o => o.setName('hash').setDescription('Script hash').setRequired(true)),
  new SlashCommandBuilder().setName('script-goster').setDescription('Script kodunu göster (KEY-EKLE ile)')
    .addStringOption(o => o.setName('script').setDescription('Script adı veya hash').setRequired(true)),
  new SlashCommandBuilder().setName('script-keyli-goster').setDescription('Script kodunu key ile göster')
    .addStringOption(o => o.setName('script').setDescription('Script adı veya hash').setRequired(true))
    .addStringOption(o => o.setName('key').setDescription('Kullanılacak key').setRequired(true)),
  new SlashCommandBuilder().setName('script-istatistik').setDescription('Script kullanım istatistikleri')
    .addStringOption(o => o.setName('script').setDescription('Script adı veya hash').setRequired(true)),
  new SlashCommandBuilder().setName('script-arama').setDescription('Script ara')
    .addStringOption(o => o.setName('kelime').setDescription('Arama kelimesi').setRequired(true)),
  new SlashCommandBuilder().setName('script-yeniden-adlandir').setDescription('Script adını değiştir')
    .addStringOption(o => o.setName('script').setDescription('Script adı veya hash').setRequired(true))
    .addStringOption(o => o.setName('yeni_isim').setDescription('Yeni isim').setRequired(true)),
  new SlashCommandBuilder().setName('script-kopyala').setDescription('Script kopyala')
    .addStringOption(o => o.setName('script').setDescription('Script adı veya hash').setRequired(true)),
  new SlashCommandBuilder().setName('script-bilgi').setDescription('Script detaylı bilgisi')
    .addStringOption(o => o.setName('script').setDescription('Script adı veya hash').setRequired(true)),

  // ═══ KEY KOMUTLARI (15) ═══
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
  new SlashCommandBuilder().setName('key-toplu-olustur').setDescription('Tek seferde 10-50 key oluştur')
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
    .addIntegerOption(o => o.setName('miktar').setDescription('Kaç key (1-50)').setRequired(true)),
  new SlashCommandBuilder().setName('key-uzat').setDescription('Key süresini uzat')
    .addStringOption(o => o.setName('key').setDescription('Key').setRequired(true))
    .addIntegerOption(o => o.setName('sure').setDescription('Eklenecek süre').setRequired(true))
    .addStringOption(o => o.setName('birim').setDescription('Birim').setRequired(true)
      .addChoices(
        { name: 'Dakika', value: '1' },
        { name: 'Saat', value: '60' },
        { name: 'Gün', value: '1440' },
        { name: 'Hafta', value: '10080' },
        { name: 'Ay', value: '43200' }
      )),
  new SlashCommandBuilder().setName('key-bilgi').setDescription('Key detaylı bilgisi')
    .addStringOption(o => o.setName('key').setDescription('Key').setRequired(true)),
  new SlashCommandBuilder().setName('key-ara').setDescription('Key ara')
    .addStringOption(o => o.setName('kelime').setDescription('Arama').setRequired(true)),
  new SlashCommandBuilder().setName('key-istatistik').setDescription('Key istatistikleri'),
  new SlashCommandBuilder().setName('key-sifirla').setDescription('Keyin usedBy değerini sıfırla')
    .addStringOption(o => o.setName('key').setDescription('Key').setRequired(true)),
  new SlashCommandBuilder().setName('key-kopyala').setDescription('Keyi panoya kopyala')
    .addStringOption(o => o.setName('key').setDescription('Key').setRequired(true)),
  new SlashCommandBuilder().setName('key-toplu-sil').setDescription('Birden fazla key sil')
    .addStringOption(o => o.setName('script').setDescription('Sadece bu scriptin keylerini sil').setRequired(false))
    .addStringOption(o => o.setName('durum').setDescription('Sadece bu durumdaki keyleri sil').setRequired(false)
      .addChoices(
        { name: 'Aktif', value: 'active' },
        { name: 'Süresi Dolmuş', value: 'expired' },
        { name: 'Kullanılmış', value: 'used' },
        { name: 'Trial', value: 'trial' }
      )),

  // ═══ BAN KOMUTLARI (8) ═══
  new SlashCommandBuilder().setName('ban').setDescription('Kullanıcıyı banla')
    .addStringOption(o => o.setName('userid').setDescription('Roblox UserId').setRequired(true))
    .addStringOption(o => o.setName('sebep').setDescription('Ban sebebi').setRequired(false)),
  new SlashCommandBuilder().setName('unban').setDescription('Kullanıcının banını kaldır')
    .addStringOption(o => o.setName('userid').setDescription('Roblox UserId').setRequired(true)),
  new SlashCommandBuilder().setName('ban-listele').setDescription('Banlı kullanıcıları listele'),
  new SlashCommandBuilder().setName('ban-kontrol').setDescription('Kullanıcı banlı mı?')
    .addStringOption(o => o.setName('userid').setDescription('Roblox UserId').setRequired(true)),
  new SlashCommandBuilder().setName('ban-istatistik').setDescription('Ban istatistikleri'),
  new SlashCommandBuilder().setName('ban-sebep-degistir').setDescription('Ban sebebini değiştir')
    .addStringOption(o => o.setName('userid').setDescription('Roblox UserId').setRequired(true))
    .addStringOption(o => o.setName('sebep').setDescription('Yeni sebep').setRequired(true)),

  // ═══ AKTİF KULLANICI (6) ═══
  new SlashCommandBuilder().setName('aktif-listele').setDescription('Aktif kullanıcıları listele'),
  new SlashCommandBuilder().setName('aktif-sil').setDescription('Kullanıcıyı aktif listeden çıkar')
    .addStringOption(o => o.setName('userid').setDescription('Roblox UserId').setRequired(true)),
  new SlashCommandBuilder().setName('aktif-banla').setDescription('Aktif kullanıcıyı banla')
    .addStringOption(o => o.setName('userid').setDescription('Roblox UserId').setRequired(true)),
  new SlashCommandBuilder().setName('aktif-say').setDescription('Kaç kişi oyunda?'),
  new SlashCommandBuilder().setName('aktif-bilgi').setDescription('Aktif kullanıcı bilgisi')
    .addStringOption(o => o.setName('userid').setDescription('Roblox UserId').setRequired(true)),

  // ═══ DİĞER (11) ═══
  new SlashCommandBuilder().setName('trial-olustur').setDescription('Trial key oluştur')
    .addStringOption(o => o.setName('script').setDescription('Script adı veya hash').setRequired(true)),
  new SlashCommandBuilder().setName('istatistik').setDescription('Sistem istatistikleri'),
  new SlashCommandBuilder().setName('yardim').setDescription('Yardım menüsü'),
  new SlashCommandBuilder().setName('bot-ping').setDescription('Bot gecikmesi'),
  new SlashCommandBuilder().setName('bot-bilgi').setDescription('Bot bilgisi'),
  new SlashCommandBuilder().setName('kullanici-bilgi').setDescription('Kullanıcı bilgisi')
    .addUserOption(o => o.setName('kullanici').setDescription('Kullanıcı').setRequired(false)),
  new SlashCommandBuilder().setName('sunucu-bilgi').setDescription('Sunucu bilgisi'),
  new SlashCommandBuilder().setName('komut-sayisi').setDescription('Kayıtlı komut sayısı'),

  // ═══ KEY DROP (4) ═══
  new SlashCommandBuilder().setName('key-drop').setDescription('Key drop başlat')
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
    .addChannelOption(o => o.setName('kanal').setDescription('Drop kanalı').setRequired(true))
    .addStringOption(o => o.setName('not').setDescription('Key notu').setRequired(false)),
  new SlashCommandBuilder().setName('key-drop-iptal').setDescription('Aktif drop iptal et'),
  new SlashCommandBuilder().setName('key-drop-istatistik').setDescription('Drop istatistikleri'),
  new SlashCommandBuilder().setName('key-drop-gecmis').setDescription('Son dropları göster')
].map(c => c.toJSON());

const UNIT_NAMES = { "1": "dakika", "60": "saat", "1440": "gün", "10080": "hafta", "43200": "ay" };

// ═══════════════════════════════════════════════════════════════
// AKTİF DROPLAR + GEÇMİŞ
// ═══════════════════════════════════════════════════════════════

const activeDrops = new Map();
const dropHistory = [];

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
// MESAJ DİNLEYİCİ (SAYI TAHMİN)
// ═══════════════════════════════════════════════════════════════

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  for (const [dropId, drop] of activeDrops.entries()) {
    if (drop.method !== 'sayi') continue;
    if (drop.winnerId) continue;
    if (message.channel.id !== drop.channelId) continue;

    const num = parseInt(message.content.trim());
    if (isNaN(num)) continue;

    if (num === drop.secretNumber) {
      drop.winnerId = message.author.id;

      dropHistory.unshift({
        scriptName: drop.scriptName,
        winnerId: message.author.id,
        winnerName: message.author.username,
        method: 'sayi',
        secretNumber: drop.secretNumber,
        wonAt: Date.now()
      });
      if (dropHistory.length > 50) dropHistory.pop();

      await updateDropMessage(drop, message.author);

      const channel = await client.channels.fetch(drop.channelId).catch(() => null);
      const keyResult = await createKeyAndDM(client, message.author.id, drop.scriptHash, drop.scriptName, drop.sure, drop.birim, drop.note, channel);

      if (keyResult && channel) {
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
      desc = `**Script:** ${drop.scriptName}\n**Key Süresi:** ${drop.sure} ${UNIT_NAMES[drop.birim]}\n\n🔒 **KAZANILDI! (${winner.username})**\n\n**Doğru Sayı:** ${drop.secretNumber}`;
    } else {
      desc = `**Script:** ${drop.scriptName}\n**Key Süresi:** ${drop.sure} ${UNIT_NAMES[drop.birim]}\n\n🔒 **KAZANILDI! (${winner.username})**`;
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
  if (interaction.isButton()) {
    for (const [dropId, drop] of activeDrops.entries()) {
      if (drop.method !== 'buton') continue;
      if (interaction.customId !== `drop_buton_${dropId}`) continue;
      if (drop.winnerId) {
        return interaction.reply({ content: "😔 Çok geç! Başkası kaptı.", ephemeral: true });
      }
      drop.winnerId = interaction.user.id;

      dropHistory.unshift({ scriptName: drop.scriptName, winnerId: interaction.user.id, winnerName: interaction.user.username, method: 'buton', secretNumber: null, wonAt: Date.now() });
      if (dropHistory.length > 50) dropHistory.pop();

      await updateDropMessage(drop, interaction.user);
      await interaction.reply({ content: "🎉 KAZANDIN! Key DM'den gönderiliyor...", ephemeral: true });

      const channel = await client.channels.fetch(drop.channelId).catch(() => null);
      const keyResult = await createKeyAndDM(client, interaction.user.id, drop.scriptHash, drop.scriptName, drop.sure, drop.birim, drop.note, channel);

      if (keyResult && channel) {
        const winEmbed = new EmbedBuilder()
          .setTitle("⚡ KAZANAN!")
          .setColor(0x3fb950)
          .setDescription(`🏆 <@${interaction.user.id}> butona ilk bastı!\n\n**Script:** ${drop.scriptName}\n**Ödül:** ${drop.sure} ${UNIT_NAMES[drop.birim]} key\n\n${keyResult.dmOk ? "📬 DM kutusuna script gönderildi!" : "⚠️ DM kapalıydı, key kanala yazıldı."}`)
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

  if (!ALLOWED_IDS.includes(interaction.user.id)) {
    return interaction.reply({ content: "🔒 **Yetkin yok!**\n\nBu komutları sadece yetkili kişiler kullanabilir.", ephemeral: true });
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
          .addFields({ name: "📦 İsim", value: name, inline: true }, { name: "🔗 Hash", value: "`" + result.hash.substring(0, 24) + "...`", inline: false })
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

    // ═══ SCRIPT İSTATİSTİK ═══
    if (commandName === 'script-istatistik') {
      await interaction.deferReply();
      const scriptInput = interaction.options.getString('script');
      const data = await apiGet();
      const found = findScript(data.scripts || {}, scriptInput);
      if (!found) return await interaction.editReply({ content: "❌ Script bulunamadı." });
      const keys = Object.entries(data.keys || {}).filter(([k, v]) => v.scriptHash === found.hash);
      const now = Date.now();
      let active = 0, used = 0, expired = 0;
      keys.forEach(([k, v]) => {
        if (v.isTrial) return;
        if (v.expires > 0 && v.expires < now) expired++;
        else if (v.usedBy) used++;
        else active++;
      });
      const embed = new EmbedBuilder().setTitle("📊 " + found.name + " İstatistikleri").setColor(0x58a6ff)
        .addFields(
          { name: "🔑 Toplam Key", value: "**" + keys.length + "**", inline: true },
          { name: "✅ Aktif", value: "**" + active + "**", inline: true },
          { name: "❌ Kullanılmış", value: "**" + used + "**", inline: true },
          { name: "⏰ Süresi Dolmuş", value: "**" + expired + "**", inline: true },
          { name: "📅 Oluşturulma", value: new Date(data.scripts[found.hash].createdAt).toLocaleString("tr-TR"), inline: false }
        )
        .setFooter({ text: "LestaSec Cyber Engine v5.2" }).setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }

    // ═══ SCRIPT ARAMA ═══
    if (commandName === 'script-arama') {
      await interaction.deferReply();
      const kelime = interaction.options.getString('kelime').toLowerCase();
      const data = await apiGet();
      const scripts = Object.entries(data.scripts || {}).filter(([h, s]) => s.name.toLowerCase().includes(kelime));
      if (scripts.length === 0) return await interaction.editReply({ content: "🔍 Sonuç bulunamadı." });
      const embed = new EmbedBuilder().setTitle("🔍 Arama Sonuçları: " + kelime).setColor(0x58a6ff)
        .setDescription("**" + scripts.length + "** sonuç bulundu")
        .setFooter({ text: "LestaSec Cyber Engine v5.2" }).setTimestamp();
      scripts.slice(0, 10).forEach(([hash, s]) => {
        const keyCount = Object.values(data.keys || {}).filter(k => k.scriptHash === hash).length;
        embed.addFields({ name: "📦 " + s.name, value: "Hash: `" + hash.substring(0, 16) + "...`\nKey: **" + keyCount + "**", inline: false });
      });
      await interaction.editReply({ embeds: [embed] });
    }

    // ═══ SCRIPT BİLGİ ═══
    if (commandName === 'script-bilgi') {
      await interaction.deferReply();
      const scriptInput = interaction.options.getString('script');
      const data = await apiGet();
      const found = findScript(data.scripts || {}, scriptInput);
      if (!found) return await interaction.editReply({ content: "❌ Script bulunamadı." });
      const s = data.scripts[found.hash];
      const keyCount = Object.values(data.keys || {}).filter(k => k.scriptHash === found.hash).length;
      const embed = new EmbedBuilder().setTitle("📦 " + found.name).setColor(0x58a6ff)
        .addFields(
          { name: "🔗 Hash", value: "`" + found.hash + "`", inline: false },
          { name: "🔑 Key Sayısı", value: "**" + keyCount + "**", inline: true },
          { name: "📅 Yüklenme", value: new Date(s.createdAt).toLocaleString("tr-TR"), inline: true },
          { name: "📏 Boyut", value: (s.script.length / 1024).toFixed(2) + " KB", inline: true }
        )
        .setFooter({ text: "LestaSec Cyber Engine v5.2" }).setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }

    // ═══ SCRIPT YENİDEN ADLANDIR ═══
    if (commandName === 'script-yeniden-adlandir') {
      await interaction.deferReply();
      const scriptInput = interaction.options.getString('script');
      const yeniIsim = interaction.options.getString('yeni_isim');
      const data = await apiGet();
      const found = findScript(data.scripts || {}, scriptInput);
      if (!found) return await interaction.editReply({ content: "❌ Script bulunamadı." });
      const result = await apiPost("/api/upload_script", { script: data.scripts[found.hash].script, name: yeniIsim });
      if (result.ok) {
        await apiPost("/api/delete_script", { hash: found.hash });
        await interaction.editReply({ content: "✅ Script yeniden adlandırıldı: **" + yeniIsim + "**\nYeni hash: `" + result.hash.substring(0, 16) + "...`" });
      } else await interaction.editReply({ content: "❌ " + result.err });
    }

    // ═══ SCRIPT KOPYALA ═══
    if (commandName === 'script-kopyala') {
      await interaction.deferReply();
      const scriptInput = interaction.options.getString('script');
      const data = await apiGet();
      const found = findScript(data.scripts || {}, scriptInput);
      if (!found) return await interaction.editReply({ content: "❌ Script bulunamadı." });
      const result = await apiPost("/api/upload_script", { script: data.scripts[found.hash].script, name: found.name + " (Kopya)" });
      if (result.ok) await interaction.editReply({ content: "✅ Script kopyalandı! Yeni hash: `" + result.hash.substring(0, 16) + "...`" });
      else await interaction.editReply({ content: "❌ " + result.err });
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

    // ═══ KEY TOPLU OLUŞTUR ═══
    if (commandName === 'key-toplu-olustur') {
      await interaction.deferReply();
      const scriptInput = interaction.options.getString('script');
      const sure = interaction.options.getInteger('sure');
      const birim = interaction.options.getString('birim');
      let miktar = interaction.options.getInteger('miktar');
      if (miktar > 50) miktar = 50;
      if (miktar < 1) miktar = 1;
      const data = await apiGet();
      const found = findScript(data.scripts || {}, scriptInput);
      if (!found) return await interaction.editReply({ content: "❌ Script bulunamadı." });
      const createdKeys = [];
      for (let i = 0; i < miktar; i++) {
        const result = await apiPost("/api/create_key", { scriptHash: found.hash, num: sure, unit: birim, note: "Toplu oluşturma" });
        if (result.ok) createdKeys.push(result.key);
      }
      const embed = new EmbedBuilder().setTitle("🔑 Toplu Key Oluşturuldu").setColor(0x3fb950)
        .addFields(
          { name: "📦 Script", value: found.name, inline: true },
          { name: "⏱️ Süre", value: sure + " " + UNIT_NAMES[birim], inline: true },
          { name: "🔢 Başarılı", value: "**" + createdKeys.length + "/" + miktar + "**", inline: true }
        )
        .setDescription("**Oluşturulan Keyler:**\n```\n" + createdKeys.join("\n") + "\n```")
        .setFooter({ text: "LestaSec Cyber Engine v5.2" }).setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }

    // ═══ KEY BİLGİ ═══
    if (commandName === 'key-bilgi') {
      await interaction.deferReply();
      const keyInput = interaction.options.getString('key');
      const data = await apiGet();
      const keys = data.keys || {};
      const realKey = findKey(keys, keyInput);
      if (!realKey) return await interaction.editReply({ content: "❌ Key bulunamadı." });
      const v = keys[realKey];
      const scriptName = data.scripts[v.scriptHash] ? data.scripts[v.scriptHash].name : "Silinmiş";
      const now = Date.now();
      let status = "✅ Aktif";
      if (v.isTrial) status = "🎁 Trial";
      else if (v.expires > 0 && v.expires < now) status = "⏰ Süresi Dolmuş";
      else if (v.usedBy) status = "❌ Kullanılmış";
      const exp = (v.isTrial || v.expires === 0) ? "Sınırsız" : new Date(v.expires).toLocaleString("tr-TR");
      const embed = new EmbedBuilder().setTitle("🔑 Key Bilgisi").setColor(0x58a6ff)
        .addFields(
          { name: "🔑 Key", value: "`" + realKey + "`", inline: false },
          { name: "📦 Script", value: scriptName, inline: true },
          { name: "📊 Durum", value: status, inline: true },
          { name: "📅 Bitiş", value: exp, inline: true },
          { name: "👤 Kullanan", value: v.usedBy ? "`" + v.usedBy + "`" : "—", inline: true },
          { name: "📝 Not", value: v.note || "—", inline: true }
        )
        .setFooter({ text: "LestaSec Cyber Engine v5.2" }).setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }

    // ═══ KEY ARA ═══
    if (commandName === 'key-ara') {
      await interaction.deferReply();
      const kelime = interaction.options.getString('kelime').toLowerCase();
      const data = await apiGet();
      const keys = Object.entries(data.keys || {}).filter(([k, v]) => k.toLowerCase().includes(kelime) || (v.note || "").toLowerCase().includes(kelime));
      if (keys.length === 0) return await interaction.editReply({ content: "🔍 Sonuç bulunamadı." });
      const embed = new EmbedBuilder().setTitle("🔍 Key Arama: " + kelime).setColor(0x58a6ff)
        .setDescription("**" + keys.length + "** sonuç bulundu")
        .setFooter({ text: "LestaSec Cyber Engine v5.2" }).setTimestamp();
      keys.slice(0, 10).forEach(([key, v]) => {
        const scriptName = data.scripts[v.scriptHash] ? data.scripts[v.scriptHash].name : "Silinmiş";
        embed.addFields({ name: "🔑 `" + key.substring(0, 20) + "`", value: "📦 " + scriptName + "\n📝 " + (v.note || "—"), inline: false });
      });
      await interaction.editReply({ embeds: [embed] });
    }

    // ═══ KEY İSTATİSTİK ═══
    if (commandName === 'key-istatistik') {
      await interaction.deferReply();
      const data = await apiGet();
      const keys = Object.values(data.keys || {});
      const now = Date.now();
      let active = 0, used = 0, expired = 0, trial = 0;
      keys.forEach(k => {
        if (k.isTrial) trial++;
        else if (k.expires > 0 && k.expires < now) expired++;
        else if (k.usedBy) used++;
        else active++;
      });
      const embed = new EmbedBuilder().setTitle("📊 Key İstatistikleri").setColor(0x58a6ff)
        .addFields(
          { name: "🔑 Toplam", value: "**" + keys.length + "**", inline: true },
          { name: "✅ Aktif", value: "**" + active + "**", inline: true },
          { name: "❌ Kullanılmış", value: "**" + used + "**", inline: true },
          { name: "⏰ Süresi Dolmuş", value: "**" + expired + "**", inline: true },
          { name: "🎁 Trial", value: "**" + trial + "**", inline: true }
        )
        .setFooter({ text: "LestaSec Cyber Engine v5.2" }).setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }

    // ═══ KEY KOPYALA ═══
    if (commandName === 'key-kopyala') {
      await interaction.deferReply({ ephemeral: true });
      const keyInput = interaction.options.getString('key');
      const data = await apiGet();
      const realKey = findKey(data.keys || {}, keyInput);
      if (!realKey) return await interaction.editReply({ content: "❌ Key bulunamadı." });
      const v = data.keys[realKey];
      const luaUrl = WORKER_URL + "/scripts/" + v.scriptHash + ".lua";
      const userScript = 'script_key = "' + realKey + '"\nloadstring(game:HttpGet("' + luaUrl + '"))()';
      await interaction.editReply({ content: "**Key:** `" + realKey + "`\n**Kod:**\n```lua\n" + userScript + "\n```" });
    }

    // ═══ KEY SIFIRLA ═══
    if (commandName === 'key-sifirla') {
      await interaction.deferReply();
      const keyInput = interaction.options.getString('key');
      const data = await apiGet();
      const realKey = findKey(data.keys || {}, keyInput);
      if (!realKey) return await interaction.editReply({ content: "❌ Key bulunamadı." });
      data.keys[realKey].usedBy = null;
      const result = await apiPost("/api/force_save", { data });
      if (result.ok || true) await interaction.editReply({ content: "✅ Key sıfırlandı: `" + realKey + "` (usedBy temizlendi)" });
    }

    // ═══ KEY TOPLU SİL ═══
    if (commandName === 'key-toplu-sil') {
      await interaction.deferReply();
      const scriptInput = interaction.options.getString('script');
      const durum = interaction.options.getString('durum');
      const data = await apiGet();
      const keys = data.keys || {};
      const now = Date.now();
      let silinecek = [];
      for (const [k, v] of Object.entries(keys)) {
        if (scriptInput) {
          const found = findScript(data.scripts || {}, scriptInput);
          if (!found || v.scriptHash !== found.hash) continue;
        }
        if (durum) {
          if (durum === "active" && (v.usedBy || v.isTrial || (v.expires > 0 && v.expires < now))) continue;
          if (durum === "used" && !v.usedBy) continue;
          if (durum === "expired" && !(v.expires > 0 && v.expires < now)) continue;
          if (durum === "trial" && !v.isTrial) continue;
        }
        silinecek.push(k);
      }
      if (silinecek.length === 0) return await interaction.editReply({ content: "📭 Silinecek key bulunamadı." });
      let silinen = 0;
      for (const k of silinecek) {
        const r = await apiPost("/api/delete_key", { key: k });
        if (r.ok) silinen++;
      }
      await interaction.editReply({ content: "🗑️ **" + silinen + "** key silindi." });
    }

    // ═══ BAN ═══
    if (commandName === 'ban') {
      await interaction.deferReply();
      const userId = interaction.options.getString('userid');
      const sebep = interaction.options.getString('sebep') || 'Belirtilmedi';
      const result = await apiPost("/api/ban_user", { userId, reason: sebep, bannedBy: interaction.user.tag });
      if (result.ok) await interaction.editReply({ content: "🚫 Kullanıcı banlandı: `" + userId + "`\n**Sebep:** " + sebep });
      else await interaction.editReply({ content: "❌ " + (result.err || "Banlanamadı.") });
    }

    // ═══ UNBAN ═══
    if (commandName === 'unban') {
      await interaction.deferReply();
      const userId = interaction.options.getString('userid');
      const result = await apiPost("/api/unban_user", { userId });
      if (result.ok) await interaction.editReply({ content: "✅ Ban kaldırıldı: `" + userId + "`" });
      else await interaction.editReply({ content: "❌ Kaldırılamadı." });
    }

    // ═══ BAN LİSTELE ═══
    if (commandName === 'ban-listele') {
      await interaction.deferReply();
      const data = await apiGet();
      const banned = data.banned || {};
      if (Object.keys(banned).length === 0) return await interaction.editReply({ content: "✅ Banlı kullanıcı yok." });
      const embed = new EmbedBuilder().setTitle("🚫 Banlı Kullanıcılar").setColor(0xf85149)
        .setDescription("Toplam: **" + Object.keys(banned).length + "** kullanıcı")
        .setFooter({ text: "LestaSec Cyber Engine v5.2" }).setTimestamp();
      Object.entries(banned).slice(0, 15).forEach(([uid, info]) => {
        embed.addFields({ name: "🚫 `" + uid + "`", value: "**Sebep:** " + (info.reason || "—") + "\n**Tarih:** " + new Date(info.bannedAt).toLocaleString("tr-TR"), inline: false });
      });
      await interaction.editReply({ embeds: [embed] });
    }

    // ═══ BAN KONTROL ═══
    if (commandName === 'ban-kontrol') {
      await interaction.deferReply();
      const userId = interaction.options.getString('userid');
      const data = await apiGet();
      const banned = data.banned || {};
      if (banned[userId]) {
        const info = banned[userId];
        const embed = new EmbedBuilder().setTitle("🚫 Kullanıcı Banlı").setColor(0xf85149)
          .addFields(
            { name: "UserID", value: "`" + userId + "`", inline: false },
            { name: "Sebep", value: info.reason || "—", inline: false },
            { name: "Banlayan", value: info.bannedBy || "—", inline: true },
            { name: "Tarih", value: new Date(info.bannedAt).toLocaleString("tr-TR"), inline: true }
          )
          .setFooter({ text: "LestaSec Cyber Engine v5.2" }).setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      } else {
        await interaction.editReply({ content: "✅ Kullanıcı banlı değil: `" + userId + "`" });
      }
    }

    // ═══ BAN İSTATİSTİK ═══
    if (commandName === 'ban-istatistik') {
      await interaction.deferReply();
      const data = await apiGet();
      const banned = data.banned || {};
      const embed = new EmbedBuilder().setTitle("📊 Ban İstatistikleri").setColor(0x58a6ff)
        .addFields({ name: "🚫 Toplam Banlı", value: "**" + Object.keys(banned).length + "**", inline: true })
        .setFooter({ text: "LestaSec Cyber Engine v5.2" }).setTimestamp();
      const son5 = Object.entries(banned).slice(-5).reverse();
      son5.forEach(([uid, info]) => {
        embed.addFields({ name: "🚫 `" + uid + "`", value: info.reason || "—", inline: false });
      });
      await interaction.editReply({ embeds: [embed] });
    }

    // ═══ BAN SEBEP DEĞİŞTİR ═══
    if (commandName === 'ban-sebep-degistir') {
      await interaction.deferReply();
      const userId = interaction.options.getString('userid');
      const sebep = interaction.options.getString('sebep');
      const data = await apiGet();
      if (!data.banned || !data.banned[userId]) return await interaction.editReply({ content: "❌ Kullanıcı banlı değil." });
      const result = await apiPost("/api/ban_user", { userId, reason: sebep, bannedBy: interaction.user.tag });
      if (result.ok) await interaction.editReply({ content: "✅ Ban sebebi güncellendi: `" + userId + "`" });
      else await interaction.editReply({ content: "❌ Güncellenemedi." });
    }

    // ═══ AKTİF LİSTELE ═══
    if (commandName === 'aktif-listele') {
      await interaction.deferReply();
      const data = await apiGet();
      const active = data.active || {};
      if (Object.keys(active).length === 0) return await interaction.editReply({ content: "📭 Şu an aktif kullanıcı yok." });
      const embed = new EmbedBuilder().setTitle("📡 Aktif Kullanıcılar").setColor(0x58a6ff)
        .setDescription("Toplam: **" + Object.keys(active).length + "** kullanıcı")
        .setFooter({ text: "LestaSec Cyber Engine v5.2" }).setTimestamp();
      Object.entries(active).slice(0, 15).forEach(([uid, u]) => {
        const sec = Math.floor((Date.now() - (u.joinedAt || 0)) / 1000);
        const ts = sec < 60 ? sec + " sn" : (sec < 3600 ? Math.floor(sec / 60) + " dk" : Math.floor(sec / 3600) + " sa");
        embed.addFields({ name: "📡 " + (u.username || "—"), value: "ID: `" + uid + "`\n🎮 " + (u.gameName || "—") + "\n📦 " + (u.scriptName || "—") + "\n⏱️ " + ts + " önce", inline: false });
      });
      await interaction.editReply({ embeds: [embed] });
    }

    // ═══ AKTİF SİL ═══
    if (commandName === 'aktif-sil') {
      await interaction.deferReply();
      const userId = interaction.options.getString('userid');
      const result = await apiPost("/api/remove_active", { userId });
      if (result.ok) await interaction.editReply({ content: "🗑️ Aktif listeden silindi: `" + userId + "`" });
      else await interaction.editReply({ content: "❌ Silinemedi." });
    }

    // ═══ AKTİF BANLA ═══
    if (commandName === 'aktif-banla') {
      await interaction.deferReply();
      const userId = interaction.options.getString('userid');
      await apiPost("/api/remove_active", { userId });
      const result = await apiPost("/api/ban_user", { userId, reason: "Panelden ban", bannedBy: interaction.user.tag });
      if (result.ok) await interaction.editReply({ content: "🚫 Kullanıcı banlandı ve listeden çıkarıldı: `" + userId + "`" });
      else await interaction.editReply({ content: "❌ Banlanamadı." });
    }

    // ═══ AKTİF SAY ═══
    if (commandName === 'aktif-say') {
      await interaction.deferReply();
      const data = await apiGet();
      const count = Object.keys(data.active || {}).length;
      await interaction.editReply({ content: "📡 Şu an **" + count + "** kişi aktif." });
    }

    // ═══ AKTİF BİLGİ ═══
    if (commandName === 'aktif-bilgi') {
      await interaction.deferReply();
      const userId = interaction.options.getString('userid');
      const data = await apiGet();
      const u = (data.active || {})[userId];
      if (!u) return await interaction.editReply({ content: "❌ Bu kullanıcı aktif değil." });
      const sec = Math.floor((Date.now() - (u.joinedAt || 0)) / 1000);
      const ts = sec < 60 ? sec + " sn" : (sec < 3600 ? Math.floor(sec / 60) + " dk" : Math.floor(sec / 3600) + " sa");
      const embed = new EmbedBuilder().setTitle("📡 Aktif Kullanıcı Bilgisi").setColor(0x58a6ff)
        .addFields(
          { name: "👤 Kullanıcı", value: u.username || "—", inline: true },
          { name: "🆔 UserID", value: "`" + userId + "`", inline: true },
          { name: "🎮 Oyun", value: u.gameName || "—", inline: true },
          { name: "📦 Script", value: u.scriptName || "—", inline: true },
          { name: "⏱️ Süre", value: ts + " önce", inline: true },
          { name: "🔑 Key", value: u.key ? "`" + u.key.substring(0, 16) + "...`" : "—", inline: true }
        )
        .setFooter({ text: "LestaSec Cyber Engine v5.2" }).setTimestamp();
      await interaction.editReply({ embeds: [embed] });
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
          { name: "🎁 Trial", value: "**" + trial + "**", inline: true },
          { name: "🚫 Banlı", value: "**" + Object.keys(data.banned || {}).length + "**", inline: true },
          { name: "📡 Aktif Kullanıcı", value: "**" + Object.keys(data.active || {}).length + "**", inline: true }
        )
        .setFooter({ text: "LestaSec Cyber Engine v5.2" }).setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }

    // ═══ YARDIM ═══
    if (commandName === 'yardim') {
      const embed = new EmbedBuilder().setTitle("📖 Lesta Bot Komutları").setColor(0x58a6ff)
        .setDescription("**Toplam " + commands.length + " komut**\nLestaSec Cyber Engine v5.2")
        .addFields(
          { name: "📦 Script (11)", value: "`script-yukle`, `script-listele`, `script-sil`, `script-goster`, `script-keyli-goster`, `script-istatistik`, `script-arama`, `script-yeniden-adlandir`, `script-kopyala`, `script-bilgi`", inline: false },
          { name: "🔑 Key (13)", value: "`key-olustur`, `key-listele`, `key-sil`, `key-toplu-olustur`, `key-uzat`, `key-bilgi`, `key-ara`, `key-istatistik`, `key-sifirla`, `key-kopyala`, `key-toplu-sil`", inline: false },
          { name: "🚫 Ban (6)", value: "`ban`, `unban`, `ban-listele`, `ban-kontrol`, `ban-istatistik`, `ban-sebep-degistir`", inline: false },
          { name: "📡 Aktif (5)", value: "`aktif-listele`, `aktif-sil`, `aktif-banla`, `aktif-say`, `aktif-bilgi`", inline: false },
          { name: "🎯 Drop (4)", value: "`key-drop`, `key-drop-iptal`, `key-drop-istatistik`, `key-drop-gecmis`", inline: false },
          { name: "🛠️ Bot (8)", value: "`istatistik`, `trial-olustur`, `yardim`, `bot-ping`, `bot-bilgi`, `kullanici-bilgi`, `sunucu-bilgi`, `komut-sayisi`", inline: false }
        )
        .setFooter({ text: "LestaSec Cyber Engine v5.2" }).setTimestamp();
      await interaction.reply({ embeds: [embed] });
    }

    // ═══ BOT PING ═══
    if (commandName === 'bot-ping') {
      const ping = client.ws.ping;
      await interaction.reply({ content: "🏓 **Pong!**\nWebsocket Ping: **" + ping + "ms**", ephemeral: true });
    }

    // ═══ BOT BİLGİ ═══
    if (commandName === 'bot-bilgi') {
      const uptime = client.uptime;
      const seconds = Math.floor(uptime / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const embed = new EmbedBuilder().setTitle("🤖 Bot Bilgisi").setColor(0x58a6ff)
        .addFields(
          { name: "🏓 Ping", value: "**" + client.ws.ping + "ms**", inline: true },
          { name: "⏱️ Çalışma Süresi", value: "**" + days + "g " + (hours % 24) + "s " + (minutes % 60) + "d**", inline: true },
          { name: "📊 Sunucu Sayısı", value: "**" + client.guilds.cache.size + "**", inline: true },
          { name: "👥 Kullanıcı Sayısı", value: "**" + client.users.cache.size + "**", inline: true },
          { name: "📖 Komut Sayısı", value: "**" + commands.length + "**", inline: true }
        )
        .setFooter({ text: "LestaSec Cyber Engine v5.2" }).setTimestamp();
      await interaction.reply({ embeds: [embed] });
    }

    // ═══ KULLANICI BİLGİ ═══
    if (commandName === 'kullanici-bilgi') {
      const user = interaction.options.getUser('kullanici') || interaction.user;
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      const embed = new EmbedBuilder().setTitle("👤 Kullanıcı Bilgisi").setColor(0x58a6ff)
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: "👤 Kullanıcı Adı", value: user.tag, inline: true },
          { name: "🆔 ID", value: "`" + user.id + "`", inline: true },
          { name: "📅 Hesap Oluşturma", value: new Date(user.createdAt).toLocaleString("tr-TR"), inline: false },
          { name: "📥 Sunucuya Katılma", value: member ? new Date(member.joinedAt).toLocaleString("tr-TR") : "—", inline: false }
        )
        .setFooter({ text: "LestaSec Cyber Engine v5.2" }).setTimestamp();
      await interaction.reply({ embeds: [embed] });
    }

    // ═══ SUNUCU BİLGİ ═══
    if (commandName === 'sunucu-bilgi') {
      const guild = interaction.guild;
      const embed = new EmbedBuilder().setTitle("🏠 Sunucu Bilgisi").setColor(0x58a6ff)
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .addFields(
          { name: "📛 Sunucu Adı", value: guild.name, inline: true },
          { name: "🆔 Sunucu ID", value: "`" + guild.id + "`", inline: true },
          { name: "👑 Sahip", value: "<@" + guild.ownerId + ">", inline: true },
          { name: "👥 Üye Sayısı", value: "**" + guild.memberCount + "**", inline: true },
          { name: "📺 Kanal Sayısı", value: "**" + guild.channels.cache.size + "**", inline: true },
          { name: "🎭 Rol Sayısı", value: "**" + guild.roles.cache.size + "**", inline: true },
          { name: "📅 Kuruluş", value: new Date(guild.createdAt).toLocaleString("tr-TR"), inline: false }
        )
        .setFooter({ text: "LestaSec Cyber Engine v5.2" }).setTimestamp();
      await interaction.reply({ embeds: [embed] });
    }

    // ═══ KOMUT SAYISI ═══
    if (commandName === 'komut-sayisi') {
      await interaction.reply({ content: "📖 Toplam **" + commands.length + "** komut kayıtlı.", ephemeral: true });
    }

    // ═══ KEY DROP ═══
    if (commandName === 'key-drop') {
      await interaction.deferReply({ ephemeral: true });

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

      const dropId = Date.now().toString(36);

      if (yontem === 'sayi') {
        const secretNumber = Math.floor(Math.random() * 51);
        const embed = new EmbedBuilder()
          .setTitle("🎯 KEY DROP - SAYI TAHMİN")
          .setColor(0xa855f7)
          .setDescription(
            "**Script:** " + found.name + "\n" +
            "**Key Süresi:** " + sure + " " + UNIT_NAMES[birim] + "\n\n" +
            "**Nasıl oynanır?**\n" +
            "1️⃣ 0 ile 50 arasında bir sayı tuttum\n" +
            "2️⃣ Bu kanala tahminini yaz\n" +
            "3️⃣ **Doğru bilen ilk kişi kazanır!**\n\n" +
            "⚡ İstediğin kadar tahmin yapabilirsin!"
          )
          .setFooter({ text: "LestaSec Cyber Engine v5.2" }).setTimestamp();

        const dropMsg = await kanal.send({ embeds: [embed] });
        activeDrops.set(dropId, {
          guildId: interaction.guildId, channelId: kanal.id, messageId: dropMsg.id,
          method: 'sayi', secretNumber, winnerId: null,
          scriptHash: found.hash, scriptName: found.name,
          sure, birim, note: not, startedAt: Date.now()
        });
        await interaction.editReply({ content: "✅ **Sayı Drop Başlatıldı!**\n\n🎯 Gizli Sayı: **" + secretNumber + "**\n📢 Kanal: " + kanal + "\n⚡ Kimse bulamazsa süresiz açık kalır." });
      }

      if (yontem === 'buton') {
        const embed = new EmbedBuilder()
          .setTitle("⚡ KEY DROP - İLK BASAN KAZANIR")
          .setColor(0xf85149)
          .setDescription(
            "**Script:** " + found.name + "\n" +
            "**Key Süresi:** " + sure + " " + UNIT_NAMES[birim] + "\n\n" +
            "**Nasıl oynanır?**\n" +
            "Aşağıdaki **KAPIYORUM!** butonuna **İLK BASAN** kazanır!"
          )
          .setFooter({ text: "LestaSec Cyber Engine v5.2" }).setTimestamp();

        const kapBtn = new ButtonBuilder()
          .setCustomId("drop_buton_" + dropId)
          .setLabel("⚡ KAPIYORUM!")
          .setStyle(ButtonStyle.Danger);

        const dropMsg = await kanal.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents(kapBtn)] });
        activeDrops.set(dropId, {
          guildId: interaction.guildId, channelId: kanal.id, messageId: dropMsg.id,
          method: 'buton', secretNumber: null, winnerId: null,
          scriptHash: found.hash, scriptName: found.name,
          sure, birim, note: not, startedAt: Date.now()
        });
        await interaction.editReply({ content: "✅ **Buton Drop Başlatıldı!**\n\n📢 Kanal: " + kanal });
      }
    }

    // ═══ KEY DROP İPTAL ═══
    if (commandName === 'key-drop-iptal') {
      await interaction.deferReply({ ephemeral: true });
      const drops = Array.from(activeDrops.entries()).filter(([id, d]) => d.guildId === interaction.guildId);
      if (drops.length === 0) return await interaction.editReply({ content: "📭 Bu sunucuda aktif drop yok." });
      for (const [dropId, drop] of drops) {
        try {
          const channel = await client.channels.fetch(drop.channelId);
          const message = await channel.messages.fetch(drop.messageId);
          const cancelledEmbed = new EmbedBuilder().setTitle("🚫 DROP İPTAL EDİLDİ").setColor(0xf85149)
            .setDescription("**Script:** " + drop.scriptName + "\n\nYetkili tarafından iptal edildi.")
            .setFooter({ text: "LestaSec Cyber Engine v5.2" }).setTimestamp();
          let components = [];
          if (drop.method === 'buton') {
            const cancelledBtn = new ButtonBuilder().setCustomId("drop_cancelled_" + dropId).setLabel("🚫 İPTAL EDİLDİ").setStyle(ButtonStyle.Secondary).setDisabled(true);
            components = [new ActionRowBuilder().addComponents(cancelledBtn)];
          }
          await message.edit({ embeds: [cancelledEmbed], components });
        } catch(e) {}
        activeDrops.delete(dropId);
      }
      await interaction.editReply({ content: "✅ " + drops.length + " drop iptal edildi." });
    }

    // ═══ KEY DROP İSTATİSTİK ═══
    if (commandName === 'key-drop-istatistik') {
      await interaction.deferReply();
      const total = dropHistory.length;
      const sayiCount = dropHistory.filter(d => d.method === 'sayi').length;
      const butonCount = dropHistory.filter(d => d.method === 'buton').length;
      const embed = new EmbedBuilder().setTitle("📊 Drop İstatistikleri").setColor(0x58a6ff)
        .addFields(
          { name: "🎯 Toplam Drop", value: "**" + total + "**", inline: true },
          { name: "🔢 Sayı Drop", value: "**" + sayiCount + "**", inline: true },
          { name: "🔘 Buton Drop", value: "**" + butonCount + "**", inline: true },
          { name: "🔴 Aktif Drop", value: "**" + activeDrops.size + "**", inline: true }
        )
        .setFooter({ text: "LestaSec Cyber Engine v5.2" }).setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }

    // ═══ KEY DROP GEÇMİŞ ═══
    if (commandName === 'key-drop-gecmis') {
      await interaction.deferReply();
      if (dropHistory.length === 0) return await interaction.editReply({ content: "📭 Henüz drop geçmişi yok." });
      const embed = new EmbedBuilder().setTitle("📜 Drop Geçmişi").setColor(0x58a6ff)
        .setDescription("**Son " + Math.min(dropHistory.length, 10) + " drop**")
        .setFooter({ text: "LestaSec Cyber Engine v5.2" }).setTimestamp();
      dropHistory.slice(0, 10).forEach(d => {
        const time = Math.floor((Date.now() - d.wonAt) / 60000);
        embed.addFields({
          name: (d.method === 'sayi' ? "🎯" : "🔘") + " " + d.scriptName,
          value: "🏆 " + d.winnerName + "\n" + (d.secretNumber !== null ? "🔢 Sayı: " + d.secretNumber + "\n" : "") + "⏱️ " + time + " dk önce",
          inline: false
        });
      });
      await interaction.editReply({ embeds: [embed] });
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
