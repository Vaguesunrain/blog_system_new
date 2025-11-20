const langSwitchButton = document.getElementById('langSwitchButton');

// Function to toggle the language state
function toggleLanguage() {
    const isChineseActive = langSwitchButton.classList.contains('chinese-active');

    if (isChineseActive) {
        // Switch to English
        langSwitchButton.classList.remove('chinese-active');
        langSwitchButton.setAttribute('aria-label', 'Switch to Chinese');
        console.log("Switched to English");
        // Add any other logic needed when switching to EN
    } else {
        // Switch to Chinese
        langSwitchButton.classList.add('chinese-active');
        langSwitchButton.setAttribute('aria-label', 'Switch to English');
        console.log("Switched to Chinese");
        // Add any other logic needed when switching to ZH
    }
}

// Event listener for mouse click
langSwitchButton.addEventListener('click', toggleLanguage);

// Event listener for keyboard interaction (Enter or Space)
langSwitchButton.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault(); // Prevent spacebar from scrolling page
        toggleLanguage();
    }
});
