/**
 * @param {import("grammy").Context} ctx
 */

module.exports = async (ctx) => {
    const name = ctx.from.first_name || "Do'stim"
    const stickerId = "CAACAgIAAxkBAANMaNr6K1VB7aaPG5T4OjHFVdvWDIAAAi1aAAJwpGBIMKPUn3Bufpg2BA"
    const profileLink = ctx.from.username
        ? `https://t.me/${ctx.from.username}`
        : `tg://user?id=${ctx.from.id}`;
    await ctx.replyWithSticker(stickerId)
    await ctx.reply(`<b>Assalomu alaykum <a href="${profileLink}">${name}</a>. \nIxlosbek Erkinovning Telegram Botiga xush kelibsiz!</b>`, {
        parse_mode: "HTML",
        disable_web_page_preview: true
    })
}