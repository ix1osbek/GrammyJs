const dotenv = require("dotenv").config()
const { Bot, GrammyError, HttpError } = require("grammy")
const startCommand = require("./commands/start.js")
const contactHandler = require("./handlers/contact");
const messageHandler = require("./handlers/message");
const callbackHandler = require("./handlers/callbacks.js");
const { mainMenuKeyboard } = require("./keyboards/reply.js");

const bot = new Bot(process.env.BOT_TOKEN)

bot.command("start", startCommand)

///// Handlers

bot.on("message:contact", contactHandler)
bot.on("message:text", messageHandler)
callbackHandler(bot, mainMenuKeyboard)
require("./features/weather")(bot);


/// Errors

bot.catch((err) => {
    const ctx = err.ctx
    console.error(`Botda xatolik yuz berdi. ${ctx.update.update_id}`)
    const e = err.error

    if (e instanceof GrammyError) {
        console.log(e)
    } else if (e instanceof HttpError) {
        console.error(`Botda xatolik. Telegram bilan bog'lanish imkoni bo'lmadi... ${e}`)
    } else {
        console.error("Unknown error")
    }
})

bot.start()