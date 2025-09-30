/**
 * @param {import("grammy").Context} ctx
 */

const { contactKeyboard } = require("../keyboards/reply.js")

module.exports = async (ctx) => {
    const name = ctx.from.first_name || "Do'stim"
    const stickerId = process.env.STICKER_ID
    const profileLink = ctx.from.username
        ? `https://t.me/${ctx.from.username}`
        : `tg://user?id=${ctx.from.id}`;
    await ctx.replyWithSticker(stickerId)
    await ctx.reply(`Assalomu alaykum <a href="${profileLink}">${name}</a>. Ixlosbek Erkinovning Telegram Botiga xush kelibsiz! \n \nIltimos Botdan to'liq foydalanish uchun quyidagi "Ro'yxatdan o'tish" tugmasini bosing.`, {
        parse_mode: "HTML",
        disable_web_page_preview: true, // linkga razm solmaslik
        reply_markup: contactKeyboard
    })
}