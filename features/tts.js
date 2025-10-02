const axios = require("axios");
const { InlineKeyboard, Keyboard } = require("grammy");

// 🔹 TTS handler
async function handleTTS(ctx) {
    // if (!ctx.message || !ctx.message.text) return;
    if (!ctx.message || !ctx.message.text) {
        await ctx.reply("❌ Iltimos, <b>matn</b> formatidan foydalaning.", {
            parse_mode: "HTML",
            reply_markup: new InlineKeyboard()
                .text("♻️ Qayta urinish", "tts2")
                .row()
                .text("⬅️ Orqaga", "back2"),
        });
        ctx.session.awaitingAI = true
        return;
    }
    const userText = ctx.message.text.trim();
    if (!userText) return;

    if (userText.length > 250) {
        return ctx.reply(
            `⚠️ Matn juda uzun. Maksimal uzunlik: 250 ta belgi.\nSiz yubordingiz: ${userText.length} ta belgi.`,
            {
                reply_markup: new InlineKeyboard()
                    .text("♻️ Qayta urinish", "tts2")
                    .row()
                    .text("⬅️ Orqaga", "back2"),
            }
        );
    }

    const { language = "uz", model = "gulnoza", mood = "neutral" } =
        ctx.session.ttsSettings || {};

    // 🔹 Kutish rejimi (progress bar)
    const waitMsg = await ctx.reply(
        "🎧 <b>Ovoz tayyorlanmoqda...</b>\n\n⏳ [░░░░░░░░░░] 0%",
        { parse_mode: "HTML" }
    );

    const totalSteps = 10; // progress bo'linmalari
    const stepTime = 700;  // har bir bosqich davomiyligi (ms) = 0.7 sek

    for (let i = 1; i <= totalSteps; i++) {
        const bar = "▓".repeat(i) + "░".repeat(totalSteps - i);
        const percent = i * 10;

        await new Promise((res) => setTimeout(res, stepTime));

        try {
            await ctx.api.editMessageText(
                ctx.chat.id,
                waitMsg.message_id,
                `🎧 <b>Ovoz tayyorlanmoqda...</b>\n\n⏳ [${bar}] ${percent}%`,
                { parse_mode: "HTML" }
            );
        } catch (e) {
            // xatoni e'tiborsiz qoldiramiz, boshqa funksiyalarga tegmaymiz
        }
    }

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


    /////// qayta urinish uchun TTS 
    bot.callbackQuery("tts2", async (ctx) => {
        await ctx.answerCallbackQuery();

        // Default sozlamalar
        ctx.session.ttsSettings = { language: "uz", model: "gulnoza" };
        ctx.session.ttsStage = "mood";

        try {
            // Callback tugmasi bosilgan xabarni o'chirish
            await ctx.api.deleteMessage(ctx.chat.id, ctx.callbackQuery.message.message_id);

            // Session ichida oldingi xabar ID saqlangan bo'lsa, uni ham o'chirish
            if (ctx.session.prevMsgId) {
                await ctx.api.deleteMessage(ctx.chat.id, ctx.session.prevMsgId);
                ctx.session.prevMsgId = null; // keyin kerak bo'lmasa tozalaymiz
            }
        } catch (e) {
            console.log("Xabar o'chirishda xato:", e.description);
        }

        const keyboard = new InlineKeyboard()
            .text("😊 Quvnoq", "tts_mood_happy").row()
            .text("😐 Oddiy", "tts_mood_neutral").row()
            .text("😢 Xafa", "tts_mood_sad").row()
            .text("⬅️ Orqaga", "back2");

        const sent = await ctx.reply("<b>😎 Kayfiyatni tanlang:</b>", {
            parse_mode: "HTML",
            reply_markup: keyboard,
        });

        // Yangi xabar ID sini saqlab qo'yamiz
        ctx.session.prevMsgId = sent.message_id;
    });

    // Kayfiyat tanlash
    bot.callbackQuery(/^tts_mood_(\w+)/, async (ctx) => {
        const mood = ctx.match[1];
        ctx.session.ttsSettings = { ...ctx.session.ttsSettings, mood };
        ctx.session.awaitingTTS = true;
        ctx.session.ttsStage = "text";

        await ctx.editMessageText(
            "📝 Endi matningizni yuboring (maks. <b>250 ta belgi</b>):",
            {
                parse_mode: "HTML"
            }
        )
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
