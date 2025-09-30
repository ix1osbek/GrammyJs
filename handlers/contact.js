const { mainMenuKeyboard } = require("../keyboards/reply");

module.exports = async (ctx) => {
    await ctx.react("🫡")
    await ctx.reply(`Ro'yxatdan o'tish muvofaqiyatli bo'ldi. \n \nMarhamat botdan to'liq foydalanishingiz mumkin✅`, {
        reply_markup: mainMenuKeyboard
    });
};