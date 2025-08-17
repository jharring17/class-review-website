// routes/users.js
import express from 'express';
import { createUser, getUserById, updateUser, loginUser } from '../data/users.js';
import { requireAuth } from '../middleware/auth.js';
import * as validation from '../utils/validation.js'

const router = express.Router();

// Get the user dashboard if they are logged in.
router.get('/userDashboard', async (req, res) => {
	// If the user is logged in, render dashboard, else redirect to login
	try {
		console.log(req.session.user);
		if (!req.session.user) {
			console.log('User not logged in, redirecting to login page');
			return res.status(403).redirect('/login');
		} else {
			res.status(200).render('userDashboard', { title: 'Dashboard', user: req.session.user });
		}
	} catch (e) {
		res.status(401).json({ error: e?.toString?.() || 'Invalid credentials' });
	}
});

// Get the user profile
router.get('/:id', async (req, res) => {
	try {
		let userId = req.params.id;

		// prevent another user from accessing userProfile
		if (!req.session.user || req.session.user._id !== userId) {
			return res.status(403).redirect('/');
		} else {
			// get the user details and render the profile
			const user = await getUserById(req.params.id);
			res.status(200).render('userProfile', { user });
		}
	} catch (e) {
		res.status(404).json({ error: e?.toString?.() || 'User not found' });
	}
});

// Register a new user
router.post('/register', async (req, res) => {
	try {
		const created = await createUser(req.body);
		res.status(201).json(created);
	} catch (e) {
		res.status(400).json({ error: e?.toString?.() || 'Bad request' });
	}
});

// Login a user
router.post('/login', async (req, res) => {
	try {
		const user = await loginUser(req.body.username, req.body.password);
		req.session.user = user;
		res.status(200).redirect('/user/userDashboard');
	} catch (e) {
		res.status(401).json({ error: e?.toString?.() || 'Invalid credentials' });
	}
});

// logout the user
router.get('/logout', (req, res) => {
	req.session.destroy(() => res.json({ ok: true }));
});

// render the update page for user profile
router.get('/editProfile/:id', requireAuth, async (req, res) => {
	try {
		// prevent users from updating other accounts if not logged in
		if (!req.session.user) {
			console.log('User not authorized to edit this profile');
			return res.status(403).redirect('/');
		}

		// render the edit profile page
		res.status(200).render('userEditProfile', { user: req.session.user });
	} catch (e) {
		console.log('Error rendering edit profile page:', e);
		return res.status(500).redirect('/');
	}
});

// update the user profile
router.post('/editProfile/:id', requireAuth, async (req, res) => {

  console.log('Editing profile for user:', req.params.id);
  console.log(req.body);

  try {
		// prevent users from updating other accounts if not logged in
		if (!req.session.user || req.session.user._id !== req.params.id) {
			console.log('User not authorized to edit this profile');
			return res.status(403).redirect('/');
		}

		// validate all of the user fields
		let { firstName, lastName, username, password, bio, imgLink, role } = req.body;
		try {
			firstName = validation.validateName(firstName);
			lastName = validation.validateName(lastName);
			username = validation.validateString('Username', username);
			password = validation.validatePasswordInputs(password);
			bio = validation.validateString('Bio', bio);
			imgLink = await validation.validateImgLink(imgLink);
			role = validateRole(role);
		} catch (e) {
			console.log(e);
		}

		// attempt to update the user with validated credentials
		const updated = await updateUser(req.session.user._id, {
			firstName,
			lastName,
			username,
			password,
			bio,
			imgLink,
			role,
		});
		console.log('User updated successfully:', updated);

		// update the user session to include new values
		req.session.user = await getUserById(req.session.user._id);

		// return 200 and redirect to user profile with updates
		return res.status(200).redirect(`/user/${req.session.user._id}`);
	} catch (e) {
		res.status(400).json({ error: e?.toString?.() || 'Bad request' });
	}
});

export default router;
