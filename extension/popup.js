document.getElementById('importBtn').addEventListener('click', async () => {
    const status = document.getElementById('status');
    status.textContent = 'Capturing structure...';

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: capturePageStructure
    }, (results) => {
        if (results && results[0] && results[0].result) {
            const data = results[0].result;
            // Copy to clipboard for easy pasting or handle message passing
            navigator.clipboard.writeText(JSON.stringify(data)).then(() => {
                status.textContent = 'Structure copied to clipboard!';
                setTimeout(() => {
                    status.textContent = 'Ready to capture site';
                }, 3000);
            });
        } else {
            status.textContent = 'Capture failed.';
        }
    });
});

function capturePageStructure() {
    function getElementStyles(element) {
        const computed = window.getComputedStyle(element);
        const styles = {};
        const importantProps = [
            'display', 'position', 'flexDirection', 'alignItems', 'justifyContent',
            'width', 'height', 'backgroundColor', 'color', 'padding', 'margin',
            'borderRadius', 'borderWidth', 'borderColor', 'fontSize', 'fontWeight',
            'fontFamily', 'textAlign', 'boxShadow', 'opacity', 'zIndex', 'gap'
        ];

        importantProps.forEach(prop => {
            styles[prop] = computed[prop];
        });

        return styles;
    }

    function traverse(node) {
        if (node.nodeType !== 1) return null; // Only elements

        const tagName = node.tagName.toLowerCase();
        if (['script', 'style', 'noscript', 'iframe'].includes(tagName)) return null;

        const el = {
            type: tagName === 'img' ? 'image' : (tagName === 'button' ? 'button' : (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span'].includes(tagName) ? 'text' : 'box')),
            content: (tagName === 'text' || tagName === 'button') ? node.innerText : undefined,
            props: {
                src: tagName === 'img' ? node.src : undefined,
                href: tagName === 'a' ? node.href : undefined
            },
            styles: getElementStyles(node),
            children: []
        };

        if (tagName === 'text') {
            el.content = node.innerText;
        }

        node.childNodes.forEach(child => {
            const childEl = traverse(child);
            if (childEl) el.children.push(childEl);
        });

        return el;
    }

    // Capture from body
    return traverse(document.body);
}
