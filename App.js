const readline = require('readline');
const store = require('./src/store');
const { movePlayer, generateDungeonAction } = require('./src/actions/gameActions');

// Configurar input para la terminal
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: true,
});

// Colores ANSI
const colors = {
	RESET: '\x1b[0m',
	PLAYER: '\x1b[1;32m',
	WALL: '\x1b[1;30m',
	FLOOR: '\x1b[30m',
	COIN: '\x1b[1;33m'
};

// Función para mostrar el juego en la terminal
const renderDungeon = () => {
	const state = store.getState();
	if (!state.game) {
		console.error("Estado indefinido");
		return;
	}
	const dungeon = state.game.dungeon;
	const playerPosition = state.game.playerPosition;

	if (!Array.isArray(dungeon)) {
		console.error("El dungeon no es un arreglo");
		return;
	}

	// Dibuja el dungeon y el jugador
	const updatedDungeon = dungeon.map((row, rowIndex) =>
		row.map((cell, colIndex) => {
			if (rowIndex === playerPosition.y && colIndex === playerPosition.x) {
				return `${colors.PLAYER}@${colors.RESET}`; // Representa al jugador
			}
			return cell === '#' ? `${colors.WALL}#${colors.RESET}` : 
				(cell === 'o' ? `${colors.COIN}o${colors.RESET}` : `${colors.FLOOR}.${colors.RESET}`);
		})
	);

	// Imprime el dungeon en la consola
	updatedDungeon.forEach((row) => {
		console.log(row.join(' '));
	});
	console.log('Score: ', state.game.coins);
	console.log('Usa WASD para moverte, presiona Q para salir.');
}
const baseDungeonParams = [4, 4, 6];

// Función para manejar las teclas del jugador
const handleInput = (key) => {
	if (key === 'w') store.dispatch(movePlayer('UP'));
	if (key === 's') store.dispatch(movePlayer('DOWN'));
	if (key === 'a') store.dispatch(movePlayer('LEFT'));
	if (key === 'd') store.dispatch(movePlayer('RIGHT'));
	if (key === 'q') {
		process.exit();
	}
	if (key === 'r') {
		// Generar un nuevo mapa al presionar 'r'
		store.dispatch(generateDungeonAction(baseDungeonParams[0], baseDungeonParams[1], baseDungeonParams[2]));
	}
	renderDungeon();
}

// Inicializar juego y esperar inputs
console.clear();
store.dispatch(generateDungeonAction(baseDungeonParams[0], baseDungeonParams[1], baseDungeonParams[2]));
renderDungeon();

rl.input.on('keypress', (_, key) => {
	console.clear();
	handleInput(key.name);
});

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
