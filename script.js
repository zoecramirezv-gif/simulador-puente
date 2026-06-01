// --- CONSTANTES FÍSICAS DE LA MAQUETA REAL ---
const GRAVITY = 9.81;
const L_CM = 60; // Longitud del puente en cm en la maqueta real de UNIVALLE

// --- ELEMENTOS DEL DOM ---
const massSlider = document.getElementById('mass-slider');
const posSlider = document.getElementById('pos-slider');
const massDisplay = document.getElementById('mass-display');
const posDisplay = document.getElementById('pos-display');
const weightDisplay = document.getElementById('weight-display');

const massBlock = document.getElementById('mass-block');
const cableA = document.getElementById('cable-a');
const cableB = document.getElementById('cable-b');
const vectorA = document.getElementById('vector-a');
const vectorB = document.getElementById('vector-b');

const sensorAVal = document.getElementById('sensor-a-val');
const sensorBVal = document.getElementById('sensor-b-val');
const barA = document.getElementById('bar-a');
const barB = document.getElementById('bar-b');

// --- MOTOR FÍSICO Y ACTUALIZACIÓN VISUAL JODIDAMENTE PERFECTA ---
function simulatePhysics() {
    // 1. Obtener valores de los sliders de control
    const massKg = parseFloat(massSlider.value);
    const posCm = parseFloat(posSlider.value);

    // 2. Cálculos Teóricos de Dinámica y Estática
    const weightNewtons = massKg * GRAVITY; // W = m * g
    // Ecuación de Sumatoria de Momentos (M_A = 0) -> T_B * L = W * x
    const tensionB = (weightNewtons * posCm) / L_CM;
    // Ecuación de Sumatoria de Fuerzas en Y (F_y = 0) -> T_A = W - T_B
    const tensionA = weightNewtons - tensionB;

    // 3. Actualizar Textos y HUD Digital en Pantalla
    massDisplay.innerText = massKg.toFixed(1);
    posDisplay.innerText = posCm;
    weightDisplay.innerText = weightNewtons.toFixed(2) + ' N';
    massBlock.innerText = massKg.toFixed(1) + 'kg';
    sensorAVal.innerText = tensionA.toFixed(2) + ' N';
    sensorBVal.innerText = tensionB.toFixed(2) + ' N';

    // 4. Mapeo Visual (Coordenadas en pantalla)
    // El puente visual va del 10% al 90% de la pantalla (rango del 80%)
    const visualPercentage = 10 + (posCm / L_CM) * 80;
    
    // Mover el bloque de masa amarillo horizontalmente
    massBlock.style.left = `${visualPercentage}%`;

    // Actualizar anclaje de los cables (siguen al bloque de masa)
    // Se fijan a la parte superior del bloque
    cableA.setAttribute('x2', `${visualPercentage}%`);
    cableB.setAttribute('x2', `${visualPercentage}%`);

    // 5. Animación de los Vectores de Fuerza (Las flechas crecen con la fuerza)
    // FIXED: La lógica de crecimiento del vector es hacia arriba, restando a Y
    // Escala: 1 Newton = 8 píxeles visuales hacia arriba
    const vectorScale = 8; 
    const basePillarY = 150; // Altura tope del pilar en el SVG
    
    // El vector crece hacia arriba, así que restamos a Y
    vectorA.setAttribute('y1', basePillarY - (tensionA * vectorScale));
    vectorB.setAttribute('y1', basePillarY - (tensionB * vectorScale));

    // Si la tensión es casi 0, ocultar la punta de la flecha para que se vea limpio
    vectorA.style.opacity = tensionA > 0.1 ? 1 : 0;
    vectorB.style.opacity = tensionB > 0.1 ? 1 : 0;

    // 6. Actualizar Barras de Progreso (Max 50N aprox para escalar)
    const maxBarForce = 50; 
    barA.style.width = `${Math.min((tensionA / maxBarForce) * 100, 100)}%`;
    barB.style.width = `${Math.min((tensionB / maxBarForce) * 100, 100)}%`;

    // 7. --- CARACTERÍSTICA DINÁMICA: ESCALADO Y COLOR DEL BLOQUE AMARILLO ---
    // Factor de escala basado en la masa actual (0.0 a 1.0)
    const factorMasa = massKg / 5.0; // Slider va de 0 a 5kg

    // A. Tamaño Dinámico: Crece de 46px a 80px
    const baseSize = 46; // Tamaño original en CSS
    const maxSize = 80; // Tamaño máximo en kg
    const newSize = baseSize + (maxSize - baseSize) * factorMasa;
    massBlock.style.width = `${newSize}px`;
    massBlock.style.height = `${newSize}px`;

    // B. Color Dinámico (HSL): Cambia de Amarillo (45 Hue) a Rojo (0 Hue)
    // UNIVALLE Maroon es HSL(0, 100%, 25%). Haremos una escala desde amarillo a rojo.
    const startHue = 45; // Amarillo
    const endHue = 0;   // Rojo Univalle/Casi Rojo
    const startLightness = 50; // Amarillo brillante
    const endLightness = 35;   // Rojo más intenso pero legible

    const newHue = startHue - (startHue - endHue) * factorMasa;
    const newLightness = startLightness - (startLightness - endLightness) * factorMasa;
    
    massBlock.style.backgroundColor = `hsl(${newHue}, 100%, ${newLightness}%)`;

    // C. Ajuste de color de texto para contraste (si es muy oscuro, texto blanco)
    massBlock.style.color = newLightness < 40 ? "#fff" : "#000";

    // D. Actualizar anclaje vertical de los cables (deben seguir la parte superior del bloque)
    // El top visual del deck está en Y=270, el top visual del bloque está en Y = 258 - newSize
    // Calculamos dinámicamente y2 para que los cables toquen el bloque escalado
    const baseDeckYTop = 350 - 92; // bottom: 92px in CSS is relative. SVG is absolute.
    // El bloque se ancla en el top del deck y se escala hacia arriba. 
    // SVG coordinates: Top visual of block is baseDeckYTop - size. 
    // Wait, CSS says bottom: 92px. If container is 350, Bottom Y is 350 - 92 = 258 top-down Y. 
    // Cable anchorage needs to drop with block top edge.
    const cableAnchorY = 258 - newSize; 
    cableA.setAttribute('y2', cableAnchorY + "px");
    cableB.setAttribute('y2', cableAnchorY + "px");
}

// --- LISTENERS DE CONTROL TÁCTIL Y DE RATÓN ---
massSlider.addEventListener('input', simulatePhysics);
posSlider.addEventListener('input', simulatePhysics);

// Iniciar simulación al cargar la página por primera vez
simulatePhysics();