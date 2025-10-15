// Firma.js - versione robusta per Chrome PWA e Edge con avviso per versioni bug
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

    // Overlay blocco eventi esterni
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

    // Funzione di ripristino firma dal localStorage
    function restoreSignature() {
        if (!firmaDataUrl) {
            firmaDataUrl = localStorage.getItem(canvasId + "_firma") || null;
        }
        const dpr = window.devicePixelRatio || 1;
        if (firmaDataUrl) {
            const img = new window.Image();
            img.onload = function() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width / dpr, canvas.height / dpr);
            };
            img.src = firmaDataUrl;
        }
    }

    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        restoreSignature();
    }

    // Eventi che potrebbero causare perdita canvas
    window.addEventListener('resize', () => { resizeCanvas(); maybeWarnChromeBug(); });
    window.addEventListener('orientationchange', () => { resizeCanvas(); maybeWarnChromeBug(); });
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', () => { resizeCanvas(); maybeWarnChromeBug(); });
    }
    window.addEventListener('pageshow', restoreSignature);
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) restoreSignature();
    });

    // Inizializza canvas e ripristina all'avvio
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
        if (overlay) overlay.style.display = 'block';
        canvas.style.position = 'relative';
        canvas.style.zIndex = 10001;
        e.preventDefault && e.preventDefault();
    }

    function handleEnd(e) {
        isDrawing = false;
        // Salva la firma dopo ogni tratto
        firmaDataUrl = canvas.toDataURL();
        localStorage.setItem(canvasId + "_firma", firmaDataUrl);
        if (overlay) overlay.style.display = 'none';
        canvas.style.zIndex = '';
        e && e.preventDefault && e.preventDefault();
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        firmaDataUrl = null;
        localStorage.removeItem(canvasId + "_firma");
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

// Avviso per bug Chrome specifico
function getChromeVersion() {
    const match = navigator.userAgent.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/);
    return match ? match[1] : null;
}
const chromeBugVersions = [
    "141.0.7390.70"
];
function maybeWarnChromeBug() {
    const ver = getChromeVersion();
    if (ver && chromeBugVersions.includes(ver)) {
        alert("ATTENZIONE: La versione di Chrome che stai usando su questo dispositivo può perdere la firma se ruoti lo schermo o cambi orientamento. Ti consigliamo di salvare la firma o aggiornare il browser.");
    }
}

// Ripristina sempre la firma all'avvio pagina
document.addEventListener('DOMContentLoaded', () => {
    initFirmaPad('firma-pad', 'clear-firma', 7);
    // Se vuoi altre istanze: initFirmaPad('altra-id', 'altro-clear-btn', spessore);

});