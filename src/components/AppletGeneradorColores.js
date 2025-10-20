import React, { useState, useEffect, useCallback } from 'react';
import '../Applets.css';

const AppletGeneradorColores = () => {
  const [colorBase, setColorBase] = useState('#3498db');
  const [paleta, setPaleta] = useState([]);
  const [tipoPaleta, setTipoPaleta] = useState('analoga');
  const [cantidadColores, setCantidadColores] = useState(5);
  const [cssCode, setCssCode] = useState('');
  const [scssCode, setScssCode] = useState('');

  // Tipos de paletas
  const tiposPaleta = [
    { value: 'analoga', label: 'Análoga' },
    { value: 'complementaria', label: 'Complementaria' },
    { value: 'triadica', label: 'Triádica' },
    { value: 'monocromatica', label: 'Monocromática' },
    { value: 'tetradica', label: 'Tetrádica' },
    { value: 'cuadrada', label: 'Cuadrada' },
    { value: 'aleatoria', label: 'Aleatoria' }
  ];

  // Funciones de conversión HEX to HSL y HSL to HEX
  const hexToHsl = (hex) => {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: 
          h = (g - b) / d + (g < b ? 6 : 0); 
          break;
        case g: 
          h = (b - r) / d + 2; 
          break;
        case b: 
          h = (r - g) / d + 4; 
          break;
        default:
          h = 0;
          break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const hslToHex = (h, s, l) => {
    h /= 360;
    s /= 100;
    l /= 100;
    
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    const toHex = (x) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Función para actualizar paleta y códigos
  const actualizarPaletaYCodigos = useCallback((colores) => {
    setPaleta(colores);
    
    const css = colores.map((color, index) => 
      `--color-${index + 1}: ${color.hex}; /* ${color.rgb} */`
    ).join('\n');
    
    const scss = colores.map((color, index) => 
      `$color-${index + 1}: ${color.hex}; // ${color.rgb}`
    ).join('\n');
    
    setCssCode(`:root {\n${css}\n}`);
    setScssCode(scss);
  }, []);

  // Función para generar paleta localmente (fallback)
  const generarPaletaLocal = useCallback(() => {
    const colores = [];
    for (let i = 0; i < cantidadColores; i++) {
      const hex = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
      colores.push({ 
        hex: hex, 
        rgb: `rgb(${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)})` 
      });
    }
    actualizarPaletaYCodigos(colores);
  }, [cantidadColores, actualizarPaletaYCodigos]);

  // Función para el backend (solo para tipo aleatorio)
  const generarPaletaBackend = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8080/api/colores/paleta');
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.colores && Array.isArray(data.colores)) {
        const coloresLimitados = data.colores.slice(0, cantidadColores);
        actualizarPaletaYCodigos(coloresLimitados);
      }
    } catch (error) {
      console.error('Error conectando con el backend:', error);
      generarPaletaLocal();
    }
  }, [cantidadColores, actualizarPaletaYCodigos, generarPaletaLocal]);

  // Función para generar paleta basada en el tipo seleccionado
  const generarPaletaPorTipo = useCallback(() => {
    if (tipoPaleta === 'aleatoria') {
      generarPaletaBackend();
      return;
    }

    const colores = [];
    const baseHsl = hexToHsl(colorBase);
    
    for (let i = 0; i < cantidadColores; i++) {
      let nuevoHsl;
      
      switch (tipoPaleta) {
        case 'analoga':
          nuevoHsl = {
            h: (baseHsl.h + (i - Math.floor(cantidadColores / 2)) * 30 + 360) % 360,
            s: Math.max(30, Math.min(80, baseHsl.s + (i - 2) * 10)),
            l: Math.max(20, Math.min(80, baseHsl.l + (i - 2) * 5))
          };
          break;
          
        case 'complementaria':
          if (i === 0) {
            nuevoHsl = baseHsl;
          } else if (i === 1) {
            nuevoHsl = {
              h: (baseHsl.h + 180) % 360,
              s: baseHsl.s,
              l: baseHsl.l
            };
          } else {
            nuevoHsl = {
              h: i % 2 === 0 ? baseHsl.h : (baseHsl.h + 180) % 360,
              s: baseHsl.s,
              l: Math.max(20, Math.min(80, baseHsl.l + (i - 1) * 10))
            };
          }
          break;
          
        case 'triadica':
          nuevoHsl = {
            h: (baseHsl.h + i * 120) % 360,
            s: baseHsl.s,
            l: Math.max(30, Math.min(70, baseHsl.l + (i - 1) * 5))
          };
          break;
          
        case 'monocromatica':
          nuevoHsl = {
            h: baseHsl.h,
            s: baseHsl.s,
            l: Math.max(15, Math.min(85, 20 + (i * 65 / (cantidadColores - 1))))
          };
          break;
          
        case 'tetradica':
          nuevoHsl = {
            h: (baseHsl.h + i * 90) % 360,
            s: baseHsl.s,
            l: Math.max(25, Math.min(75, baseHsl.l + (i % 2 === 0 ? 10 : -10)))
          };
          break;
          
        case 'cuadrada':
          nuevoHsl = {
            h: (baseHsl.h + i * 90) % 360,
            s: baseHsl.s,
            l: Math.max(30, Math.min(70, baseHsl.l))
          };
          break;
          
        default:
          nuevoHsl = baseHsl;
          break;
      }
      
      // Asegurar valores dentro de rangos válidos
      nuevoHsl.h = Math.max(0, Math.min(360, nuevoHsl.h));
      nuevoHsl.s = Math.max(0, Math.min(100, nuevoHsl.s));
      nuevoHsl.l = Math.max(0, Math.min(100, nuevoHsl.l));
      
      const hex = hslToHex(nuevoHsl.h, nuevoHsl.s, nuevoHsl.l);
      colores.push({ 
        hex: hex, 
        rgb: `rgb(${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)})` 
      });
    }
    
    actualizarPaletaYCodigos(colores);
  }, [colorBase, tipoPaleta, cantidadColores, generarPaletaBackend, actualizarPaletaYCodigos]);

  // Función principal para generar paleta
  const generarPaleta = useCallback(() => {
    if (tipoPaleta === 'aleatoria') {
      generarPaletaBackend();
    } else {
      generarPaletaPorTipo();
    }
  }, [tipoPaleta, generarPaletaBackend, generarPaletaPorTipo]);

  // Generar color aleatorio
  const generarColorAleatorio = () => {
    const randomColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
    setColorBase(randomColor);
  };

  // Copiar al portapapeles
  const copiarPortapapeles = async (texto) => {
    try {
      await navigator.clipboard.writeText(texto);
      alert('¡Copiado al portapapeles!');
    } catch (err) {
      console.error('Error copiando:', err);
      alert('Error al copiar. Por favor, copia manualmente.');
    }
  };

  // Calcular contraste de accesibilidad
  const calcularContrasteAccesibilidad = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminancia > 0.5 ? '🔳 Texto oscuro' : '🔲 Texto claro';
  };

  // Efecto para generar paleta cuando cambien los parámetros
  useEffect(() => {
    generarPaleta();
  }, [colorBase, tipoPaleta, cantidadColores, generarPaleta]);

  return (
    <div className="applet-interfaz">
      {/* Controles principales */}
      <div className="color-controls">
        <div className="input-group">
          <label htmlFor="color-base">COLOR BASE: </label>
          <input
            id="color-base"
            type="color"
            value={colorBase}
            onChange={(e) => setColorBase(e.target.value)}
            style={{ width: '100px', height: '50px' }}
          />
          <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>{colorBase}</span>
          <button 
            onClick={generarColorAleatorio}
            style={{ 
              marginLeft: '10px', 
              padding: '10px', 
              backgroundColor: '#9b59b6', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🎲 Aleatorio
          </button>
        </div>

        <div className="input-group">
          <label htmlFor="tipo-paleta">TIPO PALETA: </label>
          <select
            id="tipo-paleta"
            value={tipoPaleta}
            onChange={(e) => setTipoPaleta(e.target.value)}
            style={{ padding: '15px', fontSize: '1.1rem', borderRadius: '8px', border: '2px solid #bdc3c7', width: '200px' }}
          >
            {tiposPaleta.map(tipo => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="cantidad-colores">CANTIDAD: </label>
          <input
            id="cantidad-colores"
            type="number"
            min="3"
            max="8"
            value={cantidadColores}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (!isNaN(value) && value >= 3 && value <= 8) {
                setCantidadColores(value);
              }
            }}
            style={{ padding: '15px', fontSize: '1.1rem', borderRadius: '8px', border: '2px solid #bdc3c7', width: '100px' }}
          />
        </div>
      </div>

      {/* Paleta de colores generada */}
      <div className="paleta-display">
        <h3 style={{ textAlign: 'center', margin: '20px 0', color: '#2c3e50' }}>
          Paleta {tiposPaleta.find(t => t.value === tipoPaleta)?.label} - {colorBase}
        </h3>
        <div className="colores-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(${cantidadColores}, 1fr)`,
          gap: '10px',
          marginBottom: '30px'
        }}>
          {paleta.map((color, index) => (
            <div key={`${color.hex}-${index}`} style={{ textAlign: 'center' }}>
              <div 
                className="color-rectangle"
                style={{ 
                  backgroundColor: color.hex,
                  width: '100%',
                  height: '100px',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  border: '2px solid #bdc3c7',
                  cursor: 'pointer'
                }}
                role="button"
                tabIndex={0}
                onClick={() => copiarPortapapeles(color.hex)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    copiarPortapapeles(color.hex);
                  }
                }}
                title={`Click para copiar: ${color.hex}`}
                aria-label={`Copiar color ${color.hex} al portapapeles`}
              ></div>
              <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                {color.hex}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#7f8c8d' }}>
                {calcularContrasteAccesibilidad(color.hex)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Códigos CSS y SCSS */}
      <div className="code-sections" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="code-section">
          <h4 style={{ marginBottom: '10px', color: '#2c3e50' }}>CSS</h4>
          <pre style={{ 
            background: '#2c3e50', 
            color: 'white', 
            padding: '15px', 
            borderRadius: '8px',
            fontSize: '0.9rem',
            maxHeight: '200px',
            overflow: 'auto'
          }}>
            {cssCode}
          </pre>
          <button 
            onClick={() => copiarPortapapeles(cssCode)}
            className="button-group button"
            style={{ marginTop: '10px', width: '100%' }}
          >
            Copiar CSS
          </button>
        </div>

        <div className="code-section">
          <h4 style={{ marginBottom: '10px', color: '#2c3e50' }}>SCSS</h4>
          <pre style={{ 
            background: '#2c3e50', 
            color: 'white', 
            padding: '15px', 
            borderRadius: '8px',
            fontSize: '0.9rem',
            maxHeight: '200px',
            overflow: 'auto'
          }}>
            {scssCode}
          </pre>
          <button 
            onClick={() => copiarPortapapeles(scssCode)}
            className="button-group button"
            style={{ marginTop: '10px', width: '100%' }}
          >
            Copiar SCSS
          </button>
        </div>
      </div>

      {/* Información de accesibilidad */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        background: '#ecf0f1', 
        borderRadius: '8px',
        fontSize: '0.9rem'
      }}>
        <h4 style={{ color: '#2c3e50', marginBottom: '10px' }}>🎨 Tips de Accesibilidad</h4>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li>• <strong>Texto oscuro</strong> funciona mejor sobre fondos claros (luminancia &gt; 0.5)</li>
          <li>• <strong>Texto claro</strong> funciona mejor sobre fondos oscuros (luminancia &lt; 0.5)</li>
          <li>• Usa colores contrastantes para texto y fondos</li>
        </ul>
      </div>
    </div>
  );
};

export default AppletGeneradorColores;