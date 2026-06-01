// --- CONSTANTES FÍSICAS ---
const GRAVITY = 9.81;
const L_CM = 60; // Longitud del puente en la maqueta real

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

// --- MOTOR FÍSICO Y ACTUALIZACIÓN VISUAL ---
function simulatePhysics() {
    // 1. Obtener valores de los sliders
    const massKg = parseFloat(massSlider.value);
    const posCm = parseFloat(posSlider.value);

    // 2. Cálculos Teóricos (Dinámica y Estática)
    const weightNewtons = massKg * GRAVITY; // W = m * g
    // Ecuación de Sumatoria de Momentos (M_A = 0) -> T_B * L = W * x
    const tensionB = (weightNewtons * posCm) / L_CM;
    // Ecuación de Sumatoria de Fuerzas en Y (F_y = 0) -> T_A = W - T_B
    const tensionA = weightNewtons - tensionB;

    // 3. Actualizar Textos (HUD)
    massDisplay.innerText = massKg.toFixed(1);
    posDisplay.innerText = posCm;
    weightDisplay.innerText = weightNewtons.toFixed(2) + ' N';
    massBlock.innerText = massKg.toFixed(1) + 'kg';
    sensorAVal.innerText = tensionA.toFixed(2) + ' N';
    sensorBVal.innerText = tensionB.toFixed(2) + ' N';

    // 4. Mapeo Visual (Coordenadas en pantalla)
    // El puente visual va del 10% al 90% de la pantalla (rango del 80%)
    const visualPercentage = 10 + (posCm / L_CM) * 80;
    
    // Mover el bloque de masa
    massBlock.style.left = `${visualPercentage}%`;

    // Actualizar anclaje de los cables (siguen a la masa)
    cableA.setAttribute('x2', `${visualPercentage}%`);
    cableB.setAttribute('x2', `${visualPercentage}%`);

    // 5. Animación de los Vectores de Fuerza (Las flechas crecen con la fuerza)
    // Escala: 1 Newton = 8 píxeles visuales hacia arriba
    const vectorScale = 8; 
    const basePillarY = 150; // Altura tope del pilar en el SVG
    
    // El vector crece hacia arriba, así que restamos a Y
    vectorA.setAttribute('y1', basePillarY - (tensionA * vectorScale));
    vectorB.setAttribute('y1', basePillarY - (tensionB * vectorScale));

    // Si la tensión es 0, ocultar la punta de la flecha para que se vea limpio
    vectorA.style.opacity = tensionA > 0.1 ? 1 : 0;
    vectorB.style.opacity = tensionB > 0.1 ? 1 : 0;

    // 6. Actualizar Barras de Progreso (Max 50N aprox para escalar)
    const maxBarForce = 50; 
    barA.style.width = `${Math.min((tensionA / maxBarForce) * 100, 100)}%`;
    barB.style.width = `${Math.min((tensionB / maxBarForce) * 100, 100)}%`;
}

// --- LISTENERS ---
massSlider.addEventListener('input', simulatePhysics);
posSlider.addEventListener('input', simulatePhysics);

// Iniciar simulación al cargar
simulatePhysics();