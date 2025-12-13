"use strict";

const frenchStrings = require("./i18n.fr");
const englishStrings = require("./i18n.en");

const ENGLISH = "en";
const FRENCH = "fr";

/**
 * Determine the language to use based on the browser.
 * This sets window.applicationLanguage for backward compatibility.
 */
function detectBrowserLanguage() {
	const langTag = (navigator.language || navigator.userLanguage || ENGLISH).toLowerCase();
	window.applicationLanguage = langTag;
	return langTag;
}

/**
 * Returns true if the detected language is French.
 */
function isFrench() {
	return window.applicationLanguage.includes(FRENCH);
}

/**
 * Returns true if the detected language is English.
 */
function isEnglish() {
	return window.applicationLanguage.includes(ENGLISH);
}

/**
 * Main export — returns the correct i18n object based on navigator language.
 */
function getI18n() {
	if (isFrench()) return frenchStrings;
	if (isEnglish()) return englishStrings;

	// default to English
	return englishStrings;
}

// Run detection immediately (same behavior as original IIFE)
detectBrowserLanguage();

module.exports = {
	i18n: getI18n
};
