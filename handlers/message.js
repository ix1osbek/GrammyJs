const { aboutKeyboard, socialNetworks, otherFunctionButtons } = require("../keyboards/inline.js");
const path = require("path")
const { InputFile } = require("grammy")
const geminiAI = require("../features/geminiAI.js");
const { handleAI } = require("../features/geminiAI.js")
/**
 * @param {import("grammy").Context} ctx
*/

module.exports = async (ctx) => {
    const text = ctx.message.text;


    // 🔹 AI rejimi
    if (ctx.session.awaitingAI) {
        return handleAI(ctx);
    }

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
    } else if (text === "⚡️ Other functions") {
        const gif = "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExOTZ1aWlpemJpbDR3Y3g4ZmxtNWNxMjNodzZ3dGVkMTV6dDhwMGNwbiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/H03PuVdwREB21ANkLX/giphy.gif"
        await ctx.replyWithAnimation(gif)
        await ctx.reply("O'zingizga kerakli bo'limdan foydalanishingiz mumkin 💣", {
            reply_markup: otherFunctionButtons
        })
    } else if (text === "⬅️ Back") {
        const gif = "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExOTZ1aWlpemJpbDR3Y3g4ZmxtNWNxMjNodzZ3dGVkMTV6dDhwMGNwbiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/H03PuVdwREB21ANkLX/giphy.gif"
        await ctx.replyWithAnimation(gif)
        await ctx.reply("O'zingizga kerakli bo'limdan foydalanishingiz mumkin 💣", {
            reply_markup: otherFunctionButtons,
            // remove_keyboard: true
        })

    } else {

        const name = ctx.from.first_name || "Do'stim"
        const profileLink = ctx.from.username
            ? `https://t.me/${ctx.from.username}`
            : `tg://user?id=${ctx.from.id}`;
        await ctx.react("👀")
        await ctx.replyWithAnimation("https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNjU0d2poeHh5OWxnejVzNTJ4cXRtcGEza2k0YzRiODQ2N3dzajJ3aSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/8L0Pky6C83SzkzU55a/giphy.gif")

        await ctx.reply(`<b>Iltimos <a href="${profileLink}">${name}</a>. Botdan to'g'ri foydalaning. \n\nYoki qayta /start qiling!</b>`, {
            parse_mode: "HTML",
            disable_web_page_preview: true, // linkga razm solmaslik
        })
    }
};


