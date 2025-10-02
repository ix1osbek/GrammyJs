const { aboutKeyboard, socialNetworks, otherFunctionButtons } = require("../keyboards/inline.js");
const path = require("path");
const { InputFile } = require("grammy");
const { handleAI } = require("../features/geminiAI.js");
const { handleTTS } = require("../features/tts.js")

/**
 * @param {import("grammy").Context} ctx
 */
module.exports = async (ctx) => {
    const text = ctx.message?.text;
    const name = ctx.from.first_name || "Do'stim";
    const profileLink = ctx.from.username
        ? `https://t.me/${ctx.from.username}`
        : `tg://user?id=${ctx.from.id}`;

    if (ctx.session?.awaitingTTS) {
        ctx.session.awaitingTTS = false; // qayta ishlashning oldini olish
        return handleTTS(ctx);
    }

    // 🔹 AI rejimi
    if (ctx.session.awaitingAI) {
        return handleAI(ctx);
    }

    // 🔹 Resume
    if (text === "📄 Resume") {
        await ctx.react("⚡");
        const waitingMsg = await ctx.reply("⏳");

        const filePath = path.resolve("./Ixlosbek-Erkinov-Rezyume.pdf");
        const file = new InputFile(filePath);

        await ctx.replyWithDocument(file, {
            caption: "<b>📄 Erkinov's resume file</b>",
            parse_mode: "HTML",
        });

        return ctx.api.deleteMessage(ctx.chat.id, waitingMsg.message_id);
    }

    // 🔹 About
    if (text === "ℹ️ About") {
        return ctx.reply(
            "Men haqimdagi barcha ma'lumotlarni ushbu website orqali bilib olishingiz mumkin.",
            { reply_markup: aboutKeyboard }
        );
    }

    // 🔹 Social networks
    if (text === "📱 Social networks") {
        return ctx.reply("🌐 Barcha ijtimoiy tarmoqlar ro'yxati!", {
            reply_markup: socialNetworks,
        });
    }

    // 🔹 Other functions
    if (text === "⚡️ Other functions" || text === "⬅️ Back") {
        const gif =
            "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExOTZ1aWlpemJpbDR3Y3g4ZmxtNWNxMjNodzZ3dGVkMTV6dDhwMGNwbiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/H03PuVdwREB21ANkLX/giphy.gif";

        await ctx.replyWithAnimation(gif, {
            reply_markup: { remove_keyboard: true },
        });

        return ctx.reply(
            "O'zingizga kerakli bo'limdan foydalanishingiz mumkin 💣",
            { reply_markup: otherFunctionButtons }
        );
    }

    // 🔹 Default javob
    await ctx.react("👀");
    await ctx.replyWithAnimation(
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNjU0d2poeHh5OWxnejVzNTJ4cXRtcGEza2k0YzRiODQ2N3dzajJ3aSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/8L0Pky6C83SzkzU55a/giphy.gif"
    );

    return ctx.reply(
        `<b>Iltimos <a href="${profileLink}">${name}</a>. Botdan to'g'ri foydalaning.\n\nYoki qayta /start qiling!</b>`,
        {
            parse_mode: "HTML",
            disable_web_page_preview: true, // link preview chiqmasin
        }
    );
};
