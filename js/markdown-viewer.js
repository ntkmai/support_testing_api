// Markdown Viewer Module
import { UIComponents } from './ui-components.js';

export class MarkdownViewer {
    constructor() {
        this.currentContent = '';
        this.currentFile = null;
    }

    // Load and render markdown file
    async loadFile(filePath, fileName) {
        this.currentFile = { path: filePath, name: fileName };

        const contentDiv = document.getElementById('markdownContent');
        if (!contentDiv) return;

        // Clear previous content first
        contentDiv.innerHTML = '';
        
        UIComponents.showLoading('markdownContent');

        try {
            // Add cache-busting to prevent stale markdown content
            const cacheBuster = filePath.includes('?') ? `&t=${Date.now()}` : `?t=${Date.now()}`;
            const response = await fetch(filePath + cacheBuster);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const markdownText = await response.text();
            this.currentContent = markdownText;

            // Render using marked.js
            const htmlContent = marked.parse(markdownText);
            contentDiv.innerHTML = htmlContent;

            // Add copy buttons to code blocks
            this.addCopyButtons();

            // UIComponents.showNotification(`📖 Đã tải: ${fileName}`, 'success');

        } catch (error) {
            console.error('Error loading markdown:', error);
            UIComponents.showError(
                'markdownContent',
                'Không thể tải file',
                error.message,
                '<strong>Gợi ý:</strong> Đảm bảo local server đang chạy: <code>npx http-server -p 8000</code>'
            );
        }
    }

    // Add copy buttons to code blocks
    addCopyButtons() {
        const codeBlocks = document.querySelectorAll('#markdownContent pre code');
        codeBlocks.forEach(block => {
            const pre = block.parentElement;
            if (!pre.querySelector('.copy-btn')) {
                const button = document.createElement('button');
                button.className = 'copy-btn';
                button.innerHTML = '📋 Copy';
                button.onclick = async () => {
                    await UIComponents.copyToClipboard(block.textContent);
                    button.innerHTML = '✅ Copied!';
                    setTimeout(() => button.innerHTML = '📋 Copy', 2000);
                };
                pre.style.position = 'relative';
                pre.appendChild(button);
            }
        });
    }

    // Generate table of contents
    generateTOC() {
        const contentDiv = document.getElementById('markdownContent');
        const headings = contentDiv.querySelectorAll('h1, h2, h3');
        
        if (headings.length < 3) return; // Only show TOC if there are enough headings

        const tocDiv = document.getElementById('tableOfContents');
        if (!tocDiv) return;

        let tocHTML = '<h4>📑 Mục lục</h4><ul class="toc-list">';
        
        headings.forEach((heading, index) => {
            const level = heading.tagName.toLowerCase();
            const text = heading.textContent;
            const id = `heading-${index}`;
            heading.id = id;

            const indent = level === 'h2' ? 'toc-h2' : level === 'h3' ? 'toc-h3' : 'toc-h1';
            tocHTML += `<li class="${indent}"><a href="#${id}">${text}</a></li>`;
        });

        tocHTML += '</ul>';
        tocDiv.innerHTML = tocHTML;
        tocDiv.style.display = 'block';
    }

    // Export markdown as HTML
    exportAsHTML() {
        if (!this.currentContent) return;

        const html = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.currentFile?.name || 'Document'}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.0/github-markdown.min.css">
    <style>
        body { max-width: 900px; margin: 40px auto; padding: 20px; }
        .markdown-body { box-sizing: border-box; min-width: 200px; max-width: 980px; margin: 0 auto; padding: 45px; }
    </style>
</head>
<body>
    <article class="markdown-body">
        ${marked.parse(this.currentContent)}
    </article>
</body>
</html>`;

        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = (this.currentFile?.name || 'document').replace('.md', '.html');
        a.click();
        URL.revokeObjectURL(url);

        UIComponents.showNotification('💾 Đã xuất file HTML', 'success');
    }

    // Search in current document
    searchInDocument(query) {
        if (!this.currentContent) return [];

        const lines = this.currentContent.split('\n');
        const results = [];

        lines.forEach((line, index) => {
            if (line.toLowerCase().includes(query.toLowerCase())) {
                results.push({
                    lineNumber: index + 1,
                    content: line,
                    preview: line.substring(0, 100)
                });
            }
        });

        return results;
    }

    // Get current content
    getContent() {
        return this.currentContent;
    }

    // Get current file info
    getCurrentFile() {
        return this.currentFile;
    }
}
