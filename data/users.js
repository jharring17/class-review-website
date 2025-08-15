// this file contains methods for the users collection

import { validateString, validUrl, validArrayOfObjectIds, validateImgLink } from '../utils/validation.js';
import { ObjectId } from 'mongodb';
import { users } from '../config/mongoCollections.js';
import bcrypt from 'bcrypt';

const createUser = async (firstName, lastName, username, password, bio, imgLink, role) => {
	firstName = validateString('First Name', firstName);
	lastName = validateString('Last Name', lastName);
	username = validateString('Username', username);
	password = validateString('Password', password); // Assume password is already hashed
	bio = validateString('Bio', bio);
	imgLink = await validateImgLink(imgLink);
	role = validateString(role, 'Role (e.g., student, teacher)');

	let hashedPassword = await bcrypt.hash(password, 10);

	const newUser = {
		firstName: firstName,
		lastName: lastName,
		username: username.toLowerCase(),
		password: hashedPassword,
		bio: bio,
		imgLink: imgLink,
		role: role,
		lastViewed: [],
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	const usersCollection = await users();
	const existingUser = await usersCollection.findOne({ username: username });
	if (existingUser) throw 'Username already exists';

	const insertResult = await usersCollection.insertOne(newUser);
	if (!insertResult.insertedId) throw 'Failed to create user';
	return await getUserById(insertResult.insertedId.toString());
};

const getAllUsers = async () => {
	const usersCollection = await users();
	const all = await usersCollection
		.find({}, { projection: { firstName: 1, lastName: 1, username: 1, role: 1 } })
		.toArray();
	return all.map((user) => ({
		_id: user._id.toString(),
		firstName: user.firstName,
		lastName: user.lastName,
		username: user.username,
		role: user.role,
	}));
};

const getUserById = async (userId) => {
	if (!ObjectId.isValid(userId)) throw 'Invalid user ID';
	const usersCollection = await users();
	const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
	if (!user) throw 'User not found';
	user._id = user._id.toString();
	return user;
};

const removeUser = async (userId) => {
	if (!ObjectId.isValid(userId)) throw 'Invalid user ID';
	const usersCollection = await users();
	const deletionInfo = await usersCollection.deleteOne({ _id: new ObjectId(userId) });
	if (deletionInfo.deletedCount === 0) throw `Could not delete user with id ${userId}`;
	return { userId, deleted: true };
};

const updateUser = async (userId, fieldsToUpdate) => {
	if (!ObjectId.isValid(userId)) throw 'Invalid user ID';

	const updateData = {};
	const { firstName, lastName, password, bio, imgLink, role, lastViewed } = fieldsToUpdate;

	if (firstName) updateData.firstName = validateString(firstName, 'First Name');
	if (lastName) updateData.lastName = validateString(lastName, 'Last Name');
	if (password) updateData.password = validateString(password, 'Password'); // Assume updated passwords are hashed
	if (bio) updateData.bio = validateString(bio, 'Bio');
	if (imgLink) updateData.imgLink = validUrl(imgLink, 'Image Link');
	if (role) updateData.role = validateString(role, 'Role');
	if (lastViewed) updateData.lastViewed = validArrayOfObjectIds(lastViewed, 'Last Viewed IDs');

	updateData.updatedAt = new Date();

	if (Object.keys(updateData).length === 0) {
		throw 'No valid fields provided to update';
	}

	const usersCollection = await users();
	const updateInfo = await usersCollection.updateOne(
		{ _id: new ObjectId(userId) },
		{ $set: updateData }
	);

	if (updateInfo.modifiedCount === 0) throw 'Update failed — no changes were made';
	return await getUserById(userId);
};

//added last viewed class for limit of 3 - SS
const addViewedClass = async (userId, courseId) => {
	if (!ObjectId.isValid(userId)) throw 'Invalid user ID';
	if (!ObjectId.isValid(courseId)) throw 'Invalid course ID';
	const usersCollection = await users();
	const updateInfo = await usersCollection.updateOne(
		{ _id: new ObjectId(userId) },
		{
			$push: {
				lastViewed: {
					$each: [courseId],
					$position: 0,
					$slice: 3,
				},
			},
			$set: { updatedAt: new Date() },
		}
	);
	if (updateInfo.modifiedCount === 0) throw 'Could not update last viewed classes';
	return await getUserById(userId);
};

// Checks user credentials.
const loginUser = async (username, password) => {
	// Validates the inputs.
	username = validateString('username', username);
	password = validateString('password', password);

    console.log("TESTING: {username: " + username + ", password: " + password + "}");

	// Gets the users collection.
	const usersCollection = await users();

    console.log("GOT COLLECTION")

	// Gets the user with the matching email.
	const user = await usersCollection.findOne({ username: username.toLowerCase() });
	if (user == null) {
		throw 'Error: Either the username or password is invalid.';
	}

    console.log("TESTING: user found: " + JSON.stringify(user));
    console.log("TESTING: user password: " + user.password);

	// Checks if the password matches the hashed password.
	const match = await bcrypt.compare(password, user.password); //! need to update user function not storing right
	if (match) {
		// Returns user information.
		return {
			_id: user._id.toString(),
			firstName: user.firstName,
			lastName: user.lastName,
			username: user.username,
			role: user.role,
		};
	} else {
		throw 'Error: Either the username or password is invalid.';
	}
};

export {
	createUser,
	getAllUsers,
	getUserById,
	removeUser,
	updateUser,
	addViewedClass,
	loginUser,
};
