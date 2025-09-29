const dotenv = require("dotenv").config()
const { Bot, GrammyError, HttpError } = require("grammy")
const startCommand = require("./commands/start.js")


const bot = new Bot(process.env.BOT_TOKEN)

bot.command("start", startCommand)

// bot.on("message", async (ctx) => {
//     await ctx.reply("Iltimos kuting...")
// })

/// Errors

bot.catch((err) => {
    const ctx = err.ctx
    console.error(`Botda xatolik yuz berdi. ${ctx.update.update_id}`)
    const e = err.error

    if (e instanceof GrammyError) {
        console.error(`Botda xatolik: ${e.description}`)
    } else if (e instanceof HttpError) {
        console.error(`Botda xatolik. Telegram bilan bog'lanish imkoni bo'lmadi... ${e}`)
    } else {
        console.error("Unknown error")
    }
})

bot.start()