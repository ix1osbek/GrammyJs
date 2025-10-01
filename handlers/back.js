function setupBack(bot, mainMenuKeyboard) {
    bot.callbackQuery(["back", "back2"], async (ctx) => {
        await ctx.answerCallbackQuery();
        ctx.session.awaitingAI = false;

        try {
            // Eski xabarni tahrirlab menyu chiqarish
            await ctx.editMessageText("O'zingizga kerakli bo'limdan foydalanishingiz mumkin 💣", {
                reply_markup: mainMenuKeyboard,
            });
        } catch (e) {
            console.log("Xabarni tahrirlashda xatolik:", e.description);

            // Agar xabar tahrirlanmasa – yangi xabar yuboramiz
            await ctx.reply("O'zingizga kerakli bo'limdan foydalanishingiz mumkin 💣", {
                reply_markup: mainMenuKeyboard,
            });
        }
    });
}

module.exports = setupBack;
