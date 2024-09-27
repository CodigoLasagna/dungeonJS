const initialState = {
	playerPosition: {x : 2, y : 2},
	dungeon: [
		['.', '.', '.', '.', '.'],
		['.', '.', '.', '.', '.'],
		['.', '.', '@', '.', '.'],
		['.', '.', '.', '.', '.'],
		['.', '.', '.', '.', '.'],
	], //Plantilla sencilla de un mapa 5x5
};

const gameReducer = (state = initialState, action) => {
	const { playerPosition, dungeon } = state;
	switch (action.type) {
		case 'MOVE_PLAYER':
			const { x, y } = playerPosition;
			let newPos = { x, y };
			let validMove = true;
			
		// aquí se designa como funciona el movimiento
		if (action.payload === 'UP' && y > 0) newPos.y--;
		else if (action.payload === 'DOWN' && y < dungeon.length - 1) newPos.y++;
		else if (action.payload === 'LEFT' && x > 0) newPos.x--;
		else if (action.payload === 'RIGHT' && x < dungeon[0].length - 1) newPos.x++;
		else validMove = false
		
		// se dibuja el jugador
		const newDungeon = dungeon.map((row, rowIndex) =>
			row.map((cell, colIndex) => {
				if (validMove && rowIndex === y && colIndex === x) return '.';
				if (validMove && rowIndex === newPos.y && colIndex === newPos.x) return '@'; // <-- este es el jugador
				return cell; // todo lo demás se deja igual
			})
		);
		
		return {
			...state,
			playerPosition: validMove ? newPos : playerPosition,
			dungeon: newDungeon,
		}
		
		default:
			return state;
	}
}

module.exports = gameReducer;
