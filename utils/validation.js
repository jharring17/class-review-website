import axios from 'axios'

/**
 * Validates a string.
 * The value must be provided as a non-empty string that is not only spaces.
 * @param {string} title - The title to validate.
 * @returns {string} The validated and trimmed string.
 * @throws Will throw an error if the string is invalid.
 */
export function validateString(name, value) {
	if (!value) throw `Error: ${name} must be provided.`;
	if (typeof value !== 'string') throw `Error: ${name} must be a string.`;
	if (value.trim() === '') throw `Error: ${name} cannot be empty spaces.`;
	return value.trim();
}

/**
 * Validates a courseCode.
 * The value must be a valid string, 6 characters in length, of the format aa-123
 * @param {string} courseId The courseId to be validated.
 * @throws Will throw if course ID is invalid.
 */
export function validateCourseCode(courseId) {
	courseId = validateString("courseId", courseId)
	if (courseId.length < 6 || courseId.length > 7) throw `Error: ${courseId} must be 6 to 7 characters.`
  	if(!(/^[A-Za-z]{2,3}-\d{3}$/.test(courseId))) throw `Error: ${courseId} is invalid.`
	courseId = courseId.toLowerCase()
	return courseId
}

/**
 * Validates a courseName.
 * The value must be a valid string and less than or equal 20 characters
 * @param {string} courseName The courseName to be validated.
 * @throws Will throw if course name is invalid.
 */
export function validateCourseName(courseName) {
	courseName = validateString("courseName", courseName)
	if (courseName.length > 20) throw `Error: course name cannot exceed 20 character.`
	if (!(/^[A-Za-z\s]+$/.test(courseName))) throw `Error: course name can only contain letters and spaces.`
	return courseName
}

/**
 * Validates a courseDescription.
 * The value must be a valid string and less than or equal 200 characters
 * @param {string} courseDescription The courseDescription to be validated.
 * @throws Will throw an error if description is invalid.
 */
export function validateCourseDescription(courseDescription) {
	courseDescription = validateString("courseDescription", courseDescription)
	if (courseDescription.length > 200) throw `Error: course description cannot exceed 200 character.`
	return courseDescription
}

/**
 * Validates a imgLink.
 * @param {string} courseDescription The courseDescription to be validated.
 * @throws Will throw an error if link is improperly formatted or does not exist
 */
export async function validateImgLink(imgLink) {
	imgLink = validateString("imgLink", imgLink)
	
	// validate img format
	if (!imgLink.match(/^https?:\/\/.+\.(jpg|jpeg|png)$/))
		throw `Error: ${imgLink} is not a valid link.`;

	// attempt to get the img
	try {
		const result = await axios.get(imgLink)
	} catch(e) {
		throw `Error: ${imgLink} cannot be reached.`
	}
	return imgLink;
}

/**
 * Validates a professor name
 * @param {string} professor The name of the professor to be validated
 * @throws Will throw an error if the professor name is improperly formatted.
 */
export function validateProfessor(professor) {
	professor = validateString("professor", professor)
	if (professor.length < 5 || professor.length > 50) throw `Error: name must be 5 to 50 characters.`
	if (!(/^[A-Za-z'-]+\s[A-Za-z'-]+$/.test(professor))) throw `Error: name must be of the format <firstname> <lastname>.`
	return professor
}
/*
 * @param arr - the array of strings
 * @param fieldName - the name of the field to validate against
 * @returns {*}
 */
export const validArrayOfStrings = (arr, fieldName) => {
	if (!Array.isArray(arr) || arr.length === 0)
		throw `${fieldName} must be a non-empty array`;
	for (let s of arr) {
		if (typeof s !== 'string' || s.trim().length === 0)
			throw `Each item in ${fieldName} must be a non-empty string`;
	}
	return arr.map((s) => s.trim());
};

export const isValidDate = (dateStr) => {
	const regex = /^\d{2}\/\d{2}\/\d{4}$/;
	if (!regex.test(dateStr)) throw 'Date must be in MM/DD/YYYY format';
	const [month, day, year] = dateStr.split('/').map(Number);
	const date = new Date(year, month - 1, day);
	if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day)
		throw 'Invalid date';
	return dateStr;
};

export const isValidRuntime = (runtime) => {
	if (!runtime || typeof runtime !== 'string') throw 'Runtime must be a string';
	const regex = /^\d+h\s\d+min$/;
	if (!regex.test(runtime)) throw 'Runtime must be in format "Xh Ymin"';
	return runtime;
};

/**
 * Validates that a given value is a properly formatted URL
 * @param {string} url - The URL string to validate
 * @param {string} fieldName - The name of the field being validated, used for error messages
 * @returns {string} - Returns the valid URL if it passes validation
 * @throws Will throw an error if the URL is invalid or not a string
 */
export const validUrl = (url, fieldName) => {
	if (typeof url !== 'string' || url.trim().length === 0) {
		throw `${fieldName} must be a non-empty string`;
	}

	const trimmedUrl = url.trim();
	try {
		const urlObject = new URL(trimmedUrl);

		if (urlObject.protocol !== 'http:' && urlObject.protocol !== 'https:') {
			throw `${fieldName} must start with 'http://' or 'https://'`;
		}
	} catch (e) {
		throw `${fieldName} is not a valid URL: ${e.message}`;
	}

	return trimmedUrl;
};


import { ObjectId } from 'mongodb';

/**
 * Validates that a given value is an array of valid MongoDB ObjectIds
 * @param {Array} array - The array to validate
 * @param {string} fieldName - The name of the field being validated, used for error messages
 * @returns {Array} - Returns an array of valid ObjectId instances
 * @throws Will throw an error if the input is not an array or contains invalid ObjectId strings
 */
export const validArrayOfObjectIds = (array, fieldName) => {
	if (!Array.isArray(array)) {
		throw `${fieldName} must be an array`;
	}

	if (array.length === 0) {
		throw `${fieldName} must not be an empty array`;
	}

	// Validate each ID
	const objectIds = array.map((id, index) => {
		if (typeof id !== 'string' || id.trim().length === 0) {
			throw `${fieldName}[${index}] must be a non-empty string`;
		}

		const trimmedId = id.trim();
		if (!ObjectId.isValid(trimmedId)) {
			throw `${fieldName}[${index}] is not a valid MongoDB ObjectId`;
		}

		return new ObjectId(trimmedId); // Return the ObjectId instance for valid strings
	});

	return objectIds;
};