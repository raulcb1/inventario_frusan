<?php
/**
 * Endpoint de pruebas para recepción de datos del inventario
 */
require_once __DIR__ . '/../config/config.php';

// Capturar el método de la petición
$metodo = $_SERVER['REQUEST_METHOD'];

// Manejo de peticiones preflight (OPTIONS) para evitar bloqueos CORS en pruebas locales
if ($metodo === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($metodo !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Método no permitido. Utilice POST."]);
    exit();
}

// Leer el flujo de entrada de la petición (Raw Input JSON)
$inputRaw = file_get_contents("php://input");
$datos = json_decode($inputRaw, true);

// Validar que el archivo JSON sea válido
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "JSON inválido o malformado."]);
    exit();
}

// Campos mínimos requeridos para la prueba de captura
$camposRequeridos = ['tipo_lectura', 'codigo_capturado', 'escenario'];
foreach ($camposRequeridos as $campo) {
    if (!isset($datos[$campo]) || empty(trim($datos[$campo]))) {
        http_response_code(422);
        echo json_encode(["status" => "error", "message" => "El campo '{$campo}' es obligatorio para el procesamiento."]);
        exit();
    }
}

// Simulación de procesamiento lógico y almacenamiento (Mocking)
$idSimulado = rand(1000, 9999);
$respuestaSimulada = [
    "status" => "success",
    "message" => "Datos recibidos correctamente por la API backend",
    "data" => [
        "transaccion_id" => $idSimulado,
        "tipo_lectura" => htmlspecialchars($datos['tipo_lectura']),
        "codigo_capturado" => htmlspecialchars(trim($datos['codigo_capturado'])),
        "escenario_detectado" => intval($datos['escenario']),
        "fecha_registro" => date('Y-m-d H:i:s'),
        "entorno_servidor" => "XAMPP / PHP " . PHP_VERSION
    ]
];

// Retornar confirmación estructurada
http_response_code(200);
echo json_encode($respuestaSimulada);