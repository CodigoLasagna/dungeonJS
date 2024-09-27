const readline = require('readline');
const store = require('./src/store');
const { movePlayer, generateDungeonAction } = require('./src/actions/gameActions');

//configurar input para la terminal (readline es necesario o si no sería hacer un juego por comandos)
// y no en tiempo "real"
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: true,
});

//función para mostrar el juego en la terminal

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
				return '@'; // Representa al jugador
			}
			return cell; // Retorna el resto de las celdas como están
		})
	);

	// Imprime el dungeon en la consola
	updatedDungeon.forEach((row) => {
		console.log(row.join(' '));
	});
	console.log('Usa WASD para moverte, presiona Q para salir.');
}

// función para manejar las teclas del jugador
const handleInput = (key) => {
	if (key === 'w') store.dispatch(movePlayer('UP'));
	if (key === 's') store.dispatch(movePlayer('DOWN'));
	if (key === 'a') store.dispatch(movePlayer('LEFT'));
	if (key === 'd') store.dispatch(movePlayer('RIGHT'));
	if (key === 'q') {
		console.log("bye bye");
		process.exit();
	}
	renderDungeon();
}

// inicializar juego y esperar inputs
console.clear();
store.dispatch(generateDungeonAction(8, 8, 6));
renderDungeon();

rl.input.on('keypress', (_, key) =>{
	console.clear();
	handleInput(key.name);
});

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
