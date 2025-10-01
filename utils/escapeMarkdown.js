// markdownToHtml.js
function markdownToHtml(text) {
    if (!text) return '';

    let html = text;

    // Bold text: **text** yoki __text__ -> <b>text</b>
    html = html.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    html = html.replace(/__(.+?)__/g, '<b>$1</b>');

    // Italic: *text* yoki _text_ -> <i>text</i>
    html = html.replace(/\*(.+?)\*/g, '<i>$1</i>');
    html = html.replace(/_(.+?)_/g, '<i>$1</i>');

    // Code: `code` -> <code>code</code>
    html = html.replace(/`(.+?)`/g, '<code>$1</code>');

    // Links: [text](url) -> <a href="url">text</a>
    html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');

    // Headings (agar kerak bo'lsa)
    html = html.replace(/^### (.+)$/gm, '<b>$1</b>');
    html = html.replace(/^## (.+)$/gm, '<b>$1</b>');
    html = html.replace(/^# (.+)$/gm, '<b>$1</b>');

    // Strikethrough: ~~text~~ -> <s>text</s>
    html = html.replace(/~~(.+?)~~/g, '<s>$1</s>');

    // Underline: __text__ (agar faqat underline kerak bo'lsa)
    // html = html.replace(/__(.+?)__/g, '<u>$1</u>');

    return html;
}

module.exports = markdownToHtml;