import React, { useState, useEffect, useCallback } from "react";
import "../Applets.css";

const AppletClima = () => {
  const [clima, setClima] = useState(null);
  const [unidad, setUnidad] = useState("celsius");
  const [ubicacion, setUbicacion] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // ✅ FUNCIÓN PARA CONVERTIR CELSIUS A FAHRENHEIT
  const convertirAFahrenheit = useCallback((celsius) => {
    return (celsius * 9/5) + 32;
  }, []);

  // ✅ FUNCIÓN PARA OBTENER TEMPERATURA SEGÚN UNIDAD
  const obtenerTemperatura = useCallback((temperaturaCelsius) => {
    if (unidad === "fahrenheit") {
      return convertirAFahrenheit(temperaturaCelsius);
    }
    return temperaturaCelsius;
  }, [unidad, convertirAFahrenheit]);

  // Obtener pronóstico extendido
  const obtenerPronostico = useCallback(async (ciudadParam) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/clima/pronostico?ciudad=${ciudadParam}`
      );
      
      if (response.ok) { 
        const pronosticoData = await response.json();
        if (pronosticoData.pronostico && !pronosticoData.error) {
          setClima(prev => ({
            ...prev,
            pronostico: pronosticoData.pronostico
          }));
        }
      }
    } catch (err) {
      console.error("Error obteniendo pronóstico:", err);
    }
  }, []);

  // Obtener clima actual por coordenadas
  const obtenerClimaPorCoordenadas = useCallback(async (lat, lon) => {
    try {
      setError("");
      setCargando(true);
      
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/clima/coordenadas?lat=${lat}&lon=${lon}`
      );
      
      const data = await response.json();
      
      if (!response.ok || data.error) {
        throw new Error(data.error || "Error al obtener datos del clima");
      }
      
      setClima(data);
      
      // Obtener pronóstico extendido
      if (data.ciudad) {
        await obtenerPronostico(data.ciudad);
      }
      
    } catch (err) {
      console.error("Error obteniendo clima:", err);
      setError(err.message || "No se pudo obtener el clima. Intenta con una ciudad específica.");
    } finally {
      setCargando(false);
    }
  }, [obtenerPronostico]);

  // Geolocalización
  const obtenerGeolocalizacion = useCallback(() => {
    if (navigator.geolocation) {
      setCargando(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          obtenerClimaPorCoordenadas(latitude, longitude);
        },
        (err) => {
          console.error("Error obteniendo geolocalización:", err);
          setError("No se pudo obtener tu ubicación. Busca una ciudad manualmente.");
          setCargando(false);
        }
      );
    } else {
      setError("La geolocalización no está soportada en tu navegador.");
    }
  }, [obtenerClimaPorCoordenadas]);

  // Buscar por ubicación
  const buscarPorUbicacion = useCallback(async (e) => {
    e.preventDefault();
    if (!ubicacion.trim()) return;

    setCargando(true);
    setError("");
    
    try {
      const response = await fetch(
        `https://applet-suite-backend.onrender.com/api/clima/ciudad?ciudad=${encodeURIComponent(ubicacion)}`
      );
      
      if (!response.ok) {
        throw new Error("Ciudad no encontrada");
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setClima(data);
      obtenerPronostico(ubicacion);
      
    } catch (err) {
      console.error("Error buscando clima:", err);
      setError("No se encontró la ciudad. Verifica el nombre e intenta nuevamente.");
    } finally {
      setCargando(false);
    }
  }, [ubicacion, obtenerPronostico]);

  // ✅ CORREGIDO: Cambiar unidad de temperatura (SOLO CAMBIA EL ESTADO)
  const cambiarUnidad = useCallback((nuevaUnidad) => {
    if (nuevaUnidad === unidad) return;
    setUnidad(nuevaUnidad);

  }, [unidad]);

  // Cargar clima al iniciar
  useEffect(() => {
    obtenerGeolocalizacion();
  }, [obtenerGeolocalizacion]);

  return (
    <div className="applet-clima">
      <div className="clima-header" style={{ color: "white" }}>
        <h2>🌤️ Clima Actual</h2>
      </div>

      <div className="clima-controls">
        <form onSubmit={buscarPorUbicacion} className="busqueda-clima">
          <input
            type="text"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            placeholder="Ingresa una ciudad..."
            className="input-busqueda"
          />
          <button type="submit" disabled={cargando}>
            {cargando ? "Buscando..." : "Buscar"}
          </button>
        </form>

        <div className="unidad-botones">
          <button
            className={unidad === "celsius" ? "active" : ""}
            onClick={() => cambiarUnidad("celsius")}
            disabled={cargando}
          >
            °C
          </button>
          <button
            className={unidad === "fahrenheit" ? "active" : ""}
            onClick={() => cambiarUnidad("fahrenheit")}
            disabled={cargando}
          >
            °F
          </button>
        </div>
      </div>

      {error && (
        <div className="error-clima">
          {error}
          <button onClick={obtenerGeolocalizacion} className="btn-reintentar">
            Reintentar ubicación actual
          </button>
        </div>
      )}

      {cargando && <div className="cargando">⏳ Cargando información del clima...</div>}

      {clima && !cargando && !error && (
        <div className="clima-info">
          <div className="clima-actual">
            <div className="ubicacion">
              <h3>{clima.ciudad}, {clima.pais}</h3>
            </div>
            <div className="temperatura-principal">
              {/* ✅ CORREGIDO: Usar la función de conversión */}
              <div className="temperatura">
                {Math.round(obtenerTemperatura(clima.temperatura))}°
                {unidad === "celsius" ? "C" : "F"}
              </div>
              <div className="info-clima">
                <img
                  src={clima.icono}  
                  alt={clima.descripcion}
                  className="icono-clima"
                />
                <div className="descripcion">{clima.descripcion}</div>
              </div>
            </div>
          </div>

          <div className="detalles-clima">
            <div className="detalle">
              <span className="icono">💧</span>
              <div className="detalle-info">
                <div className="detalle-label">Humedad</div>
                <div className="detalle-valor">{clima.humedad}%</div>
              </div>
            </div>
            <div className="detalle">
              <span className="icono">💨</span>
              <div className="detalle-info">
                <div className="detalle-label">Viento</div>
                <div className="detalle-valor">{clima.viento} km/h</div>
              </div>
            </div>
            <div className="detalle">
              <span className="icono">📊</span>
              <div className="detalle-info">
                <div className="detalle-label">Presión</div>
                <div className="detalle-valor">{clima.presion} hPa</div>
              </div>
            </div>
          </div>

          {clima.pronostico && clima.pronostico.length > 0 && (
            <div className="pronostico-extendido">
              <h4>📅 Pronóstico de 3 días</h4>
              <div className="pronostico-dias">
                {clima.pronostico.map((dia, index) => (
                  <div key={`${dia.dia}-${dia.icono}-${index}`} className="dia-pronostico">
                    <div className="dia-nombre">
                      {new Date(dia.dia).toLocaleDateString('es-ES', { weekday: 'short' })}
                    </div>
                    <img
                      src={dia.icono}
                      alt={dia.descripcion}
                      className="icono-pronostico"
                    />
                    <div className="temperaturas-pronostico">
                      {/* ✅ CORREGIDO: Convertir temperaturas del pronóstico también */}
                      <span className="temp-max">
                        {Math.round(obtenerTemperatura(dia.max))}°
                      </span>
                      <span className="temp-min">
                        {Math.round(obtenerTemperatura(dia.min))}°
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AppletClima;