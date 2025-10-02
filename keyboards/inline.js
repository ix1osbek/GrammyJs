const { InlineKeyboard } = require("grammy");

const aboutKeyboard = new InlineKeyboard()
    .url("🌐 Go to my website", "https://ixlosbek.uz")


const socialNetworks = new InlineKeyboard()
    .url("💼 LinkedIn", "https://www.linkedin.com/in/ix1osbek/")
    .row()
    .url("💻 GitHub", "https://github.com/ix1osbek/")
    .row()
    .url("📢 Telegram channel", "https://t.me/Ixlosware")
    .row()
    .url("📸 Instagram", "https://instagram.com/ix1osbek_/")
    .row()
    .url("🐦 Twitter", "https://x.com/erk1nov_i")
    .row()
    .url("👤 Telegram", "https://t.me/ix1osbek")
    .row()
    .url("💸 Tirikchilik", "https://tirikchilik.uz/ixlosbek_erkinov")
    .row()
    .url("📢 Life channel", "https://t.me/+vK0qbo-tgY1kNmIy")
    .row()
    .url("🌐 Blog website", "https://ixlosware.uz/")
    .row()
    .text("⬅️ Back", "back")



const otherFunctionButtons = new InlineKeyboard()
    .text("🌤 Ob-havo", "weather")
    .text("🤖 AI yordamchi", "ai")
    .row()
    .url("🖥 Online meeting belgilash", process.env.MEETING_LINK)
    .row()
    .text("⬅️ Back menu", "back")
module.exports = {
    aboutKeyboard,
    socialNetworks,
    otherFunctionButtons
};