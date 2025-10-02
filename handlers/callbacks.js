const { otherFunctionButtons } = require("../keyboards/inline");

/**
 * @param {import("grammy").Bot} bot
 */
module.exports = (bot, mainMenuKeyboard) => {
    // 🔹 Oddiy "Back" tugmasi
    bot.callbackQuery("back", async (ctx) => {
        await ctx.answerCallbackQuery();

        try {
            await ctx.editMessageReplyMarkup({ reply_markup: null });
            await ctx.deleteMessage();
        } catch (err) {
            console.log("Callback xabarni o'chirishda xatolik:", err.description);
        }

        await ctx.reply("⬅️ Asosiy menyu:", {
            reply_markup: mainMenuKeyboard,
        });
    });

    // 🔹 AI uchun "Back2" tugmasi
    bot.callbackQuery("back2", async (ctx) => {
        await ctx.answerCallbackQuery();
        ctx.session.awaitingAI = false;

        try {
            await ctx.editMessageReplyMarkup({ reply_markup: null });
            await ctx.deleteMessage();
        } catch (err) {
            console.log("Callback xabarni o'chirishda xatolik:", err.description);
        }

        await ctx.reply("O'zingizga kerakli bo'limdan foydalanishingiz mumkin 💣", {
            reply_markup: otherFunctionButtons,
        });
    });
};
