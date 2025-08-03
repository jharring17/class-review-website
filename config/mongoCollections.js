import { dbConnection } from './mongoConnections.js';

const getCollectionFn = (collection) => {
	let _col = undefined;

	return async () => {
		if (!_col) {
			const db = await dbConnection();
			_col = await db.collection(collection);
		}

		return _col;
	};
};

// Note: You will need to change the code below to have the collection required by the assignment!
export const users = getCollectionFn('users');
export const courses = getCollectionFn('courses'); //renamed 'classes' to 'courses' - SS
export const comments = getCollectionFn('comments'); //added for comments.js - SS