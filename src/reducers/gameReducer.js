const { generateDungeonAction } = require("../actions/gameActions");

const initialState = {
	playerPosition: { x: 1, y: 1 },
	dungeon: [], 
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

const gameReducer = (state = initialState, action) => {
	const { playerPosition, dungeon } = state;
	switch (action.type) {
		case 'GENERATE_DUNGEON':
			const newDungeon = generateDungeon(action.payload.width, action.payload.height, action.payload.cellSize);
			let initialPlayerPosition = { x:1, y:1 };
			
			//bloque para encontrar posición vacia en la dungeon
			for (let y = 1; y < newDungeon.length - 1; y++)
			{
				for (let x = 1; x < newDungeon[0].length - 1; x++)
				{
					if (newDungeon[y][x] === '.')
					{
						initialPlayerPosition = { x, y }; //actualizar posición inicial si encuentra pos vacia
						break;
					}
				}
				if (initialPlayerPosition.x !== 1 || initialPlayerPosition.y !== 1) break; // sale si ya encontró una posición
			}
			return {
				...state,
				dungeon: newDungeon,
				playerPosition: initialPlayerPosition, // asignamos la posición inicial
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
			
			// se dibuja el jugador
			const updatedDungeon = dungeon.map((row, rowIndex) =>
				row.map((cell, colIndex) => {
					if (validMove && rowIndex === y && colIndex === x) return '.';
					if (validMove && rowIndex === newPos.y && colIndex === newPos.x) return '@'; // <-- este es el jugador
					return cell; // todo lo demás se deja igual
				})
			);
			
			return {
				...state,
				playerPosition: validMove ? newPos : playerPosition,
				dungeon: updatedDungeon,
			}
		
		default:
			return state;
	}
}

module.exports = gameReducer;
