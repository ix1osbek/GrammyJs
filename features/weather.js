// const fetch = require("node-fetch");
const { otherFunctionButtons } = require("../keyboards/inline");

/**
 * @param {import("grammy").Bot} bot
 */
module.exports = (bot) => {
    bot.callbackQuery("weather", async (ctx) => {
        await ctx.answerCallbackQuery();

        const chatId = ctx.chat.id;
        const currentMsgId = ctx.update.callback_query.message.message_id;
        ctx.session.awaitingWeather = true;

        // 🔹 Oldingi 2 ta xabarni xavfsiz o‘chirish
        for (let i = 0; i < 2; i++) {
            const targetId = currentMsgId - i;
            try {
                await ctx.api.deleteMessage(chatId, targetId);
            } catch (err) {
                if (err.description?.includes("message to delete not found")) {
                } else {
                    console.error("❌ deleteMessage xatolik:", err.description);
                }
            }
        }

        // 🔹 Lokatsiya so‘rash
        await ctx.reply("📍 Lokatsiyangizni yuboring:", {
            reply_markup: {
                keyboard: [
                    [{ text: "📍 Lokatsiyani yuborish", request_location: true }],
                    [{ text: "⬅️ Back" }]
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });
    });


    bot.on("message:location", async (ctx) => {
        try {
            if (!ctx.session.awaitingWeather) return;
            ctx.session.awaitingWeather = false
            const { latitude, longitude } = ctx.message.location

            const apiKey = process.env.WEATHER_API_KEY

            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=uz`;
            const res = await fetch(url);
            const data = await res.json()

            if (data.cod !== 200) {
                return ctx.reply("❌ Ob-havo ma'lumotini olishda xatolik yuz berdi.");
            }

            const weather = `
🌍 Manzilingiz: <b>${data.name}</b>
🌡 Harorat: <b>${data.main.temp}°C</b>
🤔 His qilinadi: <b>${data.main.feels_like}°C</b>
💨 Shamol tezligi: <b>${data.wind.speed} m/s</b>
            `;

            await ctx.reply(weather, { parse_mode: "HTML" });
        } catch (err) {
            console.error("Weather error:", err);
            await ctx.reply("❌ Ob-havo xizmatida muammo yuz berdi.");
        }
    });

    bot.on("message", async (ctx) => {
        const text = ctx.message.text;

        if (text === "⬅️ Back") {
            ctx.session.awaitingWeather = false;
            await ctx.reply("⚡️ Other functions:", {
                reply_markup: otherFunctionButtons,
                remove_keyboard: true
            });
        }

    });
};
