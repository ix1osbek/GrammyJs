const { aboutKeyboard, socialNetworks } = require("../keyboards/inline.js");
const path = require("path")
const { InputFile } = require("grammy")
/**
 * @param {import("grammy").Context} ctx
*/

module.exports = async (ctx) => {
    const text = ctx.message.text;

    if (text === "📄 Resume") {
        await ctx.react("⚡")
        const waitingMsg = await ctx.reply("⏳")
        const filePath = path.resolve("./Ixlosbek-Erkinov-Rezyume.pdf");
        const file = new InputFile(filePath);
        await ctx.replyWithDocument(file, {
            caption: "<b>📄 Erkinov's resume file</b>",
            parse_mode: "HTML",
        });

        await ctx.api.deleteMessage(ctx.chat.id, waitingMsg.message_id);
    } else if (text === "ℹ️ About") {
        await ctx.reply("Men haqimdagi barcha ma'lumotlarni ushbu website orqali bilib olishingiz mumkin.", {
            reply_markup: aboutKeyboard,
        });
    } else if (text === "📱 Social networks") {
        await ctx.reply("🌐 Barcha ijtimoiy tarmoqlar ro'yxati!", {
            reply_markup: socialNetworks
        });
    } else {
        await ctx.reply("❌ Men sizni tushunmadim.\n/start yoki menyudan tugma tanlang.");
    }
};