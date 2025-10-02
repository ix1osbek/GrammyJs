const { mainMenuKeyboard } = require("../keyboards/reply");

const CHANNEL_ID = process.env.CHANNEL_ID

module.exports = async (ctx) => {
    await ctx.react("🫡")
    await ctx.reply(
        `Ro'yxatdan o'tish muvofaqiyatli bo'ldi. \n\nMarhamat, botdan to'liq foydalanishingiz mumkin ✅`,
        { reply_markup: mainMenuKeyboard }
    )
    const user = ctx.from;
    const contact = ctx.message.contact

    // Telefon raqam bo'lishi mumkin (agar yuborilgan bo'lsa)
    const phone = contact?.phone_number || "Telefon yuborilmagan";

    // Kanalga yuboriladigan matn
    const text = `📥 Yangi ro'yxatdan o'tgan foydalanuvchi:\n\n` +
        `👤 Ism: ${user.first_name || "-"} ${user.last_name || ""}\n` +
        `🔗 Username: @${user.username || "yo'q"}\n` +
        `🆔 ID: ${user.id}\n` +
        `📞 Telefon: ${phone}`;

    // Kanalga yuborish
    await ctx.api.sendMessage(CHANNEL_ID, text, { parse_mode: "HTML" });
};
