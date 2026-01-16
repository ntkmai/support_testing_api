// Markdown Viewer Module
import { UIComponents } from './ui-components.js';
import { config } from './config-mongodb.js';

export class MarkdownViewer {
    constructor() {
        this.currentContent = '';
        this.currentFile = null;
    }

    // Load and render markdown file
    async loadFile(filePath, fileName) {
        // Clean path by removing query string before storing
        const cleanPath = filePath.split('?')[0];
        this.currentFile = { path: cleanPath, name: fileName };

        const contentDiv = document.getElementById('markdownContent');
        if (!contentDiv) return;

        // Clear previous content first
        contentDiv.innerHTML = '';

        UIComponents.showLoading('markdownContent', {
            image: '/assets/images/rocket-loading-view.gif',
            message: '📖 Đang tải tài liệu...'
        });

        try {
            // Add cache-busting to prevent stale markdown content
            const cacheBuster = cleanPath.includes('?') ? `&t=${Date.now()}` : `?t=${Date.now()}`;
            const response = await fetch(cleanPath + cacheBuster);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const markdownText = await response.text();
            this.currentContent = markdownText;

            // Add delay to show loading animation (configurable)
            const delay = config.getLoadingDelay();
            await new Promise(resolve => setTimeout(resolve, delay));

            // Render using marked.js
            const htmlContent = marked.parse(markdownText);
            contentDiv.innerHTML = htmlContent;

            // Add copy buttons to code blocks
            this.addCopyButtons();

            // Apply syntax highlighting to code blocks
            this.applySyntaxHighlighting();

            // Handle markdown links to load files in viewer
            this.handleMarkdownLinks();

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

    // Apply syntax highlighting to JSON and TypeScript code blocks
    applySyntaxHighlighting() {
        const codeBlocks = document.querySelectorAll('#markdownContent pre code');
        codeBlocks.forEach(block => {
            const className = block.className || '';
            const text = block.textContent;

            if (className.includes('language-json') || className.includes('json')) {
                block.innerHTML = this.highlightJSON(text);
            } else if (className.includes('language-typescript') || className.includes('language-ts') || className.includes('typescript')) {
                block.innerHTML = this.highlightTypeScript(text);
            }
        });
    }

    // Highlight JSON with comment support
    highlightJSON(code) {
        const lines = code.split('\n');
        const highlightedLines = lines.map(line => {
            // Check if line contains a comment
            const commentIndex = line.indexOf('//');

            if (commentIndex !== -1) {
                // Split line into code part and comment part
                const codePart = line.substring(0, commentIndex);
                const commentPart = line.substring(commentIndex);

                return this.highlightJSONLine(codePart) +
                       `<span class="json-comment">${this.escapeHtml(commentPart)}</span>`;
            }

            return this.highlightJSONLine(line);
        });

        return highlightedLines.join('\n');
    }

    // Highlight a single JSON line (without comments)
    highlightJSONLine(line) {
        // Escape HTML first
        let escaped = this.escapeHtml(line);

        // Highlight brackets
        escaped = escaped.replace(/([{}\[\]])/g, '<span class="json-bracket">$1</span>');

        // Highlight keys (property names before colon)
        escaped = escaped.replace(/"([^"]+)"(\s*:)/g, '<span class="json-key">"$1"</span><span class="json-colon">$2</span>');

        // Highlight string values (after colon, not keys)
        escaped = escaped.replace(/(:\s*)"([^"]*)"/g, '$1<span class="json-string">"$2"</span>');

        // Highlight numbers
        escaped = escaped.replace(/(:\s*)(-?\d+\.?\d*)/g, '$1<span class="json-number">$2</span>');

        // Highlight booleans
        escaped = escaped.replace(/(:\s*)(true|false)/g, '$1<span class="json-boolean">$2</span>');

        // Highlight null
        escaped = escaped.replace(/(:\s*)(null)/g, '$1<span class="json-null">$2</span>');

        // Highlight commas
        escaped = escaped.replace(/,(\s*)$/g, '<span class="json-comma">,</span>$1');

        return escaped;
    }

    // Highlight TypeScript/Interface code
    highlightTypeScript(code) {
        const lines = code.split('\n');
        const highlightedLines = lines.map(line => {
            // Check for comments
            const commentIndex = line.indexOf('//');

            if (commentIndex !== -1) {
                const codePart = line.substring(0, commentIndex);
                const commentPart = line.substring(commentIndex);

                return this.highlightTypeScriptLine(codePart) +
                       `<span class="ts-comment">${this.escapeHtml(commentPart)}</span>`;
            }

            return this.highlightTypeScriptLine(line);
        });

        return highlightedLines.join('\n');
    }

    // Highlight a single TypeScript line
    highlightTypeScriptLine(line) {
        let escaped = this.escapeHtml(line);

        // Highlight keywords
        escaped = escaped.replace(/\b(interface|type|enum|extends|import|export|from|const|let|var|function|class|new|return|async|await)\b/g,
            '<span class="ts-keyword">$1</span>');

        // Highlight types
        escaped = escaped.replace(/:\s*([A-Z][a-zA-Z0-9]*(?:\[\])?)/g, ': <span class="ts-type">$1</span>');
        escaped = escaped.replace(/:\s*(string|number|boolean|any|void|null|undefined|never|object|Date|Record&lt;[^&]+&gt;)/g,
            ': <span class="ts-type">$1</span>');

        // Highlight property names
        escaped = escaped.replace(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)(\??:\s*)/gm,
            '  <span class="ts-property">$1</span><span class="ts-optional">$2</span>');

        return escaped;
    }

    // Escape HTML special characters
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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

    // Handle markdown links to load files in viewer
    handleMarkdownLinks() {
        const contentDiv = document.getElementById('markdownContent');
        if (!contentDiv) return;

        const links = contentDiv.querySelectorAll('a');

        links.forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;

            // Check if link is a .md file
            if (href.endsWith('.md')) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();

                    // Resolve full path
                    let fullPath;
                    if (href.startsWith('http://') || href.startsWith('https://')) {
                        // Absolute URL
                        fullPath = href;
                    } else {
                        // Relative path - resolve based on current file path
                        const currentPath = this.currentFile.path;
                        const basePath = currentPath.substring(0, currentPath.lastIndexOf('/'));

                        // Combine and normalize path
                        let combinedPath = basePath + '/' + href;

                        // Remove ./ and normalize path
                        combinedPath = combinedPath.replace(/\/\.\//g, '/'); // Remove /./
                        combinedPath = combinedPath.replace(/\/\//g, '/'); // Remove double slashes

                        fullPath = combinedPath;
                    }

                    // Extract file name
                    const fileName = href.split('/').pop();

                    // Switch to markdown tab if not already there
                    if (window.app && typeof window.app.switchTab === 'function') {
                        window.app.switchTab('markdown');
                    }

                    // Load the linked file
                    setTimeout(() => {
                        this.loadFile(fullPath, fileName).then(() => {
                            // Scroll to top after loading
                            contentDiv.scrollTop = 0;

                            // Highlight the file in explorer after file is loaded
                            setTimeout(() => {
                                if (window.fileExplorer && typeof window.fileExplorer.setActiveFileByPath === 'function') {
                                    window.fileExplorer.setActiveFileByPath(fullPath);
                                }
                            }, 200);
                        }).catch(error => {
                            console.error('Error loading linked markdown file:', error);
                        });
                    }, 100);

                    UIComponents.showNotification(`📖 Đang tải: ${fileName}`, 'info');
                });
            }
        });
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
