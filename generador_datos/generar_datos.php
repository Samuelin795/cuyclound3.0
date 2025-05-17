<?php
date_default_timezone_set('America/Lima');

// Configuración de la DB
$servername = "buozjrm4aihgms75kuk6-mysql.services.clever-cloud.com";
$username = "uqmrrimvkufu81dw";
$password = "wxw4fb1ZXgrTub49OcLq";
$dbname = "buozjrm4aihgms75kuk6";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

$equipos = ['0001', '0002', '0003', '0004', '0005'];
$now = date('Y-m-d H:i:00');

// Función para obtener el estado de "ventilacion" basado en la temperatura
function obtenerVentilacion($temperatura_aire) {
    // Si la temperatura es mayor a 25°C, se activa la ventilación
    return ($temperatura_aire > 25) ? 'Si' : 'No';
}

// Función para obtener el estado de "limpiarpoza" basado en suelohumedo
function obtenerLimpieza($suelohumedo) {
    // Si suelohumedo es 'Si', la limpieza es 'Si'. Si es 'No', la limpieza es 'No'.
    return ($suelohumedo == 'Si') ? 'Si' : 'No';
}

// Función para obtener si la temperatura está controlada
function obtenerTemperaturaControlada($temperatura_aire) {
    // Si la temperatura está entre 20°C y 25°C, se considera controlada
    return ($temperatura_aire >= 20 && $temperatura_aire <= 25) ? 'Si' : 'No';
}

// Función para obtener si la humedad está controlada
function obtenerHumedadControlada($humedad_aire) {
    // Si la humedad está entre 40% y 60%, se considera controlada
    return ($humedad_aire >= 40 && $humedad_aire <= 60) ? 'Si' : 'No';
}

// Función para obtener el estado de "suelohumedo" dependiendo de la humedad del suelo
function obtenerSuelohumedo($humedad_suelo) {
    // Si la humedad del suelo es mayor que 50%, suelohumedo es 'Si'
    // Si la humedad del suelo es menor o igual a 50%, suelohumedo es 'No'
    return ($humedad_suelo > 50) ? 'Si' : 'No';
}

foreach ($equipos as $index => $id_equipo) {
    // Personalizar los valores con el índice o ID
    $temp_aire = rand(20 + $index * 2, 25 + $index * 2); // difieren por equipo
    $humedad_aire = rand(40 + $index * 5, 60 + $index * 5);
    $amoniaco = rand(5, 20);
    $temp_suelo = rand(18 + $index, 22 + $index);
    $humedad_suelo = rand(30 + $index * 3, 60);

    // Obtener el estado de ventilación
    $ventilacion = obtenerVentilacion($temp_aire);

    // Obtener el estado de suelohumedo (dependiendo de la humedad del suelo)
    $suelohumedo = obtenerSuelohumedo($humedad_suelo);

    // Obtener el estado de limpiarpoza (dependiendo de suelohumedo)
    $limpiarpoza = obtenerLimpieza($suelohumedo);

    // Obtener el estado de temperatura controlada
    $temperatura_controlada = obtenerTemperaturaControlada($temp_aire);

    // Obtener el estado de humedad controlada
    $humedad_controlada = obtenerHumedadControlada($humedad_aire);

    // Insertar los datos con los nuevos campos
    $sql = "INSERT INTO datos_tucuy (
                id_equipo, fechahora, temperatura_aire, humedad_aire, amoniaco, temperatura_suelo, humedad_suelo, 
                ventilacion, limpiarpoza, temperaturacontrolada, humedadcontrolada, suelohumedo
            ) VALUES (
                '$id_equipo', '$now', $temp_aire, $humedad_aire, $amoniaco, $temp_suelo, $humedad_suelo, 
                '$ventilacion', '$limpiarpoza', '$temperatura_controlada', '$humedad_controlada', '$suelohumedo'
            )
            ON DUPLICATE KEY UPDATE
                temperatura_aire = VALUES(temperatura_aire),
                humedad_aire = VALUES(humedad_aire),
                amoniaco = VALUES(amoniaco),
                temperatura_suelo = VALUES(temperatura_suelo),
                humedad_suelo = VALUES(humedad_suelo),
                ventilacion = VALUES(ventilacion),
                limpiarpoza = VALUES(limpiarpoza),
                temperaturacontrolada = VALUES(temperaturacontrolada),
                humedadcontrolada = VALUES(humedadcontrolada),
                suelohumedo = VALUES(suelohumedo)";

    if ($conn->query($sql) === TRUE) {
        echo "Dato para equipo $id_equipo insertado/actualizado\n";
    } else {
        echo "Error: " . $conn->error . "\n";
    }
}

$conn->close();
?>
