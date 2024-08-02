document.addEventListener("DOMContentLoaded", function() {
    const lis = document.querySelectorAll(".circles li");

    lis.forEach(li => {
        const size = Math.floor(Math.random() * (80 - 20 + 1)) + 20;
        const color = getRandomColor();
        const left = Math.floor(Math.random() * 100); // Pourcentage de la position de gauche
        const delay = Math.random() * 10; // Délai aléatoire pour l'animation
        const duration = 10 + Math.random() * 30; // Durée aléatoire de l'animation entre 10s et 40s

        li.style.width = `${size}px`;
        li.style.height = `${size}px`;
        li.style.backgroundColor = color;
        li.style.left = `${left}%`;
        li.style.animationDelay = `${delay}s`;
        li.style.animationDuration = `${duration}s`;
    });

    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
});
