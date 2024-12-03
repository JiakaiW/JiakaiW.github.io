---
layout: default
title: Photos
---

<style>
.photo-gallery {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2em;
}

.photo-gallery h1 {
    text-align: center;
    margin-bottom: 2em;
    font-size: 2.5em;
}

.carousel {
    position: relative;
    max-width: 800px;
    margin: 0 auto;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.carousel-images {
    display: flex;
    transition: transform 0.5s ease-in-out;
}

.carousel-images img {
    width: 100%;
    flex-shrink: 0;
    object-fit: cover;
}

.carousel-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background-color: rgba(0, 0, 0, 0.6);
    color: white;
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2em;
    transition: background-color 0.3s ease;
}

.carousel-button:hover {
    background-color: rgba(0, 0, 0, 0.8);
}

.carousel-button.prev {
    left: 20px;
}

.carousel-button.next {
    right: 20px;
}

.photo-description {
    text-align: center;
    margin-top: 1.5em;
    font-size: 1.1em;
    color: var(--color-primary);
}
</style>

<div class="photo-gallery">
    <h1>Photo Gallery</h1>
    
    <div class="carousel">
        <div class="carousel-images">
            <img src="/files/photo.jpg" alt="My Photo" />
            <img src="/files/lab_tour.png" alt="tour @Roman Kuzmin's lab" />
            <img src="/files/tracker.jpg" alt="My Photo with a bunch of sheep" />
            <!-- <img src="/files/sheep.jpg" alt="My Photo with a bunch of sheep" /> -->
        </div>
        <button class="carousel-button prev" onclick="moveSlide(-1)">&#10094;</button>
        <button class="carousel-button next" onclick="moveSlide(1)">&#10095;</button>
    </div>
    
    <div class="photo-description">
        A collection of memorable moments and adventures
    </div>
</div>

<script>
let currentSlide = 0;

function moveSlide(direction) {
    const slides = document.querySelectorAll('.carousel-images img');
    const totalSlides = slides.length;
    currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
    const offset = -currentSlide * 100;
    document.querySelector('.carousel-images').style.transform = `translateX(${offset}%)`;
}
</script> 