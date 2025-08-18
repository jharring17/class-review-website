import homeRoutes from './home.js';
import courseRoutes from './courses.js';
import statRoutes from './stats.js';
import userRoutes from './users.js';

const constructorMethod = (app) => {
	// On the / route render the home page.
	app.use('/', homeRoutes);

	// Use the other routes
	app.use('/course', courseRoutes);
	app.use('/stats', statRoutes);
	app.use('/user', userRoutes);

	// If the route is not found, render the error page.
	app.use('*', (req, res) => {
		return res.status(404).render('error', { errorMessage: 'Error: Route not found' });
	});
};

export default constructorMethod;
