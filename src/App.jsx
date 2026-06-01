import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Info, 
  RotateCcw, 
  Copy, 
  Check, 
  Sparkles, 
  Globe, 
  BookOpen, 
  Keyboard, 
  Moon, 
  Sun,
  Eye,
  RefreshCw,
  MessageSquare
} from 'lucide-react';

// === DEFINICIÓN DEL DICCIONARIO CLAVE PAXTU ===
// Basado en el documento PDF "Clave Paxtu":
// Columnas de letras: ABCDEFGHI (Col 1), JKLMNÑOPQ (Col 2), RSTUVWXYZ (Col 3)
// Las formas principales son: Cuadrado, Triángulo, Círculo.
// Se usan variaciones: vacíos, rellenos izquierdo/derecho, partidos con línea, rellenos superior/inferior, etc.
const PAXTU_DICTIONARY = {
  // --- GRUPO 1: A - I ---
  'A': { shape: 'square', fill: 'none', title: 'Cuadrado Vacío' },
  'B': { shape: 'triangle', fill: 'none', title: 'Triángulo Vacío' },
  'C': { shape: 'circle', fill: 'none', title: 'Círculo Vacío' },
  'D': { shape: 'square', fill: 'left-white-right-black', title: 'Cuadrado Mitad Derecha Negra' }, // Izquierda vacío, derecha negro
  'E': { shape: 'triangle', fill: 'left-white-right-black', title: 'Triángulo Mitad Derecha Negra' },
  'F': { shape: 'circle', fill: 'left-white-right-black', title: 'Círculo Mitad Derecha Negra' },
  'G': { shape: 'square', fill: 'left-black-right-white', title: 'Cuadrado Mitad Izquierda Negra' }, // Izquierda negro, derecha vacío
  'H': { shape: 'triangle', fill: 'left-black-right-white', title: 'Triángulo Mitad Izquierda Negra' },
  'I': { shape: 'circle', fill: 'left-black-right-white', title: 'Círculo Mitad Izquierda Negra' },

  // --- GRUPO 2: J - Q ---
  'J': { shape: 'square', fill: 'vertical-split', title: 'Cuadrado Partido Vertical' }, // Línea vertical divisoria
  'K': { shape: 'triangle', fill: 'vertical-split', title: 'Triángulo Partido Vertical' },
  'L': { shape: 'circle', fill: 'vertical-split', title: 'Círculo Partido Vertical' },
  'M': { shape: 'square', fill: 'top-white-bottom-black', title: 'Cuadrado Mitad Inferior Negra' }, // Superior blanco, inferior negro
  'N': { shape: 'triangle', fill: 'top-white-bottom-black', title: 'Triángulo Mitad Inferior Negra' },
  'Ñ': { shape: 'circle', fill: 'top-white-bottom-black', title: 'Círculo Mitad Inferior Negra' },
  'O': { shape: 'square', fill: 'top-black-bottom-white', title: 'Cuadrado Mitad Superior Negra' }, // Superior negro, inferior blanco
  'P': { shape: 'triangle', fill: 'top-black-bottom-white', title: 'Triángulo Mitad Superior Negra' },
  'Q': { shape: 'circle', fill: 'top-black-bottom-white', title: 'Círculo Mitad Superior Negra' },

  // --- GRUPO 3: R - Z ---
  'R': { shape: 'square', fill: 'horizontal-split', title: 'Cuadrado Partido Horizontal' }, // Línea horizontal divisoria
  'S': { shape: 'triangle', fill: 'horizontal-split', title: 'Triángulo Partido Horizontal' },
  'T': { shape: 'circle', fill: 'horizontal-split', title: 'Círculo Partido Horizontal' },
  'U': { shape: 'square', fill: 'full', title: 'Cuadrado Relleno Completo' },
  'V': { shape: 'triangle', fill: 'full', title: 'Triángulo Relleno Completo' },
  'W': { shape: 'circle', fill: 'full', title: 'Círculo Relleno Completo' },
  'X': { shape: 'square', fill: 'four-parts', title: 'Cuadrado con Cruz Interior' }, // Cuadrado con cruz interior
  'Y': { shape: 'triangle', fill: 'three-parts', title: 'Triángulo con Línea de Altura y Base' }, // Con líneas interiores
  'Z': { shape: 'circle', fill: 'cross', title: 'Círculo con Cruz Interior' }
};

// Componente para renderizar un Símbolo Paxtu usando SVG dinámico
function PaxtuSymbol({ char, size = 60, strokeColor = "currentColor", fillColor = "currentColor" }) {
  const upperChar = char.toUpperCase();
  const config = PAXTU_DICTIONARY[upperChar];

  if (!config) {
    // Si no está en el abecedario (ej. espacios o números), mostramos un contenedor vacío o el propio caracter
    return (
      <div 
        style={{ width: size, height: size }} 
        className="flex items-center justify-center font-bold text-lg border border-dashed border-gray-300 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
      >
        {char === ' ' ? '␣' : char}
      </div>
    );
  }

  const half = size / 2;
  const strokeWidth = Math.max(2, size / 20);

  // Generación dinámica del SVG según la forma geométrica y relleno
  const renderShape = () => {
    const { shape, fill } = config;

    // Colores basados en el modo de relleno
    const isDark = fillColor === "currentColor";

    // Retorna los elementos internos del SVG
    switch (shape) {
      case 'square':
        return (
          <>
            {/* Fondo base */}
            <rect x={strokeWidth} y={strokeWidth} width={size - strokeWidth * 2} height={size - strokeWidth * 2} fill="transparent" stroke={strokeColor} strokeWidth={strokeWidth} />
            
            {/* Rellenos específicos */}
            {fill === 'left-white-right-black' && (
              <rect x={half} y={strokeWidth} width={half - strokeWidth} height={size - strokeWidth * 2} fill={strokeColor} />
            )}
            {fill === 'left-black-right-white' && (
              <rect x={strokeWidth} y={strokeWidth} width={half - strokeWidth} height={size - strokeWidth * 2} fill={strokeColor} />
            )}
            {fill === 'top-white-bottom-black' && (
              <rect x={strokeWidth} y={half} width={size - strokeWidth * 2} height={half - strokeWidth} fill={strokeColor} />
            )}
            {fill === 'top-black-bottom-white' && (
              <rect x={strokeWidth} y={strokeWidth} width={size - strokeWidth * 2} height={half - strokeWidth} fill={strokeColor} />
            )}
            {fill === 'full' && (
              <rect x={strokeWidth} y={strokeWidth} width={size - strokeWidth * 2} height={size - strokeWidth * 2} fill={strokeColor} />
            )}
            
            {/* Particiones / Líneas internas */}
            {fill === 'vertical-split' && (
              <line x1={half} y1={strokeWidth} x2={half} y2={size - strokeWidth} stroke={strokeColor} strokeWidth={strokeWidth} />
            )}
            {fill === 'horizontal-split' && (
              <line x1={strokeWidth} y1={half} x2={size - strokeWidth} y2={half} stroke={strokeColor} strokeWidth={strokeWidth} />
            )}
            {fill === 'four-parts' && (
              <>
                <line x1={half} y1={strokeWidth} x2={half} y2={size - strokeWidth} stroke={strokeColor} strokeWidth={strokeWidth} />
                <line x1={strokeWidth} y1={half} x2={size - strokeWidth} y2={half} stroke={strokeColor} strokeWidth={strokeWidth} />
              </>
            )}
          </>
        );

      case 'triangle':
        const topX = half;
        const topY = strokeWidth;
        const leftX = strokeWidth;
        const leftY = size - strokeWidth;
        const rightX = size - strokeWidth;
        const rightY = size - strokeWidth;

        return (
          <>
            {/* Contorno base del triángulo */}
            <polygon points={`${topX},${topY} ${leftX},${leftY} ${rightX},${rightY}`} fill="transparent" stroke={strokeColor} strokeWidth={strokeWidth} />
            
            {/* Rellenos específicos */}
            {fill === 'left-white-right-black' && (
              <polygon points={`${topX},${topY} ${half},${leftY} ${rightX},${rightY}`} fill={strokeColor} />
            )}
            {fill === 'left-black-right-white' && (
              <polygon points={`${topX},${topY} ${leftX},${leftY} ${half},${leftY}`} fill={strokeColor} />
            )}
            {fill === 'top-white-bottom-black' && (
              <polygon points={`${half - (half/2)},${half} ${leftX},${leftY} ${rightX},${rightY} ${half + (half/2)},${half}`} fill={strokeColor} />
            )}
            {fill === 'top-black-bottom-white' && (
              <polygon points={`${topX},${topY} ${half - (half/2)},${half} ${half + (half/2)},${half}`} fill={strokeColor} />
            )}
            {fill === 'full' && (
              <polygon points={`${topX},${topY} ${leftX},${leftY} ${rightX},${rightY}`} fill={strokeColor} />
            )}

            {/* Particiones / Líneas internas */}
            {fill === 'vertical-split' && (
              <line x1={half} y1={topY} x2={half} y2={leftY} stroke={strokeColor} strokeWidth={strokeWidth} />
            )}
            {fill === 'horizontal-split' && (
              <line x1={half - (half/2)} y1={half} x2={half + (half/2)} y2={half} stroke={strokeColor} strokeWidth={strokeWidth} />
            )}
            {fill === 'three-parts' && (
              <>
                <line x1={half} y1={topY} x2={half} y2={leftY} stroke={strokeColor} strokeWidth={strokeWidth} />
                <line x1={half - (half/2)} y1={half} x2={half + (half/2)} y2={half} stroke={strokeColor} strokeWidth={strokeWidth} />
              </>
            )}
          </>
        );

      case 'circle':
        const radius = (size - strokeWidth * 2) / 2;
        return (
          <>
            {/* Contorno base del círculo */}
            <circle cx={half} cy={half} r={radius} fill="transparent" stroke={strokeColor} strokeWidth={strokeWidth} />
            
            {/* Rellenos específicos con máscaras o semicírculos */}
            {fill === 'left-white-right-black' && (
              <path d={`M ${half} ${strokeWidth} A ${radius} ${radius} 0 0 1 ${half} ${size - strokeWidth} Z`} fill={strokeColor} />
            )}
            {fill === 'left-black-right-white' && (
              <path d={`M ${half} ${strokeWidth} A ${radius} ${radius} 0 0 0 ${half} ${size - strokeWidth} Z`} fill={strokeColor} />
            )}
            {fill === 'top-white-bottom-black' && (
              <path d={`M ${strokeWidth} ${half} A ${radius} ${radius} 0 0 0 ${size - strokeWidth} ${half} Z`} fill={strokeColor} />
            )}
            {fill === 'top-black-bottom-white' && (
              <path d={`M ${strokeWidth} ${half} A ${radius} ${radius} 0 0 1 ${size - strokeWidth} ${half} Z`} fill={strokeColor} />
            )}
            {fill === 'full' && (
              <circle cx={half} cy={half} r={radius} fill={strokeColor} />
            )}

            {/* Particiones / Líneas internas */}
            {fill === 'vertical-split' && (
              <line x1={half} y1={strokeWidth} x2={half} y2={size - strokeWidth} stroke={strokeColor} strokeWidth={strokeWidth} />
            )}
            {fill === 'horizontal-split' && (
              <line x1={strokeWidth} y1={half} x2={size - strokeWidth} y2={half} stroke={strokeColor} strokeWidth={strokeWidth} />
            )}
            {fill === 'cross' && (
              <>
                <line x1={half} y1={strokeWidth} x2={half} y2={size - strokeWidth} stroke={strokeColor} strokeWidth={strokeWidth} />
                <line x1={strokeWidth} y1={half} x2={size - strokeWidth} y2={half} stroke={strokeColor} strokeWidth={strokeWidth} />
              </>
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="inline-block" style={{ width: size, height: size }} title={`${upperChar}: ${config.title}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {renderShape()}
      </svg>
    </div>
  );
}

export default function App() {
  // --- Estados de la aplicación ---
  const [activeTab, setActiveTab] = useState('translator'); // 'translator' | 'ia-decoder' | 'guide'
  const [theme, setTheme] = useState('dark');
  
  // Tranductores Manuales
  const [inputText, setInputText] = useState('SIEMPRE LISTOS');
  const [typedPaxtu, setTypedPaxtu] = useState([]);
  
  // Lector de Imagen / IA
  const [selectedImage, setSelectedImage] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [iaResponse, setIaResponse] = useState('');
  const [iaLoading, setIaLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Feedback visual
  const [copiedText, setCopiedText] = useState(false);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Manejar el tema del sistema
  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  // Limpieza de cámara al desmontar o cambiar pestaña
  useEffect(() => {
    if (activeTab !== 'ia-decoder') {
      stopCamera();
    }
  }, [activeTab]);

  // Copiar al portapapeles
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }).catch(() => {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    });
  };

  // --- Funciones para la Cámara ---
  const startCamera = async () => {
    setErrorMessage('');
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error al acceder a la cámara: ", err);
      setErrorMessage("No se pudo acceder a la cámara. Por favor, otorga los permisos necesarios o sube un archivo.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const dataUrl = canvas.toDataURL('image/png');
      setSelectedImage(dataUrl);
      stopCamera();
      
      // Procesar la captura inmediatamente con la IA
      analyzeWithIA(dataUrl);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target.result);
        // Procesar archivo inmediatamente con la IA
        analyzeWithIA(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- INTEGRACIÓN CON GEMINI 2.5 FLASH ---
  const analyzeWithIA = async (base64Image) => {
    setIaLoading(true);
    setErrorMessage('');
    setIaResponse('');

    const apiKey = ""; // API Key se inyecta en tiempo de ejecución
    const model = "gemini-2.5-flash-preview-09-2025";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    // Extraer solo la parte base64 cruda
    const base64Data = base64Image.split(',')[1] || base64Image;

    const systemPrompt = `Eres un experto criptógrafo scout y especialista en decodificar la famosa "Clave Paxtu". 
Tu tarea es analizar la imagen provista, que contiene un mensaje escrito mediante símbolos geométricos (cuadrados, triángulos, círculos con diferentes rellenos y líneas internas), identificar cada letra en orden de izquierda a derecha y de arriba a abajo, y regresarme la traducción exacta del mensaje en español.

Reglas de la Clave Paxtu:
- Las letras están agrupadas en 3 familias de formas:
  * Cuadrados (letras A, D, G, J, M, O, R, U, X)
  * Triángulos (letras B, E, H, K, N, P, S, V, Y)
  * Círculos (letras C, F, I, L, Ñ, Q, T, W, Z)
- Tipos de relleno/modificaciones por letra:
  * Vacíos completos: A (cuadrado), B (triángulo), C (círculo)
  * Relleno Mitad Derecha Negra: D, E, F
  * Relleno Mitad Izquierda Negra: G, H, I
  * Línea partida vertical: J, K, L
  * Relleno Mitad Inferior Negra: M, N, Ñ
  * Relleno Mitad Superior Negra: O, P, Q
  * Línea partida horizontal: R, S, T
  * Relleno Negro Completo: U, V, W
  * Modificaciones con cruz o líneas triples interiores: X (cruz cuadrado), Y (altura y base triángulo), Z (cruz círculo)

Instrucciones de Respuesta:
1. Sé extremadamente preciso en tu análisis geométrico de cada símbolo.
2. Proporciona en la primera línea el mensaje descifrado en MAYÚSCULAS y en español.
3. Luego, proporciona un breve desglose explicando qué letras identificaste o una pequeña guía del proceso paso a paso de tu traducción para ayudar al usuario a verificar si hay algún símbolo deteriorado o confuso. 
4. Si la imagen no contiene Clave Paxtu clara o es ilegible, infórmalo amablemente e intenta descifrar lo que puedas ver.`;

    const payload = {
      contents: [{
        role: "user",
        parts: [
          { text: "Por favor analiza detenidamente esta imagen de Clave Paxtu y entrégame su descifrado completo al español." },
          {
            inlineData: {
              mimeType: "image/png",
              data: base64Data
            }
          }
        ]
      }],
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      }
    };

    // Implementación de reintentos con backoff exponencial (Hasta 5 reintentos)
    const fetchWithRetry = async (retries = 5, delay = 1000) => {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`HTTP Error Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchWithRetry(retries - 1, delay * 2);
        }
        throw error;
      }
    };

    try {
      const result = await fetchWithRetry();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (text) {
        setIaResponse(text);
      } else {
        setErrorMessage("La IA procesó la solicitud pero no generó texto de respuesta. Por favor intenta con otra foto más clara.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Ocurrió un error al comunicarse con el servidor de análisis. Inténtalo de nuevo con una iluminación diferente.");
    } finally {
      setIaLoading(false);
    }
  };

  // Teclado interactivo
  const handleKeyboardPress = (letter) => {
    setTypedPaxtu([...typedPaxtu, letter]);
  };

  const handleKeyboardBackspace = () => {
    setTypedPaxtu(typedPaxtu.slice(0, -1));
  };

  const clearTyped = () => {
    setTypedPaxtu([]);
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans">
      
      {/* Cabecera Principal */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-30 px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo / Título */}
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 text-white p-2.5 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-2">
                CLAVE PAXTU <span className="text-xs bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded-full">Scout</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Traductor, Teclado y Descifrador Inteligente por Imagen</p>
            </div>
          </div>

          {/* Menú de Navegación */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl w-full sm:w-auto overflow-x-auto">
            <button 
              onClick={() => setActiveTab('translator')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'translator' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              <Globe className="w-4 h-4" />
              Traductor
            </button>
            <button 
              onClick={() => setActiveTab('ia-decoder')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'ia-decoder' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              <Camera className="w-4 h-4" />
              Lector por IA
            </button>
            <button 
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'guide' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              <BookOpen className="w-4 h-4" />
              Diccionario
            </button>
          </div>

          {/* Switch de Tema */}
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Cambiar tema"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
          </button>

        </div>
      </header>

      {/* Cuerpo Principal */}
      <main className="flex-grow max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* PESTAÑA: TRADUCTOR MANUAL */}
        {activeTab === 'translator' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Panel de Entrada */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-amber-500" />
                    Escribe tu mensaje en Español
                  </h2>
                  <span className="text-xs text-slate-400">Codificador en tiempo real</span>
                </div>
                
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value.toUpperCase())}
                  placeholder="Escribe el mensaje que deseas transformar en Clave Paxtu..."
                  className="w-full h-32 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none font-medium text-lg placeholder-slate-400 dark:placeholder-slate-600"
                />

                <div className="flex gap-2 justify-end">
                  <button 
                    onClick={() => setInputText('')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Limpiar Todo
                  </button>
                </div>
              </div>

              {/* Teclado Virtual Paxtu */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Keyboard className="w-5 h-5 text-amber-500" />
                    Teclado Interactivo Paxtu
                  </h2>
                  <span className="text-xs text-slate-400">Presiona para escribir</span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Puedes componer un mensaje directamente en símbolos para obtener su traducción automática abajo.
                </p>

                {/* Grid del Teclado */}
                <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
                  {Object.keys(PAXTU_DICTIONARY).map((char) => (
                    <button
                      key={char}
                      onClick={() => handleKeyboardPress(char)}
                      className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-amber-500/10 hover:border-amber-500/50 border border-slate-100 dark:border-slate-800 transition active:scale-95 group"
                    >
                      <PaxtuSymbol char={char} size={36} strokeColor="currentColor" />
                      <span className="text-xs font-black mt-1.5 text-slate-400 dark:text-slate-500 group-hover:text-amber-500 dark:group-hover:text-amber-400">{char}</span>
                    </button>
                  ))}
                  
                  {/* Espaciador */}
                  <button
                    onClick={() => handleKeyboardPress(' ')}
                    className="col-span-2 flex items-center justify-center p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/10 border border-transparent transition text-xs font-bold"
                  >
                    Espacio
                  </button>
                  
                  {/* Borrar */}
                  <button
                    onClick={handleKeyboardBackspace}
                    className="col-span-2 flex items-center justify-center p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition text-xs font-bold"
                  >
                    Borrar
                  </button>
                </div>

                {typedPaxtu.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-slate-400">Mensaje del teclado:</span>
                      <button onClick={clearTyped} className="text-xs text-red-500 hover:underline">Limpiar entrada</button>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-500/5 text-amber-700 dark:text-amber-300 font-bold tracking-widest text-lg">
                      {typedPaxtu.join('')}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Panel de Salida Gráfica */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-full min-h-[400px]">
                
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <Eye className="w-5 h-5 text-indigo-500" />
                      Mensaje Cifrado en Paxtu
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Traducción visual instantánea</p>
                  </div>
                  
                  <button 
                    onClick={() => handleCopy(inputText)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition"
                  >
                    {copiedText ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-500" />
                        ¡Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copiar Texto
                      </>
                    )}
                  </button>
                </div>

                {/* Contenedor de Símbolos Generados */}
                <div className="flex-grow bg-slate-50 dark:bg-slate-950 p-6 rounded-xl border border-slate-200/50 dark:border-slate-800/50 overflow-y-auto flex flex-wrap gap-4 items-start content-start max-h-[450px]">
                  {inputText.trim() === '' ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center py-12 text-slate-400 dark:text-slate-600">
                      <Info className="w-12 h-12 mb-3 stroke-[1.5]" />
                      <p className="font-semibold text-sm">No hay texto para cifrar</p>
                      <p className="text-xs">Escribe algo en el cuadro de la izquierda para ver su representación en símbolos.</p>
                    </div>
                  ) : (
                    inputText.split('').map((char, index) => (
                      <div key={index} className="flex flex-col items-center p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:scale-105 transition-all">
                        <PaxtuSymbol char={char} size={50} />
                        <span className="text-[10px] font-bold mt-1 text-slate-400 dark:text-slate-500">{char === ' ' ? 'ESP' : char}</span>
                      </div>
                    ))
                  )}
                </div>

                {/* Leyenda rápida del decodificador */}
                <div className="mt-6 p-4 rounded-xl bg-indigo-500/5 text-indigo-700 dark:text-indigo-300 border border-indigo-500/10 text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" /> ¿Cómo leer la Clave Paxtu?
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Cada letra pertenece a un grupo geométrico según su columna en la rejilla Paxtu: Las de la primera columna son <strong>Cuadrados</strong>, las de la segunda son <strong>Triángulos</strong> y las de la tercera son <strong>Círculos</strong>. Las filas determinan el tipo de relleno o la línea divisoria.
                  </p>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* PESTAÑA: DECODIFICADOR POR IA (CÁMARA / SUBIR) */}
        {activeTab === 'ia-decoder' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Panel de captura / subida */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Capturar o Cargar Mensaje</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Envía una foto de un mensaje codificado en Clave Paxtu para descifrarlo usando inteligencia artificial avanzada.</p>
                </div>

                {/* Visor de cámara o imagen seleccionada */}
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border-2 border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center">
                  
                  {cameraActive ? (
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="w-full h-full object-cover"
                    />
                  ) : selectedImage ? (
                    <img 
                      src={selectedImage} 
                      alt="Captura cargada" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center p-6 space-y-2">
                      <Camera className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 animate-pulse" />
                      <p className="font-semibold text-sm text-slate-600 dark:text-slate-300">Sin origen de imagen</p>
                      <p className="text-xs text-slate-400 max-w-[250px] mx-auto">Toma una foto de tu clave escrita en papel o sube un archivo desde tu dispositivo.</p>
                    </div>
                  )}

                  {/* Loader sobrepuesto */}
                  {iaLoading && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4">
                      <RefreshCw className="w-10 h-10 text-amber-500 animate-spin mb-4" />
                      <p className="font-bold text-white text-base">Analizando Clave Paxtu...</p>
                      <p className="text-xs text-slate-400 max-w-xs mt-1">El modelo Gemini está procesando los patrones geométricos e interpretando el abecedario scout.</p>
                    </div>
                  )}
                </div>

                {/* Controles de Acción */}
                <div className="flex flex-wrap gap-3">
                  
                  {cameraActive ? (
                    <button 
                      onClick={capturePhoto}
                      className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-3 rounded-xl shadow-lg shadow-emerald-600/25 transition active:scale-95"
                    >
                      <Camera className="w-5 h-5" />
                      Capturar Foto
                    </button>
                  ) : (
                    <button 
                      onClick={startCamera}
                      className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-3 rounded-xl shadow-lg shadow-indigo-600/25 transition active:scale-95"
                    >
                      <Camera className="w-5 h-5" />
                      Usar Cámara
                    </button>
                  )}

                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-4 py-3 rounded-xl transition"
                  >
                    <Upload className="w-5 h-5" />
                    Subir Archivo
                  </button>

                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />

                  {cameraActive && (
                    <button 
                      onClick={stopCamera}
                      className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-3 rounded-xl transition"
                    >
                      Cancelar
                    </button>
                  )}
                </div>

                {errorMessage && (
                  <div className="p-4 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-sm">
                    {errorMessage}
                  </div>
                )}

              </div>
            </div>

            {/* Panel de resultados de la IA */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-full min-h-[400px]">
                
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500 animate-bounce" />
                      Traducción de Inteligencia Artificial
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Resultado procesado con Gemini 2.5 Flash</p>
                  </div>
                </div>

                {/* Resultado */}
                <div className="flex-grow flex flex-col justify-between">
                  {iaResponse ? (
                    <div className="space-y-4">
                      
                      {/* Mensaje Decodificado Destacado */}
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/35 text-amber-800 dark:text-amber-300">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold opacity-75">Traducción aproximada:</span>
                        <div className="text-2xl font-black tracking-wide mt-1">
                          {iaResponse.split('\n')[0]}
                        </div>
                      </div>

                      {/* Desglose técnico */}
                      <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2">
                        <span className="text-xs font-bold text-slate-400">Análisis detallado de la imagen:</span>
                        <div className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 max-h-[250px] overflow-y-auto whitespace-pre-wrap">
                          {iaResponse.split('\n').slice(1).join('\n')}
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-16 text-slate-400 dark:text-slate-600">
                      <Camera className="w-14 h-14 mb-4 stroke-[1.5]" />
                      <p className="font-bold text-sm">Esperando imagen...</p>
                      <p className="text-xs max-w-xs mx-auto">Sube una fotografía de un papel con clave Paxtu escrita o usa la cámara para decodificar instantáneamente.</p>
                    </div>
                  )}

                  {iaResponse && (
                    <button 
                      onClick={() => handleCopy(iaResponse)}
                      className="mt-6 w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 py-3 rounded-xl font-bold text-sm transition"
                    >
                      {copiedText ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      {copiedText ? "Copiado al Portapapeles" : "Copiar análisis completo"}
                    </button>
                  )}
                </div>

              </div>
            </div>

            {/* Elemento oculto para procesar renderizado de foto */}
            <canvas ref={canvasRef} className="hidden" />

          </div>
        )}

        {/* PESTAÑA: GUÍA / DICCIONARIO INTERACTIVO */}
        {activeTab === 'guide' && (
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
            
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                Simbología Oficial
              </span>
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">El Abecedario de la Clave Paxtu</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                La Clave Paxtu es un cifrado scout de sustitución geométrica. El abecedario se divide en tres columnas verticales (Cuadrado, Triángulo, Círculo) y nueve filas horizontales con rellenos o marcas específicos.
              </p>
            </div>

            {/* Tabla interactiva de referencia */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              
              {/* Grupo 1: ABCDEFGHI */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2 uppercase tracking-widest text-center">
                  Grupo 1: Formas Limpias y Cortes Laterales
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].map(char => (
                    <div key={char} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 hover:border-amber-500/40 transition">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-black text-slate-800 dark:text-slate-100">{char}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">{PAXTU_DICTIONARY[char]?.title}</span>
                      </div>
                      <PaxtuSymbol char={char} size={38} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Grupo 2: JKLMNÑOPQ */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2 uppercase tracking-widest text-center">
                  Grupo 2: Partición Vertical y Superior/Inferior
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {['J', 'K', 'L', 'M', 'N', 'Ñ', 'O', 'P', 'Q'].map(char => (
                    <div key={char} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 hover:border-amber-500/40 transition">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-black text-slate-800 dark:text-slate-100">{char}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">{PAXTU_DICTIONARY[char]?.title}</span>
                      </div>
                      <PaxtuSymbol char={char} size={38} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Grupo 3: RSTUVWXYZ */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2 uppercase tracking-widest text-center">
                  Grupo 3: Línea Horizontal, Rellenos y Cruces
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {['R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'].map(char => (
                    <div key={char} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 hover:border-amber-500/40 transition">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-black text-slate-800 dark:text-slate-100">{char}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">{PAXTU_DICTIONARY[char]?.title}</span>
                      </div>
                      <PaxtuSymbol char={char} size={38} />
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Pie de Página */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-12 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-6xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            Clave Paxtu App Scout - Desarrollada para actividades al aire libre, pistas y juegos amplios.
          </p>
          <p>
            Creado utilizando el modelo de visión artificial <strong className="text-amber-500 font-bold">Gemini 2.5 Flash</strong> para el reconocimiento de simbologías scouts.
          </p>
        </div>
      </footer>

    </div>
  );
}
