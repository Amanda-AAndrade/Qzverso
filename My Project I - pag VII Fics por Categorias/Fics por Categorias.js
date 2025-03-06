document.querySelectorAll('.carrossel').forEach(carrossel => {
    carrossel.addEventListener('wheel', (event) => {
        event.preventDefault();
        carrossel.scrollLeft += event.deltaY;
    });
});
