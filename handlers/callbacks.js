/**
 * @param {import("grammy").Bot} bot
 */
module.exports = (bot, mainMenuKeyboard) => {
    bot.callbackQuery("back", async (ctx) => {
        await ctx.answerCallbackQuery();
        await ctx.deleteMessage();
        const chatId = ctx.chat.id;
        const lastMessageId = ctx.update.callback_query.message.message_id;
        const previousMessageId = lastMessageId - 1
        try {
            await ctx.api.deleteMessage(chatId, previousMessageId);
        } catch (err) {
            console.log("Oldingi xabarni o'chirishda xatolik:", err.description);
        }
        await ctx.reply("⬅️ Asosiy menyu:", {
            reply_markup: mainMenuKeyboard,
        });
    });

};
