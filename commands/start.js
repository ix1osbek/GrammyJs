/**
 * @param {import("grammy").Context} ctx
 */

const { contactKeyboard } = require("../keyboards/reply.js")

module.exports = async (ctx) => {
    const name = ctx.from.first_name || "Do'stim"
    const profileLink = ctx.from.username
        ? `https://t.me/${ctx.from.username}`
        : `tg://user?id=${ctx.from.id}`;
    const stickerId = process.env.STICKER_ID
    await ctx.replyWithSticker(stickerId)
    await ctx.reply(`Assalomu alaykum <a href="${profileLink}">${name}</a> \n\n<b>Ixlosbek Erkinov</b>ning Telegram Botiga xush kelibsiz! \n \nBotdan to'liq foydalanish uchun quyidagi "📱 Ro'yxatdan o'tish" tugmasini bosing`, {
        parse_mode: "HTML",
        disable_web_page_preview: true, // linkga razm solmaslik
        reply_markup: contactKeyboard
    })
}