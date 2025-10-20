import React, { useState, useEffect, useCallback } from 'react';
import '../Applets.css';

const AppletGeneradorPasswords = () => {
  const [password, setPassword] = useState('');
  const [passwordLength, setPasswordLength] = useState(12);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [strength, setStrength] = useState('');
  const [strengthLevel, setStrengthLevel] = useState(0);
  const [copied, setCopied] = useState(false);
  const [passwordHistory, setPasswordHistory] = useState([]);

  // Caracteres disponibles
  const characters = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };

  // Cargar historial desde localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('passwordHistory');
    if (savedHistory) {
      setPasswordHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Guardar historial en localStorage
  useEffect(() => {
    localStorage.setItem('passwordHistory', JSON.stringify(passwordHistory));
  }, [passwordHistory]);

  // Generar contraseña
  const generatePassword = useCallback(() => {
    let characterPool = '';
    let generatedPassword = '';

    // Construir el pool de caracteres basado en las opciones seleccionadas
    if (includeUppercase) characterPool += characters.uppercase;
    if (includeLowercase) characterPool += characters.lowercase;
    if (includeNumbers) characterPool += characters.numbers;
    if (includeSymbols) characterPool += characters.symbols;

    // Verificar que al menos una opción esté seleccionada
    if (characterPool.length === 0) {
      setPassword('Selecciona al menos un tipo de caracter');
      setStrength('Muy Débil');
      setStrengthLevel(0);
      return;
    }

    // Generar contraseña
    for (let i = 0; i < passwordLength; i++) {
      const randomIndex = Math.floor(Math.random() * characterPool.length);
      generatedPassword += characterPool[randomIndex];
    }

    setPassword(generatedPassword);
    calculateStrength(generatedPassword);

    // Agregar al historial
    if (generatedPassword.length === passwordLength) {
      const newEntry = {
        password: generatedPassword,
        timestamp: new Date().toLocaleString(),
        strength: strength
      };
      setPasswordHistory(prev => [newEntry, ...prev.slice(0, 9)]); // Mantener solo las últimas 10
    }
  }, [includeUppercase, characters.uppercase, characters.lowercase, characters.numbers, characters.symbols, includeLowercase, includeNumbers, includeSymbols, passwordLength, strength]);

  // Calcular fortaleza de la contraseña
  const calculateStrength = (pwd) => {
    let score = 0;
    const length = pwd.length;

    // Puntos por longitud
    if (length >= 8) score += 1;
    if (length >= 12) score += 1;
    if (length >= 16) score += 1;
    if (length >= 20) score += 1;

    // Puntos por variedad de caracteres
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    // Puntos por patrones complejos
    if (/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(pwd)) score += 2;

    // Determinar nivel de fortaleza
    let strengthText = '';
    let strengthValue = 0;

    if (score <= 2) {
      strengthText = 'Muy Débil';
      strengthValue = 1;
    } else if (score <= 4) {
      strengthText = 'Débil';
      strengthValue = 2;
    } else if (score <= 6) {
      strengthText = 'Moderada';
      strengthValue = 3;
    } else if (score <= 8) {
      strengthText = 'Fuerte';
      strengthValue = 4;
    } else {
      strengthText = 'Muy Fuerte';
      strengthValue = 5;
    }

    setStrength(strengthText);
    setStrengthLevel(strengthValue);
  };

  // Generar contraseña al cargar y cuando cambien las opciones
  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  // Copiar al portapapeles
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  } catch (err) {
    console.error('Error copiando al portapapeles:', err);
    
    // Fallback MUY simplificado para navegadores muy antiguos
    try {
      // Intentar con un enfoque alternativo moderno
      const textArea = document.createElement('textarea');
      textArea.value = password;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      
      // Solo usar execCommand como ÚLTIMO recurso
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        alert('No se pudo copiar la contraseña. Por favor, cópiala manualmente.');
      }
    } catch (fallbackErr) {
      alert('No se pudo copiar la contraseña. Por favor, cópiala manualmente.');
    }
  }
};

  // Generar contraseña memorable
  const generateMemorablePassword = () => {
    const words = [
      'sol', 'luna', 'estrella', 'cielo', 'mar', 'rio', 'montaña', 'bosque',
      'libro', 'musica', 'arte', 'tiempo', 'camino', 'sueño', 'vuelo', 'puente',
      'fuego', 'agua', 'tierra', 'aire', 'corazon', 'mente', 'alma', 'espiritu'
    ];
    
    const numbers = '0123456789';
    const symbols = '!@#$%&*';
    
    const word1 = words[Math.floor(Math.random() * words.length)];
    const word2 = words[Math.floor(Math.random() * words.length)];
    const number = numbers[Math.floor(Math.random() * numbers.length)];
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    
    const memorablePassword = word1 + symbol + word2 + number;
    setPassword(memorablePassword);
    calculateStrength(memorablePassword);
  };

  // Generar PIN numérico
  const generatePin = () => {
    let pin = '';
    for (let i = 0; i < 6; i++) {
      pin += Math.floor(Math.random() * 10);
    }
    setPassword(pin);
    calculateStrength(pin);
  };

  // Obtener clase CSS para la fortaleza
  const getStrengthClass = () => {
    switch (strengthLevel) {
      case 1: return 'strength-weak';
      case 2: return 'strength-weak';
      case 3: return 'strength-medium';
      case 4: return 'strength-strong';
      case 5: return 'strength-very-strong';
      default: return 'strength-weak';
    }
  };

  // Obtener color para la barra de progreso
  const getStrengthColor = () => {
    switch (strengthLevel) {
      case 1: return '#e74c3c';
      case 2: return '#e67e22';
      case 3: return '#f1c40f';
      case 4: return '#2ecc71';
      case 5: return '#27ae60';
      default: return '#e74c3c';
    }
  };

  // Limpiar historial
  const clearHistory = () => {
    setPasswordHistory([]);
  };

  return (
    <div className="applet-generador-passwords">
      {/* Contraseña generada */}
      <div className="password-display-container">
        <div className="password-display">
          {password}
        </div>
        
        {/* Indicador de fortaleza */}
        <div className="password-strength" style={{ margin: '15px 0' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '5px' 
          }}>
            <span>Fortaleza:</span>
            <span className={getStrengthClass()} style={{ fontWeight: 'bold' }}>
              {strength}
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#ecf0f1',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${strengthLevel * 20}%`,
              height: '100%',
              backgroundColor: getStrengthColor(),
              transition: 'all 0.3s ease',
              borderRadius: '4px'
            }}></div>
          </div>
        </div>

        {/* Botón copiar */}
        <button
          onClick={copyToClipboard}
          className="search-button"
          style={{ 
            width: '100%',
            backgroundColor: copied ? '#27ae60' : '#3498db',
            marginBottom: '20px'
          }}
        >
          {copied ? '✅ ¡Copiada!' : '📋 Copiar Contraseña'}
        </button>
      </div>

      {/* Opciones de configuración */}
      <div className="password-options">
        <h3 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '20px' }}>
          ⚙️ Configuración
        </h3>

        {/* Longitud */}
        <div className="option-group">
          <label htmlFor="password-length">
            Longitud: <strong>{passwordLength} caracteres</strong>
          </label>
          <input
            id="password-length"
            type="range"
            min="4"
            max="32"
            value={passwordLength}
            onChange={(e) => setPasswordLength(parseInt(e.target.value))}
            style={{ width: '200px' }}
          />
        </div>

        {/* Tipos de caracteres */}
        <div className="option-group">
          <label htmlFor="include-uppercase">
            <input
              id="include-uppercase"
              type="checkbox"
              checked={includeUppercase}
              onChange={(e) => setIncludeUppercase(e.target.checked)}
              style={{ marginRight: '10px' }}
            />
            Mayúsculas (A-Z)
          </label>
        </div>

        <div className="option-group">
          <label htmlFor="include-lowercase">
            <input
              id="include-lowercase"
              type="checkbox"
              checked={includeLowercase}
              onChange={(e) => setIncludeLowercase(e.target.checked)}
              style={{ marginRight: '10px' }}
            />
            Minúsculas (a-z)
          </label>
        </div>

        <div className="option-group">
          <label htmlFor="include-numbers">
            <input
              id="include-numbers"
              type="checkbox"
              checked={includeNumbers}
              onChange={(e) => setIncludeNumbers(e.target.checked)}
              style={{ marginRight: '10px' }}
            />
            Números (0-9)
          </label>
        </div>

        <div className="option-group">
          <label htmlFor="include-symbols">
            <input
              id="include-symbols"
              type="checkbox"
              checked={includeSymbols}
              onChange={(e) => setIncludeSymbols(e.target.checked)}
              style={{ marginRight: '10px' }}
            />
            Símbolos (!@#$%^&*)
          </label>
        </div>
      </div>

      {/* Botones de generación rápida */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '10px',
        margin: '20px 0'
      }}>
        <button
          onClick={generatePassword}
          className="search-button"
          style={{ backgroundColor: '#3498db' }}
        >
          🔄 Generar Nueva
        </button>
        <button
          onClick={generateMemorablePassword}
          className="search-button"
          style={{ backgroundColor: '#9b59b6' }}
        >
          🧠 Memorable
        </button>
        <button
          onClick={generatePin}
          className="search-button"
          style={{ backgroundColor: '#e67e22' }}
        >
          🔢 PIN (6 dígitos)
        </button>
        <button
          onClick={clearHistory}
          className="search-button"
          style={{ backgroundColor: '#e74c3c' }}
        >
          🗑️ Limpiar Historial
        </button>
      </div>

      {/* Historial de contraseñas */}
      {passwordHistory.length > 0 && (
        <div className="password-history">
          <h3 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '15px' }}>
            📜 Historial (Últimas 10)
          </h3>
          <div style={{
            background: '#f8f9fa',
            padding: '15px',
            borderRadius: '8px',
            border: '2px solid #bdc3c7',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {passwordHistory.map((entry, index) => (
              <div
                key={index}
                style={{
                  padding: '10px',
                  borderBottom: index < passwordHistory.length - 1 ? '1px solid #dee2e6' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.9rem'
                }}
              >
                <div>
                  <strong style={{ fontFamily: 'Courier New, monospace' }}>
                    {entry.password}
                  </strong>
                  <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>
                    {entry.timestamp}
                  </div>
                </div>
                <span className={`strength-${entry.strength.toLowerCase().replace(' ', '-')}`}>
                  {entry.strength}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips de seguridad */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        background: '#d5edf7', 
        borderRadius: '8px',
        fontSize: '0.9rem',
        border: '1px solid #3498db'
      }}>
        <h4 style={{ color: '#2c3e50', marginBottom: '10px' }}>🔒 Tips de Seguridad</h4>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li>✅ Usa contraseñas de al menos 12 caracteres</li>
          <li>✅ Combina mayúsculas, minúsculas, números y símbolos</li>
          <li>✅ No reutilices contraseñas en diferentes servicios</li>
          <li>✅ Considera usar un gestor de contraseñas</li>
          <li>✅ Cambia tus contraseñas regularmente</li>
        </ul>
      </div>
    </div>
  );
};

export default AppletGeneradorPasswords;