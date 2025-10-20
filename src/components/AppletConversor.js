import React, { useState, useEffect, useCallback } from 'react';
import '../Applets.css';

const AppletConversor = () => {
  const [valor, setValor] = useState('');
  const [unidadOrigen, setUnidadOrigen] = useState('metros');
  const [unidadDestino, setUnidadDestino] = useState('kilometros');
  const [resultado, setResultado] = useState('');
  const [tipoConversion, setTipoConversion] = useState('longitud');
  const [historial, setHistorial] = useState([]);
  const [unidadesDisponibles, setUnidadesDisponibles] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // Función fallback para unidades locales
  const obtenerUnidadesLocales = useCallback(() => {
    const unidadesLocales = {
      longitud: ['metros', 'kilometros', 'centimetros', 'milimetros', 'pies', 'pulgadas', 'millas'],
      peso: ['kilogramos', 'gramos', 'libras', 'onzas', 'toneladas'],
      temperatura: ['celsius', 'fahrenheit', 'kelvin'],
      moneda: ['USD', 'EUR', 'MXN', 'GBP', 'JPY'],
      volumen: ['litros', 'mililitros', 'galones', 'onzas_liq'],
      tiempo: ['segundos', 'minutos', 'horas', 'dias', 'semanas']
    };
    return unidadesLocales[tipoConversion] || ['unidad'];
  }, [tipoConversion]);

  // Cargar unidades disponibles cuando cambie el tipo de conversión
  useEffect(() => {
    const cargarUnidades = async () => {
      try {
        setCargando(true);
        setError('');
        const response = await fetch(`http://localhost:8080/api/conversor/unidades/${tipoConversion}`);
        
        if (!response.ok) {
          throw new Error('Error al cargar unidades');
        }
        
        const unidades = await response.json();
        setUnidadesDisponibles(unidades);
        
        // Establecer unidades por defecto
        if (unidades.length >= 2) {
          setUnidadOrigen(unidades[0]);
          setUnidadDestino(unidades[1]);
        } else if (unidades.length === 1) {
          setUnidadOrigen(unidades[0]);
          setUnidadDestino(unidades[0]);
        }
        
        setResultado('');
      } catch (err) {
        setError('Error al cargar unidades: ' + err.message);
        // Fallback a unidades locales
        setUnidadesDisponibles(obtenerUnidadesLocales());
      } finally {
        setCargando(false);
      }
    };

    cargarUnidades();
  }, [tipoConversion, obtenerUnidadesLocales]);

  const convertirUnidad = async () => {
    const valorNumerico = parseFloat(valor);
    
    if (isNaN(valorNumerico)) {
      setError('Error: Valor inválido');
      return;
    }

    setCargando(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/conversor/convertir', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          valor: valorNumerico,
          unidadOrigen: unidadOrigen,
          unidadDestino: unidadDestino,
          tipoConversion: tipoConversion
        })
      });

      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        setResultado('');
      } else {
        setResultado(data.valor);
        
        const conversion = {
          valor: valorNumerico,
          origen: unidadOrigen,
          destino: unidadDestino,
          resultado: data.valor,
          tipo: tipoConversion,
          descripcion: data.descripcion,
          fecha: new Date().toLocaleTimeString()
        };

        setHistorial(prev => [conversion, ...prev.slice(0, 9)]); // Mantener último 10
      }
    } catch (err) {
      setError('Error de conexión: ' + err.message);
      // Fallback a cálculo local
      const resultadoLocal = convertirLocalmente(valorNumerico, unidadOrigen, unidadDestino, tipoConversion);
      setResultado(resultadoLocal);
    } finally {
      setCargando(false);
    }
  };

  // Fallback para conversión local
  const convertirLocalmente = (valor, origen, destino, tipo) => {
    // Implementación simple de fallback - similar a tu código original
    // Esto es solo para emergencias cuando el backend no está disponible
    const conversiones = {
      longitud: (v, o, d) => {
        const factores = { metros: 1, kilometros: 0.001, centimetros: 100, milimetros: 1000, pies: 3.28084, pulgadas: 39.3701, millas: 0.000621371 };
        return (v / factores[o]) * factores[d];
      },
      temperatura: (v, o, d) => {
        let celsius = v;
        if (o === 'fahrenheit') celsius = (v - 32) * 5/9;
        if (o === 'kelvin') celsius = v - 273.15;
        
        if (d === 'celsius') return celsius;
        if (d === 'fahrenheit') return (celsius * 9/5) + 32;
        if (d === 'kelvin') return celsius + 273.15;
        return v;
      }
      // ... otras conversiones
    };
    
    return conversiones[tipo] ? conversiones[tipo](valor, origen, destino) : valor;
  };

  const clearFields = () => {
    setValor('');
    setResultado('');
    setError('');
  };

  const intercambiarUnidades = () => {
    setUnidadOrigen(unidadDestino);
    setUnidadDestino(unidadOrigen);
    if (resultado && valor) {
      setValor(resultado.toString());
      setResultado(valor);
    }
  };

  const manejarEnter = (e) => {
    if (e.key === 'Enter') {
      convertirUnidad();
    }
  };

  return (
    <div className="applet-conversor">
      <div className="conversor-container">
        <h2 className="conversor-title">Conversor de Unidades</h2>
        
        {/* Selector de tipo de conversión */}
        <div className="conversor-group">
          <label htmlFor="tipo-conversion" className="conversor-label">Tipo de Conversión:</label>
          <select
            id="tipo-conversion"
            value={tipoConversion}
            onChange={(e) => setTipoConversion(e.target.value)}
            className="conversor-select"
            disabled={cargando}
          >
            <option value="longitud">Longitud</option>
            <option value="peso">Peso/Masa</option>
            <option value="temperatura">Temperatura</option>
            <option value="moneda">Moneda</option>
            <option value="volumen">Volumen</option>
            <option value="tiempo">Tiempo</option>
          </select>
        </div>

        {/* Valor a convertir */}
        <div className="conversor-group">
          <label htmlFor="valor" className="conversor-label">Valor:</label>
          <input
            id="valor"
            type="number"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            onKeyDown={manejarEnter}
            placeholder="Ingresa el valor"
            className="conversor-input"
            disabled={cargando}
          />
        </div>

        {/* Unidades */}
        <div className="unidades-container">
          <div className="conversor-group">
            <label htmlFor="unidad-origen" className="conversor-label">De:</label>
            <select
              id="unidad-origen"
              value={unidadOrigen}
              onChange={(e) => setUnidadOrigen(e.target.value)}
              className="conversor-select"
              disabled={cargando || unidadesDisponibles.length === 0}
            >
              {unidadesDisponibles.map(unidad => (
                <option key={unidad} value={unidad}>
                  {unidad.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <button 
            onClick={intercambiarUnidades} 
            className="intercambiar-btn"
            disabled={cargando}
            title="Intercambiar unidades"
          >
            ⇄
          </button>

          <div className="conversor-group">
            <label htmlFor="unidad-destino" className="conversor-label">A:</label>
            <select
              id="unidad-destino"
              value={unidadDestino}
              onChange={(e) => setUnidadDestino(e.target.value)}
              className="conversor-select"
              disabled={cargando || unidadesDisponibles.length === 0}
            >
              {unidadesDisponibles.map(unidad => (
                <option key={unidad} value={unidad}>
                  {unidad.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mensajes de estado */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {cargando && (
          <div className="loading-message">
            Convirtiendo...
          </div>
        )}

        {/* Resultado */}
        {resultado && !cargando && (
          <div className="conversor-group resultado-group">
            <label className="conversor-label" htmlFor="resultado-display">Resultado:</label>
            <div id="resultado-display" className="resultado-display" aria-live="polite">
              {parseFloat(resultado).toLocaleString(undefined, {
                maximumFractionDigits: 6
              })} {unidadDestino.toUpperCase()}
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="conversor-buttons">
          <button 
            onClick={convertirUnidad} 
            className="btn-convertir"
            disabled={cargando || !valor}
          >
            {cargando ? 'CONVIRTIENDO...' : 'CONVERTIR'}
          </button>
          <button 
            onClick={clearFields} 
            className="btn-limpiar"
            disabled={cargando}
          >
            LIMPIAR
          </button>
        </div>

        {/* Historial de conversiones */}
        {historial.length > 0 && (
          <div className="historial-conversor">
            <h3 className="historial-title">Historial de Conversiones</h3>
            <div className="historial-list">
              {historial.map((item) => (
                <div key={`${item.valor}-${item.origen}-${item.destino}-${item.fecha}`} className="historial-item">
                  <div className="historial-conversion">
                    <span className="historial-valor">{item.valor}</span>
                    <span className="historial-unidad">{item.origen}</span>
                    <span className="historial-flecha">→</span>
                    <span className="historial-resultado">
                      {parseFloat(item.resultado).toLocaleString(undefined, {
                        maximumFractionDigits: 4
                      })}
                    </span>
                    <span className="historial-unidad">{item.destino}</span>
                  </div>
                  <div className="historial-meta">
                    <span className="historial-tipo">{item.tipo}</span>
                    <span className="historial-fecha">{item.fecha}</span>
                  </div>
                </div>
              ))}
            </div>
            {historial.length > 0 && (
              <button 
                onClick={() => setHistorial([])} 
                className="btn-limpiar-historial"
              >
                Limpiar Historial
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppletConversor;