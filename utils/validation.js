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