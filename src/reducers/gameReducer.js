const { generateDungeonAction } = require("../actions/gameActions");

const initialState = {
	baseDungeonParams: { w:0, h:0, cs: 0},
	playerPosition: { x: 1, y: 1 },
	dungeon: [], 
	coins : 0,
};

function generateDungeon(width, height, cellSize) {
	const dungeon = Array.from({ length: height * cellSize }, () =>
		Array.from({ length: width * cellSize }, () => '#')
	);
	
	const rooms = [];
	
	for (let i = 0; i < height; i++) {
		for (let j = 0; j < width; j++) {
			const roomWidth = Math.floor(Math.random() * (cellSize - 2)) + 2; 
			const roomHeight = Math.floor(Math.random() * (cellSize - 2)) + 2;
			
			const startX = j * cellSize + Math.floor(Math.random() * (cellSize - roomWidth));
			const startY = i * cellSize + Math.floor(Math.random() * (cellSize - roomHeight));
			
			// Verificar que la habitación no sobresalga de los límites del dungeon
			let canPlaceRoom = true;
			if (startX < 1 || startY < 1 || startX + roomWidth >= width * cellSize - 1 || startY + roomHeight >= height * cellSize - 1) {
				canPlaceRoom = false;
			}
			
			for (let y = startY; y < startY + roomHeight; y++) {
				for (let x = startX; x < startX + roomWidth; x++) {
					if (dungeon[y][x] !== '#') {
						canPlaceRoom = false;
					}
				}
			}
			
			if (canPlaceRoom) {
				// Crear la habitación
				for (let y = startY; y < startY + roomHeight; y++) {
					for (let x = startX; x < startX + roomWidth; x++) {
						dungeon[y][x] = '.'; // Cambiar a suelo
					}
				}
				// generar monedas
				if (Math.random() < 0.5){
					const coinX = startX + Math.floor(roomWidth / 2) - 1;
					const coinY = startY + Math.floor(roomHeight / 2) - 1;
					dungeon[coinY][coinX] = 'o';
				}
				// Guardar la habitación para crear pasillos más tarde
				rooms.push({ x: startX + Math.floor(roomWidth / 2), y: startY + Math.floor(roomHeight / 2) });
			}
		}
	}
	
	// Crear pasillos entre habitaciones
	for (let i = 0; i < rooms.length - 1; i++) {
		const startRoom = rooms[i];
		const endRoom = rooms[i + 1];
		
		// Conectar habitaciones horizontalmente y verticalmente
		if (Math.random() > 0.5) {
			// Horizontal primero, luego vertical
			for (let x = Math.min(startRoom.x, endRoom.x); x <= Math.max(startRoom.x, endRoom.x); x++) {
				dungeon[startRoom.y][x] = '.'; // Crear pasillo
			}
			for (let y = Math.min(startRoom.y, endRoom.y); y <= Math.max(startRoom.y, endRoom.y); y++) {
				dungeon[y][endRoom.x] = '.'; // Crear pasillo
			}
		} else {
			// Vertical primero, luego horizontal
			for (let y = Math.min(startRoom.y, endRoom.y); y <= Math.max(startRoom.y, endRoom.y); y++) {
				dungeon[y][startRoom.x] = '.'; // Crear pasillo
			}
			for (let x = Math.min(startRoom.x, endRoom.x); x <= Math.max(startRoom.x, endRoom.x); x++) {
				dungeon[endRoom.y][x] = '.'; // Crear pasillo
			}
		}
	}
	
	return dungeon;
}

//funcion para encontrar posición vacia en la dungeon
function getValidPos(dungeon){
	let initialPos = { x:1, y:1 };
	
	for (let y = 1; y < dungeon.length - 1; y++)
	{
		for (let x = 1; x < dungeon[0].length - 1; x++)
		{
			if (dungeon[y][x] === '.')
			{
				initialPos = { x, y }; //actualizar posición inicial si encuentra pos vacia
				break;
			}
		}
		if (initialPos.x !== 1 || initialPos.y !== 1) break; // sale si ya encontró una posición
	}
	return initialPos;
}

const gameReducer = (state = initialState, action) => {
	const { playerPosition, dungeon, baseDungeonParams } = state;
	switch (action.type) {
		case 'GENERATE_DUNGEON':
			//asignamos los valores predeterminados para la dungeon
			const newDungeon = generateDungeon(action.payload.width, action.payload.height, action.payload.cellSize);
			const newBDParams = {w:action.payload.width, h:action.payload.height, cs:action.payload.cellSize};
			let initialPlayerPosition = getValidPos(newDungeon);
			
			return {
				...state,
				dungeon: newDungeon,
				playerPosition: initialPlayerPosition, // asignamos la posición inicial
				coins: 0,
				baseDungeonParams: newBDParams,
			}
		case 'MOVE_PLAYER':
			const { x, y } = playerPosition;
			let newPos = { x, y };
			let validMove = true;
			const prevPos = { ...newPos };
			
			// aquí se designa como funciona el movimiento
			if (action.payload === 'UP' && y > 0) newPos.y--;
			else if (action.payload === 'DOWN' && y < dungeon.length - 1) newPos.y++;
			else if (action.payload === 'LEFT' && x > 0) newPos.x--;
			else if (action.payload === 'RIGHT' && x < dungeon[0].length - 1) newPos.x++;
			else validMove = false
			
			if (dungeon[newPos.y][newPos.x] === '#'){
				validMove = false;
				newPos = prevPos;
			}

			//al recoger una moneda
			let newCoins = state.coins;
			if (validMove && dungeon[newPos.y][newPos.x] === 'o')
			{
				newCoins += 10;
				dungeon[newPos.y][newPos.x] = '.';
			}
			
			// se dibuja el jugador
			const updatedDungeon = dungeon.map((row, rowIndex) =>
				row.map((cell, colIndex) => {
					if (validMove && rowIndex === y && colIndex === x) return cell;
					if (validMove && rowIndex === newPos.y && colIndex === newPos.x) return '@'; // <-- este es el jugador
					return cell; // todo lo demás se deja igual
				})
			);

			//verificar todas las monedas
			if (Array.isArray(dungeon)) {
				const totalCoins = dungeon.flat().filter(cell => cell === 'o').length;
				if (validMove && totalCoins === 0)
				{
					const newDungeon = generateDungeon(
						baseDungeonParams.w,
						baseDungeonParams.h,
						baseDungeonParams.cs
					);
					let initialPlayerPosition = getValidPos(newDungeon);
					return {
						...state,
						dungeon: newDungeon,
						playerPosition: initialPlayerPosition,
						coins: newCoins,
						baseDungeonParams: baseDungeonParams,
					}
				}
			}
			
			return {
				...state,
				playerPosition: validMove ? newPos : playerPosition,
				dungeon: updatedDungeon,
				coins: newCoins,
				baseDungeonParams: baseDungeonParams,
			}
		
		default:
			return state;
	}
}

module.exports = gameReducer;
