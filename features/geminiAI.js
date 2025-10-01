const { InlineKeyboard } = require("grammy");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { otherFunctionButtons } = require("../keyboards/inline.js");
const cleanHtmlForTelegram = require("../utils/htmlCleaner.js");

// 🔹 Gemini sozlamalari
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { temperature: 0.7 },
});

// 🔹 Uzoq javoblarni bo‘lib yuborish
async function sendLongMessage(ctx, text, keyboard = null) {
    const MAX_LENGTH = 4000;

    if (text.length <= MAX_LENGTH) {
        return ctx.reply(text, {
            parse_mode: "HTML",
            reply_markup: keyboard,
        });
    }

    const paragraphs = text.split("\n\n");
    let currentChunk = "";

    for (const para of paragraphs) {
        if ((currentChunk + "\n\n" + para).length > MAX_LENGTH) {
            if (currentChunk) {
                await ctx.reply(currentChunk, { parse_mode: "HTML" });
                await new Promise(r => setTimeout(r, 100));
                currentChunk = para;
            } else {
                for (let start = 0; start < para.length; start += MAX_LENGTH) {
                    const chunk = para.slice(start, start + MAX_LENGTH);
                    await ctx.reply(chunk, { parse_mode: "HTML" });
                    await new Promise(r => setTimeout(r, 100));
                }
                currentChunk = "";
            }
        } else {
            currentChunk += (currentChunk ? "\n\n" : "") + para;
        }
    }

    if (currentChunk) {
        await ctx.reply(currentChunk, {
            parse_mode: "HTML",
            reply_markup: keyboard,
        });
    }
}

// 🔹 AI Handler
async function handleAI(ctx) {
    // Faqat AI rejimida ishlasin
    if (!ctx.session.awaitingAI) return;

    // Faqat user yozgan textni qabul qilamiz, tugmalarni emas
    if (!ctx.message || !ctx.message.text) return;

    const userPrompt = ctx.message.text;

    // Agar tugmalar matniga o‘xshasa — AI ga yubormaymiz
    const blocked = ["📄 Resume", "ℹ️ About", "⬅️ Back", "📱 Social networks", "⚡️ Other functions"];
    if (blocked.includes(userPrompt)) return;

    ctx.session.awaitingAI = false;

    const waitMsg = await ctx.reply("⏳ Javob tayyorlanmoqda...");
    try {
        const prompt = `Siz yordamchi assistant bo'lib, foydalanuvchiga o'zbek tilida javob berasiz. 

<b>Formatlash qoidalari:</b>
- Qalin: <b>matn</b>
- Kursiv: <i>matn</i>
- Ro'yxatlar: • belgisi yoki raqamlar
❌ TAQIQLANGAN teglar: <p>, <h1-h6>, <ul>, <ol>, <li>, <div>, <span>, <code>

Foydalanuvchi savoli: ${userPrompt}`;

        const result = await model.generateContent(prompt);
        let answer = cleanHtmlForTelegram(result.response.text());

        try {
            await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id);
        } catch (e) { }

        const keyboard = new InlineKeyboard()
            .text("♻️ Qayta so'rash", "ai")
            .row()
            .text("⬅️ Orqaga", "back2");

        await sendLongMessage(ctx, answer, keyboard);
    } catch (err) {
        console.error("Gemini error:", err);

        try {
            await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id);
        } catch (e) { }

        await ctx.reply("❌ Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.", {
            reply_markup: new InlineKeyboard()
                .text("♻️ Qayta urinish", "ai")
                .row()
                .text("⬅️ Orqaga", "back2"),
        });
    }
}


// 🔹 Callback tugmalar
function setupAI(bot) {
    bot.callbackQuery("ai", async (ctx) => {
        await ctx.answerCallbackQuery();
        ctx.session.awaitingAI = true;

        const chatId = ctx.chat.id;
        const currentMsgId = ctx.update.callback_query.message.message_id;

        // 🔹 Oldingi 2 ta xabarni o‘chirish
        for (let i = 0; i < 2; i++) {
            try {
                await ctx.api.deleteMessage(chatId, currentMsgId - i);
            } catch (e) {
                console.log(`Xabarni o‘chirishda xatolik:`, e.description);
            }
        }

        // 🔹 AI savol olish xabarini yuborish
        await ctx.reply(
            `<b>🤖 Savolingizni yozing, AI sizga javob qaytaradi.</b>\n\n<tg-spoiler>AI bepul versiyada ishlamoqda, javob tezligida muammo bo‘lishi mumkin.</tg-spoiler>`,
            {
                parse_mode: "HTML",
                reply_markup: new InlineKeyboard().text("❌ Bekor qilish", "back2"),
            }
        );
    });


}

module.exports = { setupAI, handleAI };
