const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

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
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const commands = [
  new SlashCommandBuilder().setName('script-yukle').setDescription('Yeni script yükle')
    .addStringOption(o => o.setName('isim').setDescription('Script adı').setRequired(true))
    .addStringOption(o => o.setName('kod').setDescription('Lua kodu').setRequired(true)),
  new SlashCommandBuilder().setName('script-listele').setDescription('Tüm scriptleri listele'),
  new SlashCommandBuilder().setName('script-sil').setDescription('Script sil')
    .addStringOption(o => o.setName('hash').setDescription('Script hash').setRequired(true)),
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
  new SlashCommandBuilder().setName('ban-userid').setDescription('Roblox UserId banla')
    .addStringOption(o => o.setName('userid').setDescription('Roblox UserId').setRequired(true))
    .addStringOption(o => o.setName('neden').setDescription('Ban nedeni').setRequired(false)),
  new SlashCommandBuilder().setName('unban-userid').setDescription('Banı kaldır')
    .addStringOption(o => o.setName('userid').setDescription('Roblox UserId').setRequired(true)),
  new SlashCommandBuilder().setName('ban-listele').setDescription('Banlı kullanıcıları listele'),
  new SlashCommandBuilder().setName('istatistik').setDescription('Sistem istatistikleri'),
  new SlashCommandBuilder().setName('yardim').setDescription('Yardım menüsü')
].map(c => c.toJSON());

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

client.once('ready', async () => {
  console.log(`✅ ${client.user.tag} hazır!`);
  const rest = new REST({ version: '10' }).setToken(TOKEN);
  try {
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log(`✅ ${commands.length} slash komut kaydedildi!`);
  } catch (e) { console.error("❌ Komut kayıt hatası:", e); }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const { commandName } = interaction;

  if (!ALLOWED_IDS.includes(interaction.user.id)) {
    return interaction.reply({
      content: "🔒 **Yetkin yok!**\n\nBu komutları sadece yetkili kişiler kullanabilir.",
      ephemeral: true
    });
  }

  try {
    if (commandName === 'script-yukle') {
      await interaction.deferReply();
      const name = interaction.options.getString('isim');
      const script = interaction.options.getString('kod');
      const result = await apiPost("/api/upload_script", { script, name });
      if (result.ok) {
        const luaUrl = WORKER_URL + "/scripts/" + result.hash + ".lua";
        const embed = new EmbedBuilder().setTitle("✅ Script Yüklendi").setColor(0x3fb950)
          .addFields(
            { name: "📦 İsim", value: name, inline: true },
            { name: "🔗 Hash", value: "`" + result.hash.substring(0, 24) + "...`", inline: false }
          )
          .setDescription("**📋 Kullanıcı Scripti:**\n```lua\nscript_key = \"KEY_BURAYA\"\nloadstring(game:HttpGet(\"" + luaUrl + "\"))()\n```")
          .setFooter({ text: "LestaSec Cyber Engine v5.2" }).setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      } else await interaction.editReply({ content: "❌ " + result.err });
    }

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

    if (commandName === 'script-sil') {
      await interaction.deferReply();
      const hash = interaction.options.getString('hash');
      const result = await apiPost("/api/delete_script", { hash });
      if (result.ok) await interaction.editReply({ content: "🗑️ Script silindi." });
      else await interaction.editReply({ content: "❌ Silinemedi." });
    }

    if (commandName === 'key-olustur') {
      await interaction.deferReply();
      const scriptInput = interaction.options.getString('script');
      const sure = interaction.options.getInteger('sure');
      const birim = interaction.options.getString('birim');
      const not = interaction.options.getString('not') || '';
      const data = await apiGet();
      const scripts = data.scripts || {};
      let scriptHash = null, scriptName = null;
      for (const [h, s] of Object.entries(scripts)) {
        if (s.name.toLowerCase() === scriptInput.toLowerCase() || h.startsWith(scriptInput)) {
          scriptHash = h; scriptName = s.name; break;
        }
      }
      if (!scriptHash) return await interaction.editReply({ content: "❌ Script bulunamadı." });
      const result = await apiPost("/api/create_key", { scriptHash, num: sure, unit: birim, note: not });
      if (result.ok) {
        const luaUrl = WORKER_URL + "/scripts/" + scriptHash + ".lua";
        const unitNames = { "1": "dakika", "60": "saat", "1440": "gün", "10080": "hafta", "43200": "ay" };
        const embed = new EmbedBuilder().setTitle("🔑 Key Oluşturuldu").setColor(0x3fb950)
          .addFields(
            { name: "🔑 Key", value: "`" + result.key + "`", inline: false },
            { name: "📦 Script", value: scriptName, inline: true },
            { name: "⏱️ Süre", value: sure + " " + unitNames[birim], inline: true },
            { name: "📝 Not", value: not || "—", inline: false }
          )
          .setDescription("**📜 Kullanıcı Scripti:**\n```lua\nscript_key = \"" + result.key + "\"\nloadstring(game:HttpGet(\"" + luaUrl + "\"))()\n```")
          .setFooter({ text: "LestaSec Cyber Engine v5.2" }).setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      } else await interaction.editReply({ content: "❌ " + result.err });
    }

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

    if (commandName === 'key-sil') {
      await interaction.deferReply();
      const key = interaction.options.getString('key');
      const result = await apiPost("/api/delete_key", { key });
      if (result.ok) await interaction.editReply({ content: "🗑️ Key silindi: `" + key + "`" });
      else await interaction.editReply({ content: "❌ Silinemedi." });
    }

    if (commandName === 'trial-olustur') {
      await interaction.deferReply();
      const scriptInput = interaction.options.getString('script');
      const data = await apiGet();
      const scripts = data.scripts || {};
      let scriptHash = null, scriptName = null;
      for (const [h, s] of Object.entries(scripts)) {
        if (s.name.toLowerCase() === scriptInput.toLowerCase() || h.startsWith(scriptInput)) {
          scriptHash = h; scriptName = s.name; break;
        }
      }
      if (!scriptHash) return await interaction.editReply({ content: "❌ Script bulunamadı." });
      const result = await apiPost("/api/create_trial", { scriptHash });
      if (result.ok) {
        const luaUrl = WORKER_URL + "/scripts/" + scriptHash + ".lua";
        const embed = new EmbedBuilder().setTitle("🎁 Trial Key Oluşturuldu").setColor(0xa855f7)
          .addFields(
            { name: "🔑 Key", value: "`trial`", inline: true },
            { name: "📦 Script", value: scriptName, inline: true },
            { name: "⏱️ Süre", value: "Sınırsız", inline: true }
          )
          .setDescription("**📜 Kullanıcı Scripti:**\n```lua\nscript_key = \"trial\"\nloadstring(game:HttpGet(\"" + luaUrl + "\"))()\n```")
          .setFooter({ text: "LestaSec Cyber Engine v5.2" }).setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      } else await interaction.editReply({ content: "❌ " + result.err });
    }

    if (commandName === 'ban-userid') {
      await interaction.deferReply();
      const userId = interaction.options.getString('userid');
      const reason = interaction.options.getString('neden') || "Belirtilmedi";
      const result = await apiPost("/api/ban_user", { userId, reason, bannedBy: interaction.user.tag });
      if (result.ok) {
        const embed = new EmbedBuilder().setTitle("🚫 Kullanıcı Banlandı").setColor(0xf85149)
          .addFields(
            { name: "🆔 UserID", value: "`" + userId + "`", inline: true },
            { name: "📝 Neden", value: reason, inline: true },
            { name: "👤 Banlayan", value: interaction.user.tag, inline: true }
          )
          .setDescription("Bu Roblox hesabı artık **hiçbir scripti** çalıştıramaz.")
          .setFooter({ text: "LestaSec Cyber Engine v5.2" }).setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      } else await interaction.editReply({ content: "❌ " + result.err });
    }

    if (commandName === 'unban-userid') {
      await interaction.deferReply();
      const userId = interaction.options.getString('userid');
      const result = await apiPost("/api/unban_user", { userId });
      if (result.ok) {
        const embed = new EmbedBuilder().setTitle("✅ Ban Kaldırıldı").setColor(0x3fb950)
          .addFields({ name: "🆔 UserID", value: "`" + userId + "`", inline: true })
          .setDescription("Bu Roblox hesabı artık **tekrar script kullanabilir**.")
          .setFooter({ text: "LestaSec Cyber Engine v5.2" }).setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      } else await interaction.editReply({ content: "❌ " + result.err });
    }

    if (commandName === 'ban-listele') {
      await interaction.deferReply();
      const data = await apiGet();
      const banned = data.banned || {};
      if (Object.keys(banned).length === 0) return await interaction.editReply({ content: "📭 Banlı kullanıcı yok." });
      const embed = new EmbedBuilder().setTitle("🚫 Banlı Kullanıcılar").setColor(0xf85149)
        .setDescription("Toplam: **" + Object.keys(banned).length + "** banlı hesap")
        .setFooter({ text: "LestaSec Cyber Engine v5.2" }).setTimestamp();
      Object.entries(banned).slice(0, 15).forEach(([userId, info]) => {
        embed.addFields({
          name: "🆔 " + userId,
          value: "📝 " + (info.reason || "Belirtilmedi") + "\n👤 " + (info.bannedBy || "—") + "\n📅 " + new Date(info.bannedAt).toLocaleString("tr-TR"),
          inline: false
        });
      });
      await interaction.editReply({ embeds: [embed] });
    }

    if (commandName === 'istatistik') {
      await interaction.deferReply();
      const data = await apiGet();
      const keys = Object.values(data.keys || {});
      const scripts = Object.values(data.scripts || {});
      const banned = Object.values(data.banned || {});
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
          { name: "🚫 Banlı", value: "**" + banned.length + "**", inline: true },
          { name: "✅ Aktif", value: "**" + active + "**", inline: true },
          { name: "❌ Kullanılmış", value: "**" + used + "**", inline: true },
          { name: "⏰ Süresi Dolmuş", value: "**" + expired + "**", inline: true },
          { name: "🎁 Trial", value: "**" + trial + "**", inline: true }
        )
        .setFooter({ text: "LestaSec Cyber Engine v5.2" }).setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }

    if (commandName === 'yardim') {
      const embed = new EmbedBuilder().setTitle("📖 Lesta Bot Komutları").setColor(0x58a6ff)
        .setDescription("LestaSec Cyber Engine v5.2 - Slash Komutları")
        .addFields(
          { name: "📦 Script Komutları", value: "`/script-yukle` - Yeni script yükle\n`/script-listele` - Scriptleri listele\n`/script-sil` - Script sil", inline: false },
          { name: "🔑 Key Komutları", value: "`/key-olustur` - Yeni key oluştur\n`/key-listele` - Keyleri listele\n`/key-sil` - Key sil", inline: false },
          { name: "🎁 Trial", value: "`/trial-olustur` - Trial key oluştur", inline: false },
          { name: "🚫 Ban Komutları", value: "`/ban-userid` - Roblox hesabı banla\n`/unban-userid` - Banı kaldır\n`/ban-listele` - Banlıları listele", inline: false },
          { name: "📊 Diğer", value: "`/istatistik` - İstatistikler\n`/yardim` - Bu menü", inline: false }
        )
        .setFooter({ text: "LestaSec Cyber Engine v5.2" }).setTimestamp();
      await interaction.reply({ embeds: [embed] });
    }

  } catch (err) {
    console.error("Komut hatası:", err);
    try {
      if (interaction.deferred) await interaction.editReply({ content: "❌ Hata: " + err.message });
      else await interaction.reply({ content: "❌ Hata: " + err.message, ephemeral: true });
    } catch(e) {}
  }
});

client.login(TOKEN);

const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Lesta Bot Aktif!');
}).listen(process.env.PORT || 3000, () => {
  console.log("✅ Web sunucusu: Port " + (process.env.PORT || 3000));
});
