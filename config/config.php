<?php
/**
 * Configuración Global del Sistema - Inventario Frusan
 */

// Detectar entorno seguro (HTTPS requerido para uso de cámara)
$protocolo = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? "https://" : "http://";
$dominio = $_SERVER['HTTP_HOST'];

// Definición de URL Base adaptativa
// Si estás en local con XAMPP apuntará a http://localhost/inventario_frusan/
// Si se sube al hosting apuntará automáticamente a https://dominio-amiga.com/carpeta/
define('BASE_URL', $protocolo . $dominio . str_replace('/api', '', dirname($_SERVER['SCRIPT_NAME'])) . '/');

// Configuración temporal de cabeceras para desarrollo
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Manejo de errores en desarrollo (cambiar a 0 en producción)
ini_set('display_errors', 1);
error_reporting(E_ALL);