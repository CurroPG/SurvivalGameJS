// ════════════════════════════════════════════════════════════
//  POSICION  (= Posicion.java)
// ════════════════════════════════════════════════════════════
class Posicion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    getX() { return this.x; }
    getY() { return this.y; }
    setX(x) { this.x = x; }
    setY(y) { this.y = y; }

    static calcularDistancia(p1, p2) {
        return Math.sqrt(Math.pow(p1.getX() - p2.getX(), 2) + Math.pow(p1.getY() - p2.getY(), 2));
    }
}

// ════════════════════════════════════════════════════════════
//  PERSEGUIR  (= Perseguir.java)
// ════════════════════════════════════════════════════════════
class Perseguir {
    mover(actual, objetivo, mapa) {
        const posiblesX = [-1, 0, 1, -1, 1, -1, 0, 1];
        const posiblesY = [-1, -1, -1, 0, 0, 1, 1, 1];

        let menorDistancia = Number.MAX_VALUE;
        let vx = 0, vy = 0;

        for (let i = 0; i < posiblesX.length; i++) {
            const nuevaX = actual.getX() + posiblesX[i];
            const nuevaY = actual.getY() + posiblesY[i];

            if (nuevaX >= 0 && nuevaX < mapa[0].length && nuevaY >= 0 && nuevaY < mapa.length) {
                const celda = mapa[nuevaY][nuevaX];
                if (celda === null || (!celda.esObstaculo() && !celda.esMalo())) {
                    const posicionPrueba = new Posicion(nuevaX, nuevaY);
                    const distancia = Posicion.calcularDistancia(posicionPrueba, objetivo);
                    if (distancia < menorDistancia) {
                        menorDistancia = distancia;
                        vx = posiblesX[i];
                        vy = posiblesY[i];
                    }
                }
            }
        }
        return new Posicion(actual.getX() + vx, actual.getY() + vy);
    }
}

// ════════════════════════════════════════════════════════════
//  HUIR  (= Huir.java)
// ════════════════════════════════════════════════════════════
class Huir {
    mover(actual, objetivo, mapa) {
        const posiblesX = [-1, 0, 1, -1, 1, -1, 0, 1];
        const posiblesY = [-1, -1, -1, 0, 0, 1, 1, 1];

        let mayorDistancia = 0;
        let vx = 0, vy = 0;

        for (let i = 0; i < posiblesX.length; i++) {
            const nuevaX = actual.getX() + posiblesX[i];
            const nuevaY = actual.getY() + posiblesY[i];

            if (nuevaX >= 0 && nuevaX < mapa[0].length && nuevaY >= 0 && nuevaY < mapa.length) {
                const celda = mapa[nuevaY][nuevaX];
                if (celda === null || (!celda.esObstaculo() && !celda.esBueno())) {
                    const posicionPrueba = new Posicion(nuevaX, nuevaY);
                    const distancia = Posicion.calcularDistancia(posicionPrueba, objetivo);
                    if (distancia > mayorDistancia) {
                        mayorDistancia = distancia;
                        vx = posiblesX[i];
                        vy = posiblesY[i];
                    }
                }
            }
        }
        return new Posicion(actual.getX() + vx, actual.getY() + vy);
    }
}

// ════════════════════════════════════════════════════════════
//  ELEMENTOS  (= Elementos.java — clase abstracta)
// ════════════════════════════════════════════════════════════
class Elementos {
    constructor(x, y, tipoMovimiento) {
        this.posi = new Posicion(x, y);
        this.objetivo = null;
        this.tipoMovimiento = tipoMovimiento;
    }
    getPosiX() { return this.posi.getX(); }
    getPosiY() { return this.posi.getY(); }
    getPosi() { return this.posi; }
    setObjetivo(objetivo) { this.objetivo = objetivo; }
    esObstaculo() { return false; }
    esMalo() { return false; }
    esBueno() { return false; }
    color() { return '#ffffff'; }

    mover(mapa) {
        if (this.objetivo !== null) {
            const nuevaPosi = this.tipoMovimiento.mover(this.posi, this.objetivo.getPosi(), mapa);
            this.posi = nuevaPosi;
        }
    }
}

// ════════════════════════════════════════════════════════════
//  BUENOS  (= Buenos.java)
// ════════════════════════════════════════════════════════════
class Buenos extends Elementos {
    constructor(x, y) {
        super(x, y, new Huir());
    }
    esBueno() { return true; }
    color() { return '#39ff14'; }
}

// ════════════════════════════════════════════════════════════
//  MALOS  (= Malos.java)
// ════════════════════════════════════════════════════════════
class Malos extends Elementos {
    constructor(x, y) {
        super(x, y, new Perseguir());
    }
    esMalo() { return true; }
    color() { return '#ff3c3c'; }
}

// ════════════════════════════════════════════════════════════
//  OBSTACULOS  (= Obstaculos.java)
// ════════════════════════════════════════════════════════════
class Obstaculos extends Elementos {
    constructor(x, y) {
        super(x, y, null);
    }
    esObstaculo() { return true; }
    color() { return '#8b8b8b'; }
}

// ════════════════════════════════════════════════════════════
//  MAPA  (= Mapa.java + Rellenar.java)
// ════════════════════════════════════════════════════════════
class Mapa {
    constructor(alto, ancho) {
        this.alto = alto;
        this.ancho = ancho;
        this.mapa = Array.from({ length: alto }, () => Array(ancho).fill(null));
        this.buenos = [];
        this.malos = [];
        this.numObstaculosTotal = 0;
    }

    getAlto() { return this.alto; }
    getAncho() { return this.ancho; }
    getArea() { return this.alto * this.ancho; }

    comprobarCasillas(x, y) {
        return this.mapa[y][x] !== null;
    }

    generarObstaculos() {
        const num = Math.floor(Math.random() * (this.getArea() * 0.01) + 1);
        this.numObstaculosTotal = num;
        for (let i = 0; i < num; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * this.ancho);
                y = Math.floor(Math.random() * this.alto);
            } while (this.comprobarCasillas(x, y));
            this.mapa[y][x] = new Obstaculos(x, y);
        }
    }

    generarBuenos() {
        const num = Math.floor(Math.random() * (this.getArea() * 0.02) + 1);
        for (let i = 0; i < num; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * this.ancho);
                y = Math.floor(Math.random() * this.alto);
            } while (this.comprobarCasillas(x, y));
            const bueno = new Buenos(x, y);
            this.buenos.push(bueno);
            this.mapa[y][x] = bueno;
        }
    }

    generarMalos() {
        const num = Math.floor(Math.random() * (this.getArea() * 0.01) + 1);
        for (let i = 0; i < num; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * this.ancho);
                y = Math.floor(Math.random() * this.alto);
            } while (this.comprobarCasillas(x, y));
            const malo = new Malos(x, y);
            this.malos.push(malo);
            this.mapa[y][x] = malo;
        }
    }

    generarElementos() {
        this.generarBuenos();
        this.generarMalos();
        this.generarObstaculos();
    }

    localizarMaloCercano(bueno) {
        let cercano = null;
        let distanciaMinima = Number.MAX_VALUE;
        for (const malo of this.malos) {
            const d = Posicion.calcularDistancia(malo.getPosi(), bueno.getPosi());
            if (d < distanciaMinima) {
                distanciaMinima = d;
                cercano = malo;
            }
        }
        return cercano;
    }

    localizarBuenoCercano(malo) {
        let cercano = null;
        let distanciaMinima = Number.MAX_VALUE;
        for (const bueno of this.buenos) {
            const d = Posicion.calcularDistancia(malo.getPosi(), bueno.getPosi());
            if (d < distanciaMinima) {
                distanciaMinima = d;
                cercano = bueno;
            }
        }
        return cercano;
    }

    refrescarMapa() {
        for (const bueno of this.buenos) {
            bueno.setObjetivo(this.localizarMaloCercano(bueno));
            this.mapa[bueno.getPosiY()][bueno.getPosiX()] = null;
        }
        for (const malo of this.malos) {
            malo.setObjetivo(this.localizarBuenoCercano(malo));
            this.mapa[malo.getPosiY()][malo.getPosiX()] = null;
        }
        for (const bueno of this.buenos) {
            bueno.mover(this.mapa);
            this.mapa[bueno.getPosiY()][bueno.getPosiX()] = bueno;
        }
        for (const malo of this.malos) {
            malo.mover(this.mapa);
            this.mapa[malo.getPosiY()][malo.getPosiX()] = malo;
        }
        this.eliminarMuertos();
    }

    eliminarMuertos() {
        const buenosVivos = [];
        for (const bueno of this.buenos) {
            let muerto = false;
            for (const malo of this.malos) {
                if (malo.getPosiX() === bueno.getPosiX() && malo.getPosiY() === bueno.getPosiY()) {
                    muerto = true;
                    break;
                }
            }
            if (!muerto) buenosVivos.push(bueno);
        }
        this.buenos = buenosVivos;
    }
}

// ════════════════════════════════════════════════════════════
//  MOTOR DE RENDER
// ════════════════════════════════════════════════════════════
const ALTO = 25;
const ANCHO = 100;
const CELL = 14;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = ANCHO * CELL;
canvas.height = ALTO * CELL;

let mapa;
let corriendo = true;
let loopId = null;

const elBuenosGrande = document.getElementById('buenosGrande');
const elStatBuenos = document.getElementById('statBuenos');
const elStatMalos = document.getElementById('statMalos');
const elStatObstaculos = document.getElementById('statObstaculos');
const overlay = document.getElementById('overlay');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const btnToggle = document.getElementById('btnToggle');
const btnReset = document.getElementById('btnReset');

function actualizarContadores() {
    const n = mapa.buenos.length;
    elBuenosGrande.textContent = n;
    elStatBuenos.textContent = n;
    elStatMalos.textContent = mapa.malos.length;
    elStatObstaculos.textContent = mapa.numObstaculosTotal;
    elBuenosGrande.classList.toggle('danger', n <= 3 && n > 0);
}

function pintarCanvas() {
    ctx.fillStyle = '#0a0c10';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(30,37,50,0.6)';
    ctx.lineWidth = 0.5;
    for (let c = 0; c <= ANCHO; c++) {
        ctx.beginPath();
        ctx.moveTo(c * CELL, 0);
        ctx.lineTo(c * CELL, canvas.height);
        ctx.stroke();
    }
    for (let r = 0; r <= ALTO; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * CELL);
        ctx.lineTo(canvas.width, r * CELL);
        ctx.stroke();
    }

    for (let r = 0; r < ALTO; r++) {
        for (let c = 0; c < ANCHO; c++) {
            const elem = mapa.mapa[r][c];
            if (elem === null) continue;

            const px = c * CELL;
            const py = r * CELL;
            const clr = elem.color();

            if (!elem.esObstaculo()) {
                ctx.shadowColor = clr;
                ctx.shadowBlur = 8;
            } else {
                ctx.shadowBlur = 0;
            }

            ctx.fillStyle = clr;
            ctx.fillRect(px + 1, py + 1, CELL - 2, CELL - 2);
            ctx.shadowBlur = 0;
        }
    }
}

let lastTick = 0;

function loop(timestamp) {
    if (!corriendo) return;
    if (timestamp - lastTick >= 50) {   // = Thread.sleep(50) de App.java
        lastTick = timestamp;
        mapa.refrescarMapa();
        pintarCanvas();
        actualizarContadores();
        if (mapa.buenos.length === 0) {
            overlay.classList.add('show');
            detener();
            return;
        }
    }
    loopId = requestAnimationFrame(loop);
}

function iniciar() {
    overlay.classList.remove('show');
    mapa = new Mapa(ALTO, ANCHO);
    mapa.generarElementos();
    pintarCanvas();
    actualizarContadores();
    corriendo = true;
    lastTick = 0;
    loopId = requestAnimationFrame(loop);
    statusDot.classList.remove('stopped');
    statusText.textContent = 'corriendo';
    btnToggle.textContent = 'Pausa';
}

function detener() {
    corriendo = false;
    if (loopId) cancelAnimationFrame(loopId);
    statusDot.classList.add('stopped');
    statusText.textContent = mapa.buenos.length === 0 ? 'extinción' : 'pausado';
    btnToggle.textContent = 'Reanudar';
}

btnToggle.addEventListener('click', () => {
    if (corriendo) {
        detener();
    } else {
        if (mapa.buenos.length === 0) return;
        corriendo = true;
        lastTick = 0;
        statusDot.classList.remove('stopped');
        statusText.textContent = 'corriendo';
        btnToggle.textContent = 'Pausa';
        loopId = requestAnimationFrame(loop);
    }
});

btnReset.addEventListener('click', iniciar);

iniciar();