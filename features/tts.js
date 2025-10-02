const axios = require("axios");
const { InlineKeyboard } = require("grammy");

// 🔹 TTS handler
async function handleTTS(ctx) {
    if (!ctx.message || !ctx.message.text) return;

    const userText = ctx.message.text.trim();
    if (!userText) return;

    if (userText.length > 250) {
        return ctx.reply(
            `⚠️ Matn juda uzun. Maksimal uzunlik: 250 ta belgi.\nSiz yubordingiz: ${userText.length} ta belgi.`,
            {
                reply_markup: new InlineKeyboard()
                    .text("♻️ Qayta urinish", "tts")
                    .row()
                    .text("⬅️ Orqaga", "back2"),
            }
        );
    }

    const { language = "uz", model = "gulnoza", mood = "neutral" } =
        ctx.session.ttsSettings || {};

    // 🔹 Kutish xabari
    const waitMsg = await ctx.reply("🎙️ Ovoz yaratilmoqda...");

    try {
        // 🔹 API chaqirish
        const response = await axios.post(
            "https://back.aisha.group/api/v1/tts/post/",
            { transcript: userText, language, model, mood },
            {
                headers: { "x-api-key": process.env.AISHA_KEY },
                responseType: "json",
            }
        );

        const audioUrl = response.data.audio_path;
        if (!audioUrl) throw new Error("Audio URL kelmadi");

        await ctx.replyWithAudio(audioUrl, {
            caption: "🎶 Sizning matningiz audio formatga o‘girildi.",
            reply_markup: new InlineKeyboard()
                .text("♻️ Yangi TTS", "tts")
                .row()
                .text("⬅️ Orqaga", "back2"),
        });

        try {
            await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id);
        } catch { }
    } catch (err) {
        console.error("TTS xatolik:", err.message);
        try {
            await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id);
        } catch { }
        await ctx.reply("❌ Ovoz yaratishda xatolik yuz berdi.");
    }
}

// 🔹 Sozlamalar
function setupTTS(bot) {
    // TTS tugmasi
    bot.callbackQuery("tts", async (ctx) => {
        await ctx.answerCallbackQuery();

        // Default sozlamalar
        ctx.session.ttsSettings = { language: "uz", model: "gulnoza" };
        ctx.session.ttsStage = "mood";

        try {
            await ctx.api.deleteMessage(ctx.chat.id, ctx.callbackQuery.message.message_id);
            await ctx.api.deleteMessage(ctx.chat.id, ctx.callbackQuery.message.message_id - 1);
        } catch (e) { }

        const keyboard = new InlineKeyboard()
            .text("😊 Quvnoq", "tts_mood_happy").row()
            .text("😐 Oddiy", "tts_mood_neutral").row()
            .text("😢 Xafa", "tts_mood_sad").row()
            .text("⬅️ Orqaga", "back2");

        await ctx.reply("<b>😎 Kayfiyatni tanlang:</b>", {
            parse_mode: "HTML",
            reply_markup: keyboard,
        });
    });

    // Kayfiyat tanlash
    bot.callbackQuery(/^tts_mood_(\w+)/, async (ctx) => {
        const mood = ctx.match[1];
        ctx.session.ttsSettings = { ...ctx.session.ttsSettings, mood };
        ctx.session.awaitingTTS = true;
        ctx.session.ttsStage = "text";

        await ctx.editMessageText(
            "📝 Endi matningizni yuboring (maks. <b>250 ta belgi</b>):",
            { parse_mode: "HTML" }
        );
    });

    // Orqaga tugmasi
    bot.callbackQuery("back2", async (ctx) => {
        await ctx.answerCallbackQuery();
        ctx.session.ttsStage = null;
        ctx.session.ttsSettings = null;

        await ctx.editMessageText("⬅️ TTS bekor qilindi.");
    });

    // Qayta urinish tugmasi
    bot.callbackQuery("tts", async (ctx) => {
        await ctx.answerCallbackQuery();
        ctx.session.ttsStage = "text";

        await ctx.editMessageText(
            "📝 Iltimos, qayta matn yuboring (maks. <b>250 ta belgi</b>):",
            { parse_mode: "HTML" }
        );
    });

}

module.exports = { setupTTS, handleTTS }
