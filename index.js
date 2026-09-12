const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const WORKER_URL = process.env.WORKER_URL || "https://lesta-hub.prskrda.workers.dev";
const PASSWORD = "lesta4ever437713";

// ═══ YETKİLİ KİŞİLER ═══
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
  new SlashCommandBuilder().setName('istatistik').setDescription('Sistem istatistikleri'),
  new SlashCommandBuilder().setName('yardim').setDescription('Yardım menüsü'),

  // ═══ KEY DROP ═══
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
    .addIntegerOption(o => o.setName('drop_suresi').setDescription('Drop kaç saniye açık kalsın (varsayılan 60)').setRequired(false))
    .addStringOption(o => o.setName('not').setDescription('Key notu').setRequired(false))
].map(c => c.toJSON());

const UNIT_NAMES = { "1": "dakika", "60": "saat", "1440": "gün", "10080": "hafta", "43200": "ay" };

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

async function createKeyAndDM(client, userId, scriptHash, scriptName, sure, birim, not, kanal) {
  const result = await apiPost("/api/create_key", {
    scriptHash,
    num: sure,
    unit: birim,
    note: not || "Key Drop"
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

  // ═══ YETKİ KONTROLÜ - TÜM KOMUTLAR ═══
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
          { name: "📦 Script Komutları", value: "`/script-yukle` - Yeni script yükle\n`/script-listele` - Scriptleri listele\n`/script-sil` - Script sil", inline: false },
          { name: "🔑 Key Komutları", value: "`/key-olustur` - Yeni key oluştur\n`/key-listele` - Keyleri listele\n`/key-sil` - Key sil", inline: false },
          { name: "🎁 Trial", value: "`/trial-olustur` - Trial key oluştur", inline: false },
          { name: "🎯 Drop", value: "`/key-drop` - Key drop başlat (sayı/buton)", inline: false },
          { name: "📊 Diğer", value: "`/istatistik` - İstatistikler\n`/yardim` - Bu menü", inline: false }
        )
        .setFooter({ text: "LestaSec Cyber Engine v5.2" }).setTimestamp();
      await interaction.reply({ embeds: [embed] });
    }

    // ═══ KEY DROP ═══
    if (commandName === 'key-drop') {
      await interaction.deferReply({ ephemeral: true });

      const scriptInput = interaction.options.getString('script');
      const yontem = interaction.options.getString('yontem');
      const sure = interaction.options.getInteger('sure');
      const birim = interaction.options.getString('birim');
      const kanal = interaction.options.getChannel('kanal');
      const dropSuresi = interaction.options.getInteger('drop_suresi') || 60;
      const not = interaction.options.getString('not') || "Key Drop";

      const data = await apiGet();
      const found = findScript(data.scripts || {}, scriptInput);
      if (!found) return await interaction.editReply({ content: "❌ Script bulunamadı." });

      // Kanal kontrolü
      if (!kanal.isTextBased || !kanal.isTextBased()) {
        return await interaction.editReply({ content: "❌ Geçersiz kanal." });
      }

      const dropId = Date.now().toString(36);

      // ═══ SAYI YÖNTEMİ ═══
      if (yontem === 'sayi') {
        const gizliSayi = Math.floor(Math.random() * 51); // 0-50
        const katilimcilar = new Map();

        const embed = new EmbedBuilder()
          .setTitle("🎯 KEY DROP - SAYI TAHMİN")
          .setColor(0xa855f7)
          .setDescription(
            `**Script:** ${found.name}\n` +
            `**Key Süresi:** ${sure} ${UNIT_NAMES[birim]}\n` +
            `**Drop Süresi:** ${dropSuresi} saniye\n\n` +
            `**Nasıl oynanır?**\n` +
            `1️⃣ Aşağıdaki **KATIL** butonuna bas\n` +
            `2️⃣ Bot sana DM'den 0-50 arası tahmin soracak\n` +
            `3️⃣ Süre bitince **doğru tahmin eden** kazanır!\n\n` +
            `⏳ **Kalan süre: ${dropSuresi} saniye**`
          )
          .setFooter({ text: "LestaSec Cyber Engine v5.2" })
          .setTimestamp();

        const katilBtn = new ButtonBuilder()
          .setCustomId(`drop_sayi_katil_${dropId}`)
          .setLabel("🎯 KATIL")
          .setStyle(ButtonStyle.Primary);

        const dropMsg = await kanal.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents(katilBtn)] });
        await interaction.editReply({ content: `✅ Sayı drop başlatıldı!\n🎯 Gizli sayı: **${gizliSayi}** (kimseye gösterme)\n📢 Kanal: ${kanal}\n⏳ Süre: ${dropSuresi} sn` });

        // Buton handler
        const katilHandler = async (btnInt) => {
          if (!btnInt.isButton()) return;
          if (btnInt.customId !== `drop_sayi_katil_${dropId}`) return;
          if (katilimcilar.has(btnInt.user.id)) {
            return btnInt.reply({ content: "⚠️ Zaten katıldın! DM'den tahminini yaz.", ephemeral: true });
          }
          katilimcilar.set(btnInt.user.id, null);
          try {
            const dm = await btnInt.user.createDM();
            await dm.send(`🎯 **Key Drop - Sayı Tahmin**\n\n0 ile 50 arasında bir sayı yaz ve gönder.\n⏳ Süre: ${dropSuresi} saniye\n📦 Script: **${found.name}**`);
            await btnInt.reply({ content: "✅ Katıldın! Şimdi DM'den 0-50 arası tahminini yaz.", ephemeral: true });
          } catch (e) {
            katilimcilar.delete(btnInt.user.id);
            await btnInt.reply({ content: "❌ DM'in kapalı olduğu için tahminini alamıyorum!", ephemeral: true });
          }
        };

        // DM handler
        const dmHandler = async (message) => {
          if (message.author.bot) return;
          if (!message.guild) {
            if (!katilimcilar.has(message.author.id)) return;
            const sayi = parseInt(message.content.trim());
            if (isNaN(sayi) || sayi < 0 || sayi > 50) {
              return message.reply("❌ Lütfen 0-50 arası geçerli bir sayı yaz.").catch(() => {});
            }
            katilimcilar.set(message.author.id, sayi);
            await message.reply(`✅ Tahminin alındı: **${sayi}**`).catch(() => {});
          }
        };

        client.on('interactionCreate', katilHandler);
        client.on('messageCreate', dmHandler);

        setTimeout(async () => {
          client.off('interactionCreate', katilHandler);
          client.off('messageCreate', dmHandler);

          const disabledBtn = new ButtonBuilder()
            .setCustomId(`drop_sayi_katil_${dropId}`)
            .setLabel("⏰ BİTTİ")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true);
          await dropMsg.edit({ components: [new ActionRowBuilder().addComponents(disabledBtn)] }).catch(() => {});

          const kazananlar = [];
          for (const [userId, tahmin] of katilimcilar.entries()) {
            if (tahmin === gizliSayi) kazananlar.push(userId);
          }

          if (kazananlar.length === 0) {
            return kanal.send({
              embeds: [new EmbedBuilder()
                .setTitle("😔 Kimse Bilemedi!")
                .setColor(0xf85149)
                .setDescription(`Gizli sayı: **${gizliSayi}**\nKatılımcı: **${katilimcilar.size}** kişi\n\nKimse doğru tahmin edemedi.`)]
            });
          }

          const kazananId = kazananlar[0];

          const keyResult = await createKeyAndDM(client, kazananId, found.hash, found.name, sure, birim, not, kanal);

          if (keyResult) {
            const kazananEmbed = new EmbedBuilder()
              .setTitle("🎉 KAZANAN!")
              .setColor(0x3fb950)
              .setDescription(
                `🏆 <@${kazananId}> doğru tahmin etti!\n\n` +
                `**Gizli Sayı:** ${gizliSayi}\n` +
                `**Script:** ${found.name}\n` +
                `**Katılımcı:** ${katilimcilar.size} kişi\n\n` +
                `${keyResult.dmOk ? "📬 Key DM'den gönderildi!" : "⚠️ DM kapalıydı, key kanala yazıldı."}`
              )
              .setFooter({ text: "LestaSec Cyber Engine v5.2" })
              .setTimestamp();
            await kanal.send({ embeds: [kazananEmbed] });
          }
        }, dropSuresi * 1000);
      }

      // ═══ BUTON YÖNTEMİ ═══
      if (yontem === 'buton') {
        let kilitli = false;
        let kazananId = null;

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
          .setCustomId(`drop_buton_kap_${dropId}`)
          .setLabel("⚡ KAPIYORUM!")
          .setStyle(ButtonStyle.Danger);

        const dropMsg = await kanal.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents(kapBtn)] });
        await interaction.editReply({ content: `✅ Buton drop başlatıldı!\n📢 Kanal: ${kanal}` });

        const btnHandler = async (btnInt) => {
          if (!btnInt.isButton()) return;
          if (btnInt.customId !== `drop_buton_kap_${dropId}`) return;

          if (kilitli) {
            return btnInt.reply({ content: "😔 Çok geç! Başkası kaptı.", ephemeral: true });
          }

          kilitli = true;
          kazananId = btnInt.user.id;

          const disabledBtn = new ButtonBuilder()
            .setCustomId(`drop_buton_kap_${dropId}`)
            .setLabel("🔒 KİLİTLENDİ")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true);
          await dropMsg.edit({ components: [new ActionRowBuilder().addComponents(disabledBtn)] }).catch(() => {});

          await btnInt.reply({ content: "🎉 KAZANDIN! Key DM'den gönderiliyor...", ephemeral: true });

          const keyResult = await createKeyAndDM(client, kazananId, found.hash, found.name, sure, birim, not, kanal);

          if (keyResult) {
            const kazananEmbed = new EmbedBuilder()
              .setTitle("⚡ KAZANAN!")
              .setColor(0x3fb950)
              .setDescription(
                `🏆 <@${kazananId}> butona ilk bastı!\n\n` +
                `**Script:** ${found.name}\n` +
                `**Ödül:** ${sure} ${UNIT_NAMES[birim]} key\n\n` +
                `${keyResult.dmOk ? "📬 Key DM'den gönderildi!" : "⚠️ DM kapalıydı, key kanala yazıldı."}`
              )
              .setFooter({ text: "LestaSec Cyber Engine v5.2" })
              .setTimestamp();
            await kanal.send({ embeds: [kazananEmbed] });
          }

          // 10 saniye sonra buton handler'ı kaldır
          setTimeout(() => client.off('interactionCreate', btnHandler), 10000);
        };

        client.on('interactionCreate', btnHandler);
      }
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

// ═══ WEB SUNUCUSU (Render uyanık kalsın diye) ═══
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Lesta Bot Aktif!');
}).listen(process.env.PORT || 3000, () => {
  console.log("✅ Web sunucusu: Port " + (process.env.PORT || 3000));
});
