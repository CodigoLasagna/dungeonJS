const movePlayer = (direction) => {
	return {
		type: 'MOVE_PLAYER',
		payload: direction,
	};
};

module.exports = { movePlayer };
