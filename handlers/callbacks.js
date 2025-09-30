/**
 * @param {import("grammy").Bot} bot
 */
module.exports = (bot, mainMenuKeyboard) => {
    bot.callbackQuery("back", async (ctx) => {
        await ctx.answerCallbackQuery();
        await ctx.deleteMessage()
        await ctx.reply("⬅️ Asosiy menyu:", {
            reply_markup: mainMenuKeyboard,
        });
    });
};
