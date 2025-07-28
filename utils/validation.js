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
 * Validates a courseId.
 * The value must be a valid string, 6 characters in length, of the format aa-123
 * @param {string} courseId The courseId to be validated.
 * @throws Will throw if course ID is invalid.
 */
export function validateCourseId(courseId) {
	courseId = validateString("courseId", courseId)
	if (courseId.length !== 6) throw `Error: ${courseId} must be 6 characters.`
  	if(!(/^[A-Za-z]{2}-\d{3}$/.test(courseId))) throw `Error: ${courseId} is invalid.`
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
	return courseName
}

/**
 * Validates a courseDescription.
 * The value must be a valid string and less than or equal 200 characters
 * @param {string} courseDescription The courseDescription to be validated.
 * @throws Will throw an error if description is invalid.
 */
export function validateCourseDescription(courseDescription) {
	courseName = validateString("courseDescription", courseDescription)
	if (courseName.length > 200) throw `Error: course description cannot exceed 20 character.`
	return courseName
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