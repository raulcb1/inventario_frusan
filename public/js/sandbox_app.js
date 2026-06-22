document.addEventListener("DOMContentLoaded", () => {
    const logType = document.getElementById("log-type");
    const logRaw = document.getElementById("log-raw");
    const logFiltered = document.getElementById("log-filtered");
    const videoCanvas = document.getElementById("ocr-canvas");

    const html5QrcodeScanner = new Html5Qrcode("reader");

    // Inyectar un selector de escenario en la interfaz de forma dinámica para la prueba
    const cardResultados = document.querySelector(".result-box").parentNode;
    const selectorEscenario = document.createElement("div");
    selectorEscenario.innerHTML = `
        <label style="display:block; margin: 10px 0 5px 0; font-weight:bold;">Escenario de Prueba:</label>
        <select id="mock-escenario" style="width:100%; padding:10px; border-radius:5px; margin-bottom:15px;">
            <option value="1">1. Equipo Nuevo / Usuario Encontrado</option>
            <option value="2">2. Mismo Equipo / Mismo Usuario (Validación)</option>
            <option value="3">3. Equipo Distinto / Discrepancia</option>
        </select>
        <button id="btn-enviar-api" style="background-color: #28a745; width: 100%;">Enviar Datos a API PHP</button>
    `;
    cardResultados.insertBefore(selectorEscenario, cardResultados.firstChild);

    // Variable local para almacenar temporalmente el último código obtenido
    let ultimoCodigoCapturado = "";

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
                ultimoCodigoCapturado = decodedText.trim();
                logFiltered.innerText = ultimoCodigoCapturado;
                html5QrcodeScanner.stop();
            },
            () => {}
        ).catch((err) => { logRaw.innerText = `Error: ${err}`; });
    });

    // Lógica del Escáner OCR (Captura de Texto de Etiquetas)
    document.getElementById("btn-capture-ocr").addEventListener("click", async () => {
        logType.innerText = "Reconocimiento de Texto (OCR)";
        logRaw.innerText = "Iniciando cámara para captura de fotograma...";
        logFiltered.innerText = "-";

        if (html5QrcodeScanner.isScanning) { await html5QrcodeScanner.stop(); }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "environment" }, 
                audio: false 
            });
            
            const videoTemporal = document.createElement("video");
            videoTemporal.srcObject = stream;
            videoTemporal.setAttribute("playsinline", "true");
            await videoTemporal.play();

            logRaw.innerText = "Procesando imagen con IA local (Tesseract)...";

            const textoExtraido = await procesarFotogramaOCR(videoTemporal, videoCanvas);
            stream.getTracks().forEach(track => track.stop());

            logRaw.innerText = textoExtraido;
            ultimoCodigoCapturado = filtrarTextoSerie(textoExtraido);
            logFiltered.innerText = ultimoCodigoCapturado;

        } catch (error) {
            logRaw.innerText = `Error en captura OCR: ${error.message}`;
        }
    });

    // Petición Asíncrona hacia el Backend PHP (Fetch API)
    document.getElementById("btn-enviar-api").addEventListener("click", async () => {
        if (!ultimoCodigoCapturado || ultimoCodigoCapturado === "No se detectó patrón de Serie estándar") {
            alert("Primero debes capturar un código válido mediante barras o OCR.");
            return;
        }

        const payload = {
            tipo_lectura: logType.innerText,
            codigo_capturado: ultimoCodigoCapturado,
            escenario: document.getElementById("mock-escenario").value
        };

        logFiltered.innerText = "Enviando a la API...";

        try {
            // Se asume la estructura relativa desde /public/sandbox.html hacia /api/sandbox_test.php
            const respuesta = await fetch('../api/sandbox_test.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const resultadoJson = await respuesta.json();

            if (respuesta.ok) {
                logFiltered.innerHTML = `<span style="color:green; font-weight:bold;">Éxito (ID: ${resultadoJson.data.transaccion_id})</span><br><pre>${JSON.stringify(resultadoJson.data, null, 2)}</pre>`;
            } else {
                logFiltered.innerHTML = `<span style="color:red; font-weight:bold;">Error de API: ${resultadoJson.message}</span>`;
            }

        } catch (error) {
            logFiltered.innerHTML = `<span style="color:red; font-weight:bold;">Error de red/servidor: ${error.message}</span>`;
        }
    });

    document.getElementById("btn-stop").addEventListener("click", () => {
        if (html5QrcodeScanner.isScanning) {
            html5QrcodeScanner.stop().then(() => { logRaw.innerText = "Cámara detenida."; });
        }
    });
});