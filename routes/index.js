import courseRoutes from './courses.js';
const constructorMethod = (app) => {
	// On the / route render the home page.
	// app.use('/', homeRoutes);

	// Use the other routes
	app.use('/courses', courseRoutes);

	// If the route is not found, render the error page.
	app.use('*', (req, res) => {
		return res.status(404).render('error', { errorMessage: 'Error: Route not found' });
	});
};

export default constructorMethod;
