const { Keyboard } = require("grammy");


const contactKeyboard = new Keyboard()
    .requestContact("📱 Ro'yxatdan o'tish")
    .resized()

/////// home menu

const mainMenuKeyboard = new Keyboard()
    .text("ℹ️ About")
    .text("📄 Resume")
    .row()
    .text("📱 Social networks")
    .text("⚡️ Other functions")
    .resized();

module.exports = {
    contactKeyboard,
    mainMenuKeyboard
};