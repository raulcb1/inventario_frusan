/**
 * Módulo de procesamiento OCR mediante Tesseract.js
 */
async function procesarFotogramaOCR(videoElement, canvasElement) {
    const ctx = canvasElement.getContext('2d');
    
    // Configurar dimensiones del canvas idénticas al flujo de video activo
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    
    // Volcar el fotograma actual del video en el lienzo
    ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
    
    // Inicializar el Worker de Tesseract especificando idioma español e inglés (común en etiquetas de TI)
    const worker = Tesseract.createWorker();
    await worker.load();
    await worker.loadLanguage('eng+spa');
    await worker.initialize('eng+spa');
    
    // Ejecutar el reconocimiento sobre el área capturada del canvas
    const { data: { text } } = await worker.recognize(canvasElement);
    await worker.terminate();
    
    return text;
}

/**
 * Filtra el texto plano obtenido mediante expresiones regulares
 * para extraer patrones comunes de números de serie (S/N o Serial)
 */
function filtrarTextoSerie(textoBruto) {
    if (!textoBruto) return "";
    
    // Limpieza básica: remueve saltos de línea excesivos y espacios vacíos
    let textoLimpio = textoBruto.replace(/\s+/g, ' ').trim();
    
    // Expresión regular de prueba: busca cadenas alfanuméricas de 6 a 15 caracteres 
    // que suelan aparecer después de indicadores comunes como S/N, SN, SERIE o SERIAL
    const regexSerie = /(?:sn|s\/n|serial|serie)[:.\-\s]*([A-Z0-9]{6,15})/i;
    const coincidencia = textoLimpio.match(regexSerie);
    
    if (coincidencia && coincidencia[1]) {
        return coincidencia[1].toUpperCase(); // Retorna solo el grupo capturado (el número de serie)
    }
    
    return "No se detectó patrón de Serie estándar";
}