import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import './App.css';

const App = () => {
  // Dispositivos disponibles en la base de datos
  const [dispositivos] = useState(['1', '2', '3']);
  const [dispositivoActivo, setDispositivoActivo] = useState('3');
  const [fechaSeleccionada, setFechaSeleccionada] = useState(formatDateForInput(new Date()));
  const [tempDataPoints, setTempDataPoints] = useState(24);
  const [humDataPoints, setHumDataPoints] = useState(24);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [valoresPromedio, setValoresPromedio] = useState({
    temperatura_aire: 0,
    humedad_aire: 0,
    amoniaco: 0,
    humedad_suelo: 0
  });
  const [tempData, setTempData] = useState([]);
  const [humData, setHumData] = useState([]);
  const [amoniacoData, setAmoniacoData] = useState([]);
  const [humSueloData, setHumSueloData] = useState([]);
  const [labels, setLabels] = useState([]);

  const tempCanvasRef = useRef(null);
  const humCanvasRef = useRef(null);
  const tempChartInstance = useRef(null);
  const humChartInstance = useRef(null);

  // Función para formatear la fecha para el input type="date"
  function formatDateForInput(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  useEffect(() => {
    // Establecer fecha inicial como hoy
    if (!fechaSeleccionada) {
      setFechaSeleccionada(formatDateForInput(new Date()));
    } else {
      fetchDatos();
    }
  }, []);

  useEffect(() => {
    if (fechaSeleccionada) fetchDatos();
  }, [dispositivoActivo, fechaSeleccionada]);

  useEffect(() => {
    if (tempData.length > 0) crearGraficoTemperatura();
  }, [tempData, tempDataPoints]);

  useEffect(() => {
    if (humData.length > 0) crearGraficoHumedad();
  }, [humData, humDataPoints]);

  const fetchDatos = async () => {
    if (!fechaSeleccionada) return;
    
    setCargando(true);
    setError(null);
    
    try {
      // URL del servidor
      const url = `http://localhost:5000/api/datos?dispositivo=${dispositivoActivo}&fecha=${fechaSeleccionada}`;
      console.log("Fetching data from:", url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Data received:", data);

      if (data && data.length > 0) {
        const temp = data.map((entry) => entry.temperatura_aire);
        const hum = data.map((entry) => entry.humedad_aire);
        const amon = data.map((entry) => entry.amoniaco);
        const humSuelo = data.map((entry) => entry.humedad_suelo);
        const times = data.map((entry) => {
          // Formatear la hora para que se vea mejor en la gráfica
          const hora = entry.hora || '';
          return hora.substring(0, 5); // Tomar solo HH:MM
        });

        // Calcular promedio general
        const avgTemp = temp.reduce((acc, val) => acc + val, 0) / temp.length;
        const avgHum = hum.reduce((acc, val) => acc + val, 0) / hum.length;
        const avgAmon = amon.reduce((acc, val) => acc + val, 0) / amon.length;
        const avgHumSuelo = humSuelo.reduce((acc, val) => acc + val, 0) / humSuelo.length;

        setTempData(temp);
        setHumData(hum);
        setAmoniacoData(amon);
        setHumSueloData(humSuelo);
        setLabels(times);
        setValoresPromedio({
          temperatura_aire: avgTemp.toFixed(2),
          humedad_aire: avgHum.toFixed(2),
          amoniaco: avgAmon.toFixed(2),
          humedad_suelo: avgHumSuelo.toFixed(2),
        });
      } else {
        setTempData([]);
        setHumData([]);
        setLabels([]);
        setValoresPromedio({
          temperatura_aire: 0,
          humedad_aire: 0,
          amoniaco: 0,
          humedad_suelo: 0,
        });
        setError("No se encontraron datos para la fecha y dispositivo seleccionados");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(`Error al obtener datos: ${error.message}`);
      setTempData([]);
      setHumData([]);
      setLabels([]);
    } finally {
      setCargando(false);
    }
  };

  const crearGraficoTemperatura = () => {
    if (tempChartInstance.current) tempChartInstance.current.destroy();
    if (!tempCanvasRef.current) return;

    const ctx = tempCanvasRef.current.getContext('2d');

    // Si tempDataPoints es -1 o mayor al length, mostrar todo
    const puntos = (tempDataPoints === -1 || tempDataPoints > tempData.length) ? tempData.length : tempDataPoints;

    const slicedData = tempData.slice(-puntos);
    const slicedLabels = labels.slice(-puntos);

    tempChartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: slicedLabels,
        datasets: [{
          label: 'Temperatura Aire (°C)',
          data: slicedData,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          fill: false,
          tension: 0.1
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: {
              maxRotation: 90,
              minRotation: 45,
              autoSkip: true,
              maxTicksLimit: 10,
            },
          },
          y: {
            beginAtZero: false,
          }
        },
      },
    });
  };

  const crearGraficoHumedad = () => {
    if (humChartInstance.current) humChartInstance.current.destroy();
    if (!humCanvasRef.current) return;

    const ctx = humCanvasRef.current.getContext('2d');

    const puntos = (humDataPoints === -1 || humDataPoints > humData.length) ? humData.length : humDataPoints;

    const slicedData = humData.slice(-puntos);
    const slicedLabels = labels.slice(-puntos);

    humChartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: slicedLabels,
        datasets: [{
          label: 'Humedad Aire (%)',
          data: slicedData,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          fill: false,
          tension: 0.1
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: {
              maxRotation: 90,
              minRotation: 45,
              autoSkip: true,
              maxTicksLimit: 10,
            },
          },
          y: {
            beginAtZero: false,
          }
        },
      },
    });
  };

  return (
    <div className="container">
      <div className="sidebar">
        <div className="logo-container">
          <img src="img/LOGO2.png" alt="Logo Cuycloud" className="logo" />
        </div>
        <ul className="sidebar-menu">
          <li><strong>Dispositivos</strong></li>
          {dispositivos.map((id) => (
            <li
              key={id}
              onClick={() => setDispositivoActivo(id)}
              className={dispositivoActivo === id ? 'active' : ''}
            >
              Dispositivo {id}
            </li>
          ))}
        </ul>
      </div>

      <div className="main-content">
        <div className="header">
          <h2>Bienvenidos a Cuycloud... que tu cuy no se muera</h2>
          <div className="search-container">
            <label>Fecha:</label>
            <input 
              type="date" 
              value={fechaSeleccionada} 
              onChange={(e) => setFechaSeleccionada(e.target.value)} 
            />
            <button onClick={fetchDatos} disabled={cargando}>
              {cargando ? 'Cargando...' : 'Buscar'}
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message" style={{
            padding: '10px',
            margin: '10px 0',
            backgroundColor: '#ffeeee',
            color: '#cc0000',
            borderRadius: '5px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <div className="content-grid">
          <div className="charts-column">
            <div className="chart-box">
              <h3 className="chart-title">Temperatura</h3>
              <div className="chart-controls">
                <select value={tempDataPoints} onChange={(e) => setTempDataPoints(Number(e.target.value))}>
                  <option value={12}>Mostrar 12 puntos</option>
                  <option value={24}>Mostrar 24 puntos</option>
                  <option value={48}>Mostrar 48 puntos</option>
                  <option value={-1}>Mostrar todos</option>
                </select>
              </div>
              <div style={{ height: '300px' }}>
                {tempData.length > 0 ? (
                  <canvas ref={tempCanvasRef}></canvas>
                ) : (
                  <div className="no-data">No hay datos disponibles</div>
                )}
              </div>
            </div>

            <div className="chart-box">
              <h3 className="chart-title">Humedad</h3>
              <div className="chart-controls">
                <select value={humDataPoints} onChange={(e) => setHumDataPoints(Number(e.target.value))}>
                  <option value={12}>Mostrar 12 puntos</option>
                  <option value={24}>Mostrar 24 puntos</option>
                  <option value={48}>Mostrar 48 puntos</option>
                  <option value={-1}>Mostrar todos</option>
                </select>
              </div>
              <div style={{ height: '300px' }}>
                {humData.length ? (
                  <canvas ref={humCanvasRef}></canvas>
                ) : (
                  <div className="no-data">No hay datos disponibles</div>
                )}
              </div>
            </div>
          </div>

          <div className="metrics-column">
            <h2 style={{ textAlign: 'center', color: '#3aaed8' }}>Valores Promedio</h2>
            <div className="metrics-container">
              <div className="metric-box">
                <div className="metric-value temp-aire">{valoresPromedio.temperatura_aire}°</div>
                <div className="metric-label">Temp Aire</div>
              </div>
              <div className="metric-box">
                <div className="metric-value humedad-aire">{valoresPromedio.humedad_aire}%</div>
                <div className="metric-label">Humedad Aire</div>
              </div>
              <div className="metric-box">
                <div className="metric-value amoniaco">{valoresPromedio.amoniaco}%</div>
                <div className="metric-label">Amoniaco</div>
              </div>
              <div className="metric-box">
                <div className="metric-value humedad-suelo">{valoresPromedio.humedad_suelo}%</div>
                <div className="metric-label">Humedad Suelo</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;