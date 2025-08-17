import {
	validateString,
	validUrl,
	validArrayOfObjectIds,
	validateImgLink,
	validateName,
	validatePasswordInputs,
	validateRole,
} from '../utils/validation.js';
import { ObjectId } from 'mongodb';
import { users } from '../config/mongoCollections.js';
import bcrypt from 'bcrypt';

const createUser = async (firstName, lastName, username, password, bio, imgLink, role) => {
	firstName = validateName(firstName);
	lastName = validateName(lastName);
	username = validateString('Username', username);
	password = validatePasswordInputs(password);
	bio = validateString('Bio', bio);
	imgLink = await validateImgLink(imgLink);
	role = validateRole(role);

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
	const { firstName, lastName, username, password, bio, imgLink, role } = fieldsToUpdate;
	if (firstName) updateData.firstName = validateName(firstName);
	if (lastName) updateData.lastName = validateName(lastName);
	if (username) {
		updateData.username = validateString('Username', username);
		const usersCollection = await users();
		const existingUser = await usersCollection.findOne({ username: username.toLowerCase() });
		if (existingUser && existingUser._id.toString() !== userId) {
			throw 'Username already exists';
		}
		updateData.username = username.toLowerCase();
	}
	if (password) {
		updateData.password = validatePasswordInputs(password);
		updateData.password = await bcrypt.hash(updateData.password, 10);
	}
	if (bio) updateData.bio = validateString('bio', bio);
	if (imgLink) updateData.imgLink = await validateImgLink(imgLink);
	if (role) updateData.role = validateRole(role);

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

	console.log('in data functions' + username);
	console.log(password);

	// Gets the users collection.
	const usersCollection = await users();

	// Gets the user with the matching email.
	const user = await usersCollection.findOne({ username: username.toLowerCase() });
	if (user == null) {
		throw 'Error: Either the username or password is invalid.';
	}

	// Checks if the password matches the hashed password.
	const match = await bcrypt.compare(password, user.password);
	if (match) {
		// Returns user information.
		return {
			_id: user._id.toString(),
			firstName: user.firstName,
			lastName: user.lastName,
			username: user.username,
			bio: user.bio,
			imgLink: user.imgLink,
			role: user.role,
			lastViewed: user.lastViewed,
		};
	} else {
		throw 'Error: Either the username or password is invalid.';
	}
};

export { createUser, getAllUsers, getUserById, removeUser, updateUser, addViewedClass, loginUser };
