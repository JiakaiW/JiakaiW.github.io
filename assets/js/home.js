async function expandCard(cardId) {
    const overlay = document.getElementById('cardOverlay');
    const content = document.getElementById('expandedContent');
    
    try {
        // Use the cardId directly as it now contains the full path
        const fetchPath = cardId;
        
        // Fetch the content
        const response = await fetch(fetchPath);
        const html = await response.text();
        
        // Extract the main content
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const mainContent = doc.querySelector('main').innerHTML;
        
        // Insert the content
        content.innerHTML = mainContent;
        
        // Position the overlay relative to current viewport
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        overlay.style.top = `${scrollTop}px`;
        
        // Show the overlay
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    } catch (error) {
        console.error('Error loading content:', error);
    }
}

function closeExpandedCard() {
    const overlay = document.getElementById('cardOverlay');
    overlay.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
    overlay.style.top = '0'; // Reset position
}

function expandPhoto(src, caption) {
    const overlay = document.getElementById('cardOverlay');
    const content = document.getElementById('expandedContent');
    
    content.innerHTML = `
        <img src="${src}" alt="${caption}" style="max-width: 100%; max-height: 80vh; object-fit: contain;">
        <p style="text-align: center; margin-top: 1em;">${caption}</p>
    `;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    overlay.style.top = `${scrollTop}px`;
    
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

document.addEventListener('DOMContentLoaded', setAnimationDelays);

/**
 * Automatically adjusts the font size of text within a container to ensure it fits.
 */
function autoSizeText() {
    const textContainers = document.querySelectorAll('.card-text');

    textContainers.forEach(container => {
        // Ensure the text is wrapped in a span for accurate measurement
        if (!container.querySelector('span')) {
            container.innerHTML = `<span>${container.textContent.trim()}</span>`;
        }
        const textSpan = container.querySelector('span');
        if (!textSpan) return;

        const style = window.getComputedStyle(container);
        const paddingTop = parseFloat(style.paddingTop);
        const paddingBottom = parseFloat(style.paddingBottom);
        const paddingLeft = parseFloat(style.paddingLeft);
        const paddingRight = parseFloat(style.paddingRight);

        const availableHeight = container.clientHeight - paddingTop - paddingBottom;
        const availableWidth = container.clientWidth - paddingLeft - paddingRight;

        // Reset font size to the initial one from CSS to handle resizes
        textSpan.style.fontSize = ''; 
        let currentFontSize = parseFloat(window.getComputedStyle(textSpan).fontSize);

        // Iteratively reduce font size until it fits both dimensions
        while (
            (textSpan.scrollHeight > availableHeight || textSpan.scrollWidth > availableWidth) && 
            currentFontSize > 8 // Set a minimum font size of 8px
        ) {
            currentFontSize--;
            textSpan.style.fontSize = `${currentFontSize}px`;
        }
    });
}

// Run auto-sizing on initial load and on window resize
document.addEventListener('DOMContentLoaded', autoSizeText);
window.addEventListener('resize', autoSizeText); 