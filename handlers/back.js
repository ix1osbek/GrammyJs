function setupBack(bot, mainMenuKeyboard) {
    bot.callbackQuery(["back", "back2"], async (ctx) => {
        await ctx.answerCallbackQuery();

        // 🔹 Session flaglarni reset
        ctx.session.awaitingAI = false;
        ctx.session.awaitingTTS = false;

        // 🔹 Inline keyboardni tozalash
        try {
            await ctx.editMessageReplyMarkup({ reply_markup: null });
        } catch (e) {
            console.log("ReplyMarkup tozalashda xatolik:", e.description);
        }

        try {
            await ctx.deleteMessage();
        } catch (e) {
            console.log("Xabarni o‘chirishda xatolik:", e.description);
        }

        // 🔹 Har doim asosiy menyuni qaytarish
        await ctx.reply("⬅️ Siz asosiy menyuga qaytdingiz.", {
            reply_markup: mainMenuKeyboard,
        });
    });
}

module.exports = setupBack;
