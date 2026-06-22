document.addEventListener("DOMContentLoaded", () => {
    const logType = document.getElementById("log-type");
    const logRaw = document.getElementById("log-raw");
    const logFiltered = document.getElementById("log-filtered");
    const videoCanvas = document.getElementById("ocr-canvas");

    const html5QrcodeScanner = new Html5Qrcode("reader");

    // Lógica del Escáner de Códigos de Barras / QR
    document.getElementById("btn-scan-barcode").addEventListener("click", () => {
        logType.innerText = "Código de Barras / QR";
        logRaw.innerText = "Iniciando cámara...";
        logFiltered.innerText = "-";
        
        const config = { fps: 10, qrbox: { width: 250, height: 150 } };
        
        html5QrcodeScanner.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
                logRaw.innerText = decodedText;
                logFiltered.innerText = decodedText.trim();
                html5QrcodeScanner.stop();
            },
            () => {}
        ).catch((err) => {
            logRaw.innerText = `Error: ${err}`;
        });
    });

    // Lógica del Escáner OCR (Captura de Texto de Etiquetas)
    document.getElementById("btn-capture-ocr").addEventListener("click", async () => {
        logType.innerText = "Reconocimiento de Texto (OCR)";
        logRaw.innerText = "Iniciando cámara para captura de fotograma...";
        logFiltered.innerText = "-";

        // Si el escáner de códigos está activo, detenerlo primero
        if (html5QrcodeScanner.isScanning) {
            await html5QrcodeScanner.stop();
        }

        // Levantar el feed de video nativo para congelar el fotograma
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "environment" }, 
                audio: false 
            });
            
            // Crear elemento de video temporal fuera de la vista para transferir el stream al canvas
            const videoTemporal = document.createElement("video");
            videoTemporal.srcObject = stream;
            videoTemporal.setAttribute("playsinline", "true");
            await videoTemporal.play();

            logRaw.innerText = "Procesando imagen con IA local (Tesseract)...";

            // Ejecutar la extracción definida en ocr.js
            const textoExtraido = await procesarFotogramaOCR(videoTemporal, videoCanvas);
            
            // Apagar la cámara tras la captura
            stream.getTracks().forEach(track => track.stop());

            // Mostrar resultados en el panel
            logRaw.innerText = textoExtraido;
            logFiltered.innerText = filtrarTextoSerie(textoExtraido);

        } catch (error) {
            logRaw.innerText = `Error en captura OCR: ${error.message}`;
        }
    });

    document.getElementById("btn-stop").addEventListener("click", () => {
        if (html5QrcodeScanner.isScanning) {
            html5QrcodeScanner.stop().then(() => {
                logRaw.innerText = "Cámara detenida.";
            });
        }
    });
});