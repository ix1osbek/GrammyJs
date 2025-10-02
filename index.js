const dotenv = require("dotenv").config()
const { Bot, GrammyError, HttpError, session } = require("grammy")
const startCommand = require("./commands/start.js")
const contactHandler = require("./handlers/contact");
const messageHandler = require("./handlers/message");
const callbackHandler = require("./handlers/callbacks.js");
const { mainMenuKeyboard } = require("./keyboards/reply.js");
const { otherFunctionButtons } = require("./keyboards/inline.js");
const setupBack = require("./handlers/back.js");

const bot = new Bot(process.env.BOT_TOKEN)

// Session middleware
bot.use(session({
    initial: () => ({
        awaitingAI: false,
        awaitingTTS: false,
        awaitingWeather: false,
    }),
}));


bot.command("start", startCommand)

// Handlers
bot.on("message:contact", contactHandler)
callbackHandler(bot, mainMenuKeyboard)
bot.filter(
    (ctx) => ctx.message && !ctx.message.location,
    messageHandler
);

require("./features/weather.js")(bot);

// ✅ GeminiAI
require("./features/geminiAI").setupAI(bot);
setupBack(bot, mainMenuKeyboard);
const { setupTTS, handleTTS } = require("./features/tts.js");
setupTTS(bot);

bot.on("message", async (ctx) => {
    if (ctx.session?.awaitingTTS) {
        ctx.session.awaitingTTS = false;
        return handleTTS(ctx);
    }
});
// Back handler

// Errors
bot.catch((err) => {
    const ctx = err.ctx
    console.error(`Botda xatolik yuz berdi. ${ctx.update.update_id}`)
    const e = err.error
    console.log(err);

    if (e instanceof GrammyError) {
        console.log(e)
    } else if (e instanceof HttpError) {
        console.error(`Botda xatolik. Telegram bilan bog'lanish imkoni bo'lmadi... ${e}`)
    } else {
        console.error("Unknown error")
    }
})

bot.start()