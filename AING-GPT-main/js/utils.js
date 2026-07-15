// fungsi utilitas

export function detectCodeBlocks(text) {
    const safeText = typeof text === 'string' ? text : '';
    const result = [];
    const codeBlockPattern = /```([\s\S]*?)```/g;
    let match;
    let lastIndex = 0;

    while ((match = codeBlockPattern.exec(safeText)) !== null) {
        if (match.index > lastIndex) {
            result.push({
                type: 'text',
                content: safeText.substring(lastIndex, match.index)
            });
        }
        const language = match[1] || 'text';
        const codeContent = match[2].trim();

        result.push({
            type: 'code',
            language: language,
            content: codeContent
        });
        lastIndex = codeBlockPattern.lastIndex;
    }

    if (lastIndex < safeText.length) {
        result.push({
            type: 'text',
            content: safeText.substring(lastIndex)
        });
    }

    return result.length > 0 ? result : [{ type: 'text', content: safeText }];
}

export function copyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text ?? '';
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const copyPromise = navigator.clipboard?.writeText
        ? navigator.clipboard.writeText(text ?? '').then(() => true).catch(() => false)
        : Promise.resolve(false);

    textArea.remove();
    return copyPromise;
}

export function escapeHtml(str) {
    return String(str ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function normalizeUploadText(text) {
    return String(text ?? '')
        .replaceAll('\u0000', '')
        .replaceAll('\r\n', '\n')
        .trim();
}

function isTextLikeUpload(file) {
    const filename = file?.name ?? '';
    const mimetype = file?.type ?? '';
    const ext = filename.toLowerCase();
    const mime = mimetype.toLowerCase();
    return [
        ext.endsWith('.txt'),
        ext.endsWith('.md'),
        ext.endsWith('.csv'),
        ext.endsWith('.json'),
        ext.endsWith('.xml'),
        ext.endsWith('.html'),
        ext.endsWith('.htm'),
        mime.startsWith('text/'),
        mime === 'application/json',
        mime === 'application/xml',
        mime === 'application/javascript',
        mime === 'application/x-javascript'
    ].some(Boolean);
}

export async function parseUploadFileText(file) {
    if (!file) {
        return { text: '', error: 'No file selected' };
    }

    if (!isTextLikeUpload(file)) {
        return { text: '', error: 'Unsupported file type for local parsing' };
    }

    try {
        if (typeof file.text === 'function') {
            const text = await file.text();
            return { text: normalizeUploadText(text), error: '' };
        }

        if (typeof FileReader !== 'undefined') {
            const text = await file.text();
            return { text: normalizeUploadText(text), error: '' };
        }

        return { text: '', error: 'File reading API is not available in this environment' };
    } catch (error) {
        return { text: '', error: error?.message ?? 'Failed to read file' };
    }
}

function normalizeText(text) {
    return typeof text === 'string' ? text.trim() : '';
}

function extractTextFromObject(obj) {
    if (!obj || typeof obj !== 'object') return '';

    const directText = [
        obj.text,
        obj.generatedText,
        obj.generated_text,
        obj.output_text,
        obj.reply,
        obj.message,
        obj.answer
    ].find(value => typeof value === 'string' && value.trim());

    if (directText) return directText.trim();

    if (Array.isArray(obj.parts) && obj.parts.length > 0) {
        return obj.parts.map(extractTextFromObject).filter(Boolean).join(' ').trim();
    }

    if (Array.isArray(obj.output) && obj.output.length > 0) {
        return obj.output.map(extractTextFromObject).filter(Boolean).join(' ').trim();
    }

    if (obj.content) {
        return extractTextFromObject(obj.content);
    }

    if (obj.response) {
        return extractTextFromObject(obj.response);
    }

    return '';
}

export function extractAiReplyText(payload) {
    if (!payload || typeof payload !== 'object') return '';

    if (Array.isArray(payload.candidates) && payload.candidates.length > 0) {
        const candidate = payload.candidates[0];
        const candidateText = extractTextFromObject(candidate);
        if (candidateText) return candidateText;
    }

    const objectText = extractTextFromObject(payload);
    if (objectText) return objectText;

    if (payload.response && typeof payload.response === 'object') {
        return extractAiReplyText(payload.response);
    }

    return '';
}

export function buildFallbackAiReply(userMessage) {
    const cleaned = normalizeText(userMessage);
    if (!cleaned) {
        return 'Backend AI sedang sibuk. Coba lagi sebentar lagi.';
    }
    return `Maaf, Backend AI tidak memberi jawaban untuk "${cleaned}". Coba ulang sekali lagi atau cek koneksi API.`;
}