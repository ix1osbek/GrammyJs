const { InlineKeyboard } = require("grammy");
const { GoogleGenerativeAI } = require("@google/generative-ai");
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

    for (let i = 0; i < paragraphs.length; i++) {
        const para = paragraphs[i];

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

        // 🔹 Oxirgi bo‘lakka tugmalarni qo‘shish
        if (i === paragraphs.length - 1 && currentChunk) {
            await ctx.reply(currentChunk, {
                parse_mode: "HTML",
                reply_markup: keyboard,
            });
        }
    }
}

// 🔹 AI Handler
// 🔹 AI Handler
async function handleAI(ctx) {

    const keyboard = new InlineKeyboard()
        .text("♻️ Qayta so'rash", "ai")
        .row()
        .text("⬅️ Orqaga", "back2");

    if (!ctx.session || !ctx.session.awaitingAI) return;

    // ❌ Faqat text qabul qilamiz
    if (!ctx.message || !ctx.message.text) {
        const warnMsg = await ctx.reply("❌ Iltimos, savolingizni <b>matn</b> ko‘rinishida yuboring.", {
            parse_mode: "HTML",
            reply_markup: keyboard
        });

        ctx.session.awaitingAI = true;

        try {
            await ctx.api.deleteMessage(ctx.chat.id, warnMsg.message_id - 2);
        } catch (err) {
            console.error("❌ O‘chirishda xatolik:", err.description);
        }

        return;
    }



    const userPrompt = ctx.message.text.trim();
    const blocked = ["📄 Resume", "ℹ️ About", "⬅️ Back", "📱 Social networks", "⚡️ Other functions"];
    if (blocked.some(b => userPrompt === b)) return;

    ctx.session.awaitingAI = false;

    if (ctx.session.lastMessageId) {
        try {
            await ctx.api.deleteMessage(ctx.chat.id, ctx.session.lastMessageId);
        } catch (e) { }
        ctx.session.lastMessageId = null;
    }

    let percent = 0;
    let waitMsg = await ctx.reply(`⏳ <b>Javob tayyorlanmoqda...</b> [▒▒▒▒▒▒▒▒▒▒] ${percent}%`, {
        parse_mode: "HTML"
    });

    const progressInterval = setInterval(async () => {
        if (percent < 90) {
            percent += Math.floor(Math.random() * 10) + 5;
            if (percent > 90) percent = 90;
        } else if (percent < 99) {
            percent += 1;
        }

        const barLength = 10;
        const filled = Math.floor((percent / 100) * barLength);
        const bar = "█".repeat(filled) + "▒".repeat(barLength - filled);

        try {
            await ctx.api.editMessageText(ctx.chat.id, waitMsg.message_id,
                `⏳ <b>Javob tayyorlanmoqda...</b> [${bar}] ${percent}%`, {
                parse_mode: "HTML"
            });
        } catch (e) { }
    }, 1500);

    try {
        const prompt = `Siz yordamchi assistant bo'lib, foydalanuvchiga o'zbek tilida javob berasiz. 

<b>Formatlash qoidalari:</b>
- Qalin: <b>matn</b>
- Kursiv: <i>matn</i>
- Ro'yxatlar: • belgisi yoki raqamlar
❌ TAQIQLANGAN teglar: <p>, <h1-h6>, <ul>, <ol>, <li>, <div>, <span>, <code>

Foydalanuvchi savoli: ${userPrompt}`;

        const result = await model.generateContent(prompt);

        let rawText = "";
        if (result.response.text) {
            rawText = result.response.text();
        } else if (result.response.candidates?.[0]?.content?.parts) {
            rawText = result.response.candidates[0].content.parts
                .map(p => p.text || "")
                .join(" ");
        }

        let answer = cleanHtmlForTelegram(rawText);

        clearInterval(progressInterval);

        try {
            await ctx.api.editMessageText(ctx.chat.id, waitMsg.message_id,
                `⏳ <b>Javob tayyorlanmoqda...</b> [██████████] 100%`, {
                parse_mode: "HTML"
            });
        } catch (e) { }

        setTimeout(async () => {
            try {
                await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id);
            } catch (e) { }
        }, 500);

        const keyboard = new InlineKeyboard()
            .text("♻️ Qayta so'rash", "ai")
            .row()
            .text("⬅️ Orqaga", "back2");

        await sendLongMessage(ctx, answer, keyboard);

    } catch (err) {
        console.error("Gemini error:", err);

        clearInterval(progressInterval);
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
// 🔹 Callback tugmalar
function setupAI(bot) {
    bot.callbackQuery("ai", async (ctx) => {
        await ctx.answerCallbackQuery();
        ctx.session.awaitingAI = true;

        const chatId = ctx.chat.id;
        const currentMsgId = ctx.update.callback_query.message.message_id;

        // ⬅️ Eski xabarni o‘chirish
        try {
            await ctx.api.deleteMessage(chatId, currentMsgId);
        } catch (e) {
            console.log(`Xabarni o‘chirishda xatolik:`, e);
        }

        // Agar sessionda oldingi xabar saqlangan bo‘lsa uni ham o‘chir
        if (ctx.session.lastMessageId) {
            try {
                await ctx.api.deleteMessage(chatId, ctx.session.lastMessageId);
            } catch (e) { }
            ctx.session.lastMessageId = null;
        }

        // 🔹 AI savol olish xabarini yuborish
        const msg = await ctx.reply(
            `<b>🤖 Savolingizni yozing, AI sizga javob qaytaradi.</b>\n\n<tg-spoiler>AI bepul versiyada ishlamoqda, javob tezligida muammo bo‘lishi mumkin.</tg-spoiler>`,
            {
                parse_mode: "HTML",
                reply_markup: new InlineKeyboard().text("❌ Bekor qilish", "back2"),
            }
        );

        ctx.session.lastMessageId = msg.message_id;
    });

    // 🔹 Orqaga tugmasi (AI uchun)
    bot.callbackQuery("back2", async (ctx) => {
        await ctx.answerCallbackQuery();
        ctx.session.awaitingAI = false;

        // Eski keyboardni o‘chir
        try {
            await ctx.api.deleteMessage(ctx.chat.id, ctx.callbackQuery.message.message_id);
        } catch (e) { }

        await ctx.reply("⬅️ AI bekor qilindi.");
    });
}


module.exports = { setupAI, handleAI };
