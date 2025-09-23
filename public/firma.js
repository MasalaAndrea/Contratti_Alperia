document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('firma-pad');
    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }

    const ctx = canvas.getContext('2d');
    const clearButton = document.getElementById('clear-firma');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // Configura lo stile di disegno
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    function draw(e) {
        if (!isDrawing) return;
        
        let clientX, clientY;
        if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const rect = canvas.getBoundingClientRect();
        const currentX = clientX - rect.left;
        const currentY = clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
        
        [lastX, lastY] = [currentX, currentY];
    }

    function handleStart(e) {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;
        if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        [lastX, lastY] = [clientX - rect.left, clientY - rect.top];
        e.preventDefault();
    }

    function handleEnd() {
        isDrawing = false;
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // Eventi per mouse
    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', handleEnd);
    canvas.addEventListener('mouseout', handleEnd);
    
    // Eventi per touch
    canvas.addEventListener('touchstart', handleStart);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', handleEnd);
    
    // Pulsante per cancellare
    clearButton.addEventListener('click', clearCanvas);
});