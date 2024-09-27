//Accion de generar un dungeon
const generateDungeonAction = (width, height, cellSize) => ({
	type: 'GENERATE_DUNGEON',
	payload: { width, height, cellSize},
});

//Acción de mover el jugador
const movePlayer = (direction) => {
	return {
		type: 'MOVE_PLAYER',
		payload: direction,
	};
};

module.exports = { movePlayer, generateDungeonAction };
