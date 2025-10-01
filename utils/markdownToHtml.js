function markdownToHtml(text) {
    return text
        // Bold (**Matn**)
        .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
        // Italic (*Matn*)
        .replace(/\*(.*?)\*/g, "<i>$1</i>")
        // Punktlar
        .replace(/^\* (.*)$/gm, "• $1")
        // H1 (# Matn)
        .replace(/^# (.*)$/gm, "<b><u>$1</u></b>")
        // H2 (## Matn)
        .replace(/^## (.*)$/gm, "<b>$1</b>")
        // Xavfsiz belgilar
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

module.exports = markdownToHtml;
