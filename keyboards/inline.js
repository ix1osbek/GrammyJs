const { InlineKeyboard } = require("grammy");

const aboutKeyboard = new InlineKeyboard().url(
    "🌐 Go to my website",
    "https://ixlosbek.uz"
);

module.exports = {
    aboutKeyboard,
};