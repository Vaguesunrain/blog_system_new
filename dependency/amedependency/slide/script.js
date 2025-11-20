const slidesWrapper = document.querySelector('.slides-wrapper');
const slides = document.querySelectorAll('.slide');
const dotsContainer = document.querySelector('.dots-container');
let slideIndex = 0;
let slideInterval;
const slideTime = 3000; // Time per slide in milliseconds (3 seconds)

// --- Create Dots ---
function createDots() {
    // Clear existing dots first
    dotsContainer.innerHTML = '';
    // Create a dot for each slide
    slides.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        // Add click event to go to that slide
        dot.addEventListener('click', () => {
            showSlide(index);
            resetInterval(); // Reset timer on manual click
        });
        dotsContainer.appendChild(dot);
    });
}

// --- Update Dots ---
function updateDots() {
    const dots = dotsContainer.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === slideIndex);
    });
    // Mimic the dots in the original image (1 dark, 2 grey) - this part is tricky if slides > 1
     if (slides.length >= 3) {
         dots[0].style.backgroundColor = '#333'; // Dark
         dots[1].style.backgroundColor = '#aaa'; // Medium grey
         dots[2].style.backgroundColor = '#ccc'; // Light grey
         // Apply 'active' class based on slideIndex, potentially overriding the grey
         if (slideIndex < dots.length) {
             dots[slideIndex].classList.add('active'); // Make the current one active (dark)
             // Reset others if needed, ensuring the base greys are set first
             for(let i=0; i<dots.length; i++) {
                 if (i !== slideIndex) {
                     dots[i].style.backgroundColor = '#bbb'; // Default for extras
                     dots[i].classList.remove('active');
                 } else {
                     dots[slideIndex].style.backgroundColor = '#333'; // Active is always dark
                 }
             }
         }

     } else if (slides.length === 1) {
         // If only one slide, just show one active dot
         dots[0].classList.add('active');
     } else {
         // Default behaviour for other cases
         dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === slideIndex);
            dot.style.backgroundColor = ''; // Reset specific grey styles
         });
     }


}


// --- Show Slide ---
function showSlide(index) {
    if (index >= slides.length) {
        slideIndex = 0; // Loop back to start
    } else if (index < 0) {
        slideIndex = slides.length - 1; // Loop back to end
    } else {
        slideIndex = index;
    }

    // Calculate the transform value to move the wrapper
    const offset = -slideIndex * 100;
    slidesWrapper.style.transform = `translateX(${offset}%)`;

    updateDots();
}

// --- Next Slide ---
function nextSlide() {
    showSlide(slideIndex + 1);
}

// --- Automatic Sliding ---
function startInterval() {
    // Only start interval if there's more than one slide
    if (slides.length > 1) {
        slideInterval = setInterval(nextSlide, slideTime);
    }
}

function resetInterval() {
    clearInterval(slideInterval);
    startInterval();
}

// --- Initialize ---
if (slides.length > 0) {
    createDots(); // Create dots based on the number of slides found
    showSlide(0); // Show the first slide initially
    startInterval(); // Start automatic switching
} else {
    console.warn("No slides found in the slideshow container.");
    // Optionally display a message if no slides are present
    slidesWrapper.innerHTML = "<p style='text-align:center; padding: 20px; width: 100%;'>No images to display.</p>";
}
