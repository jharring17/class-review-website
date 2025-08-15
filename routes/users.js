import express from 'express';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  removeUser,
  addViewedClass,
  loginUser
} from '../data/users.js';
import * as validation from '../utils/validation.js'
const router = express.Router();

//GET /users
router.get('/', async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } 
  catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

//GET /users/:id
router.get('/:id', async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    res.json(user);
  } 
  catch (e) {
    res.status(404).json({ error: e.toString() });
  }
});

//PUT /users/:id
router.put('/:id', async (req, res) => {
  try {
    const updated = await updateUser(req.params.id, req.body);
    res.json(updated);
  } 
  catch (e) {
    res.status(400).json({ error: e.toString() });
  }
});

//DELETE /users/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await removeUser(req.params.id);
    res.json(result);
  } 
  catch (e) {
    res.status(400).json({ error: e.toString() });
  }
});

//PATCH /users/:id/viewed
router.patch('/:id/viewed', async (req, res) => {
  try {
    const { courseId } = req.body;
    const updatedUser = await addViewedClass(req.params.id, courseId);
    res.json(updatedUser);
  } 
  catch (e) {
    res.status(400).json({ error: e.toString() });
  }
});

// POST /users - register route
router.post('/register', async (req, res) => {
  try {
    // register the user
    const { firstName, lastName, username, password, bio, imgLink, role } = req.body;
    const newUser = await createUser(firstName, lastName, username, password, bio, imgLink, role);
    return res.status(201).render('login', { title: 'Login' });
  } 
  catch (e) {
    res.status(400).json({ error: e.toString() });
  }
});

// POST /users/login - Login route
router.route('/login').post(async (req, res) => {
	const { username, password } = req.body;
	try {

    console.log("TESTING: {username: " + username + ", password: " + password + "}");

    // login the user and set the session
		const user = await loginUser(username, password);
		req.session.user = user;
		return res.status(200).render('dashboard', { title: 'Dashboard', user });
	} catch (e) {
		res.status(400).json({ error: e.toString() });
	}
});

// GET /users/logout - Logout route
router.route('/logout').get(async (req, res) => {
	// logout user and redirect to home
	req.session.destroy();
	return res.render('home', { title: 'Home' });
});

export default router;
