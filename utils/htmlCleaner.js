// htmlCleaner.js - Gemini HTML javoblarini Telegram formatiga o'zgartirish

function cleanHtmlForTelegram(html) {
    if (!html) return '';

    let text = html;

    // Telegram qo'llab-quvvatlamaydigan teglarni olib tashlash
    // Telegram faqat: <b>, <i>, <u>, <s>, <code>, <pre>, <a> qo'llab-quvvatlaydi

    // <code> va </code> teglarni butunlay olib tashlash (agar butun matn code ichida bo'lsa)
    text = text.replace(/^<code>|<\/code>$/g, '');

    // <pre> va </pre> teglarni olib tashlash
    text = text.replace(/<pre[^>]*>/gi, '');
    text = text.replace(/<\/pre>/gi, '');

    // <p> va </p> teglarni olib tashlash
    text = text.replace(/<p[^>]*>/gi, '');
    text = text.replace(/<\/p>/gi, '\n');

    // <strong> → <b>
    text = text.replace(/<strong>/gi, '<b>');
    text = text.replace(/<\/strong>/gi, '</b>');

    // <em> → <i>
    text = text.replace(/<em>/gi, '<i>');
    text = text.replace(/<\/em>/gi, '</i>');

    // Heading teglarni <b> ga aylantirish va yangi qator qo'shish
    text = text.replace(/<h[1-6][^>]*>/gi, '\n<b>');
    text = text.replace(/<\/h[1-6]>/gi, '</b>\n');

    // List elementlarini tozalash
    text = text.replace(/<\/?ul[^>]*>/gi, '\n');
    text = text.replace(/<\/?ol[^>]*>/gi, '\n');

    // <li> → •
    text = text.replace(/<li[^>]*>/gi, '• ');
    text = text.replace(/<\/li>/gi, '\n');

    // <br> → \n
    text = text.replace(/<br\s*\/?>/gi, '\n');

    // <hr> → ─────
    text = text.replace(/<hr\s*\/?>/gi, '\n─────────────\n');

    // Div, span va boshqa umumiy teglarni olib tashlash
    text = text.replace(/<\/?div[^>]*>/gi, '');
    text = text.replace(/<\/?span[^>]*>/gi, '');
    text = text.replace(/<\/?section[^>]*>/gi, '');
    text = text.replace(/<\/?article[^>]*>/gi, '');
    text = text.replace(/<\/?header[^>]*>/gi, '');
    text = text.replace(/<\/?footer[^>]*>/gi, '');
    text = text.replace(/<\/?main[^>]*>/gi, '');
    text = text.replace(/<\/?nav[^>]*>/gi, '');
    text = text.replace(/<\/?aside[^>]*>/gi, '');

    // HTML entities ni dekodlash
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&apos;/g, "'");
    text = text.replace(/&#39;/g, "'");
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&mdash;/g, '—');
    text = text.replace(/&ndash;/g, '–');

    // Ko'p bo'sh qatorlarni kamaytirish (3 va undan ortiq → 2)
    text = text.replace(/\n{3,}/g, '\n\n');

    // Har bir qatorning boshidagi va oxiridagi bo'sh joylarni olib tashlash
    text = text.split('\n').map(line => line.trim()).join('\n');

    // Bosh va oxiridagi bo'sh joylarni olib tashlash
    text = text.trim();

    return text;
}

module.exports = cleanHtmlForTelegram;