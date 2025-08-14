import { Router } from "express";
const router = Router();

// Render the home page
router.get('/', (req, res) => {
	res.status(200).render('home');
});

// Render the register page
router.get('/register', (req, res) => {
	res.status(200).render('register');
});

// Render the login page
router.get('/login', (req, res) => {
	res.status(200).render('login');
});

// Render the error page
router.get('/error', (req, res) => {
	res.status(404).render('error', { errorMessage: 'Error: Route not found' });
});

export default router;
