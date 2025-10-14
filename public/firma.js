// Funzione di init firma su un canvas con clear button + overlay blocco esterno
function initFirmaPad(canvasId, clearButtonId, lineWidth = 5) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas element ${canvasId} not found!`);
        return;
    }
    const clearButton = document.getElementById(clearButtonId);
    const ctx = canvas.getContext('2d');

    // Variabile globale per tenere la firma tra i resize
    let firmaDataUrl = null;
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // Crea overlay una sola volta
    let overlay = document.getElementById('firma-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'firma-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = 0;
        overlay.style.left = 0;
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.background = 'rgba(0,0,0,0.02)';
        overlay.style.zIndex = 10000;
        overlay.style.display = 'none';
        overlay.style.touchAction = 'none';
        overlay.style.userSelect = 'none';
        overlay.addEventListener('pointerdown', (e) => e.preventDefault());
        overlay.addEventListener('touchstart', (e) => e.preventDefault());
        document.body.appendChild(overlay);
    }

    function resizeCanvas() {
        // Salva la firma solo se NON si sta disegnando
        if (!isDrawing && canvas.width > 0 && canvas.height > 0) {
            // console.log("Salvo firmaDataUrl");
            firmaDataUrl = canvas.toDataURL();
        }
        // Ridimensiona il canvas
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);

        // Ripristina la firma, se c'è
        if (firmaDataUrl) {
            const img = new window.Image();
            img.onload = function() {
                ctx.drawImage(img, 0, 0, canvas.width / dpr, canvas.height / dpr);
            };
            img.src = firmaDataUrl;
        }
    }

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', resizeCanvas);

    // Inizializza canvas
    resizeCanvas();

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    function getRelativePosition(e) {
        const rect = canvas.getBoundingClientRect();
        let clientX = e.clientX, clientY = e.clientY;
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

        // Overlay sopra tutto
        if (overlay) overlay.style.display = 'block';
        canvas.style.position = 'relative';
        canvas.style.zIndex = 10001;
        e.preventDefault && e.preventDefault();
    }

    function handleEnd(e) {
        isDrawing = false;
        // Salva la firma dopo aver disegnato/completato il tratto
        firmaDataUrl = canvas.toDataURL();

        if (overlay) overlay.style.display = 'none';
        canvas.style.zIndex = '';
        e && e.preventDefault && e.preventDefault();
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        firmaDataUrl = null;
    }

    // Pointer Events (mouse, touch, pen)
    canvas.addEventListener('pointerdown', handleStart, {passive: false});
    canvas.addEventListener('pointermove', draw, {passive: false});
    canvas.addEventListener('pointerup', handleEnd, {passive: false});
    canvas.addEventListener('pointerout', handleEnd, {passive: false});
    canvas.addEventListener('pointercancel', handleEnd, {passive: false});

    // Previeni scroll su tutto il canvas mentre si disegna (mobile)
    canvas.addEventListener('touchstart', e => { if (isDrawing) e.preventDefault(); }, {passive: false});
    canvas.addEventListener('touchmove', e => { if (isDrawing) e.preventDefault(); }, {passive: false});

    if (clearButton) {
        clearButton.addEventListener('click', clearCanvas);
    }
}
window.initFirmaPad = initFirmaPad;

document.addEventListener('DOMContentLoaded', () => {
    // Inizializza la firma principale con spessore 7 (puoi cambiare a piacere)
    initFirmaPad('firma-pad', 'clear-firma', 7);

    // La firma SDD sarà inizializzata dinamicamente dal codice della pagina (come già avviene),
    // ma ora puoi passarle anche lo spessore desiderato (es: 5 o quello che preferisci):
    // Esempio: window.initFirmaPad('firma-debitore-sdd-pad', 'clear-firma-debitore-sdd', 7);
});