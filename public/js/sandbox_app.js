document.addEventListener("DOMContentLoaded", () => {
    const logType = document.getElementById("log-type");
    const logRaw = document.getElementById("log-raw");
    const logFiltered = document.getElementById("log-filtered");

    // Instancia del escáner (html5-qrcode)
    const html5QrcodeScanner = new Html5Qrcode("reader");

    document.getElementById("btn-scan-barcode").addEventListener("click", () => {
        logType.innerText = "Código de Barras / QR";
        logRaw.innerText = "Iniciando cámara...";
        
        const config = { fps: 10, qrbox: { width: 250, height: 150 } };
        
        html5QrcodeScanner.start(
            { facingMode: "environment" }, // Forzar cámara trasera
            config,
            (decodedText, decodedResult) => {
                // Éxito al escanear
                logRaw.innerText = decodedText;
                logFiltered.innerText = decodedText.trim(); // Simulación inicial de filtro
                html5QrcodeScanner.stop();
            },
            (errorMessage) => {
                // Error de lectura continuo (ignorar para evitar spam en log)
            }
        ).catch((err) => {
            logRaw.innerText = `Error de inicialización: ${err}`;
        });
    });

    document.getElementById("btn-stop").addEventListener("click", () => {
        if (html5QrcodeScanner.isScanning) {
            html5QrcodeScanner.stop().then(() => {
                logRaw.innerText = "Cámara detenida.";
            });
        }
    });
});