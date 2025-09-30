const { Keyboard } = require("grammy");


const contactKeyboard = new Keyboard()
    .requestContact("📱 Ro'yxatdan o'tish")
    .resized()

/////// home menu

const mainMenuKeyboard = new Keyboard()
    .text("📄 Resume")
    .text("ℹ️ About")
    .row()
    .text("📢 Channel")
    .resized();
module.exports = {
    contactKeyboard,
    mainMenuKeyboard
};