document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('firma-pad');
    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }

    const clearButton = document.getElementById('clear-firma');

    // --- GESTIONE RETINA / PIXEL RATIO ---
    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
    }

    const ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    function getRelativePosition(e) {
        const rect = canvas.getBoundingClientRect();
        let clientX = e.clientX, clientY = e.clientY;
        // Per compatibilità: se è un event touch (alcuni browser vecchi)
        if (typeof e.touches !== "undefined" && e.touches.length) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }
        return [clientX - rect.left, clientY - rect.top];
    }

    function draw(e) {
        if (!isDrawing) return;
        const [currentX, currentY] = getRelativePosition(e);
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
        [lastX, lastY] = [currentX, currentY];
        e.preventDefault && e.preventDefault();
    }

    function handleStart(e) {
        isDrawing = true;
        [lastX, lastY] = getRelativePosition(e);
        e.preventDefault && e.preventDefault();
    }

    function handleEnd(e) {
        isDrawing = false;
        e && e.preventDefault && e.preventDefault();
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Pointer Events (mouse, touch, pen) - con passive:false per fluidità su mobile
    canvas.addEventListener('pointerdown', handleStart, {passive: false});
    canvas.addEventListener('pointermove', draw, {passive: false});
    canvas.addEventListener('pointerup', handleEnd, {passive: false});
    canvas.addEventListener('pointerout', handleEnd, {passive: false});
    canvas.addEventListener('pointercancel', handleEnd, {passive: false});

    // Previeni scroll su tutto il canvas mentre si disegna (importante per iOS e Android)
    canvas.addEventListener('touchstart', e => { if (isDrawing) e.preventDefault(); }, {passive: false});
    canvas.addEventListener('touchmove', e => { if (isDrawing) e.preventDefault(); }, {passive: false});

    // Pulsante per cancellare
    if (clearButton) {
        clearButton.addEventListener('click', clearCanvas);
    }
});