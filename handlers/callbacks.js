/**
 * @param {import("grammy").Bot} bot
 */
module.exports = (bot, mainMenuKeyboard) => {
    bot.callbackQuery("back", async (ctx) => {
        await ctx.answerCallbackQuery();

        const chatId = ctx.chat.id
        try {
            await ctx.editMessageReplyMarkup({ reply_markup: null });
        } catch (err) {
            console.log("Inline tugmalarni tozalashda xatolik:", err.description);
        }

        try {
            await ctx.deleteMessage();
        } catch (err) {
            console.log("Callback xabarni o'chirishda xatolik:", err.description);
        }

        await ctx.reply("⬅️ Asosiy menyu:", {
            reply_markup: mainMenuKeyboard,
        });
    });
};
