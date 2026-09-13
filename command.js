// ═══════════════════════════════════════════════════════════════
// LESTA BOT - YENİ KOMUTLAR (Moderasyon, Buton Rol, Not, vs.)
// ═══════════════════════════════════════════════════════════════

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

// ═══════════════════════════════════════════════════════════════
// GEÇİCİ VERİ DEPOLAMA
// ═══════════════════════════════════════════════════════════════

const notes = new Map();        // userId -> [notes]
const buttonRoles = new Map();  // messageId -> { roles: [{roleId, roleName}], guildId }

// ═══════════════════════════════════════════════════════════════
// YENİ SLASH KOMUTLAR
// ═══════════════════════════════════════════════════════════════

const newCommands = [
  // ═══ MODERASYON (12) ═══
  new SlashCommandBuilder().setName('kick').setDescription('Kullanıcıyı sunucudan at')
    .addUserOption(o => o.setName('kullanici').setDescription('Kullanıcı').setRequired(true))
    .addStringOption(o => o.setName('sebep').setDescription('Sebep').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  new SlashCommandBuilder().setName('mod-ban').setDescription('Kullanıcıyı sunucudan banla')
    .addUserOption(o => o.setName('kullanici').setDescription('Kullanıcı').setRequired(true))
    .addStringOption(o => o.setName('sebep').setDescription('Sebep').setRequired(false))
    .addIntegerOption(o => o.setName('gun').setDescription('Mesaj geçmişi sil (gün)').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  new SlashCommandBuilder().setName('mod-unban').setDescription('Ban kaldır')
    .addStringOption(o => o.setName('userid').setDescription('Discord UserId').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  new SlashCommandBuilder().setName('mute').setDescription('Kullanıcıyı sustur (timeout)')
    .addUserOption(o => o.setName('kullanici').setDescription('Kullanıcı').setRequired(true))
    .addIntegerOption(o => o.setName('dakika').setDescription('Kaç dakika').setRequired(true))
    .addStringOption(o => o.setName('sebep').setDescription('Sebep').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  new SlashCommandBuilder().setName('unmute').setDescription('Susturmayı kaldır')
    .addUserOption(o => o.setName('kullanici').setDescription('Kullanıcı').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  new SlashCommandBuilder().setName('clear').setDescription('Mesajları temizle')
    .addIntegerOption(o => o.setName('miktar').setDescription('Kaç mesaj (1-100)').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  new SlashCommandBuilder().setName('slowmode').setDescription('Kanal yavaş modu ayarla')
    .addIntegerOption(o => o.setName('saniye').setDescription('Saniye (0=kapat)').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  new SlashCommandBuilder().setName('lock').setDescription('Kanalı kilitle')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  new SlashCommandBuilder().setName('unlock').setDescription('Kanalın kilidini aç')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  new SlashCommandBuilder().setName('addrole').setDescription('Kullanıcıya rol ver')
    .addUserOption(o => o.setName('kullanici').setDescription('Kullanıcı').setRequired(true))
    .addRoleOption(o => o.setName('rol').setDescription('Rol').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  new SlashCommandBuilder().setName('removerole').setDescription('Kullanıcıdan rol al')
    .addUserOption(o => o.setName('kullanici').setDescription('Kullanıcı').setRequired(true))
    .addRoleOption(o => o.setName('rol').setDescription('Rol').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  new SlashCommandBuilder().setName('nickname').setDescription('Kullanıcının takma adını değiştir')
    .addUserOption(o => o.setName('kullanici').setDescription('Kullanıcı').setRequired(true))
    .addStringOption(o => o.setName('yeni_isim').setDescription('Yeni isim').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),

  // ═══ BUTON ROL (3) ═══
  new SlashCommandBuilder().setName('buton-rol-olustur').setDescription('Buton rol menüsü oluştur')
    .addStringOption(o => o.setName('baslik').setDescription('Panel başlığı').setRequired(true))
    .addRoleOption(o => o.setName('rol1').setDescription('1. rol').setRequired(true))
    .addRoleOption(o => o.setName('rol2').setDescription('2. rol').setRequired(false))
    .addRoleOption(o => o.setName('rol3').setDescription('3. rol').setRequired(false))
    .addRoleOption(o => o.setName('rol4').setDescription('4. rol').setRequired(false))
    .addRoleOption(o => o.setName('rol5').setDescription('5. rol').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  new SlashCommandBuilder().setName('buton-rol-sil').setDescription('Buton rol mesajını sil')
    .addStringOption(o => o.setName('messageid').setDescription('Mesaj ID').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  new SlashCommandBuilder().setName('buton-rol-listele').setDescription('Buton rolleri listele'),

  // ═══ NOT SİSTEMİ (5) ═══
  new SlashCommandBuilder().setName('not-ekle').setDescription('Kişisel not ekle')
    .addStringOption(o => o.setName('not').setDescription('Not içeriği').setRequired(true)),
  new SlashCommandBuilder().setName('not-listele').setDescription('Notlarını listele'),
  new SlashCommandBuilder().setName('not-sil').setDescription('Not sil')
    .addIntegerOption(o => o.setName('index').setDescription('Not numarası').setRequired(true)),
  new SlashCommandBuilder().setName('not-temizle').setDescription('Tüm notlarını temizle'),
  new SlashCommandBuilder().setName('not-bilgi').setDescription('Not istatistikleri')
].map(c => c.toJSON());

// ═══════════════════════════════════════════════════════════════
// YENİ KOMUT HANDLER
// ═══════════════════════════════════════════════════════════════

async function handleNewCommand(interaction) {
  const { commandName } = interaction;

  // ═══ MODERASYON ═══
  if (commandName === 'kick') {
    await interaction.deferReply();
    const user = interaction.options.getUser('kullanici');
    const sebep = interaction.options.getString('sebep') || 'Belirtilmedi';
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return await interaction.editReply({ content: "❌ Kullanıcı bulunamadı." });
    if (!member.kickable) return await interaction.editReply({ content: "❌ Bu kullanıcıyı atamam." });
    try {
      await member.kick(sebep);
      await interaction.editReply({ content: "👢 **" + user.tag + "** sunucudan atıldı.\n**Sebep:** " + sebep });
    } catch (e) { await interaction.editReply({ content: "❌ Hata: " + e.message }); }
    return true;
  }

  if (commandName === 'mod-ban') {
    await interaction.deferReply();
    const user = interaction.options.getUser('kullanici');
    const sebep = interaction.options.getString('sebep') || 'Belirtilmedi';
    const gun = interaction.options.getInteger('gun') || 0;
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return await interaction.editReply({ content: "❌ Kullanıcı bulunamadı." });
    if (!member.bannable) return await interaction.editReply({ content: "❌ Bu kullanıcıyı banlayamam." });
    try {
      await member.ban({ reason: sebep, deleteMessageSeconds: gun * 86400 });
      await interaction.editReply({ content: "🔨 **" + user.tag + "** banlandı.\n**Sebep:** " + sebep + "\n**Silinen mesaj:** " + gun + " gün" });
    } catch (e) { await interaction.editReply({ content: "❌ Hata: " + e.message }); }
    return true;
  }

  if (commandName === 'mod-unban') {
    await interaction.deferReply();
    const userId = interaction.options.getString('userid');
    try {
      await interaction.guild.members.unban(userId);
      await interaction.editReply({ content: "✅ Ban kaldırıldı: `" + userId + "`" });
    } catch (e) { await interaction.editReply({ content: "❌ Hata: " + e.message }); }
    return true;
  }

  if (commandName === 'mute') {
    await interaction.deferReply();
    const user = interaction.options.getUser('kullanici');
    const dakika = interaction.options.getInteger('dakika');
    const sebep = interaction.options.getString('sebep') || 'Belirtilmedi';
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return await interaction.editReply({ content: "❌ Kullanıcı bulunamadı." });
    try {
      await member.timeout(dakika * 60 * 1000, sebep);
      await interaction.editReply({ content: "🔇 **" + user.tag + "** susturuldu.\n**Süre:** " + dakika + " dakika\n**Sebep:** " + sebep });
    } catch (e) { await interaction.editReply({ content: "❌ Hata: " + e.message }); }
    return true;
  }

  if (commandName === 'unmute') {
    await interaction.deferReply();
    const user = interaction.options.getUser('kullanici');
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return await interaction.editReply({ content: "❌ Kullanıcı bulunamadı." });
    try {
      await member.timeout(null);
      await interaction.editReply({ content: "🔊 **" + user.tag + "** susturması kaldırıldı." });
    } catch (e) { await interaction.editReply({ content: "❌ Hata: " + e.message }); }
    return true;
  }

  if (commandName === 'clear') {
    await interaction.deferReply({ ephemeral: true });
    let miktar = interaction.options.getInteger('miktar');
    if (miktar > 100) miktar = 100;
    if (miktar < 1) miktar = 1;
    try {
      const deleted = await interaction.channel.bulkDelete(miktar, true);
      await interaction.editReply({ content: "🗑️ **" + deleted.size + "** mesaj silindi." });
    } catch (e) { await interaction.editReply({ content: "❌ Hata: " + e.message }); }
    return true;
  }

  if (commandName === 'slowmode') {
    await interaction.deferReply();
    const saniye = interaction.options.getInteger('saniye');
    try {
      await interaction.channel.setRateLimitPerUser(saniye);
      await interaction.editReply({ content: saniye === 0 ? "🐇 Yavaş mod kapatıldı." : "🐌 Yavaş mod: **" + saniye + " saniye**" });
    } catch (e) { await interaction.editReply({ content: "❌ Hata: " + e.message }); }
    return true;
  }

  if (commandName === 'lock') {
    await interaction.deferReply();
    try {
      await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });
      await interaction.editReply({ content: "🔒 Kanal kilitlendi." });
    } catch (e) { await interaction.editReply({ content: "❌ Hata: " + e.message }); }
    return true;
  }

  if (commandName === 'unlock') {
    await interaction.deferReply();
    try {
      await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: null });
      await interaction.editReply({ content: "🔓 Kanal kilidi açıldı." });
    } catch (e) { await interaction.editReply({ content: "❌ Hata: " + e.message }); }
    return true;
  }

  if (commandName === 'addrole') {
    await interaction.deferReply();
    const user = interaction.options.getUser('kullanici');
    const role = interaction.options.getRole('rol');
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return await interaction.editReply({ content: "❌ Kullanıcı bulunamadı." });
    try {
      await member.roles.add(role);
      await interaction.editReply({ content: "✅ **" + role.name + "** rolü verildi: " + user.tag });
    } catch (e) { await interaction.editReply({ content: "❌ Hata: " + e.message }); }
    return true;
  }

  if (commandName === 'removerole') {
    await interaction.deferReply();
    const user = interaction.options.getUser('kullanici');
    const role = interaction.options.getRole('rol');
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return await interaction.editReply({ content: "❌ Kullanıcı bulunamadı." });
    try {
      await member.roles.remove(role);
      await interaction.editReply({ content: "✅ **" + role.name + "** rolü alındı: " + user.tag });
    } catch (e) { await interaction.editReply({ content: "❌ Hata: " + e.message }); }
    return true;
  }

  if (commandName === 'nickname') {
    await interaction.deferReply();
    const user = interaction.options.getUser('kullanici');
    const yeniIsim = interaction.options.getString('yeni_isim');
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return await interaction.editReply({ content: "❌ Kullanıcı bulunamadı." });
    try {
      await member.setNickname(yeniIsim);
      await interaction.editReply({ content: "✏️ Takma ad değiştirildi: **" + yeniIsim + "**" });
    } catch (e) { await interaction.editReply({ content: "❌ Hata: " + e.message }); }
    return true;
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
    if (roller.length === 0) return await interaction.editReply({ content: "❌ En az 1 rol gerekli." });
    const embed = new EmbedBuilder().setTitle("🎭 " + baslik).setColor(0x8b5cf6)
      .setDescription("Aşağıdaki butonlara basarak rol alabilirsin.\n\n" + roller.map(r => "• " + r.toString()).join("\n"))
      .setFooter({ text: "LestaSec Cyber Engine v5.3" }).setTimestamp();
    const row = new ActionRowBuilder();
    roller.forEach(r => {
      row.addComponents(new ButtonBuilder().setCustomId("btnrole_" + r.id).setLabel(r.name).setStyle(ButtonStyle.Secondary));
    });
    const msg = await interaction.channel.send({ embeds: [embed], components: [row] });
    buttonRoles.set(msg.id, { roles: roller.map(r => ({ roleId: r.id, roleName: r.name })), guildId: interaction.guildId });
    await interaction.editReply({ content: "✅ Buton rol menüsü oluşturuldu!" });
    return true;
  }

  if (commandName === 'buton-rol-sil') {
    await interaction.deferReply();
    const messageId = interaction.options.getString('messageid');
    try {
      const msg = await interaction.channel.messages.fetch(messageId);
      await msg.delete();
      buttonRoles.delete(messageId);
      await interaction.editReply({ content: "🗑️ Buton rol mesajı silindi." });
    } catch (e) { await interaction.editReply({ content: "❌ Hata: " + e.message }); }
    return true;
  }

  if (commandName === 'buton-rol-listele') {
    await interaction.deferReply();
    if (buttonRoles.size === 0) return await interaction.editReply({ content: "📭 Kayıtlı buton rol yok." });
    const embed = new EmbedBuilder().setTitle("🎭 Buton Rol Menüleri").setColor(0x58a6ff)
      .setDescription("Toplam: **" + buttonRoles.size + "** menü")
      .setFooter({ text: "LestaSec Cyber Engine v5.3" }).setTimestamp();
    let i = 1;
    for (const [msgId, data] of buttonRoles.entries()) {
      embed.addFields({ name: "#" + i + " (" + msgId + ")", value: data.roles.map(r => "• " + r.roleName).join("\n"), inline: false });
      i++;
    }
    await interaction.editReply({ embeds: [embed] });
    return true;
  }

  // ═══ NOT SİSTEMİ ═══
  if (commandName === 'not-ekle') {
    await interaction.deferReply({ ephemeral: true });
    const not = interaction.options.getString('not');
    const userId = interaction.user.id;
    if (!notes.has(userId)) notes.set(userId, []);
    const userNotes = notes.get(userId);
    if (userNotes.length >= 20) return await interaction.editReply({ content: "❌ Maksimum 20 not ekleyebilirsin." });
    userNotes.push({ text: not, createdAt: Date.now() });
    await interaction.editReply({ content: "✅ Not eklendi! (" + userNotes.length + "/20)\n📝 " + not });
    return true;
  }

  if (commandName === 'not-listele') {
    await interaction.deferReply({ ephemeral: true });
    const userId = interaction.user.id;
    const userNotes = notes.get(userId) || [];
    if (userNotes.length === 0) return await interaction.editReply({ content: "📭 Hiç notun yok." });
    const embed = new EmbedBuilder().setTitle("📝 Notların").setColor(0x58a6ff)
      .setDescription("Toplam: **" + userNotes.length + "** not")
      .setFooter({ text: "LestaSec Cyber Engine v5.3" }).setTimestamp();
    userNotes.forEach((n, i) => {
      embed.addFields({ name: "#" + (i + 1) + " (" + new Date(n.createdAt).toLocaleString("tr-TR") + ")", value: n.text, inline: false });
    });
    await interaction.editReply({ embeds: [embed] });
    return true;
  }

  if (commandName === 'not-sil') {
    await interaction.deferReply({ ephemeral: true });
    const index = interaction.options.getInteger('index') - 1;
    const userId = interaction.user.id;
    const userNotes = notes.get(userId) || [];
    if (index < 0 || index >= userNotes.length) return await interaction.editReply({ content: "❌ Geçersiz index." });
    const silinen = userNotes.splice(index, 1)[0];
    await interaction.editReply({ content: "🗑️ Not silindi: " + silinen.text });
    return true;
  }

  if (commandName === 'not-temizle') {
    await interaction.deferReply({ ephemeral: true });
    notes.delete(interaction.user.id);
    await interaction.editReply({ content: "🗑️ Tüm notların silindi." });
    return true;
  }

  if (commandName === 'not-bilgi') {
    await interaction.deferReply({ ephemeral: true });
    const userId = interaction.user.id;
    const userNotes = notes.get(userId) || [];
    await interaction.editReply({ content: "📊 **" + userNotes.length + "/20** not kullanıyorsun." });
    return true;
  }

  return false;
}

// ═══════════════════════════════════════════════════════════════
// BUTON HANDLER (Buton Rol)
// ═══════════════════════════════════════════════════════════════

async function handleNewButton(interaction) {
  if (interaction.customId.startsWith('btnrole_')) {
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
    return true;
  }
  return false;
}

module.exports = { newCommands, handleNewCommand, handleNewButton };
