import express from 'express';
import session from 'express-session';
const app = express();
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import exphbs from 'express-handlebars';
import configRoutes from './routes/index.js';
import { setUserLocals } from './middleware/auth.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const staticDir = express.static(__dirname + '/public');

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
	// If the user posts to the server with a property called _method, rewrite the request's method
	// To be that method; so if they post _method=PUT you can now allow browsers to POST to a route that gets
	// rewritten in this middleware to a PUT route
	if (req.body && req.body._method) {
		req.method = req.body._method;
		delete req.body._method;
	}

	// let the next middleware run:
	next();
};

// Sets a cookie.
app.use(
	session({
		name: 'AuthCookie',
		user: {},
		secret: 'some secret string!',
		saveUninitialized: true,
		resave: true,
	})
);

// Login Middleware
app.use('/login', (req, res, next) => {
	if (req.session.user) {
		if (req.session.user.role === 'admin') {
			return res.redirect('/admin');
		} else {
			return res.redirect('/student');
		}
	} else {
		next();
	}
});

// Register Middleware
app.use('/register', (req, res, next) => {
	if (req.session.user) {
		if (req.session.user.role === 'admin') {
			return res.redirect('/admin');
		} else {
			return res.redirect('/student');
		}
	} else {
		next();
	}
});

// student Middleware
app.use('/student', (req, res, next) => {
	if (req.session.user) {
		next();
	} else {
		return res.redirect('/login');
	}
});

// Admin Middleware
app.use('/admin', (req, res, next) => {
	if (req.session.user) {
		if (req.session.user.role === 'admin') {
			next();
		} else {
			return res.redirect('/error');
		}
	} else {
		return res.redirect('/login');
	}
});

// Logout Middleware
app.use('/logout', (req, res, next) => {
	if (req.session.user) {
		next();
	} else {
		return res.redirect('/login');
	}
});

// Logging Middleware
app.use(async (req, res, next) => {
	let date = new Date().toUTCString();
	let method = req.method;
	let route = req.originalUrl;
	let message;
	if (req.session.user) {
		message = `[${date}]: ${method} ${route} (Authenticated User)`;
	} else {
		message = `[${date}]: ${method} ${route} (Non-Authenticated User)`;
	}
	console.log(message);
	next();
});

app.use('/public', staticDir);
app.use(express.urlencoded({ extended: true }));
app.use(rewriteUnsupportedBrowserMethods);
app.use(setUserLocals);

// helpers used by search/admin templates
const hbsHelpers = {
  eq: (a, b) => a === b,
  fmt: (n) => (typeof n === 'number' ? n.toFixed(1) : n),
  isAdmin: (user) => user && String(user.role).toLowerCase() === 'admin',
};

app.engine(
  'handlebars', 
  exphbs.engine({ 
    defaultLayout: 'main', 
    helpers: {
      eq: (a, b) => a === b, 
      fmt: (n) => (typeof n === 'number' ? n.toFixed(1) : n), 
      isAdmin: (user) => user && user.role === 'admin',
    } 
  })
);

app.set('view engine', 'handlebars');

app.listen(3000, () => {
	console.log("We've now got a server!");
	console.log('Your routes will be running on http://localhost:3000');
});
configRoutes(app);