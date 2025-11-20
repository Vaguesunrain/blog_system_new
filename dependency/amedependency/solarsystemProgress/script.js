function updateProgress(percentage) {
    const progressFill = document.querySelector('.progress-fill');
    const celestialBodies = document.querySelectorAll('.celestial-body');

    // Ensure percentage is between 0 and 100
    const validPercentage = Math.max(0, Math.min(100, percentage));

    // Update the fill width
    progressFill.style.width = `${validPercentage}%`;

    // Determine which bodies are 'active' (reached by progress)
    const progressPoint = validPercentage / 100; // Convert percentage to 0-1 scale

    celestialBodies.forEach(body => {
        const bodyPosition = parseFloat(body.dataset.position);

        // Add/remove 'active' class based on position vs progress
        // A body is active if its position is at or before the progress point
        if (bodyPosition <= progressPoint) {
            body.classList.add('active');
        } else {
            body.classList.remove('active');
        }

        // Special case: If progress is exactly 0, only the Sun (pos 0) should be active.
        // The loop already handles this, but good to be aware.
        // Special case: If progress is exactly 100, all should be active. Loop handles this too.
    });
}

// --- Initial Setup ---
// Set the initial progress (e.g., 30%) when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const initialProgress = 60; // Set your desired initial progress here
    updateProgress(initialProgress);

    // Update slider value if using the optional control
    const progressInput = document.getElementById('progressInput');
     const progressValueSpan = document.getElementById('progressValue');
    if (progressInput) {
        progressInput.value = initialProgress;
        progressValueSpan.textContent = initialProgress + '%';
    }
});
