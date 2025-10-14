// Funzione di init firma su un canvas con clear button + overlay blocco esterno
// Ora puoi specificare lo spessore della penna (lineWidth) come terzo parametro opzionale
function initFirmaPad(canvasId, clearButtonId, lineWidth = 5) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas element ${canvasId} not found!`);
        return;
    }
    const clearButton = document.getElementById(clearButtonId);

    // Crea l'overlay una sola volta per pagina
    let overlay = document.getElementById('firma-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'firma-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = 0;
        overlay.style.left = 0;
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.background = 'rgba(0,0,0,0.02)'; // quasi invisibile
        overlay.style.zIndex = 10000;
        overlay.style.display = 'none';
        overlay.style.touchAction = 'none';
        overlay.style.userSelect = 'none';
        // Previeni tutto fuori dal canvas!
        overlay.addEventListener('pointerdown', (e) => e.preventDefault());
        overlay.addEventListener('touchstart', (e) => e.preventDefault());
        document.body.appendChild(overlay);
    }

    function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
}
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', resizeCanvas);

    const ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    ctx.strokeStyle = '#000000'; // nero pieno
    ctx.lineWidth = lineWidth;   // personalizzabile (default 5)
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

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

        // Mostra overlay sopra tutto
        if (overlay) {
            overlay.style.display = 'block';
        }
        // Porta il canvas sopra l'overlay
        canvas.style.position = 'relative';
        canvas.style.zIndex = 10001;

        e.preventDefault && e.preventDefault();
    }

    function handleEnd(e) {
        isDrawing = false;
        // Nascondi l'overlay
        if (overlay) {
            overlay.style.display = 'none';
        }
        canvas.style.zIndex = '';
        e && e.preventDefault && e.preventDefault();
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
       
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
    // (vedi script inline in pagina3.html)
});