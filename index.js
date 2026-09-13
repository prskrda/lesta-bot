// ═══════════════════════════════════════════════════════════════
// LESTA BOT - CYBER ENGINE V5.3
// Tek Dosya - TÜM KOMUTLAR ALLOWED_IDS'E ÖZEL
// ═══════════════════════════════════════════════════════════════

const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

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
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration
  ]
});

// ═══════════════════════════════════════════════════════════════
// GEÇİCİ VERİ DEPOLAMA
// ═══════════════════════════════════════════════════════════════

const notes = new Map();
const buttonRoles = new Map();
const activeDrops = new Map();
const dropHistory = [];

// ═══════════════════════════════════════════════════════════════
// SLASH KOMUTLAR
// ═══════════════════════════════════════════════════════════════

const commands = [
  // ═══ SCRIPT (10) ═══
  new SlashCommandBuilder().setName('script-yukle').setDescription('Yeni script yükle')
    .addStringOption(o => o.setName('isim').setDescription('Script adı').setRequired(true))
    .addStringOption(o => o.setName('kod').setDescription('Lua kodu').setRequired(true)),
  new SlashCommandBuilder().setName('script-listele').setDescription('Tüm scriptleri listele'),
  new SlashCommandBuilder().setName('script-sil').setDescription('Script sil')
    .addStringOption(o => o.setName('hash').setDescription('Script hash').setRequired(true)),
  new SlashCommandBuilder().setName('script-goster').setDescription('Script kodunu göster (KEY-EKLE)')
    .addStringOption(o => o.setName('script').setDescription('Script adı veya hash').setRequired(true)),
  new SlashCommandBuilder().setName('script-keyli-goster').setDescription('Script kodunu key ile göster')
    .addStringOption(o => o.setName('script').setDescription('Script adı veya hash').setRequired(true))
    .addStringOption(o => o.setName('key').setDescription('Kullanılacak key').setRequired(true)),
  new SlashCommandBuilder().setName('script-istatistik').setDescription('Script kullanım istatistikleri')
    .addStringOption(o => o.setName('script').setDescription('Script adı veya hash').setRequired(true)),
  new SlashCommandBuilder().setName('script-arama').setDescription('Script ara')
    .addStringOption(o => o.setName('kelime').setDescription('Arama').setRequired(true)),
  new SlashCommandBuilder().setName('script-yeniden-adlandir').setDescription('Script adını değiştir')
    .addStringOption(o => o.setName('script').setDescription('Script').setRequired(true))
    .addStringOption(o => o.setName('yeni_isim').setDescription('Yeni isim').setRequired(true)),
  new SlashCommandBuilder().setName('script-kopyala').setDescription('Script kopyala')
    .addStringOption(o => o.setName('script').setDescription('Script').setRequired(true)),
  new SlashCommandBuilder().setName('script-bilgi').setDescription('Script detaylı bilgisi')
    .addStringOption(o => o.setName('script').setDescription('Script').setRequired(true)),

  // ═══ KEY (11) ═══
  new SlashCommandBuilder().setName('key-olustur').setDescription('Yeni key oluştur')
    .addStringOption(o => o.setName('script').setDescription('Script').setRequired(true))
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
    .addStringOption(o => o.setName('key').setDescription('Key').setRequired(true)),
  new SlashCommandBuilder().setName('key-toplu-olustur').setDescription('Tek seferde çok key oluştur')
    .addStringOption(o => o.setName('script').setDescription('Script').setRequired(true))
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
    .addIntegerOption(o => o.setName('sure').setDescription('Süre').setRequired(true))
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
  new SlashCommandBuilder().setName('key-kopyala').setDescription('Keyi kopyala')
    .addStringOption(o => o.setName('key').setDescription('Key').setRequired(true)),
  new SlashCommandBuilder().setName('key-toplu-sil').setDescription('Filtreli toplu key sil')
    .addStringOption(o => o.setName('script').setDescription('Script filtresi').setRequired(false))
    .addStringOption(o => o.setName('durum').setDescription('Durum filtresi').setRequired(false)
      .addChoices(
        { name: 'Aktif', value: 'active' },
        { name: 'Süresi Dolmuş', value: 'expired' },
        { name: 'Kullanılmış', value: 'used' },
        { name: 'Trial', value: 'trial' }
      )),

  // ═══ BAN (6) ═══
  new SlashCommandBuilder().setName('ban').setDescription('Kullanıcıyı banla')
    .addStringOption(o => o.setName('userid').setDescription('Roblox UserId').setRequired(true))
    .addStringOption(o => o.setName('sebep').setDescription('Sebep').setRequired(false)),
  new SlashCommandBuilder().setName('unban').setDescription('Ban kaldır')
    .addStringOption(o => o.setName('userid').setDescription('Roblox UserId').setRequired(true)),
  new SlashCommandBuilder().setName('ban-listele').setDescription('Banlıları listele'),
  new SlashCommandBuilder().setName('ban-kontrol').setDescription('Kullanıcı banlı mı?')
    .addStringOption(o => o.setName('userid').setDescription('Roblox UserId').setRequired(true)),
  new SlashCommandBuilder().setName('ban-istatistik').setDescription('Ban istatistikleri'),
  new SlashCommandBuilder().setName('ban-sebep-degistir').setDescription('Ban sebebini değiştir')
    .addStringOption(o => o.setName('userid').setDescription('Roblox UserId').setRequired(true))
    .addStringOption(o => o.setName('sebep').setDescription('Yeni sebep').setRequired(true)),

  // ═══ AKTİF (5) ═══
  new SlashCommandBuilder().setName('aktif-listele').setDescription('Aktif kullanıcıları listele'),
  new SlashCommandBuilder().setName('aktif-sil').setDescription('Aktif listeden çıkar')
    .addStringOption(o => o.setName('userid').setDescription('Roblox UserId').setRequired(true)),
  new SlashCommandBuilder().setName('aktif-banla').setDescription('Aktif kullanıcıyı banla')
    .addStringOption(o => o.setName('userid').setDescription('Roblox UserId').setRequired(true)),
  new SlashCommandBuilder().setName('aktif-say').setDescription('Kaç kişi oyunda'),
  new SlashCommandBuilder().setName('aktif-bilgi').setDescription('Aktif kullanıcı bilgisi')
    .addStringOption(o => o.setName('userid').setDescription('Roblox UserId').setRequired(true)),

  // ═══ DROP (4) ═══
  new SlashCommandBuilder().setName('key-drop').setDescription('Key drop başlat')
    .addStringOption(o => o.setName('script').setDescription('Script').setRequired(true))
    .addStringOption(o => o.setName('yontem').setDescription('Yöntem').setRequired(true)
      .addChoices({ name: 'Sayı Tahmin (0-50)', value: 'sayi' }, { name: 'İlk Basan (buton)', value: 'buton' }))
    .addIntegerOption(o => o.setName('sure').setDescription('Key süresi').setRequired(true))
    .addStringOption(o => o.setName('birim').setDescription('Birim').setRequired(true)
      .addChoices(
        { name: 'Dakika', value: '1' },
        { name: 'Saat', value: '60' },
        { name: 'Gün', value: '1440' },
        { name: 'Hafta', value: '10080' },
        { name: 'Ay', value: '43200' }
      ))
    .addChannelOption(o => o.setName('kanal').setDescription('Kanal').setRequired(true))
    .addStringOption(o => o.setName('not').setDescription('Not').setRequired(false)),
  new SlashCommandBuilder().setName('key-drop-iptal').setDescription('Drop iptal et'),
  new SlashCommandBuilder().setName('key-drop-istatistik').setDescription('Drop istatistikleri'),
  new SlashCommandBuilder().setName('key-drop-gecmis').setDescription('Drop geçmişi'),

  // ═══ MODERASYON (12) ═══
  new SlashCommandBuilder().setName('kick').setDescription('Kullanıcıyı sunucudan at')
    .addUserOption(o => o.setName('kullanici').setDescription('Kullanıcı').setRequired(true))
    .addStringOption(o => o.setName('sebep').setDescription('Sebep').setRequired(false)),
  new SlashCommandBuilder().setName('mod-ban').setDescription('Kullanıcıyı sunucudan banla')
    .addUserOption(o => o.setName('kullanici').setDescription('Kullanıcı').setRequired(true))
    .addStringOption(o => o.setName('sebep').setDescription('Sebep').setRequired(false))
    .addIntegerOption(o => o.setName('gun').setDescription('Mesaj geçmişi sil (gün)').setRequired(false)),
  new SlashCommandBuilder().setName('mod-unban').setDescription('Ban kaldır')
    .addStringOption(o => o.setName('userid').setDescription('Discord UserId').setRequired(true)),
  new SlashCommandBuilder().setName('mute').setDescription('Kullanıcıyı sustur (timeout)')
    .addUserOption(o => o.setName('kullanici').setDescription('Kullanıcı').setRequired(true))
    .addIntegerOption(o => o.setName('dakika').setDescription('Kaç dakika').setRequired(true))
    .addStringOption(o => o.setName('sebep').setDescription('Sebep').setRequired(false)),
  new SlashCommandBuilder().setName('unmute').setDescription('Susturmayı kaldır')
    .addUserOption(o => o.setName('kullanici').setDescription('Kullanıcı').setRequired(true)),
  new SlashCommandBuilder().setName('clear').setDescription('Mesajları temizle')
    .addIntegerOption(o => o.setName('miktar').setDescription('Kaç mesaj (1-100)').setRequired(true)),
  new SlashCommandBuilder().setName('slowmode').setDescription('Kanal yavaş modu ayarla')
    .addIntegerOption(o => o.setName('saniye').setDescription('Saniye (0=kapat)').setRequired(true)),
  new SlashCommandBuilder().setName('lock').setDescription('Kanalı kilitle'),
  new SlashCommandBuilder().setName('unlock').setDescription('Kanalın kilidini aç'),
  new SlashCommandBuilder().setName('addrole').setDescription('Kullanıcıya rol ver')
    .addUserOption(o => o.setName('kullanici').setDescription('Kullanıcı').setRequired(true))
    .addRoleOption(o => o.setName('rol').setDescription('Rol').setRequired(true)),
  new SlashCommandBuilder().setName('removerole').setDescription('Kullanıcıdan rol al')
    .addUserOption(o => o.setName('kullanici').setDescription('Kullanıcı').setRequired(true))
    .addRoleOption(o => o.setName('rol').setDescription('Rol').setRequired(true)),
  new SlashCommandBuilder().setName('nickname').setDescription('Kullanıcının takma adını değiştir')
    .addUserOption(o => o.setName('kullanici').setDescription('Kullanıcı').setRequired(true))
    .addStringOption(o => o.setName('yeni_isim').setDescription('Yeni isim').setRequired(true)),

  // ═══ BUTON ROL (3) ═══
  new SlashCommandBuilder().setName('buton-rol-olustur').setDescription('Buton rol menüsü oluştur')
    .addStringOption(o => o.setName('baslik').setDescription('Panel başlığı').setRequired(true))
    .addRoleOption(o => o.setName('rol1').setDescription('1. rol').setRequired(true))
    .addRoleOption(o => o.setName('rol2').setDescription('2. rol').setRequired(false))
    .addRoleOption(o => o.setName('rol3').setDescription('3. rol').setRequired(false))
    .addRoleOption(o => o.setName('rol4').setDescription('4. rol').setRequired(false))
    .addRoleOption(o => o.setName('rol5').setDescription('5. rol').setRequired(false)),
  new SlashCommandBuilder().setName('buton-rol-sil').setDescription('Buton rol mesajını sil')
    .addStringOption(o => o.setName('messageid').setDescription('Mesaj ID').setRequired(true)),
  new SlashCommandBuilder().setName('buton-rol-listele').setDescription('Buton rolleri listele'),

  // ═══ NOT (5) ═══
  new SlashCommandBuilder().setName('not-ekle').setDescription('Kişisel not ekle')
    .addStringOption(o => o.setName('not').setDescription('Not içeriği').setRequired(true)),
  new SlashCommandBuilder().setName('not-listele').setDescription('Notlarını listele'),
  new SlashCommandBuilder().setName('not-sil').setDescription('Not sil')
    .addIntegerOption(o => o.setName('index').setDescription('Not numarası').setRequired(true)),
  new SlashCommandBuilder().setName('not-temizle').setDescription('Tüm notlarını temizle'),
  new SlashCommandBuilder().setName('not-bilgi').setDescription('Not istatistikleri'),

  // ═══ DİĞER (8) ═══
  new SlashCommandBuilder().setName('trial-olustur').setDescription('Trial key oluştur')
    .addStringOption(o => o.setName('script').setDescription('Script').setRequired(true)),
  new SlashCommandBuilder().setName('istatistik').setDescription('Sistem istatistikleri'),
  new SlashCommandBuilder().setName('yardim').setDescription('Yardım menüsü'),
  new SlashCommandBuilder().setName('bot-ping').setDescription('Bot gecikmesi'),
  new SlashCommandBuilder().setName('bot-bilgi').setDescription('Bot bilgisi'),
  new SlashCommandBuilder().setName('kullanici-bilgi').setDescription('Kullanıcı bilgisi')
    .addUserOption(o => o.setName('kullanici').setDescription('Kullanıcı').setRequired(false)),
  new SlashCommandBuilder().setName('sunucu-bilgi').setDescription('Sunucu bilgisi'),
  new SlashCommandBuilder().setName('komut-sayisi').setDescription('Toplam komut sayısı')
].map(c => c.toJSON());

const UNIT_NAMES = { "1": "dakika", "60": "saat", "1440": "gün", "10080": "hafta", "43200": "ay" };

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

async function createKeyAndDM(client, userId, scriptHash, scriptName, sure, birim, note, kanal) {
  const result = await apiPost("/api/create_key", { scriptHash, num: sure, unit: birim, note: note || "Key Drop" });
  if (!result.ok) {
    if (kanal) await kanal.send({ content: `❌ Key oluşturulamadı: ${result.err}` }).catch(() => {});
    return null;
  }
  const luaUrl = WORKER_URL + "/scripts/" + scriptHash + ".lua";
  const dmEmbed = new EmbedBuilder().setTitle("🏆 Key Drop Kazandın!").setColor(0x3fb950)
    .addFields(
      { name: "📦 Script", value: scriptName, inline: true },
      { name: "⏱️ Süre", value: `${sure} ${UNIT_NAMES[birim]}`, inline: true },
      { name: "🔑 Key", value: "`" + result.key + "`", inline: false }
    )
    .setDescription("**📜 Kullanıcı Scripti:**\n```lua\nscript_key = \"" + result.key + "\"\nloadstring(game:HttpGet(\"" + luaUrl + "\"))()\n```")
    .setFooter({ text: "LestaSec Cyber Engine v5.3" }).setTimestamp();
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
      dropHistory.unshift({ scriptName: drop.scriptName, winnerId: message.author.id, winnerName: message.author.username, method: 'sayi', secretNumber: drop.secretNumber, wonAt: Date.now() });
      if (dropHistory.length > 50) dropHistory.pop();
      await updateDropMessage(drop, message.author);
      const channel = await client.channels.fetch(drop.channelId).catch(() => null);
      const keyResult = await createKeyAndDM(client, message.author.id, drop.scriptHash, drop.scriptName, drop.sure, drop.birim, drop.note, channel);
      if (keyResult && channel) {
        const winEmbed = new EmbedBuilder().setTitle("🎉 KAZANAN!").setColor(0x3fb950)
          .setDescription(`🏆 <@${message.author.id}> sayıyı doğru bildi!\n\n**Doğru Sayı:** ${drop.secretNumber}\n**Script:** ${drop.scriptName}\n\n${keyResult.dmOk ? "📬 DM kutusuna script gönderildi!" : "⚠️ DM kapalıydı, key kanala yazıldı."}`)
          .setFooter({ text: "LestaSec Cyber Engine v5.3" }).setTimestamp();
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
    let desc = `**Script:** ${drop.scriptName}\n**Key Süresi:** ${drop.sure} ${UNIT_NAMES[drop.birim]}\n\n🔒 **KAZANILDI! (${winner.username})**`;
    if (drop.method === 'sayi') desc += `\n\n**Doğru Sayı:** ${drop.secretNumber}`;
    const embed = new EmbedBuilder()
      .setTitle(drop.method === 'sayi' ? "🎯 KEY DROP - SAYI TAHMİN" : "⚡ KEY DROP - İLK BASAN KAZANIR")
      .setColor(drop.method === 'sayi' ? 0xa855f7 : 0xf85149)
      .setDescription(desc)
      .setFooter({ text: "LestaSec Cyber Engine v5.3" }).setTimestamp();
    let components = [];
    if (drop.method === 'buton') {
      const lockedBtn = new ButtonBuilder().setCustomId(`drop_locked_${drop.messageId}`).setLabel(`🔒 KAZANILDI! (${winner.username})`).setStyle(ButtonStyle.Secondary).setDisabled(true);
      components = [new ActionRowBuilder().addComponents(lockedBtn)];
    }
    await message.edit({ embeds: [embed], components });
  } catch (e) { console.error("Drop mesajı güncellenemedi:", e); }
}

// ═══════════════════════════════════════════════════════════════
// KOMUT HANDLER
// ═══════════════════════════════════════════════════════════════

client.on('interactionCreate', async interaction => {
  // ═══ BUTON ROL ═══
  if (interaction.isButton() && interaction.customId.startsWith('btnrole_')) {
    const roleId = interaction.customId.replace('btnrole_', '');
    const member = interaction.member;
    try {
      const role = interaction.guild.roles.cache.get(roleId);
      if (!role) return interaction.reply({ content: "❌ Rol bulunamadı.", ephemeral: true });
      if (member.roles.cache.has(roleId)) {
        await member.roles.remove(roleId);
        await interaction.reply({ content: `✅ **${role.name}** rolü kaldırıldı.`, ephemeral: true });
      } else {
        await member.roles.add(roleId);
        await interaction.reply({ content: `✅ **${role.name}** rolü verildi!`, ephemeral: true });
      }
    } catch (e) {
      await interaction.reply({ content: "❌ Rol değiştirilemedi.", ephemeral: true });
    }
    return;
  }

  // ═══ DROP BUTONU ═══
  if (interaction.isButton()) {
    for (const [dropId, drop] of activeDrops.entries()) {
      if (drop.method !== 'buton') continue;
      if (interaction.customId !== `drop_buton_${dropId}`) continue;
      if (drop.winnerId) return interaction.reply({ content: "😔 Çok geç! Başkası kaptı.", ephemeral: true });
      drop.winnerId = interaction.user.id;
      dropHistory.unshift({ scriptName: drop.scriptName, winnerId: interaction.user.id, winnerName: interaction.user.username, method: 'buton', secretNumber: null, wonAt: Date.now() });
      if (dropHistory.length > 50) dropHistory.pop();
      await updateDropMessage(drop, interaction.user);
      await interaction.reply({ content: "🎉 KAZANDIN! Key DM'den gönderiliyor...", ephemeral: true });
      const channel = await client.channels.fetch(drop.channelId).catch(() => null);
      const keyResult = await createKeyAndDM(client, interaction.user.id, drop.scriptHash, drop.scriptName, drop.sure, drop.birim, drop.note, channel);
      if (keyResult && channel) {
        const winEmbed = new EmbedBuilder().setTitle("⚡ KAZANAN!").setColor(0x3fb950)
          .setDescription(`🏆 <@${interaction.user.id}> butona ilk bastı!\n\n**Script:** ${drop.scriptName}\n**Ödül:** ${drop.sure} ${UNIT_NAMES[drop.birim]} key\n\n${keyResult.dmOk ? "📬 DM kutusuna script gönderildi!" : "⚠️ DM kapalıydı, key kanala yazıldı."}`)
          .setFooter({ text: "LestaSec Cyber Engine v5.3" }).setTimestamp();
        await channel.send({ embeds: [winEmbed] }).catch(() => {});
      }
      activeDrops.delete(dropId);
      return;
    }
    return;
  }

  if (!interaction.isChatInputCommand()) return;
  const { commandName } = interaction;

  // ═══ YETKİ KONTROLÜ — TÜM KOMUTLAR ═══
  if (!ALLOWED_IDS.includes(interaction.user.id)) {
    return interaction.reply({ content: "🔒 **Yetkin yok!**\n\nBu komutları sadece yetkili kişiler kullanabilir.", ephemeral: true });
  }

  try {
    // ═══ SCRIPT ═══
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
          .setFooter({ text: "LestaSec Cyber Engine v5.3" }).setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      } else await interaction.editReply({ content: "❌ " + result.err });
    }

    if (commandName === 'script-listele') {
      await interaction.deferReply();
      const data = await apiGet();
      const scripts = data.scripts || {};
      if (Object.keys(scripts).length === 0) return await interaction.editReply({ content: "📭 Henüz script yok." });
      const embed = new EmbedBuilder().setTitle("📦 Yüklü Scriptler").setColor(0x58a6ff)
        .setDescription("Toplam: **" + Object.keys(scripts).length + "**")
        .setFooter({ text: "LestaSec Cyber Engine v5.3" }).setTimestamp();
      Object.entries(scripts).slice(0, 15).forEach(([hash, s]) => {
        const keyCount = Object.values(data.keys || {}).filter(k => k.scriptHash === hash).length;
        embed.addFields({ name: "📦 " + s.name, value: "Hash: `" + hash.substring(0, 16) + "...`\nKey: **" + keyCount + "**", inline: false });
      });
      await interaction.editReply({ embeds: [embed] });
    }

    if (commandName === 'script-sil') {
      await interaction.deferReply();
      const hash = interaction.options.getString('hash');
      const result = await apiPost("/api/delete_script", { hash });
      await interaction.editReply({ content: result.ok ? "🗑️ Silindi." : "❌ Silinemedi." });
    }

    if (commandName === 'script-goster') {
      await interaction.deferReply();
      const scriptInput = interaction.options.getString('script');
      const data = await apiGet();
      const found = findScript(data.scripts || {}, scriptInput);
      if (!found) return await interaction.editReply({ content: "❌ Script bulunamadı." });
      const luaUrl = WORKER_URL + "/scripts/" + found.hash + ".lua";
      const userScript = 'script_key = "KEY-EKLE"\nloadstring(game:HttpGet("' + luaUrl + '"))()';
      const embed = new EmbedBuilder().setTitle("📜 " + found.name).setColor(0x58a6ff)
        .setDescription("**Kod:**\n```lua\n" + userScript + "\n```")
        .setFooter({ text: "LestaSec Cyber Engine v5.3" }).setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }

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
      const embed = new EmbedBuilder().setTitle("📜 " + found.name + " • 🔑").setColor(0x3fb950)
        .setDescription("**Kod:**\n```lua\n" + userScript + "\n```")
        .addFields(
          { name: "🔑 Key", value: "`" + realKey + "`", inline: false },
          { name: "📦 Script", value: found.name, inline: true },
          { name: "📅 Bitiş", value: keys[realKey].isTrial ? "Sınırsız" : new Date(keys[realKey].expires).toLocaleString("tr-TR"), inline: true }
        )
        .setFooter({ text: "LestaSec Cyber Engine v5.3" }).setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }

    if (commandName === 'script-istatistik') {
      await interaction.deferReply();
      const scriptInput = interaction.options.getString('script');
      const data = await apiGet();
      const found = findScript(data.scripts || {}, scriptInput);
      if (!found) return await interaction.editReply({ content: "❌ Script bulunamadı." });
      const keys = Object.values(data.keys || {}).filter(k => k.scriptHash === found.hash);
      const now = Date.now();
      let active = 0, used = 0, expired = 0, trial = 0;
      keys.forEach(k => {
        if (k.isTrial) trial++;
        else if (k.expires > 0 && k.expires < now) expired++;
        else if (k.usedBy) used++;
        else active++;
      });
      const embed = new EmbedBuilder().setTitle("📊 " + found.name).setColor(0x58a6ff)
        .addFields(
          { name: "🔑 Toplam", value: "**" + keys.length + "**", inline: true },
          { name: "✅ Aktif", value: "**" + active + "**", inline: true },
          { name: "❌ Kullanılmış", value: "**" + used + "**", inline: true },
          { name: "⏰ Süresi Dolmuş", value: "**" + expired + "**", inline: true },
          { name: "🎁 Trial", value: "**" + trial + "**", inline: true }
        )
        .setFooter({ text: "LestaSec Cyber Engine v5.3" }).setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }

    if (commandName === 'script-arama') {
      await interaction.deferReply();
      const kelime = interaction.options.getString('kelime').toLowerCase();
      const data = await apiGet();
      const scripts = Object.entries(data.scripts || {}).filter(([h, s]) => s.name.toLowerCase().includes(kelime));
      if (scripts.length === 0) return await interaction.editReply({ content: "🔍 Sonuç yok." });
      const embed = new EmbedBuilder().setTitle("🔍 " + kelime).setColor(0x58a6ff)
        .setDescription("**" + scripts.length + "** sonuç")
        .setFooter({ text: "LestaSec Cyber Engine v5.3" }).setTimestamp();
      scripts.slice(0, 10).forEach(([hash, s]) => {
        const keyCount = Object.values(data.keys || {}).filter(k => k.scriptHash === hash).length;
        embed.addFields({ name: "📦 " + s.name, value: "Hash: `" + hash.substring(0, 16) + "...`\nKey: **" + keyCount + "**", inline: false });
      });
      await interaction.editReply({ embeds: [embed] });
    }

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
          { name: "🔑 Key", value: "**" + keyCount + "**", inline: true },
          { name: "📅 Yüklenme", value: new Date(s.createdAt).toLocaleString("tr-TR"), inline: true },
          { name: "📏 Boyut", value: (s.script.length / 1024).toFixed(2) + " KB", inline: true }
        )
        .setFooter({ text: "LestaSec Cyber Engine v5.3" }).setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }

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
        await interaction.editReply({ content: "✅ **" + yeniIsim + "** olarak kaydedildi." });
      } else await interaction.editReply({ content: "❌ " + result.err });
    }

    if (commandName === 'script-kopyala') {
      await interaction.deferReply();
      const scriptInput = interaction.options.getString('script');
      const data = await apiGet();
      const found = findScript(data.scripts || {}, scriptInput);
      if (!found) return await interaction.editReply({ content: "❌ Script bulunamadı." });
      const result = await apiPost("/api/upload_script", { script: data.scripts[found.hash].script, name: found.name + " (Kopya)" });
      await interaction.editReply({ content: result.ok ? "✅ Kopyalandı!" : "❌ " + result.err });
    }

    // ═══ KEY ═══
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
        const embed = new EmbedBuilder().setTitle("🔑 Key").setColor(0x3fb950)
          .addFields(
            { name: "🔑 Key", value: "`" + result.key + "`", inline: false },
            { name: "📦 Script", value: found.name, inline: true },
            { name: "⏱️ Süre", value: sure + " " + UNIT_NAMES[birim], inline: true },
            { name: "📝 Not", value: not || "—", inline: false }
          )
          .setDescription("**Kod:**\n```lua\nscript_key = \"" + result.key + "\"\nloadstring(game:HttpGet(\"" + luaUrl + "\"))()\n```")
          .setFooter({ text: "LestaSec Cyber Engine v5.3" }).setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      } else await interaction.editReply({ content: "❌ " + result.err });
    }

    if (commandName === 'key-listele') {
      await interaction.deferReply();
      const data = await apiGet();
      const keys = data.keys || {};
      if (Object.keys(keys).length === 0) return await interaction.editReply({ content: "📭 Key yok." });
      const embed = new EmbedBuilder().setTitle("🔑 Key Listesi").setColor(0x58a6ff)
        .setDescription("Toplam: **" + Object.keys(keys).length + "**")
        .setFooter({ text: "LestaSec Cyber Engine v5.3" }).setTimestamp();
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

    if (commandName === 'key-sil') {
      await interaction.deferReply();
      const key = interaction.options.getString('key');
      const result = await apiPost("/api/delete_key", { key });
      await interaction.editReply({ content: result.ok ? "🗑️ Silindi." : "❌ Silinemedi." });
    }

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
        const result = await apiPost("/api/create_key", { scriptHash: found.hash, num: sure, unit: birim, note: "Toplu" });
        if (result.ok) createdKeys.push(result.key);
      }
      const embed = new EmbedBuilder().setTitle("🔑 Toplu Key").setColor(0x3fb950)
        .addFields(
          { name: "📦", value: found.name, inline: true },
          { name: "⏱️", value: sure + " " + UNIT_NAMES[birim], inline: true },
          { name: "🔢", value: createdKeys.length + "/" + miktar, inline: true }
        )
        .setDescription("**Keyler:**\n```\n" + createdKeys.join("\n") + "\n```")
        .setFooter({ text: "LestaSec Cyber Engine v5.3" }).setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }

    if (commandName === 'key-bilgi') {
      await interaction.deferReply();
      const keyInput = interaction.options.getString('key');
      const data = await apiGet();
      const realKey = findKey(data.keys || {}, keyInput);
      if (!realKey) return await interaction.editReply({ content: "❌ Key bulunamadı." });
      const v = data.keys[realKey];
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
          { name: "👤", value: v.usedBy ? "`" + v.usedBy + "`" : "—", inline: true },
          { name: "📝", value: v.note || "—", inline: true }
        )
        .setFooter({ text: "LestaSec Cyber Engine v5.3" }).setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }

    if (commandName === 'key-ara') {
      await interaction.deferReply();
      const kelime = interaction.options.getString('kelime').toLowerCase();
      const data = await apiGet();
      const keys = Object.entries(data.keys || {}).filter(([k, v]) => k.toLowerCase().includes(kelime) || (v.note || "").toLowerCase().includes(kelime));
      if (keys.length === 0) return await interaction.editReply({ content: "🔍 Sonuç yok." });
      const embed = new EmbedBuilder().setTitle("🔍 " + kelime).setColor(0x58a6ff)
        .setDescription("**" + keys.length + "** sonuç")
        .setFooter({ text: "LestaSec Cyber Engine v5.3" }).setTimestamp();
      keys.slice(0, 10).forEach(([key, v]) => {
        const scriptName = data.scripts[v.scriptHash] ? data.scripts[v.scriptHash].name : "Silinmiş";
        embed.addFields({ name: "🔑 `" + key.substring(0, 20) + "`", value: "📦 " + scriptName + "\n📝 " + (v.note || "—"), inline: false });
      });
      await interaction.editReply({ embeds: [embed] });
    }

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
        .setFooter({ text: "LestaSec Cyber Engine v5.3" }).setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }

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

    if (commandName === 'key-toplu-sil') {
      await interaction.deferReply();
      const scriptInput = interaction.options.getString('script');
      const durum = interaction.options.getString('durum');
      const data = await apiGet();
      const keys = data.keys || {};
      const now = Date.now();
      let silinecek = [];
      let foundScript = scriptInput ? findScript(data.scripts || {}, scriptInput) : null;
      for (const [k, v] of Object.entries(keys)) {
        if (foundScript && v.scriptHash !== foundScript.hash) continue;
        if (durum) {
          if (durum === "active" && (v.usedBy || v.isTrial || (v.expires > 0 && v.expires < now))) continue;
          if (durum === "used" && !v.usedBy) continue;
          if (durum === "expired" && !(v.expires > 0 && v.expires < now)) continue;
          if (durum === "trial" && !v.isTrial) continue;
        }
        silinecek.push(k);
      }
      if (silinecek.length === 0) return await interaction.editReply({ content: "📭 Silinecek key yok." });
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
      await interaction.editReply({ content: result.ok ? "🚫 Banlandı: `" + userId + "`" : "❌ " + (result.err || "Hata") });
    }

    if (commandName === 'unban') {
      await interaction.deferReply();
      const userId = interaction.options.getString('userid');
      const result = await apiPost("/api/unban_user", { userId });
      await interaction.editReply({ content: result.ok ? "✅ Kaldırıldı." : "❌ Kaldırılamadı." });
    }

    if (commandName === 'ban-listele') {
      await interaction.deferReply();
      const data = await apiGet();
      const banned = data.banned || {};
      if (Object.keys(banned).length === 0) return await interaction.editReply({ content: "✅ Banlı yok." });
      const embed = new EmbedBuilder().setTitle("🚫 Banlı").setColor(0xf85149)
        .setDescription("Toplam: **" + Object.keys(banned).length + "**")
        .setFooter({ text: "LestaSec Cyber Engine v5.3" }).setTimestamp();
      Object.entries(banned).slice(0, 15).forEach(([uid, info]) => {
        embed.addFields({ name: "🚫 `" + uid + "`", value: "**Sebep:** " + (info.reason || "—") + "\n**Tarih:** " + new Date(info.bannedAt).toLocaleString("tr-TR"), inline: false });
      });
      await interaction.editReply({ embeds: [embed] });
    }

    if (commandName === 'ban-kontrol') {
      await interaction.deferReply();
      const userId = interaction.options.getString('userid');
      const data = await apiGet();
      if ((data.banned || {})[userId]) {
        const info = data.banned[userId];
        const embed = new EmbedBuilder().setTitle("🚫 Banlı").setColor(0xf85149)
          .addFields(
            { name: "UserID", value: "`" + userId + "`", inline: false },
            { name: "Sebep", value: info.reason || "—", inline: false },
            { name: "Banlayan", value: info.bannedBy || "—", inline: true },
            { name: "Tarih", value: new Date(info.bannedAt).toLocaleString("tr-TR"), inline: true }
          )
          .setFooter({ text: "LestaSec Cyber Engine v5.3" }).setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      } else await interaction.editReply({ content: "✅ Banlı değil: `" + userId + "`" });
    }

    if (commandName === 'ban-istatistik') {
      await interaction.deferReply();
      const data = await apiGet();
      const banned = data.banned || {};
      const embed = new EmbedBuilder().setTitle("📊 Ban İstatistikleri").setColor(0x58a6ff)
        .addFields({ name: "🚫 Toplam", value: "**" + Object.keys(banned).length + "**", inline: true })
        .setFooter({ text: "LestaSec Cyber Engine v5.3" }).setTimestamp();
      Object.entries(banned).slice(-5).reverse().forEach(([uid, info]) => {
        embed.addFields({ name: "🚫 `" + uid + "`", value: info.reason || "—", inline: false });
      });
      await interaction.editReply({ embeds: [embed] });
    }

    if (commandName === 'ban-sebep-degistir') {
      await interaction.deferReply();
      const userId = interaction.options.getString('userid');
      const sebep = interaction.options.getString('sebep');
      const result = await apiPost("/api/ban_user", { userId, reason: sebep, bannedBy: interaction.user.tag });
      await interaction.editReply({ content: result.ok ? "✅ Güncellendi." : "❌ Hata" });
    }

    // ═══ AKTİF ═══
    if (commandName === 'aktif-listele') {
      await interaction.deferReply();
      const data = await apiGet();
      const active = data.active || {};
      if (Object.keys(active).length === 0) return await interaction.editReply({ content: "📭 Aktif yok." });
      const embed = new EmbedBuilder().setTitle("📡 Aktif Kullanıcılar").setColor(0x58a6ff)
        .setDescription("Toplam: **" + Object.keys(active).length + "**")
        .setFooter({ text: "LestaSec Cyber Engine v5.3" }).setTimestamp();
      Object.entries(active).slice(0, 15).forEach(([uid, u]) => {
        const sec = Math.floor((Date.now() - (u.joinedAt || 0)) / 1000);
        const ts = sec < 60 ? sec + " sn" : (sec < 3600 ? Math.floor(sec / 60) + " dk" : Math.floor(sec / 3600) + " sa");
        embed.addFields({ name: "📡 " + (u.username || "—"), value: "ID: `" + uid + "`\n🎮 " + (u.gameName || "—") + "\n📦 " + (u.scriptName || "—") + "\n⏱️ " + ts, inline: false });
      });
      await interaction.editReply({ embeds: [embed] });
    }

    if (commandName === 'aktif-sil') {
      await interaction.deferReply();
      const userId = interaction.options.getString('userid');
      const result = await apiPost("/api/remove_active", { userId });
      await interaction.editReply({ content: result.ok ? "🗑️ Silindi." : "❌ Silinemedi." });
    }

    if (commandName === 'aktif-banla') {
      await interaction.deferReply();
      const userId = interaction.options.getString('userid');
      await apiPost("/api/remove_active", { userId });
      const result = await apiPost("/api/ban_user", { userId, reason: "Panelden ban", bannedBy: interaction.user.tag });
      await interaction.editReply({ content: result.ok ? "🚫 Banlandı." : "❌ Banlanamadı." });
    }

    if (commandName === 'aktif-say') {
      await interaction.deferReply();
      const data = await apiGet();
      const count = Object.keys(data.active || {}).length;
      await interaction.editReply({ content: "📡 **" + count + "** kişi aktif." });
    }

    if (commandName === 'aktif-bilgi') {
      await interaction.deferReply();
      const userId = interaction.options.getString('userid');
      const data = await apiGet();
      const u = (data.active || {})[userId];
      if (!u) return await interaction.editReply({ content: "❌ Aktif değil." });
      const sec = Math.floor((Date.now() - (u.joinedAt || 0)) / 1000);
      const ts = sec < 60 ? sec + " sn" : (sec < 3600 ? Math.floor(sec / 60) + " dk" : Math.floor(sec / 3600) + " sa");
      const embed = new EmbedBuilder().setTitle("📡 Aktif Kullanıcı").setColor(0x58a6ff)
        .addFields(
          { name: "👤", value: u.username || "—", inline: true },
          { name: "🆔", value: "`" + userId + "`", inline: true },
          { name: "🎮", value: u.gameName || "—", inline: true },
          { name: "📦", value: u.scriptName || "—", inline: true },
          { name: "⏱️", value: ts + " önce", inline: true }
        )
        .setFooter({ text: "LestaSec Cyber Engine v5.3" }).setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }

    // ═══ TRIAL ═══
    if (commandName === 'trial-olustur') {
      await interaction.deferReply();
      const scriptInput = interaction.options.getString('script');
      const data = await apiGet();
      const found = findScript(data.scripts || {}, scriptInput);
      if (!found) return await interaction.editReply({ content: "❌ Script bulunamadı." });
      const result = await apiPost("/api/create_trial", { scriptHash: found.hash });
      if (result.ok) {
        const luaUrl = WORKER_URL + "/scripts/" + found.hash + ".lua";
        const embed = new EmbedBuilder().setTitle("🎁 Trial").setColor(0xa855f7)
          .addFields(
            { name: "🔑 Key", value: "`trial`", inline: true },
            { name: "📦", value: found.name, inline: true },
            { name: "⏱️", value: "Sınırsız", inline: true }
          )
          .setDescription("**Kod:**\n```lua\nscript_key = \"trial\"\nloadstring(game:HttpGet(\"" + luaUrl + "\"))()\n```")
          .setFooter({ text: "LestaSec Cyber Engine v5.3" }).setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      } else await interaction.editReply({ content: "❌ " + result.err });
    }

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
      const embed = new EmbedBuilder().setTitle("📊 İstatistikler").setColor(0x58a6ff)
        .addFields(
          { name: "📦 Script", value: "**" + scripts.length + "**", inline: true },
          { name: "🔑 Key", value: "**" + keys.length + "**", inline: true },
          { name: "✅ Aktif", value: "**" + active + "**", inline: true },
          { name: "❌ Kullanılmış", value: "**" + used + "**", inline: true },
          { name: "⏰ Dolmuş", value: "**" + expired + "**", inline: true },
          { name: "🎁 Trial", value: "**" + trial + "**", inline: true },
          { name: "🚫 Banlı", value: "**" + Object.keys(data.banned || {}).length + "**", inline: true },
          { name: "📡 Aktif", value: "**" + Object.keys(data.active || {}).length + "**", inline: true }
        )
        .setFooter({ text: "LestaSec Cyber Engine v5.3" }).setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }

    // ═══ YARDIM ═══
    if (commandName === 'yardim') {
      const embed = new EmbedBuilder().setTitle("📖 Lesta Bot Komutları").setColor(0x58a6ff)
        .setDescription("**" + commands.length + " komut** - v5.3")
        .addFields(
          { name: "📦 Script (10)", value: "script-yukle, script-listele, script-sil, script-goster, script-keyli-goster, script-istatistik, script-arama, script-yeniden-adlandir, script-kopyala, script-bilgi", inline: false },
          { name: "🔑 Key (11)", value: "key-olustur, key-listele, key-sil, key-toplu-olustur, key-uzat, key-bilgi, key-ara, key-istatistik, key-kopyala, key-toplu-sil", inline: false },
          { name: "🚫 Ban (6)", value: "ban, unban, ban-listele, ban-kontrol, ban-istatistik, ban-sebep-degistir", inline: false },
          { name: "📡 Aktif (5)", value: "aktif-listele, aktif-sil, aktif-banla, aktif-say, aktif-bilgi", inline: false },
          { name: "🎯 Drop (4)", value: "key-drop, key-drop-iptal, key-drop-istatistik, key-drop-gecmis", inline: false },
          { name: "🛡️ Moderasyon (12)", value: "kick, mod-ban, mod-unban, mute, unmute, clear, slowmode, lock, unlock, addrole, removerole, nickname", inline: false },
          { name: "🎭 Buton Rol (3)", value: "buton-rol-olustur, buton-rol-sil, buton-rol-listele", inline: false },
          { name: "📝 Not (5)", value: "not-ekle, not-listele, not-sil, not-temizle, not-bilgi", inline: false },
          { name: "🤖 Bot (7)", value: "bot-ping, bot-bilgi, kullanici-bilgi, sunucu-bilgi, komut-sayisi, istatistik, trial-olustur", inline: false }
        )
        .setFooter({ text: "LestaSec Cyber Engine v5.3" }).setTimestamp();
      await interaction.reply({ embeds: [embed] });
    }

    // ═══ BOT PING ═══
    if (commandName === 'bot-ping') {
      await interaction.reply({ content: "🏓 **Pong!**\nWebsocket: **" + client.ws.ping + "ms**", ephemeral: true });
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
          { name: "⏱️ Uptime", value: "**" + days + "g " + (hours % 24) + "s " + (minutes % 60) + "d**", inline: true },
          { name: "📊 Sunucu", value: "**" + client.guilds.cache.size + "**", inline: true },
          { name: "👥 Kullanıcı", value: "**" + client.users.cache.size + "**", inline: true },
          { name: "📖 Komut", value: "**" + commands.length + "**", inline: true }
        )
        .setFooter({ text: "LestaSec Cyber Engine v5.3" }).setTimestamp();
      await interaction.reply({ embeds: [embed] });
    }

    // ═══ KULLANICI BİLGİ ═══
    if (commandName === 'kullanici-bilgi') {
      const user = interaction.options.getUser('kullanici') || interaction.user;
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      const embed = new EmbedBuilder().setTitle("👤 Kullanıcı Bilgisi").setColor(0x58a6ff)
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: "👤", value: user.tag, inline: true },
          { name: "🆔", value: "`" + user.id + "`", inline: true },
          { name: "📅 Hesap", value: new Date(user.createdAt).toLocaleString("tr-TR"), inline: false },
          { name: "📥 Katılma", value: member ? new Date(member.joinedAt).toLocaleString("tr-TR") : "—", inline: false }
        )
        .setFooter({ text: "LestaSec Cyber Engine v5.3" }).setTimestamp();
      await interaction.reply({ embeds: [embed] });
    }

    // ═══ SUNUCU BİLGİ ═══
    if (commandName === 'sunucu-bilgi') {
      const guild = interaction.guild;
      const embed = new EmbedBuilder().setTitle("🏠 Sunucu Bilgisi").setColor(0x58a6ff)
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .addFields(
          { name: "📛", value: guild.name, inline: true },
          { name: "🆔", value: "`" + guild.id + "`", inline: true },
          { name: "👑", value: "<@" + guild.ownerId + ">", inline: true },
          { name: "👥", value: "**" + guild.memberCount + "**", inline: true },
          { name: "📺", value: "**" + guild.channels.cache.size + "**", inline: true },
          { name: "🎭", value: "**" + guild.roles.cache.size + "**", inline: true },
          { name: "📅", value: new Date(guild.createdAt).toLocaleString("tr-TR"), inline: false }
        )
        .setFooter({ text: "LestaSec Cyber Engine v5.3" }).setTimestamp();
      await interaction.reply({ embeds: [embed] });
    }

    // ═══ KOMUT SAYISI ═══
    if (commandName === 'komut-sayisi') {
      await interaction.reply({ content: "📖 **" + commands.length + "** komut.", ephemeral: true });
    }

    // ═══ MODERASYON ═══
    if (commandName === 'kick') {
      await interaction.deferReply();
      const user = interaction.options.getUser('kullanici');
      const sebep = interaction.options.getString('sebep') || 'Belirtilmedi';
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      if (!member) return await interaction.editReply({ content: "❌ Bulunamadı." });
      if (!member.kickable) return await interaction.editReply({ content: "❌ Atamam." });
      try { await member.kick(sebep); await interaction.editReply({ content: "👢 **" + user.tag + "** atıldı.\n**Sebep:** " + sebep }); }
      catch (e) { await interaction.editReply({ content: "❌ " + e.message }); }
    }

    if (commandName === 'mod-ban') {
      await interaction.deferReply();
      const user = interaction.options.getUser('kullanici');
      const sebep = interaction.options.getString('sebep') || 'Belirtilmedi';
      const gun = interaction.options.getInteger('gun') || 0;
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      if (!member) return await interaction.editReply({ content: "❌ Bulunamadı." });
      if (!member.bannable) return await interaction.editReply({ content: "❌ Banlayamam." });
      try { await member.ban({ reason: sebep, deleteMessageSeconds: gun * 86400 }); await interaction.editReply({ content: "🔨 **" + user.tag + "** banlandı.\n**Sebep:** " + sebep }); }
      catch (e) { await interaction.editReply({ content: "❌ " + e.message }); }
    }

    if (commandName === 'mod-unban') {
      await interaction.deferReply();
      const userId = interaction.options.getString('userid');
      try { await interaction.guild.members.unban(userId); await interaction.editReply({ content: "✅ Kaldırıldı: `" + userId + "`" }); }
      catch (e) { await interaction.editReply({ content: "❌ " + e.message }); }
    }

    if (commandName === 'mute') {
      await interaction.deferReply();
      const user = interaction.options.getUser('kullanici');
      const dakika = interaction.options.getInteger('dakika');
      const sebep = interaction.options.getString('sebep') || 'Belirtilmedi';
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      if (!member) return await interaction.editReply({ content: "❌ Bulunamadı." });
      try { await member.timeout(dakika * 60 * 1000, sebep); await interaction.editReply({ content: "🔇 **" + user.tag + "** susturuldu. (" + dakika + " dk)\n**Sebep:** " + sebep }); }
      catch (e) { await interaction.editReply({ content: "❌ " + e.message }); }
    }

    if (commandName === 'unmute') {
      await interaction.deferReply();
      const user = interaction.options.getUser('kullanici');
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      if (!member) return await interaction.editReply({ content: "❌ Bulunamadı." });
      try { await member.timeout(null); await interaction.editReply({ content: "🔊 **" + user.tag + "** susturması kaldırıldı." }); }
      catch (e) { await interaction.editReply({ content: "❌ " + e.message }); }
    }

    if (commandName === 'clear') {
      await interaction.deferReply({ ephemeral: true });
      let miktar = interaction.options.getInteger('miktar');
      if (miktar > 100) miktar = 100;
      if (miktar < 1) miktar = 1;
      try { const deleted = await interaction.channel.bulkDelete(miktar, true); await interaction.editReply({ content: "🗑️ **" + deleted.size + "** mesaj silindi." }); }
      catch (e) { await interaction.editReply({ content: "❌ " + e.message }); }
    }

    if (commandName === 'slowmode') {
      await interaction.deferReply();
      const saniye = interaction.options.getInteger('saniye');
      try { await interaction.channel.setRateLimitPerUser(saniye); await interaction.editReply({ content: saniye === 0 ? "🐇 Kapatıldı." : "🐌 **" + saniye + " saniye**" }); }
      catch (e) { await interaction.editReply({ content: "❌ " + e.message }); }
    }

    if (commandName === 'lock') {
      await interaction.deferReply();
      try { await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false }); await interaction.editReply({ content: "🔒 Kilitlendi." }); }
      catch (e) { await interaction.editReply({ content: "❌ " + e.message }); }
    }

    if (commandName === 'unlock') {
      await interaction.deferReply();
      try { await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: null }); await interaction.editReply({ content: "🔓 Açıldı." }); }
      catch (e) { await interaction.editReply({ content: "❌ " + e.message }); }
    }

    if (commandName === 'addrole') {
      await interaction.deferReply();
      const user = interaction.options.getUser('kullanici');
      const role = interaction.options.getRole('rol');
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      if (!member) return await interaction.editReply({ content: "❌ Bulunamadı." });
      try { await member.roles.add(role); await interaction.editReply({ content: "✅ **" + role.name + "** verildi: " + user.tag }); }
      catch (e) { await interaction.editReply({ content: "❌ " + e.message }); }
    }

    if (commandName === 'removerole') {
      await interaction.deferReply();
      const user = interaction.options.getUser('kullanici');
      const role = interaction.options.getRole('rol');
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      if (!member) return await interaction.editReply({ content: "❌ Bulunamadı." });
      try { await member.roles.remove(role); await interaction.editReply({ content: "✅ **" + role.name + "** alındı: " + user.tag }); }
      catch (e) { await interaction.editReply({ content: "❌ " + e.message }); }
    }

    if (commandName === 'nickname') {
      await interaction.deferReply();
      const user = interaction.options.getUser('kullanici');
      const yeniIsim = interaction.options.getString('yeni_isim');
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      if (!member) return await interaction.editReply({ content: "❌ Bulunamadı." });
      try { await member.setNickname(yeniIsim); await interaction.editReply({ content: "✏️ **" + yeniIsim + "** olarak değiştirildi." }); }
      catch (e) { await interaction.editReply({ content: "❌ " + e.message }); }
    }

    // ═══ BUTON ROL ═══
    if (commandName === 'buton-rol-olustur') {
      await interaction.deferReply();
      const baslik = interaction.options.getString('baslik');
      const roller = [];
      for (let i = 1; i <= 5; i++) {
        const r = interaction.options.getRole('rol' + i);
        if (r) roller.push(r);
      }
      if (roller.length === 0) return await interaction.editReply({ content: "❌ En az 1 rol." });
      const embed = new EmbedBuilder().setTitle("🎭 " + baslik).setColor(0x8b5cf6)
        .setDescription("Butonlara basarak rol alabilirsin.\n\n" + roller.map(r => "• " + r.toString()).join("\n"))
        .setFooter({ text: "LestaSec Cyber Engine v5.3" }).setTimestamp();
      const row = new ActionRowBuilder();
      roller.forEach(r => { row.addComponents(new ButtonBuilder().setCustomId("btnrole_" + r.id).setLabel(r.name).setStyle(ButtonStyle.Secondary)); });
      const msg = await interaction.channel.send({ embeds: [embed], components: [row] });
      buttonRoles.set(msg.id, { roles: roller.map(r => ({ roleId: r.id, roleName: r.name })), guildId: interaction.guildId });
      await interaction.editReply({ content: "✅ Oluşturuldu!" });
    }

    if (commandName === 'buton-rol-sil') {
      await interaction.deferReply();
      const messageId = interaction.options.getString('messageid');
      try { const msg = await interaction.channel.messages.fetch(messageId); await msg.delete(); buttonRoles.delete(messageId); await interaction.editReply({ content: "🗑️ Silindi." }); }
      catch (e) { await interaction.editReply({ content: "❌ " + e.message }); }
    }

    if (commandName === 'buton-rol-listele') {
      await interaction.deferReply();
      if (buttonRoles.size === 0) return await interaction.editReply({ content: "📭 Yok." });
      const embed = new EmbedBuilder().setTitle("🎭 Buton Roller").setColor(0x58a6ff)
        .setDescription("Toplam: **" + buttonRoles.size + "**")
        .setFooter({ text: "LestaSec Cyber Engine v5.3" }).setTimestamp();
      let i = 1;
      for (const [msgId, data] of buttonRoles.entries()) { embed.addFields({ name: "#" + i + " (" + msgId + ")", value: data.roles.map(r => "• " + r.roleName).join("\n"), inline: false }); i++; }
      await interaction.editReply({ embeds: [embed] });
    }

    // ═══ NOT ═══
    if (commandName === 'not-ekle') {
      await interaction.deferReply({ ephemeral: true });
      const not = interaction.options.getString('not');
      const userId = interaction.user.id;
      if (!notes.has(userId)) notes.set(userId, []);
      const userNotes = notes.get(userId);
      if (userNotes.length >= 20) return await interaction.editReply({ content: "❌ Maks 20 not." });
      userNotes.push({ text: not, createdAt: Date.now() });
      await interaction.editReply({ content: "✅ Eklendi! (" + userNotes.length + "/20)\n📝 " + not });
    }

    if (commandName === 'not-listele') {
      await interaction.deferReply({ ephemeral: true });
      const userNotes = notes.get(interaction.user.id) || [];
      if (userNotes.length === 0) return await interaction.editReply({ content: "📭 Notun yok." });
      const embed = new EmbedBuilder().setTitle("📝 Notların").setColor(0x58a6ff)
        .setDescription("Toplam: **" + userNotes.length + "**")
        .setFooter({ text: "LestaSec Cyber Engine v5.3" }).setTimestamp();
      userNotes.forEach((n, i) => { embed.addFields({ name: "#" + (i + 1) + " (" + new Date(n.createdAt).toLocaleString("tr-TR") + ")", value: n.text, inline: false }); });
      await interaction.editReply({ embeds: [embed] });
    }

    if (commandName === 'not-sil') {
      await interaction.deferReply({ ephemeral: true });
      const index = interaction.options.getInteger('index') - 1;
      const userNotes = notes.get(interaction.user.id) || [];
      if (index < 0 || index >= userNotes.length) return await interaction.editReply({ content: "❌ Geçersiz." });
      const silinen = userNotes.splice(index, 1)[0];
      await interaction.editReply({ content: "🗑️ Silindi: " + silinen.text });
    }

    if (commandName === 'not-temizle') {
      await interaction.deferReply({ ephemeral: true });
      notes.delete(interaction.user.id);
      await interaction.editReply({ content: "🗑️ Hepsi silindi." });
    }

    if (commandName === 'not-bilgi') {
      await interaction.deferReply({ ephemeral: true });
      const userNotes = notes.get(interaction.user.id) || [];
      await interaction.editReply({ content: "📊 **" + userNotes.length + "/20**" });
    }

    // ═══ KEY DROP ═══
    if (commandName === 'key-drop') {
      await interaction.deferReply({ ephemeral: true });
      const existing = Array.from(activeDrops.values()).find(d => d.guildId === interaction.guildId);
      if (existing) return await interaction.editReply({ content: "⚠️ Aktif drop var." });
      const scriptInput = interaction.options.getString('script');
      const yontem = interaction.options.getString('yontem');
      const sure = interaction.options.getInteger('sure');
      const birim = interaction.options.getString('birim');
      const kanal = interaction.options.getChannel('kanal');
      const not = interaction.options.getString('not') || "Key Drop";
      const data = await apiGet();
      const found = findScript(data.scripts || {}, scriptInput);
      if (!found) return await interaction.editReply({ content: "❌ Bulunamadı." });
      const dropId = Date.now().toString(36);
      if (yontem === 'sayi') {
        const secretNumber = Math.floor(Math.random() * 51);
        const embed = new EmbedBuilder().setTitle("🎯 KEY DROP - SAYI").setColor(0xa855f7)
          .setDescription("**Script:** " + found.name + "\n**Süre:** " + sure + " " + UNIT_NAMES[birim] + "\n\n1️⃣ 0-50 arası sayı tuttum\n2️⃣ Kanala tahmin yaz\n3️⃣ İlk bilen kazanır!\n\n⚡ Sınırsız tahmin!")
          .setFooter({ text: "LestaSec Cyber Engine v5.3" }).setTimestamp();
        const dropMsg = await kanal.send({ embeds: [embed] });
        activeDrops.set(dropId, { guildId: interaction.guildId, channelId: kanal.id, messageId: dropMsg.id, method: 'sayi', secretNumber, winnerId: null, scriptHash: found.hash, scriptName: found.name, sure, birim, note: not, startedAt: Date.now() });
        await interaction.editReply({ content: "✅ **Sayı Drop!**\n\n🎯 Gizli: **" + secretNumber + "**\n📢 " + kanal });
      }
      if (yontem === 'buton') {
        const embed = new EmbedBuilder().setTitle("⚡ KEY DROP - İLK BASAN").setColor(0xf85149)
          .setDescription("**Script:** " + found.name + "\n**Süre:** " + sure + " " + UNIT_NAMES[birim] + "\n\n**İLK BASAN KAZANIR!**")
          .setFooter({ text: "LestaSec Cyber Engine v5.3" }).setTimestamp();
        const kapBtn = new ButtonBuilder().setCustomId("drop_buton_" + dropId).setLabel("⚡ KAPIYORUM!").setStyle(ButtonStyle.Danger);
        const dropMsg = await kanal.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents(kapBtn)] });
        activeDrops.set(dropId, { guildId: interaction.guildId, channelId: kanal.id, messageId: dropMsg.id, method: 'buton', secretNumber: null, winnerId: null, scriptHash: found.hash, scriptName: found.name, sure, birim, note: not, startedAt: Date.now() });
        await interaction.editReply({ content: "✅ **Buton Drop!**\n📢 " + kanal });
      }
    }

    if (commandName === 'key-drop-iptal') {
      await interaction.deferReply({ ephemeral: true });
      const drops = Array.from(activeDrops.entries()).filter(([id, d]) => d.guildId === interaction.guildId);
      if (drops.length === 0) return await interaction.editReply({ content: "📭 Aktif yok." });
      for (const [dropId, drop] of drops) {
        try {
          const channel = await client.channels.fetch(drop.channelId);
          const message = await channel.messages.fetch(drop.messageId);
          const cancelledEmbed = new EmbedBuilder().setTitle("🚫 İPTAL").setColor(0xf85149)
            .setDescription("**" + drop.scriptName + "**\n\nYetkili iptal etti.")
            .setFooter({ text: "LestaSec Cyber Engine v5.3" }).setTimestamp();
          let components = [];
          if (drop.method === 'buton') {
            const cancelledBtn = new ButtonBuilder().setCustomId("drop_cancelled_" + dropId).setLabel("🚫 İPTAL").setStyle(ButtonStyle.Secondary).setDisabled(true);
            components = [new ActionRowBuilder().addComponents(cancelledBtn)];
          }
          await message.edit({ embeds: [cancelledEmbed], components });
        } catch (e) {}
        activeDrops.delete(dropId);
      }
      await interaction.editReply({ content: "✅ " + drops.length + " iptal edildi." });
    }

    if (commandName === 'key-drop-istatistik') {
      await interaction.deferReply();
      const embed = new EmbedBuilder().setTitle("📊 Drop İstatistik").setColor(0x58a6ff)
        .addFields(
          { name: "🎯 Toplam", value: "**" + dropHistory.length + "**", inline: true },
          { name: "🔢 Sayı", value: "**" + dropHistory.filter(d => d.method === 'sayi').length + "**", inline: true },
          { name: "🔘 Buton", value: "**" + dropHistory.filter(d => d.method === 'buton').length + "**", inline: true },
          { name: "🔴 Aktif", value: "**" + activeDrops.size + "**", inline: true }
        )
        .setFooter({ text: "LestaSec Cyber Engine v5.3" }).setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }

    if (commandName === 'key-drop-gecmis') {
      await interaction.deferReply();
      if (dropHistory.length === 0) return await interaction.editReply({ content: "📭 Geçmiş yok." });
      const embed = new EmbedBuilder().setTitle("📜 Geçmiş").setColor(0x58a6ff)
        .setDescription("Son **" + Math.min(dropHistory.length, 10) + "**")
        .setFooter({ text: "LestaSec Cyber Engine v5.3" }).setTimestamp();
      dropHistory.slice(0, 10).forEach(d => {
        const time = Math.floor((Date.now() - d.wonAt) / 60000);
        embed.addFields({ name: (d.method === 'sayi' ? "🎯" : "🔘") + " " + d.scriptName, value: "🏆 " + d.winnerName + (d.secretNumber !== null ? "\n🔢 " + d.secretNumber : "") + "\n⏱️ " + time + " dk önce", inline: false });
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
