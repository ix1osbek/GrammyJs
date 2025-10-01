const escapeMarkdown = require("./escapeMarkdown");

async function sendLongMessage(ctx, text) {
    const MAX_LENGTH = 4000; // Telegram limitidan biroz kichik
    const escaped = escapeMarkdown(text);

    let start = 0;
    while (start < escaped.length) {
        const chunk = escaped.slice(start, start + MAX_LENGTH);
        await ctx.reply(chunk, { parse_mode: "MarkdownV2" });
        start += MAX_LENGTH;
    }
}

module.exports = sendLongMessage;
