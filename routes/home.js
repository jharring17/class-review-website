import { Router } from "express";
const router = Router();

// Render the home page
router.get('/', (req, res) => {
	res.status(200).render('home', { title: 'Home' });
});

// Render the register page
router.get('/register', (req, res) => {
	res.status(200).render('register');
});

// Render the login page
router.get('/login', (req, res) => {
	res.status(200).render('login');
});

// Logout the user and render the home page
router.route('/logout').get(async (req, res) => {
	req.session.destroy();
	return res.render('home', { title: 'Home' });
});

// Render the error page
router.get('/error', (req, res) => {
	res.status(404).render('error', { errorMessage: 'Error: Route not found' });
});

export default router;
