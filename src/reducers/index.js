const { combineReducers } = require('redux');
const gameReducer = require('./gameReducer');

const rootReducer = combineReducers({
	game: gameReducer,
});

module.exports = rootReducer;
