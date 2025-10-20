import React, { useState, useEffect, useCallback } from 'react';
import '../Applets.css';

const AppletCalculadora = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [hasDecimal, setHasDecimal] = useState(false);
  const [history, setHistory] = useState([]);

  // Memoizar todas las funciones con useCallback
  const inputDigit = useCallback((digit) => {
    if (waitingForOperand) {
      setDisplay(String(digit));
      setWaitingForOperand(false);
      setHasDecimal(false);
    } else {
      setDisplay(display === '0' ? String(digit) : display + digit);
    }
  }, [waitingForOperand, display]);

  const inputDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      setHasDecimal(true);
    } else if (!hasDecimal) {
      setDisplay(display + '.');
      setHasDecimal(true);
    }
  }, [waitingForOperand, hasDecimal, display]);

  const clearDisplay = useCallback(() => {
    setDisplay('0');
    setHasDecimal(false);
  }, []);

  const clearAll = useCallback(() => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
    setHasDecimal(false);
  }, []);

  const handleBackspace = useCallback(() => {
    if (display.length === 1 || (display.length === 2 && display.startsWith('-'))) {
      setDisplay('0');
      setHasDecimal(false);
    } else {
      const newDisplay = display.slice(0, -1);
      setDisplay(newDisplay);
      setHasDecimal(newDisplay.includes('.'));
    }
  }, [display]);

  const calculate = useCallback(async (firstValue, secondValue, operation) => {
    try {
      const response = await fetch("http://localhost:8080/api/calculadora/calcular", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          x: firstValue,
          y: secondValue,
          operador: operation
        })
      });

      const result = await response.json();
      
      if (result.error) {
        setDisplay('Error');
        setTimeout(() => clearAll(), 1000);
        return null;
      } else {
        setHistory(prev => [...prev, {
          operacion: result.operacionRealizada,
          resultado: result.valor
        }]);
        return result.valor;
      }
    } catch (error) {
      console.error('Error al conectar con el backend:', error);
      // Fallback a cálculo local
      switch(operation) {
        case '+': return firstValue + secondValue;
        case '-': return firstValue - secondValue;
        case '*': return firstValue * secondValue;
        case '/': return firstValue / secondValue;
        default: return secondValue;
      }
    }
  }, [clearAll]);

  const performOperation = useCallback(async (nextOperation) => {
    const inputValue = parseFloat(display);
    
    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const result = await calculate(previousValue, inputValue, operation);
      if (result !== null) {
        setPreviousValue(result);
        setDisplay(String(result));
      }
    }
    
    setWaitingForOperand(true);
    setOperation(nextOperation);
    setHasDecimal(false);
  }, [display, previousValue, operation, calculate]);

  const performUnaryOperation = useCallback(async (unaryOperation) => {
    const inputValue = parseFloat(display);
    
    try {
      const response = await fetch('http://localhost:8080/api/calculadora/calcular/unario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          x: inputValue,
          operador: unaryOperation
        })
      });

      const result = await response.json();
      
      if (result.error) {
        setDisplay('Error');
        setTimeout(() => clearAll(), 1000);
      } else {
        setDisplay(String(result.valor));
        setHistory(prev => [...prev, {
          operacion: result.operacionRealizada,
          resultado: result.valor
        }]);
      }
    } catch (error) {
      console.error('Error:', error);

      let localResult;
      switch(unaryOperation) {
        case '√':
          localResult = Math.sqrt(inputValue);
          break;
        case '±':
          localResult = -inputValue;
          break;
        case '1/x':
          localResult = 1 / inputValue;
          break;
        default:
          localResult = inputValue;
      }
      setDisplay(String(localResult));
    }
  }, [display, clearAll]);

  const handleEquals = useCallback(async () => {
    const inputValue = parseFloat(display);
    
    if (previousValue !== null && operation) {
      const result = await calculate(previousValue, inputValue, operation);
      
      if (result !== null) {
        setDisplay(String(result));
        setPreviousValue(null);
        setOperation(null);
        setWaitingForOperand(true);
        setHasDecimal(String(result).includes('.'));
      }
    }
  }, [display, previousValue, operation, calculate]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  // useEffect con todas las dependencias necesarias
  useEffect(() => {
    const handleKeyPress = (event) => {
      const key = event.key;
      
      // Números
      if (key >= '0' && key <= '9') {
        inputDigit(parseInt(key));
      }
      // Operadores
      else if (key === '+') {
        performOperation('+');
      }
      else if (key === '-') {
        performOperation('-');
      }
      else if (key === '*') {
        performOperation('*');
      }
      else if (key === '/') {
        event.preventDefault();
        performOperation('/');
      }
      // Decimal
      else if (key === '.' || key === ',') {
        inputDecimal();
      }
      // Enter o = para igual
      else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        handleEquals();
      }
      // Escape para limpiar
      else if (key === 'Escape') {
        clearAll();
      }
      // Backspace para borrar
      else if (key === 'Backspace') {
        handleBackspace();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [
    inputDigit, 
    performOperation, 
    inputDecimal, 
    handleEquals, 
    clearAll, 
    handleBackspace
  ]);

  return (
    <div className="applet-calculadora">
      <div className="calculator-container">
        <div className="calculator">
          <div className="display-container">
            <div className="operation-preview">
              {previousValue !== null && `${previousValue} ${operation || ''}`}
            </div>
            <div className="display">{display}</div>
          </div>
          <div className="buttons">
            {/* Fila 1: Funciones avanzadas */}
            <button onClick={() => performUnaryOperation('√')} className="scientific">√</button>
            <button onClick={() => performUnaryOperation('±')} className="scientific">±</button>
            <button onClick={() => performUnaryOperation('1/x')} className="scientific">1/x</button>
            <button onClick={clearAll} className="function">CE</button>
            <button onClick={clearDisplay} className="function">C</button>
            
            {/* Fila 2: Operadores básicos y números */}
            <button onClick={() => inputDigit(7)}>7</button>
            <button onClick={() => inputDigit(8)}>8</button>
            <button onClick={() => inputDigit(9)}>9</button>
            <button onClick={() => performOperation('/')} className="operator">/</button>
            <button onClick={() => performOperation('*')} className="operator">×</button>
            
            {/* Fila 3 */}
            <button onClick={() => inputDigit(4)}>4</button>
            <button onClick={() => inputDigit(5)}>5</button>
            <button onClick={() => inputDigit(6)}>6</button>
            <button onClick={() => performOperation('-')} className="operator">-</button>
            <button onClick={() => performOperation('%')} className="operator">%</button>
            
            {/* Fila 4 */}
            <button onClick={() => inputDigit(1)}>1</button>
            <button onClick={() => inputDigit(2)}>2</button>
            <button onClick={() => inputDigit(3)}>3</button>
            <button onClick={() => performOperation('+')} className="operator">+</button>
            <button onClick={() => performOperation('^')} className="operator">x^y</button>
            
            {/* Fila 5 */}
            <button onClick={() => inputDigit(0)} className="zero">0</button>
            <button onClick={inputDecimal}>.</button>
            <button onClick={handleBackspace} className="function">⌫</button>
            <button onClick={handleEquals} className="equals">=</button>
          </div>
        </div>

        {/* Historial de operaciones */}
        {history.length > 0 && (
          <div className="calculator-history">
            <div className="history-header">
              <h4>Historial</h4>
              <button onClick={clearHistory} className="clear-history">×</button>
            </div>
            <div className="history-list">
              {history.slice(-5).reverse().map((item) => (
                <div key={item.operacion + '-' + item.resultado} className="history-item">
                  <span className="history-operation">{item.operacion}</span>
                  <span className="history-result">= {item.resultado}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppletCalculadora;