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