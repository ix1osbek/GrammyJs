const { InlineKeyboard } = require("grammy");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { mainMenuKeyboard } = require("../keyboards/reply");
const cleanHtmlForTelegram = require("../utils/htmlCleaner.js");

// Gemini model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
        temperature: 0.7,
    }
});

// Uzun javoblarni bo'lib yuborish
async function sendLongMessage(ctx, text, keyboard = null) {
    const MAX_LENGTH = 4000;

    // Agar matn qisqa bo'lsa, bir marta yuboramiz
    if (text.length <= MAX_LENGTH) {
        return await ctx.reply(text, {
            parse_mode: "HTML",
            reply_markup: keyboard,
        });
    }

    // Uzun matnni paragraflar bo'yicha bo'lamiz
    const paragraphs = text.split('\n\n');
    let currentChunk = '';

    for (let i = 0; i < paragraphs.length; i++) {
        const para = paragraphs[i];

        // Agar joriy chunk + yangi paragraf MAX_LENGTH dan oshsa
        if ((currentChunk + '\n\n' + para).length > MAX_LENGTH) {
            // Joriy chunkni yuboramiz
            if (currentChunk) {
                await ctx.reply(currentChunk, {
                    parse_mode: "HTML",
                });
                await new Promise(resolve => setTimeout(resolve, 100)); // Kichik kechikish
                currentChunk = para;
            } else {
                // Bitta paragraf juda uzun bo'lsa, majburan bo'lamiz
                let start = 0;
                while (start < para.length) {
                    const chunk = para.slice(start, start + MAX_LENGTH);
                    await ctx.reply(chunk, {
                        parse_mode: "HTML",
                    });
                    await new Promise(resolve => setTimeout(resolve, 100));
                    start += MAX_LENGTH;
                }
                currentChunk = '';
            }
        } else {
            currentChunk += (currentChunk ? '\n\n' : '') + para;
        }
    }

    // Oxirgi chunkni tugmalar bilan yuboramiz
    if (currentChunk) {
        await ctx.reply(currentChunk, {
            parse_mode: "HTML",
            reply_markup: keyboard,
        });
    }
}

// Asosiy AI handler
async function handleAI(ctx) {
    ctx.session.awaitingAI = false;
    const userPrompt = ctx.message.text;

    // "Javob tayyorlanmoqda..." xabari
    const waitMsg = await ctx.reply("⏳ Javob tayyorlanmoqda...");

    try {
        // System prompt bilan birga yuboramiz
        const prompt = `Siz yordamchi assistant bo'lib, foydalanuvchiga o'zbek tilida javob berasiz. 

MUHIM: Javobingizni oddiy matn va quyidagi HTML teglar bilan formatlang:
- Qalin matn uchun: <b>matn</b>
- Kursiv uchun: <i>matn</i>
- Sarlavhalar: <b>Sarlavha</b> formatida (p, h1-h6 teglarini ISHLATMANG!)
- Ro'yxatlar: Oddiy • belgisi bilan yoki raqamlar bilan (ul, ol, li teglarini ISHLATMANG!)

TAQIQLANGAN teglar: <p>, <h1-h6>, <ul>, <ol>, <li>, <div>, <span>, <code> (butun matn uchun)

Foydalanuvchi savoli: ${userPrompt}`;

        const result = await model.generateContent(prompt);
        let answer = result.response.text();

        // HTML ni tozalash va Telegram formatiga moslashtirish
        answer = cleanHtmlForTelegram(answer);

        // Kutish xabarini o'chiramiz
        try {
            await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id);
        } catch (e) {
            console.log("Xabarni o'chirishda xatolik:", e.message);
        }

        const keyboard = new InlineKeyboard()
            .text("♻️ Qayta so'rash", "ai")
            .row()
            .text("⬅️ Orqaga", "back2");

        await sendLongMessage(ctx, answer, keyboard);
    } catch (err) {
        console.error("Gemini error:", err);

        // Kutish xabarini o'chiramiz
        try {
            await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id);
        } catch (e) { }

        await ctx.reply("❌ Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.", {
            reply_markup: new InlineKeyboard()
                .text("♻️ Qayta urinish", "ai")
                .row()
                .text("⬅️ Orqaga", "back2")
        });
    }
}

// Tugmalarni sozlash
function setupAI(bot) {
    bot.callbackQuery("ai", async (ctx) => {
        await ctx.answerCallbackQuery();
        ctx.session.awaitingAI = true;
        await ctx.reply("🤖 Savolingizni yozing:", {
            reply_markup: new InlineKeyboard()
                .text("❌ Bekor qilish", "back2")
        });
    });

    bot.callbackQuery("back2", async (ctx) => {
        await ctx.answerCallbackQuery();
        ctx.session.awaitingAI = false;

        try {
            await ctx.deleteMessage();
        } catch (e) { }

        await ctx.reply("⬅️ Asosiy menyu:", {
            reply_markup: mainMenuKeyboard,
        });
    });
}

module.exports = { setupAI, handleAI };