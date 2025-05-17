<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Simulador de Datos</title>
</head>
<body>
    <h1>Simulando datos cada 5 segundos...</h1>
    <div id="resultado"></div>

    <script>
        function ejecutarScript() {
            fetch('generar_datos.php')
                .then(response => response.text())
                .then(data => {
                    document.getElementById('resultado').innerText = data;
                    console.log('Ejecutado:', new Date());
                })
                .catch(error => {
                    console.error('Error al ejecutar:', error);
                });
        }

        // Ejecutar cada 5 segundos
        setInterval(ejecutarScript, 5000);
        ejecutarScript(); // Primera vez al cargar
    </script>
</body>
</html>
