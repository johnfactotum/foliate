(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("xmldom"), (function webpackLoadOptionalExternalModule() { try { return require("jszip"); } catch(e) {} }()));
	else if(typeof define === 'function' && define.amd)
		define(["xmldom", "jszip"], factory);
	else if(typeof exports === 'object')
		exports["ePub"] = factory(require("xmldom"), (function webpackLoadOptionalExternalModule() { try { return require("jszip"); } catch(e) {} }()));
	else
		root["ePub"] = factory(root["xmldom"], root["jszip"]);
})(typeof self !== 'undefined' ? self : this, function(__WEBPACK_EXTERNAL_MODULE_42__, __WEBPACK_EXTERNAL_MODULE_73__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/dist/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 25);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.uuid = uuid;
exports.documentHeight = documentHeight;
exports.isElement = isElement;
exports.isNumber = isNumber;
exports.isFloat = isFloat;
exports.prefixed = prefixed;
exports.defaults = defaults;
exports.extend = extend;
exports.insert = insert;
exports.locationOf = locationOf;
exports.indexOfSorted = indexOfSorted;
exports.bounds = bounds;
exports.borders = borders;
exports.nodeBounds = nodeBounds;
exports.windowBounds = windowBounds;
exports.indexOfNode = indexOfNode;
exports.indexOfTextNode = indexOfTextNode;
exports.indexOfElementNode = indexOfElementNode;
exports.isXml = isXml;
exports.createBlob = createBlob;
exports.createBlobUrl = createBlobUrl;
exports.revokeBlobUrl = revokeBlobUrl;
exports.createBase64Url = createBase64Url;
exports.type = type;
exports.parse = parse;
exports.qs = qs;
exports.qsa = qsa;
exports.qsp = qsp;
exports.sprint = sprint;
exports.treeWalker = treeWalker;
exports.walk = walk;
exports.blob2base64 = blob2base64;
exports.defer = defer;
exports.querySelectorByType = querySelectorByType;
exports.findChildren = findChildren;
exports.parents = parents;
exports.filterChildren = filterChildren;
exports.getParentByTagName = getParentByTagName;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Core Utilities and Helpers
 * @module Core
*/

/**
 * Vendor prefixed requestAnimationFrame
 * @returns {function} requestAnimationFrame
 * @memberof Core
 */
var requestAnimationFrame = exports.requestAnimationFrame = typeof window != "undefined" ? window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame : false;
var ELEMENT_NODE = 1;
var TEXT_NODE = 3;
var COMMENT_NODE = 8;
var DOCUMENT_NODE = 9;
var _URL = typeof URL != "undefined" ? URL : typeof window != "undefined" ? window.URL || window.webkitURL || window.mozURL : undefined;

/**
 * Generates a UUID
 * based on: http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
 * @returns {string} uuid
 * @memberof Core
 */
function uuid() {
	var d = new Date().getTime();
	var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
		var r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c == "x" ? r : r & 0x7 | 0x8).toString(16);
	});
	return uuid;
}

/**
 * Gets the height of a document
 * @returns {number} height
 * @memberof Core
 */
function documentHeight() {
	return Math.max(document.documentElement.clientHeight, document.body.scrollHeight, document.documentElement.scrollHeight, document.body.offsetHeight, document.documentElement.offsetHeight);
}

/**
 * Checks if a node is an element
 * @param {object} obj
 * @returns {boolean}
 * @memberof Core
 */
function isElement(obj) {
	return !!(obj && obj.nodeType == 1);
}

/**
 * @param {any} n
 * @returns {boolean}
 * @memberof Core
 */
function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * @param {any} n
 * @returns {boolean}
 * @memberof Core
 */
function isFloat(n) {
	var f = parseFloat(n);

	if (isNumber(n) === false) {
		return false;
	}

	if (typeof n === "string" && n.indexOf(".") > -1) {
		return true;
	}

	return Math.floor(f) !== f;
}

/**
 * Get a prefixed css property
 * @param {string} unprefixed
 * @returns {string}
 * @memberof Core
 */
function prefixed(unprefixed) {
	var vendors = ["Webkit", "webkit", "Moz", "O", "ms"];
	var prefixes = ["-webkit-", "-webkit-", "-moz-", "-o-", "-ms-"];
	var lower = unprefixed.toLowerCase();
	var length = vendors.length;

	if (typeof document === "undefined" || typeof document.body.style[lower] != "undefined") {
		return unprefixed;
	}

	for (var i = 0; i < length; i++) {
		if (typeof document.body.style[prefixes[i] + lower] != "undefined") {
			return prefixes[i] + lower;
		}
	}

	return unprefixed;
}

/**
 * Apply defaults to an object
 * @param {object} obj
 * @returns {object}
 * @memberof Core
 */
function defaults(obj) {
	for (var i = 1, length = arguments.length; i < length; i++) {
		var source = arguments[i];
		for (var prop in source) {
			if (obj[prop] === void 0) obj[prop] = source[prop];
		}
	}
	return obj;
}

/**
 * Extend properties of an object
 * @param {object} target
 * @returns {object}
 * @memberof Core
 */
function extend(target) {
	var sources = [].slice.call(arguments, 1);
	sources.forEach(function (source) {
		if (!source) return;
		Object.getOwnPropertyNames(source).forEach(function (propName) {
			Object.defineProperty(target, propName, Object.getOwnPropertyDescriptor(source, propName));
		});
	});
	return target;
}

/**
 * Fast quicksort insert for sorted array -- based on:
 *  http://stackoverflow.com/questions/1344500/efficient-way-to-insert-a-number-into-a-sorted-array-of-numbers
 * @param {any} item
 * @param {array} array
 * @param {function} [compareFunction]
 * @returns {number} location (in array)
 * @memberof Core
 */
function insert(item, array, compareFunction) {
	var location = locationOf(item, array, compareFunction);
	array.splice(location, 0, item);

	return location;
}

/**
 * Finds where something would fit into a sorted array
 * @param {any} item
 * @param {array} array
 * @param {function} [compareFunction]
 * @param {function} [_start]
 * @param {function} [_end]
 * @returns {number} location (in array)
 * @memberof Core
 */
function locationOf(item, array, compareFunction, _start, _end) {
	var start = _start || 0;
	var end = _end || array.length;
	var pivot = parseInt(start + (end - start) / 2);
	var compared;
	if (!compareFunction) {
		compareFunction = function compareFunction(a, b) {
			if (a > b) return 1;
			if (a < b) return -1;
			if (a == b) return 0;
		};
	}
	if (end - start <= 0) {
		return pivot;
	}

	compared = compareFunction(array[pivot], item);
	if (end - start === 1) {
		return compared >= 0 ? pivot : pivot + 1;
	}
	if (compared === 0) {
		return pivot;
	}
	if (compared === -1) {
		return locationOf(item, array, compareFunction, pivot, end);
	} else {
		return locationOf(item, array, compareFunction, start, pivot);
	}
}

/**
 * Finds index of something in a sorted array
 * Returns -1 if not found
 * @param {any} item
 * @param {array} array
 * @param {function} [compareFunction]
 * @param {function} [_start]
 * @param {function} [_end]
 * @returns {number} index (in array) or -1
 * @memberof Core
 */
function indexOfSorted(item, array, compareFunction, _start, _end) {
	var start = _start || 0;
	var end = _end || array.length;
	var pivot = parseInt(start + (end - start) / 2);
	var compared;
	if (!compareFunction) {
		compareFunction = function compareFunction(a, b) {
			if (a > b) return 1;
			if (a < b) return -1;
			if (a == b) return 0;
		};
	}
	if (end - start <= 0) {
		return -1; // Not found
	}

	compared = compareFunction(array[pivot], item);
	if (end - start === 1) {
		return compared === 0 ? pivot : -1;
	}
	if (compared === 0) {
		return pivot; // Found
	}
	if (compared === -1) {
		return indexOfSorted(item, array, compareFunction, pivot, end);
	} else {
		return indexOfSorted(item, array, compareFunction, start, pivot);
	}
}
/**
 * Find the bounds of an element
 * taking padding and margin into account
 * @param {element} el
 * @returns {{ width: Number, height: Number}}
 * @memberof Core
 */
function bounds(el) {

	var style = window.getComputedStyle(el);
	var widthProps = ["width", "paddingRight", "paddingLeft", "marginRight", "marginLeft", "borderRightWidth", "borderLeftWidth"];
	var heightProps = ["height", "paddingTop", "paddingBottom", "marginTop", "marginBottom", "borderTopWidth", "borderBottomWidth"];

	var width = 0;
	var height = 0;

	widthProps.forEach(function (prop) {
		width += parseFloat(style[prop]) || 0;
	});

	heightProps.forEach(function (prop) {
		height += parseFloat(style[prop]) || 0;
	});

	return {
		height: height,
		width: width
	};
}

/**
 * Find the bounds of an element
 * taking padding, margin and borders into account
 * @param {element} el
 * @returns {{ width: Number, height: Number}}
 * @memberof Core
 */
function borders(el) {

	var style = window.getComputedStyle(el);
	var widthProps = ["paddingRight", "paddingLeft", "marginRight", "marginLeft", "borderRightWidth", "borderLeftWidth"];
	var heightProps = ["paddingTop", "paddingBottom", "marginTop", "marginBottom", "borderTopWidth", "borderBottomWidth"];

	var width = 0;
	var height = 0;

	widthProps.forEach(function (prop) {
		width += parseFloat(style[prop]) || 0;
	});

	heightProps.forEach(function (prop) {
		height += parseFloat(style[prop]) || 0;
	});

	return {
		height: height,
		width: width
	};
}

/**
 * Find the bounds of any node
 * allows for getting bounds of text nodes by wrapping them in a range
 * @param {node} node
 * @returns {BoundingClientRect}
 * @memberof Core
 */
function nodeBounds(node) {
	var elPos = void 0;
	var doc = node.ownerDocument;
	if (node.nodeType == Node.TEXT_NODE) {
		var elRange = doc.createRange();
		elRange.selectNodeContents(node);
		elPos = elRange.getBoundingClientRect();
	} else {
		elPos = node.getBoundingClientRect();
	}
	return elPos;
}

/**
 * Find the equivelent of getBoundingClientRect of a browser window
 * @returns {{ width: Number, height: Number, top: Number, left: Number, right: Number, bottom: Number }}
 * @memberof Core
 */
function windowBounds() {

	var width = window.innerWidth;
	var height = window.innerHeight;

	return {
		top: 0,
		left: 0,
		right: width,
		bottom: height,
		width: width,
		height: height
	};
}

/**
 * Gets the index of a node in its parent
 * @param {Node} node
 * @param {string} typeId
 * @return {number} index
 * @memberof Core
 */
function indexOfNode(node, typeId) {
	var parent = node.parentNode;
	var children = parent.childNodes;
	var sib;
	var index = -1;
	for (var i = 0; i < children.length; i++) {
		sib = children[i];
		if (sib.nodeType === typeId) {
			index++;
		}
		if (sib == node) break;
	}

	return index;
}

/**
 * Gets the index of a text node in its parent
 * @param {node} textNode
 * @returns {number} index
 * @memberof Core
 */
function indexOfTextNode(textNode) {
	return indexOfNode(textNode, TEXT_NODE);
}

/**
 * Gets the index of an element node in its parent
 * @param {element} elementNode
 * @returns {number} index
 * @memberof Core
 */
function indexOfElementNode(elementNode) {
	return indexOfNode(elementNode, ELEMENT_NODE);
}

/**
 * Check if extension is xml
 * @param {string} ext
 * @returns {boolean}
 * @memberof Core
 */
function isXml(ext) {
	return ["xml", "opf", "ncx"].indexOf(ext) > -1;
}

/**
 * Create a new blob
 * @param {any} content
 * @param {string} mime
 * @returns {Blob}
 * @memberof Core
 */
function createBlob(content, mime) {
	return new Blob([content], { type: mime });
}

/**
 * Create a new blob url
 * @param {any} content
 * @param {string} mime
 * @returns {string} url
 * @memberof Core
 */
function createBlobUrl(content, mime) {
	var tempUrl;
	var blob = createBlob(content, mime);

	tempUrl = _URL.createObjectURL(blob);

	return tempUrl;
}

/**
 * Remove a blob url
 * @param {string} url
 * @memberof Core
 */
function revokeBlobUrl(url) {
	return _URL.revokeObjectURL(url);
}

/**
 * Create a new base64 encoded url
 * @param {any} content
 * @param {string} mime
 * @returns {string} url
 * @memberof Core
 */
function createBase64Url(content, mime) {
	var data;
	var datauri;

	if (typeof content !== "string") {
		// Only handles strings
		return;
	}

	data = btoa(encodeURIComponent(content));

	datauri = "data:" + mime + ";base64," + data;

	return datauri;
}

/**
 * Get type of an object
 * @param {object} obj
 * @returns {string} type
 * @memberof Core
 */
function type(obj) {
	return Object.prototype.toString.call(obj).slice(8, -1);
}

/**
 * Parse xml (or html) markup
 * @param {string} markup
 * @param {string} mime
 * @param {boolean} forceXMLDom force using xmlDom to parse instead of native parser
 * @returns {document} document
 * @memberof Core
 */
function parse(markup, mime, forceXMLDom) {
	var doc;
	var Parser;

	if (typeof DOMParser === "undefined" || forceXMLDom) {
		Parser = __webpack_require__(42).DOMParser;
	} else {
		Parser = DOMParser;
	}

	// Remove byte order mark before parsing
	// https://www.w3.org/International/questions/qa-byte-order-mark
	if (markup.charCodeAt(0) === 0xFEFF) {
		markup = markup.slice(1);
	}

	doc = new Parser().parseFromString(markup, mime);

	return doc;
}

/**
 * querySelector polyfill
 * @param {element} el
 * @param {string} sel selector string
 * @returns {element} element
 * @memberof Core
 */
function qs(el, sel) {
	var elements;
	if (!el) {
		throw new Error("No Element Provided");
	}

	if (typeof el.querySelector != "undefined") {
		return el.querySelector(sel);
	} else {
		elements = el.getElementsByTagName(sel);
		if (elements.length) {
			return elements[0];
		}
	}
}

/**
 * querySelectorAll polyfill
 * @param {element} el
 * @param {string} sel selector string
 * @returns {element[]} elements
 * @memberof Core
 */
function qsa(el, sel) {

	if (typeof el.querySelector != "undefined") {
		return el.querySelectorAll(sel);
	} else {
		return el.getElementsByTagName(sel);
	}
}

/**
 * querySelector by property
 * @param {element} el
 * @param {string} sel selector string
 * @param {object[]} props
 * @returns {element[]} elements
 * @memberof Core
 */
function qsp(el, sel, props) {
	var q, filtered;
	if (typeof el.querySelector != "undefined") {
		sel += "[";
		for (var prop in props) {
			sel += prop + "~='" + props[prop] + "'";
		}
		sel += "]";
		return el.querySelector(sel);
	} else {
		q = el.getElementsByTagName(sel);
		filtered = Array.prototype.slice.call(q, 0).filter(function (el) {
			for (var prop in props) {
				if (el.getAttribute(prop) === props[prop]) {
					return true;
				}
			}
			return false;
		});

		if (filtered) {
			return filtered[0];
		}
	}
}

/**
 * Sprint through all text nodes in a document
 * @memberof Core
 * @param  {element} root element to start with
 * @param  {function} func function to run on each element
 */
function sprint(root, func) {
	var doc = root.ownerDocument || root;
	if (typeof doc.createTreeWalker !== "undefined") {
		treeWalker(root, func, NodeFilter.SHOW_TEXT);
	} else {
		walk(root, function (node) {
			if (node && node.nodeType === 3) {
				// Node.TEXT_NODE
				func(node);
			}
		}, true);
	}
}

/**
 * Create a treeWalker
 * @memberof Core
 * @param  {element} root element to start with
 * @param  {function} func function to run on each element
 * @param  {function | object} filter funtion or object to filter with
 */
function treeWalker(root, func, filter) {
	var treeWalker = document.createTreeWalker(root, filter, null, false);
	var node = void 0;
	while (node = treeWalker.nextNode()) {
		func(node);
	}
}

/**
 * @memberof Core
 * @param {node} node
 * @param {callback} return false for continue,true for break inside callback
 */
function walk(node, callback) {
	if (callback(node)) {
		return true;
	}
	node = node.firstChild;
	if (node) {
		do {
			var walked = walk(node, callback);
			if (walked) {
				return true;
			}
			node = node.nextSibling;
		} while (node);
	}
}

/**
 * Convert a blob to a base64 encoded string
 * @param {Blog} blob
 * @returns {string}
 * @memberof Core
 */
function blob2base64(blob) {
	return new Promise(function (resolve, reject) {
		var reader = new FileReader();
		reader.readAsDataURL(blob);
		reader.onloadend = function () {
			resolve(reader.result);
		};
	});
}

/**
 * Creates a new pending promise and provides methods to resolve or reject it.
 * From: https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Promise.jsm/Deferred#backwards_forwards_compatible
 * @memberof Core
 */
function defer() {
	var _this = this;

	/* A method to resolve the associated Promise with the value passed.
  * If the promise is already settled it does nothing.
  *
  * @param {anything} value : This value is used to resolve the promise
  * If the value is a Promise then the associated promise assumes the state
  * of Promise passed as value.
  */
	this.resolve = null;

	/* A method to reject the assocaited Promise with the value passed.
  * If the promise is already settled it does nothing.
  *
  * @param {anything} reason: The reason for the rejection of the Promise.
  * Generally its an Error object. If however a Promise is passed, then the Promise
  * itself will be the reason for rejection no matter the state of the Promise.
  */
	this.reject = null;

	this.id = uuid();

	/* A newly created Pomise object.
  * Initially in pending state.
  */
	this.promise = new Promise(function (resolve, reject) {
		_this.resolve = resolve;
		_this.reject = reject;
	});
	Object.freeze(this);
}

/**
 * querySelector with filter by epub type
 * @param {element} html
 * @param {string} element element type to find
 * @param {string} type epub type to find
 * @returns {element[]} elements
 * @memberof Core
 */
function querySelectorByType(html, element, type) {
	var query;
	if (typeof html.querySelector != "undefined") {
		query = html.querySelector(element + "[*|type=\"" + type + "\"]");
	}
	// Handle IE not supporting namespaced epub:type in querySelector
	if (!query || query.length === 0) {
		query = qsa(html, element);
		for (var i = 0; i < query.length; i++) {
			if (query[i].getAttributeNS("http://www.idpf.org/2007/ops", "type") === type || query[i].getAttribute("epub:type") === type) {
				return query[i];
			}
		}
	} else {
		return query;
	}
}

/**
 * Find direct decendents of an element
 * @param {element} el
 * @returns {element[]} children
 * @memberof Core
 */
function findChildren(el) {
	var result = [];
	var childNodes = el.childNodes;
	for (var i = 0; i < childNodes.length; i++) {
		var node = childNodes[i];
		if (node.nodeType === 1) {
			result.push(node);
		}
	}
	return result;
}

/**
 * Find all parents (ancestors) of an element
 * @param {element} node
 * @returns {element[]} parents
 * @memberof Core
 */
function parents(node) {
	var nodes = [node];
	for (; node; node = node.parentNode) {
		nodes.unshift(node);
	}
	return nodes;
}

/**
 * Find all direct decendents of a specific type
 * @param {element} el
 * @param {string} nodeName
 * @param {boolean} [single]
 * @returns {element[]} children
 * @memberof Core
 */
function filterChildren(el, nodeName, single) {
	var result = [];
	var childNodes = el.childNodes;
	for (var i = 0; i < childNodes.length; i++) {
		var node = childNodes[i];
		if (node.nodeType === 1 && node.nodeName.toLowerCase() === nodeName) {
			if (single) {
				return node;
			} else {
				result.push(node);
			}
		}
	}
	if (!single) {
		return result;
	}
}

/**
 * Filter all parents (ancestors) with tag name
 * @param {element} node
 * @param {string} tagname
 * @returns {element[]} parents
 * @memberof Core
 */
function getParentByTagName(node, tagname) {
	var parent = void 0;
	if (node === null || tagname === '') return;
	parent = node.parentNode;
	while (parent.nodeType === 1) {
		if (parent.tagName.toLowerCase() === tagname) {
			return parent;
		}
		parent = parent.parentNode;
	}
}

/**
 * Lightweight Polyfill for DOM Range
 * @class
 * @memberof Core
 */

var RangeObject = exports.RangeObject = function () {
	function RangeObject() {
		_classCallCheck(this, RangeObject);

		this.collapsed = false;
		this.commonAncestorContainer = undefined;
		this.endContainer = undefined;
		this.endOffset = undefined;
		this.startContainer = undefined;
		this.startOffset = undefined;
	}

	_createClass(RangeObject, [{
		key: "setStart",
		value: function setStart(startNode, startOffset) {
			this.startContainer = startNode;
			this.startOffset = startOffset;

			if (!this.endContainer) {
				this.collapse(true);
			} else {
				this.commonAncestorContainer = this._commonAncestorContainer();
			}

			this._checkCollapsed();
		}
	}, {
		key: "setEnd",
		value: function setEnd(endNode, endOffset) {
			this.endContainer = endNode;
			this.endOffset = endOffset;

			if (!this.startContainer) {
				this.collapse(false);
			} else {
				this.collapsed = false;
				this.commonAncestorContainer = this._commonAncestorContainer();
			}

			this._checkCollapsed();
		}
	}, {
		key: "collapse",
		value: function collapse(toStart) {
			this.collapsed = true;
			if (toStart) {
				this.endContainer = this.startContainer;
				this.endOffset = this.startOffset;
				this.commonAncestorContainer = this.startContainer.parentNode;
			} else {
				this.startContainer = this.endContainer;
				this.startOffset = this.endOffset;
				this.commonAncestorContainer = this.endOffset.parentNode;
			}
		}
	}, {
		key: "selectNode",
		value: function selectNode(referenceNode) {
			var parent = referenceNode.parentNode;
			var index = Array.prototype.indexOf.call(parent.childNodes, referenceNode);
			this.setStart(parent, index);
			this.setEnd(parent, index + 1);
		}
	}, {
		key: "selectNodeContents",
		value: function selectNodeContents(referenceNode) {
			var end = referenceNode.childNodes[referenceNode.childNodes - 1];
			var endIndex = referenceNode.nodeType === 3 ? referenceNode.textContent.length : parent.childNodes.length;
			this.setStart(referenceNode, 0);
			this.setEnd(referenceNode, endIndex);
		}
	}, {
		key: "_commonAncestorContainer",
		value: function _commonAncestorContainer(startContainer, endContainer) {
			var startParents = parents(startContainer || this.startContainer);
			var endParents = parents(endContainer || this.endContainer);

			if (startParents[0] != endParents[0]) return undefined;

			for (var i = 0; i < startParents.length; i++) {
				if (startParents[i] != endParents[i]) {
					return startParents[i - 1];
				}
			}
		}
	}, {
		key: "_checkCollapsed",
		value: function _checkCollapsed() {
			if (this.startContainer === this.endContainer && this.startOffset === this.endOffset) {
				this.collapsed = true;
			} else {
				this.collapsed = false;
			}
		}
	}, {
		key: "toString",
		value: function toString() {
			// TODO: implement walking between start and end to find text
		}
	}]);

	return RangeObject;
}();

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _core = __webpack_require__(0);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ELEMENT_NODE = 1;
var TEXT_NODE = 3;
var COMMENT_NODE = 8;
var DOCUMENT_NODE = 9;

/**
	* Parsing and creation of EpubCFIs: http://www.idpf.org/epub/linking/cfi/epub-cfi.html

	* Implements:
	* - Character Offset: epubcfi(/6/4[chap01ref]!/4[body01]/10[para05]/2/1:3)
	* - Simple Ranges : epubcfi(/6/4[chap01ref]!/4[body01]/10[para05],/2/1:1,/3:4)

	* Does Not Implement:
	* - Temporal Offset (~)
	* - Spatial Offset (@)
	* - Temporal-Spatial Offset (~ + @)
	* - Text Location Assertion ([)
	* @class
	@param {string | Range | Node } [cfiFrom]
	@param {string | object} [base]
	@param {string} [ignoreClass] class to ignore when parsing DOM
*/

var EpubCFI = function () {
	function EpubCFI(cfiFrom, base, ignoreClass) {
		_classCallCheck(this, EpubCFI);

		var type;

		this.str = "";

		this.base = {};
		this.spinePos = 0; // For compatibility

		this.range = false; // true || false;

		this.path = {};
		this.start = null;
		this.end = null;

		// Allow instantiation without the "new" keyword
		if (!(this instanceof EpubCFI)) {
			return new EpubCFI(cfiFrom, base, ignoreClass);
		}

		if (typeof base === "string") {
			this.base = this.parseComponent(base);
		} else if ((typeof base === "undefined" ? "undefined" : _typeof(base)) === "object" && base.steps) {
			this.base = base;
		}

		type = this.checkType(cfiFrom);

		if (type === "string") {
			this.str = cfiFrom;
			return (0, _core.extend)(this, this.parse(cfiFrom));
		} else if (type === "range") {
			return (0, _core.extend)(this, this.fromRange(cfiFrom, this.base, ignoreClass));
		} else if (type === "node") {
			return (0, _core.extend)(this, this.fromNode(cfiFrom, this.base, ignoreClass));
		} else if (type === "EpubCFI" && cfiFrom.path) {
			return cfiFrom;
		} else if (!cfiFrom) {
			return this;
		} else {
			throw new TypeError("not a valid argument for EpubCFI");
		}
	}

	/**
  * Check the type of constructor input
  * @private
  */


	_createClass(EpubCFI, [{
		key: "checkType",
		value: function checkType(cfi) {

			if (this.isCfiString(cfi)) {
				return "string";
				// Is a range object
			} else if (cfi && (typeof cfi === "undefined" ? "undefined" : _typeof(cfi)) === "object" && ((0, _core.type)(cfi) === "Range" || typeof cfi.startContainer != "undefined")) {
				return "range";
			} else if (cfi && (typeof cfi === "undefined" ? "undefined" : _typeof(cfi)) === "object" && typeof cfi.nodeType != "undefined") {
				// || typeof cfi === "function"
				return "node";
			} else if (cfi && (typeof cfi === "undefined" ? "undefined" : _typeof(cfi)) === "object" && cfi instanceof EpubCFI) {
				return "EpubCFI";
			} else {
				return false;
			}
		}

		/**
   * Parse a cfi string to a CFI object representation
   * @param {string} cfiStr
   * @returns {object} cfi
   */

	}, {
		key: "parse",
		value: function parse(cfiStr) {
			var cfi = {
				spinePos: -1,
				range: false,
				base: {},
				path: {},
				start: null,
				end: null
			};
			var baseComponent, pathComponent, range;

			if (typeof cfiStr !== "string") {
				return { spinePos: -1 };
			}

			if (cfiStr.indexOf("epubcfi(") === 0 && cfiStr[cfiStr.length - 1] === ")") {
				// Remove intial epubcfi( and ending )
				cfiStr = cfiStr.slice(8, cfiStr.length - 1);
			}

			baseComponent = this.getChapterComponent(cfiStr);

			// Make sure this is a valid cfi or return
			if (!baseComponent) {
				return { spinePos: -1 };
			}

			cfi.base = this.parseComponent(baseComponent);

			pathComponent = this.getPathComponent(cfiStr);
			cfi.path = this.parseComponent(pathComponent);

			range = this.getRange(cfiStr);

			if (range) {
				cfi.range = true;
				cfi.start = this.parseComponent(range[0]);
				cfi.end = this.parseComponent(range[1]);
			}

			// Get spine node position
			// cfi.spineSegment = cfi.base.steps[1];

			// Chapter segment is always the second step
			cfi.spinePos = cfi.base.steps[1].index;

			return cfi;
		}
	}, {
		key: "parseComponent",
		value: function parseComponent(componentStr) {
			var component = {
				steps: [],
				terminal: {
					offset: null,
					assertion: null
				}
			};
			var parts = componentStr.split(":");
			var steps = parts[0].split("/");
			var terminal;

			if (parts.length > 1) {
				terminal = parts[1];
				component.terminal = this.parseTerminal(terminal);
			}

			if (steps[0] === "") {
				steps.shift(); // Ignore the first slash
			}

			component.steps = steps.map(function (step) {
				return this.parseStep(step);
			}.bind(this));

			return component;
		}
	}, {
		key: "parseStep",
		value: function parseStep(stepStr) {
			var type, num, index, has_brackets, id;

			has_brackets = stepStr.match(/\[(.*)\]/);
			if (has_brackets && has_brackets[1]) {
				id = has_brackets[1];
			}

			//-- Check if step is a text node or element
			num = parseInt(stepStr);

			if (isNaN(num)) {
				return;
			}

			if (num % 2 === 0) {
				// Even = is an element
				type = "element";
				index = num / 2 - 1;
			} else {
				type = "text";
				index = (num - 1) / 2;
			}

			return {
				"type": type,
				"index": index,
				"id": id || null
			};
		}
	}, {
		key: "parseTerminal",
		value: function parseTerminal(termialStr) {
			var characterOffset, textLocationAssertion;
			var assertion = termialStr.match(/\[(.*)\]/);

			if (assertion && assertion[1]) {
				characterOffset = parseInt(termialStr.split("[")[0]);
				textLocationAssertion = assertion[1];
			} else {
				characterOffset = parseInt(termialStr);
			}

			if (!(0, _core.isNumber)(characterOffset)) {
				characterOffset = null;
			}

			return {
				"offset": characterOffset,
				"assertion": textLocationAssertion
			};
		}
	}, {
		key: "getChapterComponent",
		value: function getChapterComponent(cfiStr) {

			var indirection = cfiStr.split("!");

			return indirection[0];
		}
	}, {
		key: "getPathComponent",
		value: function getPathComponent(cfiStr) {

			var indirection = cfiStr.split("!");

			if (indirection[1]) {
				var ranges = indirection[1].split(",");
				return ranges[0];
			}
		}
	}, {
		key: "getRange",
		value: function getRange(cfiStr) {

			var ranges = cfiStr.split(",");

			if (ranges.length === 3) {
				return [ranges[1], ranges[2]];
			}

			return false;
		}
	}, {
		key: "getCharecterOffsetComponent",
		value: function getCharecterOffsetComponent(cfiStr) {
			var splitStr = cfiStr.split(":");
			return splitStr[1] || "";
		}
	}, {
		key: "joinSteps",
		value: function joinSteps(steps) {
			if (!steps) {
				return "";
			}

			return steps.map(function (part) {
				var segment = "";

				if (part.type === "element") {
					segment += (part.index + 1) * 2;
				}

				if (part.type === "text") {
					segment += 1 + 2 * part.index; // TODO: double check that this is odd
				}

				if (part.id) {
					segment += "[" + part.id + "]";
				}

				return segment;
			}).join("/");
		}
	}, {
		key: "segmentString",
		value: function segmentString(segment) {
			var segmentString = "/";

			segmentString += this.joinSteps(segment.steps);

			if (segment.terminal && segment.terminal.offset != null) {
				segmentString += ":" + segment.terminal.offset;
			}

			if (segment.terminal && segment.terminal.assertion != null) {
				segmentString += "[" + segment.terminal.assertion + "]";
			}

			return segmentString;
		}

		/**
   * Convert CFI to a epubcfi(...) string
   * @returns {string} epubcfi
   */

	}, {
		key: "toString",
		value: function toString() {
			var cfiString = "epubcfi(";

			cfiString += this.segmentString(this.base);

			cfiString += "!";
			cfiString += this.segmentString(this.path);

			// Add Range, if present
			if (this.range && this.start) {
				cfiString += ",";
				cfiString += this.segmentString(this.start);
			}

			if (this.range && this.end) {
				cfiString += ",";
				cfiString += this.segmentString(this.end);
			}

			cfiString += ")";

			return cfiString;
		}

		/**
   * Compare which of two CFIs is earlier in the text
   * @returns {number} First is earlier = -1, Second is earlier = 1, They are equal = 0
   */

	}, {
		key: "compare",
		value: function compare(cfiOne, cfiTwo) {
			var stepsA, stepsB;
			var terminalA, terminalB;

			var rangeAStartSteps, rangeAEndSteps;
			var rangeBEndSteps, rangeBEndSteps;
			var rangeAStartTerminal, rangeAEndTerminal;
			var rangeBStartTerminal, rangeBEndTerminal;

			if (typeof cfiOne === "string") {
				cfiOne = new EpubCFI(cfiOne);
			}
			if (typeof cfiTwo === "string") {
				cfiTwo = new EpubCFI(cfiTwo);
			}
			// Compare Spine Positions
			if (cfiOne.spinePos > cfiTwo.spinePos) {
				return 1;
			}
			if (cfiOne.spinePos < cfiTwo.spinePos) {
				return -1;
			}

			if (cfiOne.range) {
				stepsA = cfiOne.path.steps.concat(cfiOne.start.steps);
				terminalA = cfiOne.start.terminal;
			} else {
				stepsA = cfiOne.path.steps;
				terminalA = cfiOne.path.terminal;
			}

			if (cfiTwo.range) {
				stepsB = cfiTwo.path.steps.concat(cfiTwo.start.steps);
				terminalB = cfiTwo.start.terminal;
			} else {
				stepsB = cfiTwo.path.steps;
				terminalB = cfiTwo.path.terminal;
			}

			// Compare Each Step in the First item
			for (var i = 0; i < stepsA.length; i++) {
				if (!stepsA[i]) {
					return -1;
				}
				if (!stepsB[i]) {
					return 1;
				}
				if (stepsA[i].index > stepsB[i].index) {
					return 1;
				}
				if (stepsA[i].index < stepsB[i].index) {
					return -1;
				}
				// Otherwise continue checking
			}

			// All steps in First equal to Second and First is Less Specific
			if (stepsA.length < stepsB.length) {
				return -1;
			}

			// Compare the charecter offset of the text node
			if (terminalA.offset > terminalB.offset) {
				return 1;
			}
			if (terminalA.offset < terminalB.offset) {
				return -1;
			}

			// CFI's are equal
			return 0;
		}
	}, {
		key: "step",
		value: function step(node) {
			var nodeType = node.nodeType === TEXT_NODE ? "text" : "element";

			return {
				"id": node.id,
				"tagName": node.tagName,
				"type": nodeType,
				"index": this.position(node)
			};
		}
	}, {
		key: "filteredStep",
		value: function filteredStep(node, ignoreClass) {
			var filteredNode = this.filter(node, ignoreClass);
			var nodeType;

			// Node filtered, so ignore
			if (!filteredNode) {
				return;
			}

			// Otherwise add the filter node in
			nodeType = filteredNode.nodeType === TEXT_NODE ? "text" : "element";

			return {
				"id": filteredNode.id,
				"tagName": filteredNode.tagName,
				"type": nodeType,
				"index": this.filteredPosition(filteredNode, ignoreClass)
			};
		}
	}, {
		key: "pathTo",
		value: function pathTo(node, offset, ignoreClass) {
			var segment = {
				steps: [],
				terminal: {
					offset: null,
					assertion: null
				}
			};
			var currentNode = node;
			var step;

			while (currentNode && currentNode.parentNode && currentNode.parentNode.nodeType != DOCUMENT_NODE) {

				if (ignoreClass) {
					step = this.filteredStep(currentNode, ignoreClass);
				} else {
					step = this.step(currentNode);
				}

				if (step) {
					segment.steps.unshift(step);
				}

				currentNode = currentNode.parentNode;
			}

			if (offset != null && offset >= 0) {

				segment.terminal.offset = offset;

				// Make sure we are getting to a textNode if there is an offset
				if (segment.steps[segment.steps.length - 1].type != "text") {
					segment.steps.push({
						"type": "text",
						"index": 0
					});
				}
			}

			return segment;
		}
	}, {
		key: "equalStep",
		value: function equalStep(stepA, stepB) {
			if (!stepA || !stepB) {
				return false;
			}

			if (stepA.index === stepB.index && stepA.id === stepB.id && stepA.type === stepB.type) {
				return true;
			}

			return false;
		}

		/**
   * Create a CFI object from a Range
   * @param {Range} range
   * @param {string | object} base
   * @param {string} [ignoreClass]
   * @returns {object} cfi
   */

	}, {
		key: "fromRange",
		value: function fromRange(range, base, ignoreClass) {
			var cfi = {
				range: false,
				base: {},
				path: {},
				start: null,
				end: null
			};

			var start = range.startContainer;
			var end = range.endContainer;

			var startOffset = range.startOffset;
			var endOffset = range.endOffset;

			var needsIgnoring = false;

			if (ignoreClass) {
				// Tell pathTo if / what to ignore
				needsIgnoring = start.ownerDocument.querySelector("." + ignoreClass) != null;
			}

			if (typeof base === "string") {
				cfi.base = this.parseComponent(base);
				cfi.spinePos = cfi.base.steps[1].index;
			} else if ((typeof base === "undefined" ? "undefined" : _typeof(base)) === "object") {
				cfi.base = base;
			}

			if (range.collapsed) {
				if (needsIgnoring) {
					startOffset = this.patchOffset(start, startOffset, ignoreClass);
				}
				cfi.path = this.pathTo(start, startOffset, ignoreClass);
			} else {
				cfi.range = true;

				if (needsIgnoring) {
					startOffset = this.patchOffset(start, startOffset, ignoreClass);
				}

				cfi.start = this.pathTo(start, startOffset, ignoreClass);
				if (needsIgnoring) {
					endOffset = this.patchOffset(end, endOffset, ignoreClass);
				}

				cfi.end = this.pathTo(end, endOffset, ignoreClass);

				// Create a new empty path
				cfi.path = {
					steps: [],
					terminal: null
				};

				// Push steps that are shared between start and end to the common path
				var len = cfi.start.steps.length;
				var i;

				for (i = 0; i < len; i++) {
					if (this.equalStep(cfi.start.steps[i], cfi.end.steps[i])) {
						if (i === len - 1) {
							// Last step is equal, check terminals
							if (cfi.start.terminal === cfi.end.terminal) {
								// CFI's are equal
								cfi.path.steps.push(cfi.start.steps[i]);
								// Not a range
								cfi.range = false;
							}
						} else {
							cfi.path.steps.push(cfi.start.steps[i]);
						}
					} else {
						break;
					}
				}

				cfi.start.steps = cfi.start.steps.slice(cfi.path.steps.length);
				cfi.end.steps = cfi.end.steps.slice(cfi.path.steps.length);

				// TODO: Add Sanity check to make sure that the end if greater than the start
			}

			return cfi;
		}

		/**
   * Create a CFI object from a Node
   * @param {Node} anchor
   * @param {string | object} base
   * @param {string} [ignoreClass]
   * @returns {object} cfi
   */

	}, {
		key: "fromNode",
		value: function fromNode(anchor, base, ignoreClass) {
			var cfi = {
				range: false,
				base: {},
				path: {},
				start: null,
				end: null
			};

			if (typeof base === "string") {
				cfi.base = this.parseComponent(base);
				cfi.spinePos = cfi.base.steps[1].index;
			} else if ((typeof base === "undefined" ? "undefined" : _typeof(base)) === "object") {
				cfi.base = base;
			}

			cfi.path = this.pathTo(anchor, null, ignoreClass);

			return cfi;
		}
	}, {
		key: "filter",
		value: function filter(anchor, ignoreClass) {
			var needsIgnoring;
			var sibling; // to join with
			var parent, previousSibling, nextSibling;
			var isText = false;

			if (anchor.nodeType === TEXT_NODE) {
				isText = true;
				parent = anchor.parentNode;
				needsIgnoring = anchor.parentNode.classList.contains(ignoreClass);
			} else {
				isText = false;
				needsIgnoring = anchor.classList.contains(ignoreClass);
			}

			if (needsIgnoring && isText) {
				previousSibling = parent.previousSibling;
				nextSibling = parent.nextSibling;

				// If the sibling is a text node, join the nodes
				if (previousSibling && previousSibling.nodeType === TEXT_NODE) {
					sibling = previousSibling;
				} else if (nextSibling && nextSibling.nodeType === TEXT_NODE) {
					sibling = nextSibling;
				}

				if (sibling) {
					return sibling;
				} else {
					// Parent will be ignored on next step
					return anchor;
				}
			} else if (needsIgnoring && !isText) {
				// Otherwise just skip the element node
				return false;
			} else {
				// No need to filter
				return anchor;
			}
		}
	}, {
		key: "patchOffset",
		value: function patchOffset(anchor, offset, ignoreClass) {
			if (anchor.nodeType != TEXT_NODE) {
				throw new Error("Anchor must be a text node");
			}

			var curr = anchor;
			var totalOffset = offset;

			// If the parent is a ignored node, get offset from it's start
			if (anchor.parentNode.classList.contains(ignoreClass)) {
				curr = anchor.parentNode;
			}

			while (curr.previousSibling) {
				if (curr.previousSibling.nodeType === ELEMENT_NODE) {
					// Originally a text node, so join
					if (curr.previousSibling.classList.contains(ignoreClass)) {
						totalOffset += curr.previousSibling.textContent.length;
					} else {
						break; // Normal node, dont join
					}
				} else {
					// If the previous sibling is a text node, join the nodes
					totalOffset += curr.previousSibling.textContent.length;
				}

				curr = curr.previousSibling;
			}

			return totalOffset;
		}
	}, {
		key: "normalizedMap",
		value: function normalizedMap(children, nodeType, ignoreClass) {
			var output = {};
			var prevIndex = -1;
			var i,
			    len = children.length;
			var currNodeType;
			var prevNodeType;

			for (i = 0; i < len; i++) {

				currNodeType = children[i].nodeType;

				// Check if needs ignoring
				if (currNodeType === ELEMENT_NODE && children[i].classList.contains(ignoreClass)) {
					currNodeType = TEXT_NODE;
				}

				if (i > 0 && currNodeType === TEXT_NODE && prevNodeType === TEXT_NODE) {
					// join text nodes
					output[i] = prevIndex;
				} else if (nodeType === currNodeType) {
					prevIndex = prevIndex + 1;
					output[i] = prevIndex;
				}

				prevNodeType = currNodeType;
			}

			return output;
		}
	}, {
		key: "position",
		value: function position(anchor) {
			var children, index;
			if (anchor.nodeType === ELEMENT_NODE) {
				children = anchor.parentNode.children;
				if (!children) {
					children = (0, _core.findChildren)(anchor.parentNode);
				}
				index = Array.prototype.indexOf.call(children, anchor);
			} else {
				children = this.textNodes(anchor.parentNode);
				index = children.indexOf(anchor);
			}

			return index;
		}
	}, {
		key: "filteredPosition",
		value: function filteredPosition(anchor, ignoreClass) {
			var children, index, map;

			if (anchor.nodeType === ELEMENT_NODE) {
				children = anchor.parentNode.children;
				map = this.normalizedMap(children, ELEMENT_NODE, ignoreClass);
			} else {
				children = anchor.parentNode.childNodes;
				// Inside an ignored node
				if (anchor.parentNode.classList.contains(ignoreClass)) {
					anchor = anchor.parentNode;
					children = anchor.parentNode.childNodes;
				}
				map = this.normalizedMap(children, TEXT_NODE, ignoreClass);
			}

			index = Array.prototype.indexOf.call(children, anchor);

			return map[index];
		}
	}, {
		key: "stepsToXpath",
		value: function stepsToXpath(steps) {
			var xpath = [".", "*"];

			steps.forEach(function (step) {
				var position = step.index + 1;

				if (step.id) {
					xpath.push("*[position()=" + position + " and @id='" + step.id + "']");
				} else if (step.type === "text") {
					xpath.push("text()[" + position + "]");
				} else {
					xpath.push("*[" + position + "]");
				}
			});

			return xpath.join("/");
		}

		/*
  	To get the last step if needed:
  	// Get the terminal step
  lastStep = steps[steps.length-1];
  // Get the query string
  query = this.stepsToQuery(steps);
  // Find the containing element
  startContainerParent = doc.querySelector(query);
  // Find the text node within that element
  if(startContainerParent && lastStep.type == "text") {
  	container = startContainerParent.childNodes[lastStep.index];
  }
  */

	}, {
		key: "stepsToQuerySelector",
		value: function stepsToQuerySelector(steps) {
			var query = ["html"];

			steps.forEach(function (step) {
				var position = step.index + 1;

				if (step.id) {
					query.push("#" + step.id);
				} else if (step.type === "text") {
					// unsupported in querySelector
					// query.push("text()[" + position + "]");
				} else {
					query.push("*:nth-child(" + position + ")");
				}
			});

			return query.join(">");
		}
	}, {
		key: "textNodes",
		value: function textNodes(container, ignoreClass) {
			return Array.prototype.slice.call(container.childNodes).filter(function (node) {
				if (node.nodeType === TEXT_NODE) {
					return true;
				} else if (ignoreClass && node.classList.contains(ignoreClass)) {
					return true;
				}
				return false;
			});
		}
	}, {
		key: "walkToNode",
		value: function walkToNode(steps, _doc, ignoreClass) {
			var doc = _doc || document;
			var container = doc.documentElement;
			var children;
			var step;
			var len = steps.length;
			var i;

			for (i = 0; i < len; i++) {
				step = steps[i];

				if (step.type === "element") {
					//better to get a container using id as some times step.index may not be correct
					//For ex.https://github.com/futurepress/epub.js/issues/561
					if (step.id) {
						container = doc.getElementById(step.id);
					} else {
						children = container.children || (0, _core.findChildren)(container);
						container = children[step.index];
					}
				} else if (step.type === "text") {
					container = this.textNodes(container, ignoreClass)[step.index];
				}
				if (!container) {
					//Break the for loop as due to incorrect index we can get error if
					//container is undefined so that other functionailties works fine
					//like navigation
					break;
				}
			}

			return container;
		}
	}, {
		key: "findNode",
		value: function findNode(steps, _doc, ignoreClass) {
			var doc = _doc || document;
			var container;
			var xpath;

			if (!ignoreClass && typeof doc.evaluate != "undefined") {
				xpath = this.stepsToXpath(steps);
				container = doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
			} else if (ignoreClass) {
				container = this.walkToNode(steps, doc, ignoreClass);
			} else {
				container = this.walkToNode(steps, doc);
			}

			return container;
		}
	}, {
		key: "fixMiss",
		value: function fixMiss(steps, offset, _doc, ignoreClass) {
			var container = this.findNode(steps.slice(0, -1), _doc, ignoreClass);
			var children = container.childNodes;
			var map = this.normalizedMap(children, TEXT_NODE, ignoreClass);
			var child;
			var len;
			var lastStepIndex = steps[steps.length - 1].index;

			for (var childIndex in map) {
				if (!map.hasOwnProperty(childIndex)) return;

				if (map[childIndex] === lastStepIndex) {
					child = children[childIndex];
					len = child.textContent.length;
					if (offset > len) {
						offset = offset - len;
					} else {
						if (child.nodeType === ELEMENT_NODE) {
							container = child.childNodes[0];
						} else {
							container = child;
						}
						break;
					}
				}
			}

			return {
				container: container,
				offset: offset
			};
		}

		/**
   * Creates a DOM range representing a CFI
   * @param {document} _doc document referenced in the base
   * @param {string} [ignoreClass]
   * @return {Range}
   */

	}, {
		key: "toRange",
		value: function toRange(_doc, ignoreClass) {
			var doc = _doc || document;
			var range;
			var start, end, startContainer, endContainer;
			var cfi = this;
			var startSteps, endSteps;
			var needsIgnoring = ignoreClass ? doc.querySelector("." + ignoreClass) != null : false;
			var missed;

			if (typeof doc.createRange !== "undefined") {
				range = doc.createRange();
			} else {
				range = new _core.RangeObject();
			}

			if (cfi.range) {
				start = cfi.start;
				startSteps = cfi.path.steps.concat(start.steps);
				startContainer = this.findNode(startSteps, doc, needsIgnoring ? ignoreClass : null);
				end = cfi.end;
				endSteps = cfi.path.steps.concat(end.steps);
				endContainer = this.findNode(endSteps, doc, needsIgnoring ? ignoreClass : null);
			} else {
				start = cfi.path;
				startSteps = cfi.path.steps;
				startContainer = this.findNode(cfi.path.steps, doc, needsIgnoring ? ignoreClass : null);
			}

			if (startContainer) {
				try {

					if (start.terminal.offset != null) {
						range.setStart(startContainer, start.terminal.offset);
					} else {
						range.setStart(startContainer, 0);
					}
				} catch (e) {
					missed = this.fixMiss(startSteps, start.terminal.offset, doc, needsIgnoring ? ignoreClass : null);
					range.setStart(missed.container, missed.offset);
				}
			} else {
				console.log("No startContainer found for", this.toString());
				// No start found
				return null;
			}

			if (endContainer) {
				try {

					if (end.terminal.offset != null) {
						range.setEnd(endContainer, end.terminal.offset);
					} else {
						range.setEnd(endContainer, 0);
					}
				} catch (e) {
					missed = this.fixMiss(endSteps, cfi.end.terminal.offset, doc, needsIgnoring ? ignoreClass : null);
					range.setEnd(missed.container, missed.offset);
				}
			}

			// doc.defaultView.getSelection().addRange(range);
			return range;
		}

		/**
   * Check if a string is wrapped with "epubcfi()"
   * @param {string} str
   * @returns {boolean}
   */

	}, {
		key: "isCfiString",
		value: function isCfiString(str) {
			if (typeof str === "string" && str.indexOf("epubcfi(") === 0 && str[str.length - 1] === ")") {
				return true;
			}

			return false;
		}
	}, {
		key: "generateChapterComponent",
		value: function generateChapterComponent(_spineNodeIndex, _pos, id) {
			var pos = parseInt(_pos),
			    spineNodeIndex = (_spineNodeIndex + 1) * 2,
			    cfi = "/" + spineNodeIndex + "/";

			cfi += (pos + 1) * 2;

			if (id) {
				cfi += "[" + id + "]";
			}

			return cfi;
		}

		/**
   * Collapse a CFI Range to a single CFI Position
   * @param {boolean} [toStart=false]
   */

	}, {
		key: "collapse",
		value: function collapse(toStart) {
			if (!this.range) {
				return;
			}

			this.range = false;

			if (toStart) {
				this.path.steps = this.path.steps.concat(this.start.steps);
				this.path.terminal = this.start.terminal;
			} else {
				this.path.steps = this.path.steps.concat(this.end.steps);
				this.path.terminal = this.end.terminal;
			}
		}
	}]);

	return EpubCFI;
}();

exports.default = EpubCFI;
module.exports = exports["default"];

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var EPUBJS_VERSION = exports.EPUBJS_VERSION = "0.3";

// Dom events to listen for
var DOM_EVENTS = exports.DOM_EVENTS = ["keydown", "keyup", "keypressed", "mouseup", "mousedown", "click", "touchend", "touchstart", "touchmove"];

var EVENTS = exports.EVENTS = {
  BOOK: {
    OPEN_FAILED: "openFailed"
  },
  CONTENTS: {
    EXPAND: "expand",
    RESIZE: "resize",
    SELECTED: "selected",
    SELECTED_RANGE: "selectedRange",
    LINK_CLICKED: "linkClicked"
  },
  LOCATIONS: {
    CHANGED: "changed"
  },
  MANAGERS: {
    RESIZE: "resize",
    RESIZED: "resized",
    ORIENTATION_CHANGE: "orientationchange",
    ADDED: "added",
    SCROLL: "scroll",
    SCROLLED: "scrolled",
    REMOVED: "removed"
  },
  VIEWS: {
    AXIS: "axis",
    LOAD_ERROR: "loaderror",
    RENDERED: "rendered",
    RESIZED: "resized",
    DISPLAYED: "displayed",
    SHOWN: "shown",
    HIDDEN: "hidden",
    MARK_CLICKED: "markClicked"
  },
  RENDITION: {
    STARTED: "started",
    ATTACHED: "attached",
    DISPLAYED: "displayed",
    DISPLAY_ERROR: "displayerror",
    RENDERED: "rendered",
    REMOVED: "removed",
    RESIZED: "resized",
    ORIENTATION_CHANGE: "orientationchange",
    LOCATION_CHANGED: "locationChanged",
    RELOCATED: "relocated",
    MARK_CLICKED: "markClicked",
    SELECTED: "selected",
    LAYOUT: "layout"
  },
  LAYOUT: {
    UPDATED: "updated"
  },
  ANNOTATION: {
    ATTACH: "attach",
    DETACH: "detach"
  }
};

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var d        = __webpack_require__(27)
  , callable = __webpack_require__(41)

  , apply = Function.prototype.apply, call = Function.prototype.call
  , create = Object.create, defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , hasOwnProperty = Object.prototype.hasOwnProperty
  , descriptor = { configurable: true, enumerable: false, writable: true }

  , on, once, off, emit, methods, descriptors, base;

on = function (type, listener) {
	var data;

	callable(listener);

	if (!hasOwnProperty.call(this, '__ee__')) {
		data = descriptor.value = create(null);
		defineProperty(this, '__ee__', descriptor);
		descriptor.value = null;
	} else {
		data = this.__ee__;
	}
	if (!data[type]) data[type] = listener;
	else if (typeof data[type] === 'object') data[type].push(listener);
	else data[type] = [data[type], listener];

	return this;
};

once = function (type, listener) {
	var once, self;

	callable(listener);
	self = this;
	on.call(this, type, once = function () {
		off.call(self, type, once);
		apply.call(listener, this, arguments);
	});

	once.__eeOnceListener__ = listener;
	return this;
};

off = function (type, listener) {
	var data, listeners, candidate, i;

	callable(listener);

	if (!hasOwnProperty.call(this, '__ee__')) return this;
	data = this.__ee__;
	if (!data[type]) return this;
	listeners = data[type];

	if (typeof listeners === 'object') {
		for (i = 0; (candidate = listeners[i]); ++i) {
			if ((candidate === listener) ||
					(candidate.__eeOnceListener__ === listener)) {
				if (listeners.length === 2) data[type] = listeners[i ? 0 : 1];
				else listeners.splice(i, 1);
			}
		}
	} else {
		if ((listeners === listener) ||
				(listeners.__eeOnceListener__ === listener)) {
			delete data[type];
		}
	}

	return this;
};

emit = function (type) {
	var i, l, listener, listeners, args;

	if (!hasOwnProperty.call(this, '__ee__')) return;
	listeners = this.__ee__[type];
	if (!listeners) return;

	if (typeof listeners === 'object') {
		l = arguments.length;
		args = new Array(l - 1);
		for (i = 1; i < l; ++i) args[i - 1] = arguments[i];

		listeners = listeners.slice();
		for (i = 0; (listener = listeners[i]); ++i) {
			apply.call(listener, this, args);
		}
	} else {
		switch (arguments.length) {
		case 1:
			call.call(listeners, this);
			break;
		case 2:
			call.call(listeners, this, arguments[1]);
			break;
		case 3:
			call.call(listeners, this, arguments[1], arguments[2]);
			break;
		default:
			l = arguments.length;
			args = new Array(l - 1);
			for (i = 1; i < l; ++i) {
				args[i - 1] = arguments[i];
			}
			apply.call(listeners, this, args);
		}
	}
};

methods = {
	on: on,
	once: once,
	off: off,
	emit: emit
};

descriptors = {
	on: d(on),
	once: d(once),
	off: d(off),
	emit: d(emit)
};

base = defineProperties({}, descriptors);

module.exports = exports = function (o) {
	return (o == null) ? create(base) : defineProperties(Object(o), descriptors);
};
exports.methods = methods;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _pathWebpack = __webpack_require__(7);

var _pathWebpack2 = _interopRequireDefault(_pathWebpack);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Creates a Path object for parsing and manipulation of a path strings
 *
 * Uses a polyfill for Nodejs path: https://nodejs.org/api/path.html
 * @param	{string} pathString	a url string (relative or absolute)
 * @class
 */
var Path = function () {
	function Path(pathString) {
		_classCallCheck(this, Path);

		var protocol;
		var parsed;

		protocol = pathString.indexOf("://");
		if (protocol > -1) {
			pathString = new URL(pathString).pathname;
		}

		parsed = this.parse(pathString);

		this.path = pathString;

		if (this.isDirectory(pathString)) {
			this.directory = pathString;
		} else {
			this.directory = parsed.dir + "/";
		}

		this.filename = parsed.base;
		this.extension = parsed.ext.slice(1);
	}

	/**
  * Parse the path: https://nodejs.org/api/path.html#path_path_parse_path
  * @param	{string} what
  * @returns {object}
  */


	_createClass(Path, [{
		key: "parse",
		value: function parse(what) {
			return _pathWebpack2.default.parse(what);
		}

		/**
   * @param	{string} what
   * @returns {boolean}
   */

	}, {
		key: "isAbsolute",
		value: function isAbsolute(what) {
			return _pathWebpack2.default.isAbsolute(what || this.path);
		}

		/**
   * Check if path ends with a directory
   * @param	{string} what
   * @returns {boolean}
   */

	}, {
		key: "isDirectory",
		value: function isDirectory(what) {
			return what.charAt(what.length - 1) === "/";
		}

		/**
   * Resolve a path against the directory of the Path
   *
   * https://nodejs.org/api/path.html#path_path_resolve_paths
   * @param	{string} what
   * @returns {string} resolved
   */

	}, {
		key: "resolve",
		value: function resolve(what) {
			return _pathWebpack2.default.resolve(this.directory, what);
		}

		/**
   * Resolve a path relative to the directory of the Path
   *
   * https://nodejs.org/api/path.html#path_path_relative_from_to
   * @param	{string} what
   * @returns {string} relative
   */

	}, {
		key: "relative",
		value: function relative(what) {
			var isAbsolute = what && what.indexOf("://") > -1;

			if (isAbsolute) {
				return what;
			}

			return _pathWebpack2.default.relative(this.directory, what);
		}
	}, {
		key: "splitPath",
		value: function splitPath(filename) {
			return this.splitPathRe.exec(filename).slice(1);
		}

		/**
   * Return the path string
   * @returns {string} path
   */

	}, {
		key: "toString",
		value: function toString() {
			return this.path;
		}
	}]);

	return Path;
}();

exports.default = Path;
module.exports = exports["default"];

/***/ }),
/* 5 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _path = __webpack_require__(4);

var _path2 = _interopRequireDefault(_path);

var _pathWebpack = __webpack_require__(7);

var _pathWebpack2 = _interopRequireDefault(_pathWebpack);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * creates a Url object for parsing and manipulation of a url string
 * @param	{string} urlString	a url string (relative or absolute)
 * @param	{string} [baseString] optional base for the url,
 * default to window.location.href
 */
var Url = function () {
	function Url(urlString, baseString) {
		_classCallCheck(this, Url);

		var absolute = urlString.indexOf("://") > -1;
		var pathname = urlString;
		var basePath;

		this.Url = undefined;
		this.href = urlString;
		this.protocol = "";
		this.origin = "";
		this.hash = "";
		this.hash = "";
		this.search = "";
		this.base = baseString;

		if (!absolute && baseString !== false && typeof baseString !== "string" && window && window.location) {
			this.base = window.location.href;
		}

		// URL Polyfill doesn't throw an error if base is empty
		if (absolute || this.base) {
			try {
				if (this.base) {
					// Safari doesn't like an undefined base
					this.Url = new URL(urlString, this.base);
				} else {
					this.Url = new URL(urlString);
				}
				this.href = this.Url.href;

				this.protocol = this.Url.protocol;
				this.origin = this.Url.origin;
				this.hash = this.Url.hash;
				this.search = this.Url.search;

				pathname = this.Url.pathname + (this.Url.search ? this.Url.search : '');
			} catch (e) {
				// Skip URL parsing
				this.Url = undefined;
				// resolve the pathname from the base
				if (this.base) {
					basePath = new _path2.default(this.base);
					pathname = basePath.resolve(pathname);
				}
			}
		}

		this.Path = new _path2.default(pathname);

		this.directory = this.Path.directory;
		this.filename = this.Path.filename;
		this.extension = this.Path.extension;
	}

	/**
  * @returns {Path}
  */


	_createClass(Url, [{
		key: "path",
		value: function path() {
			return this.Path;
		}

		/**
   * Resolves a relative path to a absolute url
   * @param {string} what
   * @returns {string} url
   */

	}, {
		key: "resolve",
		value: function resolve(what) {
			var isAbsolute = what.indexOf("://") > -1;
			var fullpath;

			if (isAbsolute) {
				return what;
			}

			fullpath = _pathWebpack2.default.resolve(this.directory, what);
			return this.origin + fullpath;
		}

		/**
   * Resolve a path relative to the url
   * @param {string} what
   * @returns {string} path
   */

	}, {
		key: "relative",
		value: function relative(what) {
			return _pathWebpack2.default.relative(what, this.directory);
		}

		/**
   * @returns {string}
   */

	}, {
		key: "toString",
		value: function toString() {
			return this.href;
		}
	}]);

	return Url;
}();

exports.default = Url;
module.exports = exports["default"];

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


if (!process) {
  var process = {
    "cwd" : function () { return '/' }
  };
}

function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string. Received ' + path);
  }
}

// Resolves . and .. elements in a path with directory names
function normalizeStringPosix(path, allowAboveRoot) {
  var res = '';
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47/*/*/)
      break;
    else
      code = 47/*/*/;
    if (code === 47/*/*/) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 ||
            res.charCodeAt(res.length - 1) !== 46/*.*/ ||
            res.charCodeAt(res.length - 2) !== 46/*.*/) {
          if (res.length > 2) {
            var start = res.length - 1;
            var j = start;
            for (; j >= 0; --j) {
              if (res.charCodeAt(j) === 47/*/*/)
                break;
            }
            if (j !== start) {
              if (j === -1)
                res = '';
              else
                res = res.slice(0, j);
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += '/..';
          else
            res = '..';
        }
      } else {
        if (res.length > 0)
          res += '/' + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46/*.*/ && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root;
  var base = pathObject.base ||
    ((pathObject.name || '') + (pathObject.ext || ''));
  if (!dir) {
    return base;
  }
  if (dir === pathObject.root) {
    return dir + base;
  }
  return dir + sep + base;
}

var posix = {
  // path.resolve([from ...], to)
  resolve: function resolve() {
    var resolvedPath = '';
    var resolvedAbsolute = false;
    var cwd;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path;
      if (i >= 0)
        path = arguments[i];
      else {
        if (cwd === undefined)
          cwd = process.cwd();
        path = cwd;
      }

      assertPath(path);

      // Skip empty entries
      if (path.length === 0) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47/*/*/;
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);

    if (resolvedAbsolute) {
      if (resolvedPath.length > 0)
        return '/' + resolvedPath;
      else
        return '/';
    } else if (resolvedPath.length > 0) {
      return resolvedPath;
    } else {
      return '.';
    }
  },


  normalize: function normalize(path) {
    assertPath(path);

    if (path.length === 0)
      return '.';

    var isAbsolute = path.charCodeAt(0) === 47/*/*/;
    var trailingSeparator = path.charCodeAt(path.length - 1) === 47/*/*/;

    // Normalize the path
    path = normalizeStringPosix(path, !isAbsolute);

    if (path.length === 0 && !isAbsolute)
      path = '.';
    if (path.length > 0 && trailingSeparator)
      path += '/';

    if (isAbsolute)
      return '/' + path;
    return path;
  },


  isAbsolute: function isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47/*/*/;
  },


  join: function join() {
    if (arguments.length === 0)
      return '.';
    var joined;
    for (var i = 0; i < arguments.length; ++i) {
      var arg = arguments[i];
      assertPath(arg);
      if (arg.length > 0) {
        if (joined === undefined)
          joined = arg;
        else
          joined += '/' + arg;
      }
    }
    if (joined === undefined)
      return '.';
    return posix.normalize(joined);
  },


  relative: function relative(from, to) {
    assertPath(from);
    assertPath(to);

    if (from === to)
      return '';

    from = posix.resolve(from);
    to = posix.resolve(to);

    if (from === to)
      return '';

    // Trim any leading backslashes
    var fromStart = 1;
    for (; fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47/*/*/)
        break;
    }
    var fromEnd = from.length;
    var fromLen = (fromEnd - fromStart);

    // Trim any leading backslashes
    var toStart = 1;
    for (; toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47/*/*/)
        break;
    }
    var toEnd = to.length;
    var toLen = (toEnd - toStart);

    // Compare paths to find the longest common path from root
    var length = (fromLen < toLen ? fromLen : toLen);
    var lastCommonSep = -1;
    var i = 0;
    for (; i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47/*/*/) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from='/foo/bar'; to='/foo/bar/baz'
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            // We get here if `from` is the root
            // For example: from='/'; to='/foo'
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47/*/*/) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from='/foo/bar/baz'; to='/foo/bar'
            lastCommonSep = i;
          } else if (i === 0) {
            // We get here if `to` is the root.
            // For example: from='/foo'; to='/'
            lastCommonSep = 0;
          }
        }
        break;
      }
      var fromCode = from.charCodeAt(fromStart + i);
      var toCode = to.charCodeAt(toStart + i);
      if (fromCode !== toCode)
        break;
      else if (fromCode === 47/*/*/)
        lastCommonSep = i;
    }

    var out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47/*/*/) {
        if (out.length === 0)
          out += '..';
        else
          out += '/..';
      }
    }

    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0)
      return out + to.slice(toStart + lastCommonSep);
    else {
      toStart += lastCommonSep;
      if (to.charCodeAt(toStart) === 47/*/*/)
        ++toStart;
      return to.slice(toStart);
    }
  },


  _makeLong: function _makeLong(path) {
    return path;
  },


  dirname: function dirname(path) {
    assertPath(path);
    if (path.length === 0)
      return '.';
    var code = path.charCodeAt(0);
    var hasRoot = (code === 47/*/*/);
    var end = -1;
    var matchedSlash = true;
    for (var i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i);
      if (code === 47/*/*/) {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if (end === -1)
      return hasRoot ? '/' : '.';
    if (hasRoot && end === 1)
      return '//';
    return path.slice(0, end);
  },


  basename: function basename(path, ext) {
    if (ext !== undefined && typeof ext !== 'string')
      throw new TypeError('"ext" argument must be a string');
    assertPath(path);

    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;

    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path)
        return '';
      var extIdx = ext.length - 1;
      var firstNonSlashEnd = -1;
      for (i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);
        if (code === 47/*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            start = i + 1;
            break;
          }
        } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if (start === end)
        end = firstNonSlashEnd;
      else if (end === -1)
        end = path.length;
      return path.slice(start, end);
    } else {
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47/*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            start = i + 1;
            break;
          }
        } else if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // path component
          matchedSlash = false;
          end = i + 1;
        }
      }

      if (end === -1)
        return '';
      return path.slice(start, end);
    }
  },


  extname: function extname(path) {
    assertPath(path);
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    for (var i = path.length - 1; i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47/*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46/*.*/) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1)
          startDot = i;
        else if (preDotState !== 1)
          preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 ||
        end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        (preDotState === 1 &&
         startDot === end - 1 &&
         startDot === startPart + 1)) {
      return '';
    }
    return path.slice(startDot, end);
  },


  format: function format(pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError(
        'Parameter "pathObject" must be an object, not ' + typeof(pathObject)
      );
    }
    return _format('/', pathObject);
  },


  parse: function parse(path) {
    assertPath(path);

    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0)
      return ret;
    var code = path.charCodeAt(0);
    var isAbsolute = (code === 47/*/*/);
    var start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;

    // Get non-dir info
    for (; i >= start; --i) {
      code = path.charCodeAt(i);
      if (code === 47/*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46/*.*/) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1)
          startDot = i;
        else if (preDotState !== 1)
          preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 ||
        end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        (preDotState === 1 &&
         startDot === end - 1 &&
         startDot === startPart + 1)) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute)
          ret.base = ret.name = path.slice(1, end);
        else
          ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }
      ret.ext = path.slice(startDot, end);
    }

    if (startPart > 0)
      ret.dir = path.slice(0, startPart - 1);
    else if (isAbsolute)
      ret.dir = '/';

    return ret;
  },


  sep: '/',
  delimiter: ':',
  posix: null
};


module.exports = posix;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.replaceBase = replaceBase;
exports.replaceCanonical = replaceCanonical;
exports.replaceMeta = replaceMeta;
exports.replaceLinks = replaceLinks;
exports.substitute = substitute;

var _core = __webpack_require__(0);

var _url = __webpack_require__(6);

var _url2 = _interopRequireDefault(_url);

var _path = __webpack_require__(4);

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function replaceBase(doc, section) {
	var base;
	var head;
	var url = section.url;
	var absolute = url.indexOf("://") > -1;

	if (!doc) {
		return;
	}

	head = (0, _core.qs)(doc, "head");
	base = (0, _core.qs)(head, "base");

	if (!base) {
		base = doc.createElement("base");
		head.insertBefore(base, head.firstChild);
	}

	// Fix for Safari crashing if the url doesn't have an origin
	if (!absolute && window && window.location) {
		url = window.location.origin + url;
	}

	base.setAttribute("href", url);
}

function replaceCanonical(doc, section) {
	var head;
	var link;
	var url = section.canonical;

	if (!doc) {
		return;
	}

	head = (0, _core.qs)(doc, "head");
	link = (0, _core.qs)(head, "link[rel='canonical']");

	if (link) {
		link.setAttribute("href", url);
	} else {
		link = doc.createElement("link");
		link.setAttribute("rel", "canonical");
		link.setAttribute("href", url);
		head.appendChild(link);
	}
}

function replaceMeta(doc, section) {
	var head;
	var meta;
	var id = section.idref;
	if (!doc) {
		return;
	}

	head = (0, _core.qs)(doc, "head");
	meta = (0, _core.qs)(head, "link[property='dc.identifier']");

	if (meta) {
		meta.setAttribute("content", id);
	} else {
		meta = doc.createElement("meta");
		meta.setAttribute("name", "dc.identifier");
		meta.setAttribute("content", id);
		head.appendChild(meta);
	}
}

// TODO: move me to Contents
function replaceLinks(contents, fn) {

	var links = contents.querySelectorAll("a[href]");

	if (!links.length) {
		return;
	}

	var base = (0, _core.qs)(contents.ownerDocument, "base");
	var location = base ? base.getAttribute("href") : undefined;
	var replaceLink = function (link) {
		var href = link.getAttribute("href");

		if (href.indexOf("mailto:") === 0) {
			return;
		}

		var absolute = href.indexOf("://") > -1;

		if (absolute) {

			link.setAttribute("target", "_blank");
		} else {
			var linkUrl;
			try {
				linkUrl = new _url2.default(href, location);
			} catch (error) {
				// NOOP
			}

			link.onclick = function () {

				if (linkUrl && linkUrl.hash) {
					fn(linkUrl.Path.path + linkUrl.hash);
				} else if (linkUrl) {
					fn(linkUrl.Path.path);
				} else {
					fn(href);
				}

				return false;
			};
		}
	}.bind(this);

	for (var i = 0; i < links.length; i++) {
		replaceLink(links[i]);
	}
}

function substitute(content, urls, replacements) {
	urls.forEach(function (url, i) {
		if (url && replacements[i]) {
			// Account for special characters in the file name.
			// See https://stackoverflow.com/a/6318729.
			url = url.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
			content = content.replace(new RegExp(url, "g"), replacements[i]);
		}
	});
	return content;
}

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _core = __webpack_require__(0);

var _path = __webpack_require__(4);

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function request(url, type, withCredentials, headers) {
	var supportsURL = typeof window != "undefined" ? window.URL : false; // TODO: fallback for url if window isn't defined
	var BLOB_RESPONSE = supportsURL ? "blob" : "arraybuffer";

	var deferred = new _core.defer();

	var xhr = new XMLHttpRequest();

	//-- Check from PDF.js:
	//   https://github.com/mozilla/pdf.js/blob/master/web/compatibility.js
	var xhrPrototype = XMLHttpRequest.prototype;

	var header;

	if (!("overrideMimeType" in xhrPrototype)) {
		// IE10 might have response, but not overrideMimeType
		Object.defineProperty(xhrPrototype, "overrideMimeType", {
			value: function xmlHttpRequestOverrideMimeType() {}
		});
	}

	if (withCredentials) {
		xhr.withCredentials = true;
	}

	xhr.onreadystatechange = handler;
	xhr.onerror = err;

	xhr.open("GET", url, true);

	for (header in headers) {
		xhr.setRequestHeader(header, headers[header]);
	}

	if (type == "json") {
		xhr.setRequestHeader("Accept", "application/json");
	}

	// If type isn"t set, determine it from the file extension
	if (!type) {
		type = new _path2.default(url).extension;
	}

	if (type == "blob") {
		xhr.responseType = BLOB_RESPONSE;
	}

	if ((0, _core.isXml)(type)) {
		// xhr.responseType = "document";
		xhr.overrideMimeType("text/xml"); // for OPF parsing
	}

	if (type == "xhtml") {
		// xhr.responseType = "document";
	}

	if (type == "html" || type == "htm") {
		// xhr.responseType = "document";
	}

	if (type == "binary") {
		xhr.responseType = "arraybuffer";
	}

	xhr.send();

	function err(e) {
		deferred.reject(e);
	}

	function handler() {
		if (this.readyState === XMLHttpRequest.DONE) {
			var responseXML = false;

			if (this.responseType === "" || this.responseType === "document") {
				responseXML = this.responseXML;
			}

			if (this.status === 200 || this.status === 0 || responseXML) {
				//-- Firefox is reporting 0 for blob urls
				var r;

				if (!this.response && !responseXML) {
					deferred.reject({
						status: this.status,
						message: "Empty Response",
						stack: new Error().stack
					});
					return deferred.promise;
				}

				if (this.status === 403) {
					deferred.reject({
						status: this.status,
						response: this.response,
						message: "Forbidden",
						stack: new Error().stack
					});
					return deferred.promise;
				}
				if (responseXML) {
					r = this.responseXML;
				} else if ((0, _core.isXml)(type)) {
					// xhr.overrideMimeType("text/xml"); // for OPF parsing
					// If this.responseXML wasn't set, try to parse using a DOMParser from text
					r = (0, _core.parse)(this.response, "text/xml");
				} else if (type == "xhtml") {
					r = (0, _core.parse)(this.response, "application/xhtml+xml");
				} else if (type == "html" || type == "htm") {
					r = (0, _core.parse)(this.response, "text/html");
				} else if (type == "json") {
					r = JSON.parse(this.response);
				} else if (type == "blob") {

					if (supportsURL) {
						r = this.response;
					} else {
						//-- Safari doesn't support responseType blob, so create a blob from arraybuffer
						r = new Blob([this.response]);
					}
				} else {
					r = this.response;
				}

				deferred.resolve(r);
			} else {

				deferred.reject({
					status: this.status,
					message: this.response,
					stack: new Error().stack
				});
			}
		}
	}

	return deferred.promise;
}

exports.default = request;
module.exports = exports["default"];

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _undefined = __webpack_require__(34)(); // Support ES3 engines

module.exports = function (val) {
 return (val !== _undefined) && (val !== null);
};


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Hooks allow for injecting functions that must all complete in order before finishing
 * They will execute in parallel but all must finish before continuing
 * Functions may return a promise if they are asycn.
 * @param {any} context scope of this
 * @example this.content = new EPUBJS.Hook(this);
 */
var Hook = function () {
	function Hook(context) {
		_classCallCheck(this, Hook);

		this.context = context || this;
		this.hooks = [];
	}

	/**
  * Adds a function to be run before a hook completes
  * @example this.content.register(function(){...});
  */


	_createClass(Hook, [{
		key: "register",
		value: function register() {
			for (var i = 0; i < arguments.length; ++i) {
				if (typeof arguments[i] === "function") {
					this.hooks.push(arguments[i]);
				} else {
					// unpack array
					for (var j = 0; j < arguments[i].length; ++j) {
						this.hooks.push(arguments[i][j]);
					}
				}
			}
		}

		/**
   * Removes a function
   * @example this.content.deregister(function(){...});
   */

	}, {
		key: "deregister",
		value: function deregister(func) {
			var hook = void 0;
			for (var i = 0; i < this.hooks.length; i++) {
				hook = this.hooks[i];
				if (hook === func) {
					this.hooks.splice(i, 1);
					break;
				}
			}
		}

		/**
   * Triggers a hook to run all functions
   * @example this.content.trigger(args).then(function(){...});
   */

	}, {
		key: "trigger",
		value: function trigger() {
			var args = arguments;
			var context = this.context;
			var promises = [];

			this.hooks.forEach(function (task) {
				var executing = task.apply(context, args);

				if (executing && typeof executing["then"] === "function") {
					// Task is a function that returns a promise
					promises.push(executing);
				}
				// Otherwise Task resolves immediately, continue
			});

			return Promise.all(promises);
		}

		// Adds a function to be run before a hook completes

	}, {
		key: "list",
		value: function list() {
			return this.hooks;
		}
	}, {
		key: "clear",
		value: function clear() {
			return this.hooks = [];
		}
	}]);

	return Hook;
}();

exports.default = Hook;
module.exports = exports["default"];

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Task = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _core = __webpack_require__(0);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Queue for handling tasks one at a time
 * @class
 * @param {scope} context what this will resolve to in the tasks
 */
var Queue = function () {
	function Queue(context) {
		_classCallCheck(this, Queue);

		this._q = [];
		this.context = context;
		this.tick = _core.requestAnimationFrame;
		this.running = false;
		this.paused = false;
	}

	/**
  * Add an item to the queue
  * @return {Promise}
  */


	_createClass(Queue, [{
		key: "enqueue",
		value: function enqueue() {
			var deferred, promise;
			var queued;
			var task = [].shift.call(arguments);
			var args = arguments;

			// Handle single args without context
			// if(args && !Array.isArray(args)) {
			//   args = [args];
			// }
			if (!task) {
				throw new Error("No Task Provided");
			}

			if (typeof task === "function") {

				deferred = new _core.defer();
				promise = deferred.promise;

				queued = {
					"task": task,
					"args": args,
					//"context"  : context,
					"deferred": deferred,
					"promise": promise
				};
			} else {
				// Task is a promise
				queued = {
					"promise": task
				};
			}

			this._q.push(queued);

			// Wait to start queue flush
			if (this.paused == false && !this.running) {
				// setTimeout(this.flush.bind(this), 0);
				// this.tick.call(window, this.run.bind(this));
				this.run();
			}

			return queued.promise;
		}

		/**
   * Run one item
   * @return {Promise}
   */

	}, {
		key: "dequeue",
		value: function dequeue() {
			var inwait, task, result;

			if (this._q.length && !this.paused) {
				inwait = this._q.shift();
				task = inwait.task;
				if (task) {
					// console.log(task)

					result = task.apply(this.context, inwait.args);

					if (result && typeof result["then"] === "function") {
						// Task is a function that returns a promise
						return result.then(function () {
							inwait.deferred.resolve.apply(this.context, arguments);
						}.bind(this), function () {
							inwait.deferred.reject.apply(this.context, arguments);
						}.bind(this));
					} else {
						// Task resolves immediately
						inwait.deferred.resolve.apply(this.context, result);
						return inwait.promise;
					}
				} else if (inwait.promise) {
					// Task is a promise
					return inwait.promise;
				}
			} else {
				inwait = new _core.defer();
				inwait.deferred.resolve();
				return inwait.promise;
			}
		}

		// Run All Immediately

	}, {
		key: "dump",
		value: function dump() {
			while (this._q.length) {
				this.dequeue();
			}
		}

		/**
   * Run all tasks sequentially, at convince
   * @return {Promise}
   */

	}, {
		key: "run",
		value: function run() {
			var _this = this;

			if (!this.running) {
				this.running = true;
				this.defered = new _core.defer();
			}

			this.tick.call(window, function () {

				if (_this._q.length) {

					_this.dequeue().then(function () {
						this.run();
					}.bind(_this));
				} else {
					_this.defered.resolve();
					_this.running = undefined;
				}
			});

			// Unpause
			if (this.paused == true) {
				this.paused = false;
			}

			return this.defered.promise;
		}

		/**
   * Flush all, as quickly as possible
   * @return {Promise}
   */

	}, {
		key: "flush",
		value: function flush() {

			if (this.running) {
				return this.running;
			}

			if (this._q.length) {
				this.running = this.dequeue().then(function () {
					this.running = undefined;
					return this.flush();
				}.bind(this));

				return this.running;
			}
		}

		/**
   * Clear all items in wait
   */

	}, {
		key: "clear",
		value: function clear() {
			this._q = [];
		}

		/**
   * Get the number of tasks in the queue
   * @return {number} tasks
   */

	}, {
		key: "length",
		value: function length() {
			return this._q.length;
		}

		/**
   * Pause a running queue
   */

	}, {
		key: "pause",
		value: function pause() {
			this.paused = true;
		}

		/**
   * End the queue
   */

	}, {
		key: "stop",
		value: function stop() {
			this._q = [];
			this.running = false;
			this.paused = true;
		}
	}]);

	return Queue;
}();

/**
 * Create a new task from a callback
 * @class
 * @private
 * @param {function} task
 * @param {array} args
 * @param {scope} context
 * @return {function} task
 */


var Task = function Task(task, args, context) {
	_classCallCheck(this, Task);

	return function () {
		var _this2 = this;

		var toApply = arguments || [];

		return new Promise(function (resolve, reject) {
			var callback = function callback(value, err) {
				if (!value && err) {
					reject(err);
				} else {
					resolve(value);
				}
			};
			// Add the callback to the arguments list
			toApply.push(callback);

			// Apply all arguments to the functions
			task.apply(context || _this2, toApply);
		});
	};
};

exports.default = Queue;
exports.Task = Task;

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*
 From Zip.js, by Gildas Lormeau
edited down
 */

var table = {
	"application": {
		"ecmascript": ["es", "ecma"],
		"javascript": "js",
		"ogg": "ogx",
		"pdf": "pdf",
		"postscript": ["ps", "ai", "eps", "epsi", "epsf", "eps2", "eps3"],
		"rdf+xml": "rdf",
		"smil": ["smi", "smil"],
		"xhtml+xml": ["xhtml", "xht"],
		"xml": ["xml", "xsl", "xsd", "opf", "ncx"],
		"zip": "zip",
		"x-httpd-eruby": "rhtml",
		"x-latex": "latex",
		"x-maker": ["frm", "maker", "frame", "fm", "fb", "book", "fbdoc"],
		"x-object": "o",
		"x-shockwave-flash": ["swf", "swfl"],
		"x-silverlight": "scr",
		"epub+zip": "epub",
		"font-tdpfr": "pfr",
		"inkml+xml": ["ink", "inkml"],
		"json": "json",
		"jsonml+json": "jsonml",
		"mathml+xml": "mathml",
		"metalink+xml": "metalink",
		"mp4": "mp4s",
		// "oebps-package+xml" : "opf",
		"omdoc+xml": "omdoc",
		"oxps": "oxps",
		"vnd.amazon.ebook": "azw",
		"widget": "wgt",
		// "x-dtbncx+xml" : "ncx",
		"x-dtbook+xml": "dtb",
		"x-dtbresource+xml": "res",
		"x-font-bdf": "bdf",
		"x-font-ghostscript": "gsf",
		"x-font-linux-psf": "psf",
		"x-font-otf": "otf",
		"x-font-pcf": "pcf",
		"x-font-snf": "snf",
		"x-font-ttf": ["ttf", "ttc"],
		"x-font-type1": ["pfa", "pfb", "pfm", "afm"],
		"x-font-woff": "woff",
		"x-mobipocket-ebook": ["prc", "mobi"],
		"x-mspublisher": "pub",
		"x-nzb": "nzb",
		"x-tgif": "obj",
		"xaml+xml": "xaml",
		"xml-dtd": "dtd",
		"xproc+xml": "xpl",
		"xslt+xml": "xslt",
		"internet-property-stream": "acx",
		"x-compress": "z",
		"x-compressed": "tgz",
		"x-gzip": "gz"
	},
	"audio": {
		"flac": "flac",
		"midi": ["mid", "midi", "kar", "rmi"],
		"mpeg": ["mpga", "mpega", "mp2", "mp3", "m4a", "mp2a", "m2a", "m3a"],
		"mpegurl": "m3u",
		"ogg": ["oga", "ogg", "spx"],
		"x-aiff": ["aif", "aiff", "aifc"],
		"x-ms-wma": "wma",
		"x-wav": "wav",
		"adpcm": "adp",
		"mp4": "mp4a",
		"webm": "weba",
		"x-aac": "aac",
		"x-caf": "caf",
		"x-matroska": "mka",
		"x-pn-realaudio-plugin": "rmp",
		"xm": "xm",
		"mid": ["mid", "rmi"]
	},
	"image": {
		"gif": "gif",
		"ief": "ief",
		"jpeg": ["jpeg", "jpg", "jpe"],
		"pcx": "pcx",
		"png": "png",
		"svg+xml": ["svg", "svgz"],
		"tiff": ["tiff", "tif"],
		"x-icon": "ico",
		"bmp": "bmp",
		"webp": "webp",
		"x-pict": ["pic", "pct"],
		"x-tga": "tga",
		"cis-cod": "cod"
	},
	"text": {
		"cache-manifest": ["manifest", "appcache"],
		"css": "css",
		"csv": "csv",
		"html": ["html", "htm", "shtml", "stm"],
		"mathml": "mml",
		"plain": ["txt", "text", "brf", "conf", "def", "list", "log", "in", "bas"],
		"richtext": "rtx",
		"tab-separated-values": "tsv",
		"x-bibtex": "bib"
	},
	"video": {
		"mpeg": ["mpeg", "mpg", "mpe", "m1v", "m2v", "mp2", "mpa", "mpv2"],
		"mp4": ["mp4", "mp4v", "mpg4"],
		"quicktime": ["qt", "mov"],
		"ogg": "ogv",
		"vnd.mpegurl": ["mxu", "m4u"],
		"x-flv": "flv",
		"x-la-asf": ["lsf", "lsx"],
		"x-mng": "mng",
		"x-ms-asf": ["asf", "asx", "asr"],
		"x-ms-wm": "wm",
		"x-ms-wmv": "wmv",
		"x-ms-wmx": "wmx",
		"x-ms-wvx": "wvx",
		"x-msvideo": "avi",
		"x-sgi-movie": "movie",
		"x-matroska": ["mpv", "mkv", "mk3d", "mks"],
		"3gpp2": "3g2",
		"h261": "h261",
		"h263": "h263",
		"h264": "h264",
		"jpeg": "jpgv",
		"jpm": ["jpm", "jpgm"],
		"mj2": ["mj2", "mjp2"],
		"vnd.ms-playready.media.pyv": "pyv",
		"vnd.uvvu.mp4": ["uvu", "uvvu"],
		"vnd.vivo": "viv",
		"webm": "webm",
		"x-f4v": "f4v",
		"x-m4v": "m4v",
		"x-ms-vob": "vob",
		"x-smv": "smv"
	}
};

var mimeTypes = function () {
	var type,
	    subtype,
	    val,
	    index,
	    mimeTypes = {};
	for (type in table) {
		if (table.hasOwnProperty(type)) {
			for (subtype in table[type]) {
				if (table[type].hasOwnProperty(subtype)) {
					val = table[type][subtype];
					if (typeof val == "string") {
						mimeTypes[val] = type + "/" + subtype;
					} else {
						for (index = 0; index < val.length; index++) {
							mimeTypes[val[index]] = type + "/" + subtype;
						}
					}
				}
			}
		}
	}
	return mimeTypes;
}();

var defaultValue = "text/plain"; //"application/octet-stream";

function lookup(filename) {
	return filename && mimeTypes[filename.split(".").pop().toLowerCase()] || defaultValue;
};

module.exports = {
	'lookup': lookup
};

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventEmitter = __webpack_require__(3);

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

var _core = __webpack_require__(0);

var _epubcfi = __webpack_require__(1);

var _epubcfi2 = _interopRequireDefault(_epubcfi);

var _mapping = __webpack_require__(19);

var _mapping2 = _interopRequireDefault(_mapping);

var _replacements = __webpack_require__(8);

var _constants = __webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var hasNavigator = typeof navigator !== "undefined";

var isChrome = hasNavigator && /Chrome/.test(navigator.userAgent);
var isWebkit = hasNavigator && !isChrome && /AppleWebKit/.test(navigator.userAgent);

var ELEMENT_NODE = 1;
var TEXT_NODE = 3;

/**
	* Handles DOM manipulation, queries and events for View contents
	* @class
	* @param {document} doc Document
	* @param {element} content Parent Element (typically Body)
	* @param {string} cfiBase Section component of CFIs
	* @param {number} sectionIndex Index in Spine of Conntent's Section
	*/

var Contents = function () {
	function Contents(doc, content, cfiBase, sectionIndex) {
		_classCallCheck(this, Contents);

		// Blank Cfi for Parsing
		this.epubcfi = new _epubcfi2.default();

		this.document = doc;
		this.documentElement = this.document.documentElement;
		this.content = content || this.document.body;
		this.window = this.document.defaultView;

		this._size = {
			width: 0,
			height: 0
		};

		this.sectionIndex = sectionIndex || 0;
		this.cfiBase = cfiBase || "";

		this.epubReadingSystem("epub.js", _constants.EPUBJS_VERSION);

		this.listeners();
	}

	/**
 	* Get DOM events that are listened for and passed along
 	*/


	_createClass(Contents, [{
		key: "width",


		/**
  	* Get or Set width
  	* @param {number} [w]
  	* @returns {number} width
  	*/
		value: function width(w) {
			// var frame = this.documentElement;
			var frame = this.content;

			if (w && (0, _core.isNumber)(w)) {
				w = w + "px";
			}

			if (w) {
				frame.style.width = w;
				// this.content.style.width = w;
			}

			return parseInt(this.window.getComputedStyle(frame)["width"]);
		}

		/**
  	* Get or Set height
  	* @param {number} [h]
  	* @returns {number} height
  	*/

	}, {
		key: "height",
		value: function height(h) {
			// var frame = this.documentElement;
			var frame = this.content;

			if (h && (0, _core.isNumber)(h)) {
				h = h + "px";
			}

			if (h) {
				frame.style.height = h;
				// this.content.style.height = h;
			}

			return parseInt(this.window.getComputedStyle(frame)["height"]);
		}

		/**
  	* Get or Set width of the contents
  	* @param {number} [w]
  	* @returns {number} width
  	*/

	}, {
		key: "contentWidth",
		value: function contentWidth(w) {

			var content = this.content || this.document.body;

			if (w && (0, _core.isNumber)(w)) {
				w = w + "px";
			}

			if (w) {
				content.style.width = w;
			}

			return parseInt(this.window.getComputedStyle(content)["width"]);
		}

		/**
  	* Get or Set height of the contents
  	* @param {number} [h]
  	* @returns {number} height
  	*/

	}, {
		key: "contentHeight",
		value: function contentHeight(h) {

			var content = this.content || this.document.body;

			if (h && (0, _core.isNumber)(h)) {
				h = h + "px";
			}

			if (h) {
				content.style.height = h;
			}

			return parseInt(this.window.getComputedStyle(content)["height"]);
		}

		/**
  	* Get the width of the text using Range
  	* @returns {number} width
  	*/

	}, {
		key: "textWidth",
		value: function textWidth() {
			var rect = void 0;
			var width = void 0;
			var range = this.document.createRange();
			var content = this.content || this.document.body;
			var border = (0, _core.borders)(content);

			// Select the contents of frame
			range.selectNodeContents(content);

			// get the width of the text content
			rect = range.getBoundingClientRect();
			width = rect.width;

			if (border && border.width) {
				width += border.width;
			}

			return Math.round(width);
		}

		/**
  	* Get the height of the text using Range
  	* @returns {number} height
  	*/

	}, {
		key: "textHeight",
		value: function textHeight() {
			var rect = void 0;
			var height = void 0;
			var range = this.document.createRange();
			var content = this.content || this.document.body;
			var border = (0, _core.borders)(content);

			range.selectNodeContents(content);

			rect = range.getBoundingClientRect();
			height = rect.height;

			if (height && border.height) {
				height += border.height;
			}

			if (height && rect.top) {
				height += rect.top;
			}

			return Math.round(height);
		}

		/**
  	* Get documentElement scrollWidth
  	* @returns {number} width
  	*/

	}, {
		key: "scrollWidth",
		value: function scrollWidth() {
			var width = this.documentElement.scrollWidth;

			return width;
		}

		/**
  	* Get documentElement scrollHeight
  	* @returns {number} height
  	*/

	}, {
		key: "scrollHeight",
		value: function scrollHeight() {
			var height = this.documentElement.scrollHeight;

			return height;
		}

		/**
  	* Set overflow css style of the contents
  	* @param {string} [overflow]
  	*/

	}, {
		key: "overflow",
		value: function overflow(_overflow) {

			if (_overflow) {
				this.documentElement.style.overflow = _overflow;
			}

			return this.window.getComputedStyle(this.documentElement)["overflow"];
		}

		/**
  	* Set overflowX css style of the documentElement
  	* @param {string} [overflow]
  	*/

	}, {
		key: "overflowX",
		value: function overflowX(overflow) {

			if (overflow) {
				this.documentElement.style.overflowX = overflow;
			}

			return this.window.getComputedStyle(this.documentElement)["overflowX"];
		}

		/**
  	* Set overflowY css style of the documentElement
  	* @param {string} [overflow]
  	*/

	}, {
		key: "overflowY",
		value: function overflowY(overflow) {

			if (overflow) {
				this.documentElement.style.overflowY = overflow;
			}

			return this.window.getComputedStyle(this.documentElement)["overflowY"];
		}

		/**
  	* Set Css styles on the contents element (typically Body)
  	* @param {string} property
  	* @param {string} value
  	* @param {boolean} [priority] set as "important"
  	*/

	}, {
		key: "css",
		value: function css(property, value, priority) {
			var content = this.content || this.document.body;

			if (value) {
				content.style.setProperty(property, value, priority ? "important" : "");
			} else {
				content.style.removeProperty(property);
			}

			return this.window.getComputedStyle(content)[property];
		}

		/**
  	* Get or Set the viewport element
  	* @param {object} [options]
  	* @param {string} [options.width]
  	* @param {string} [options.height]
  	* @param {string} [options.scale]
  	* @param {string} [options.minimum]
  	* @param {string} [options.maximum]
  	* @param {string} [options.scalable]
  	*/

	}, {
		key: "viewport",
		value: function viewport(options) {
			var _width, _height, _scale, _minimum, _maximum, _scalable;
			// var width, height, scale, minimum, maximum, scalable;
			var $viewport = this.document.querySelector("meta[name='viewport']");
			var parsed = {
				"width": undefined,
				"height": undefined,
				"scale": undefined,
				"minimum": undefined,
				"maximum": undefined,
				"scalable": undefined
			};
			var newContent = [];
			var settings = {};

			/*
   * check for the viewport size
   * <meta name="viewport" content="width=1024,height=697" />
   */
			if ($viewport && $viewport.hasAttribute("content")) {
				var content = $viewport.getAttribute("content");
				var _width2 = content.match(/width\s*=\s*([^,]*)/);
				var _height2 = content.match(/height\s*=\s*([^,]*)/);
				var _scale2 = content.match(/initial-scale\s*=\s*([^,]*)/);
				var _minimum2 = content.match(/minimum-scale\s*=\s*([^,]*)/);
				var _maximum2 = content.match(/maximum-scale\s*=\s*([^,]*)/);
				var _scalable2 = content.match(/user-scalable\s*=\s*([^,]*)/);

				if (_width2 && _width2.length && typeof _width2[1] !== "undefined") {
					parsed.width = _width2[1];
				}
				if (_height2 && _height2.length && typeof _height2[1] !== "undefined") {
					parsed.height = _height2[1];
				}
				if (_scale2 && _scale2.length && typeof _scale2[1] !== "undefined") {
					parsed.scale = _scale2[1];
				}
				if (_minimum2 && _minimum2.length && typeof _minimum2[1] !== "undefined") {
					parsed.minimum = _minimum2[1];
				}
				if (_maximum2 && _maximum2.length && typeof _maximum2[1] !== "undefined") {
					parsed.maximum = _maximum2[1];
				}
				if (_scalable2 && _scalable2.length && typeof _scalable2[1] !== "undefined") {
					parsed.scalable = _scalable2[1];
				}
			}

			settings = (0, _core.defaults)(options || {}, parsed);

			if (options) {
				if (settings.width) {
					newContent.push("width=" + settings.width);
				}

				if (settings.height) {
					newContent.push("height=" + settings.height);
				}

				if (settings.scale) {
					newContent.push("initial-scale=" + settings.scale);
				}

				if (settings.scalable === "no") {
					newContent.push("minimum-scale=" + settings.scale);
					newContent.push("maximum-scale=" + settings.scale);
					newContent.push("user-scalable=" + settings.scalable);
				} else {

					if (settings.scalable) {
						newContent.push("user-scalable=" + settings.scalable);
					}

					if (settings.minimum) {
						newContent.push("minimum-scale=" + settings.minimum);
					}

					if (settings.maximum) {
						newContent.push("minimum-scale=" + settings.maximum);
					}
				}

				if (!$viewport) {
					$viewport = this.document.createElement("meta");
					$viewport.setAttribute("name", "viewport");
					this.document.querySelector("head").appendChild($viewport);
				}

				$viewport.setAttribute("content", newContent.join(", "));

				this.window.scrollTo(0, 0);
			}

			return settings;
		}

		/**
   * Event emitter for when the contents has expanded
   * @private
   */

	}, {
		key: "expand",
		value: function expand() {
			this.emit(_constants.EVENTS.CONTENTS.EXPAND);
		}

		/**
   * Add DOM listeners
   * @private
   */

	}, {
		key: "listeners",
		value: function listeners() {
			this.imageLoadListeners();

			this.mediaQueryListeners();

			// this.fontLoadListeners();

			this.addEventListeners();

			this.addSelectionListeners();

			// this.transitionListeners();

			this.resizeListeners();

			// this.resizeObservers();

			this.linksHandler();
		}

		/**
   * Remove DOM listeners
   * @private
   */

	}, {
		key: "removeListeners",
		value: function removeListeners() {

			this.removeEventListeners();

			this.removeSelectionListeners();

			clearTimeout(this.expanding);
		}

		/**
   * Check if size of contents has changed and
   * emit 'resize' event if it has.
   * @private
   */

	}, {
		key: "resizeCheck",
		value: function resizeCheck() {
			var width = this.textWidth();
			var height = this.textHeight();

			if (width != this._size.width || height != this._size.height) {

				this._size = {
					width: width,
					height: height
				};

				this.onResize && this.onResize(this._size);
				this.emit(_constants.EVENTS.CONTENTS.RESIZE, this._size);
			}
		}

		/**
   * Poll for resize detection
   * @private
   */

	}, {
		key: "resizeListeners",
		value: function resizeListeners() {
			var width, height;
			// Test size again
			clearTimeout(this.expanding);
			requestAnimationFrame(this.resizeCheck.bind(this));
		}

		/**
   * Use css transitions to detect resize
   * @private
   */

	}, {
		key: "transitionListeners",
		value: function transitionListeners() {
			var body = this.content;

			body.style['transitionProperty'] = "font, font-size, font-size-adjust, font-stretch, font-variation-settings, font-weight, width, height";
			body.style['transitionDuration'] = "0.001ms";
			body.style['transitionTimingFunction'] = "linear";
			body.style['transitionDelay'] = "0";

			this._resizeCheck = this.resizeCheck.bind(this);
			this.document.addEventListener('transitionend', this._resizeCheck);
		}

		/**
   * Listen for media query changes and emit 'expand' event
   * Adapted from: https://github.com/tylergaw/media-query-events/blob/master/js/mq-events.js
   * @private
   */

	}, {
		key: "mediaQueryListeners",
		value: function mediaQueryListeners() {
			var sheets = this.document.styleSheets;
			var mediaChangeHandler = function (m) {
				if (m.matches && !this._expanding) {
					setTimeout(this.expand.bind(this), 1);
				}
			}.bind(this);

			for (var i = 0; i < sheets.length; i += 1) {
				var rules;
				// Firefox errors if we access cssRules cross-domain
				try {
					rules = sheets[i].cssRules;
				} catch (e) {
					return;
				}
				if (!rules) return; // Stylesheets changed
				for (var j = 0; j < rules.length; j += 1) {
					//if (rules[j].constructor === CSSMediaRule) {
					if (rules[j].media) {
						var mql = this.window.matchMedia(rules[j].media.mediaText);
						mql.addListener(mediaChangeHandler);
						//mql.onchange = mediaChangeHandler;
					}
				}
			}
		}

		/**
   * Use MutationObserver to listen for changes in the DOM and check for resize
   * @private
   */

	}, {
		key: "resizeObservers",
		value: function resizeObservers() {
			var _this = this;

			// create an observer instance
			this.observer = new MutationObserver(function (mutations) {
				_this.resizeCheck();
			});

			// configuration of the observer:
			var config = { attributes: true, childList: true, characterData: true, subtree: true };

			// pass in the target node, as well as the observer options
			this.observer.observe(this.document, config);
		}

		/**
   * Test if images are loaded or add listener for when they load
   * @private
   */

	}, {
		key: "imageLoadListeners",
		value: function imageLoadListeners() {
			var images = this.document.querySelectorAll("img");
			var img;
			for (var i = 0; i < images.length; i++) {
				img = images[i];

				if (typeof img.naturalWidth !== "undefined" && img.naturalWidth === 0) {
					img.onload = this.expand.bind(this);
				}
			}
		}

		/**
   * Listen for font load and check for resize when loaded
   * @private
   */

	}, {
		key: "fontLoadListeners",
		value: function fontLoadListeners() {
			if (!this.document || !this.document.fonts) {
				return;
			}

			this.document.fonts.ready.then(function () {
				this.resizeCheck();
			}.bind(this));
		}

		/**
   * Get the documentElement
   * @returns {element} documentElement
   */

	}, {
		key: "root",
		value: function root() {
			if (!this.document) return null;
			return this.document.documentElement;
		}

		/**
   * Get the location offset of a EpubCFI or an #id
   * @param {string | EpubCFI} target
   * @param {string} [ignoreClass] for the cfi
   * @returns { {left: Number, top: Number }
   */

	}, {
		key: "locationOf",
		value: function locationOf(target, ignoreClass) {
			var position;
			var targetPos = { "left": 0, "top": 0 };

			if (!this.document) return targetPos;

			if (this.epubcfi.isCfiString(target)) {
				var range = new _epubcfi2.default(target).toRange(this.document, ignoreClass);

				if (range) {
					try {
						if (!range.endContainer || range.startContainer == range.endContainer && range.startOffset == range.endOffset) {
							// If the end for the range is not set, it results in collapsed becoming
							// true. This in turn leads to inconsistent behaviour when calling
							// getBoundingRect. Wrong bounds lead to the wrong page being displayed.
							// https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/15684911/
							var pos = range.startContainer.textContent.indexOf(" ", range.startOffset);
							if (pos == -1) {
								pos = range.startContainer.textContent.length;
							}
							range.setEnd(range.startContainer, pos);
						}
					} catch (e) {
						console.error("setting end offset to start container length failed", e);
					}

					if (range.startContainer.nodeType === Node.ELEMENT_NODE) {
						position = range.startContainer.getBoundingClientRect();
						targetPos.left = position.left;
						targetPos.top = position.top;
					} else {
						// Webkit does not handle collapsed range bounds correctly
						// https://bugs.webkit.org/show_bug.cgi?id=138949

						// Construct a new non-collapsed range
						if (isWebkit) {
							var container = range.startContainer;
							var newRange = new Range();
							try {
								if (container.nodeType === ELEMENT_NODE) {
									position = container.getBoundingClientRect();
								} else if (range.startOffset + 2 < container.length) {
									newRange.setStart(container, range.startOffset);
									newRange.setEnd(container, range.startOffset + 2);
									position = newRange.getBoundingClientRect();
								} else if (range.startOffset - 2 > 0) {
									newRange.setStart(container, range.startOffset - 2);
									newRange.setEnd(container, range.startOffset);
									position = newRange.getBoundingClientRect();
								} else {
									// empty, return the parent element
									position = container.parentNode.getBoundingClientRect();
								}
							} catch (e) {
								console.error(e, e.stack);
							}
						} else {
							position = range.getBoundingClientRect();
						}
					}
				}
			} else if (typeof target === "string" && target.indexOf("#") > -1) {

				var id = target.substring(target.indexOf("#") + 1);
				var el = this.document.getElementById(id);
				if (el) {
					if (isWebkit) {
						// Webkit reports incorrect bounding rects in Columns
						var _newRange = new Range();
						_newRange.selectNode(el);
						position = _newRange.getBoundingClientRect();
					} else {
						position = el.getBoundingClientRect();
					}
				}
			}

			if (position) {
				targetPos.left = position.left;
				targetPos.top = position.top;
			}

			return targetPos;
		}

		/**
   * Append a stylesheet link to the document head
   * @param {string} src url
   */

	}, {
		key: "addStylesheet",
		value: function addStylesheet(src) {
			return new Promise(function (resolve, reject) {
				var $stylesheet;
				var ready = false;

				if (!this.document) {
					resolve(false);
					return;
				}

				// Check if link already exists
				$stylesheet = this.document.querySelector("link[href='" + src + "']");
				if ($stylesheet) {
					resolve(true);
					return; // already present
				}

				$stylesheet = this.document.createElement("link");
				$stylesheet.type = "text/css";
				$stylesheet.rel = "stylesheet";
				$stylesheet.href = src;
				$stylesheet.onload = $stylesheet.onreadystatechange = function () {
					if (!ready && (!this.readyState || this.readyState == "complete")) {
						ready = true;
						// Let apply
						setTimeout(function () {
							resolve(true);
						}, 1);
					}
				};

				this.document.head.appendChild($stylesheet);
			}.bind(this));
		}
	}, {
		key: "_getStylesheetNode",
		value: function _getStylesheetNode(key) {
			var styleEl;
			key = "epubjs-inserted-css-" + (key || '');

			if (!this.document) return false;

			// Check if link already exists
			styleEl = this.document.getElementById(key);
			if (!styleEl) {
				styleEl = this.document.createElement("style");
				styleEl.id = key;
				// Append style element to head
				this.document.head.appendChild(styleEl);
			}
			return styleEl;
		}

		/**
   * Append stylesheet css
   * @param {string} serializedCss
   * @param {string} key If the key is the same, the CSS will be replaced instead of inserted
   */

	}, {
		key: "addStylesheetCss",
		value: function addStylesheetCss(serializedCss, key) {
			if (!this.document || !serializedCss) return false;

			var styleEl;
			styleEl = this._getStylesheetNode(key);
			styleEl.innerHTML = serializedCss;

			return true;
		}

		/**
   * Append stylesheet rules to a generate stylesheet
   * Array: https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet/insertRule
   * Object: https://github.com/desirable-objects/json-to-css
   * @param {array | object} rules
   * @param {string} key If the key is the same, the CSS will be replaced instead of inserted
   */

	}, {
		key: "addStylesheetRules",
		value: function addStylesheetRules(rules, key) {
			var styleSheet;

			if (!this.document || !rules || rules.length === 0) return;

			// Grab style sheet
			styleSheet = this._getStylesheetNode(key).sheet;

			if (Object.prototype.toString.call(rules) === "[object Array]") {
				for (var i = 0, rl = rules.length; i < rl; i++) {
					var j = 1,
					    rule = rules[i],
					    selector = rules[i][0],
					    propStr = "";
					// If the second argument of a rule is an array of arrays, correct our variables.
					if (Object.prototype.toString.call(rule[1][0]) === "[object Array]") {
						rule = rule[1];
						j = 0;
					}

					for (var pl = rule.length; j < pl; j++) {
						var prop = rule[j];
						propStr += prop[0] + ":" + prop[1] + (prop[2] ? " !important" : "") + ";\n";
					}

					// Insert CSS Rule
					styleSheet.insertRule(selector + "{" + propStr + "}", styleSheet.cssRules.length);
				}
			} else {
				var selectors = Object.keys(rules);
				selectors.forEach(function (selector) {
					var definition = rules[selector];
					if (Array.isArray(definition)) {
						definition.forEach(function (item) {
							var _rules = Object.keys(item);
							var result = _rules.map(function (rule) {
								return rule + ":" + item[rule];
							}).join(';');
							styleSheet.insertRule(selector + "{" + result + "}", styleSheet.cssRules.length);
						});
					} else {
						var _rules = Object.keys(definition);
						var result = _rules.map(function (rule) {
							return rule + ":" + definition[rule];
						}).join(';');
						styleSheet.insertRule(selector + "{" + result + "}", styleSheet.cssRules.length);
					}
				});
			}
		}

		/**
   * Append a script tag to the document head
   * @param {string} src url
   * @returns {Promise} loaded
   */

	}, {
		key: "addScript",
		value: function addScript(src) {

			return new Promise(function (resolve, reject) {
				var $script;
				var ready = false;

				if (!this.document) {
					resolve(false);
					return;
				}

				$script = this.document.createElement("script");
				$script.type = "text/javascript";
				$script.async = true;
				$script.src = src;
				$script.onload = $script.onreadystatechange = function () {
					if (!ready && (!this.readyState || this.readyState == "complete")) {
						ready = true;
						setTimeout(function () {
							resolve(true);
						}, 1);
					}
				};

				this.document.head.appendChild($script);
			}.bind(this));
		}

		/**
   * Add a class to the contents container
   * @param {string} className
   */

	}, {
		key: "addClass",
		value: function addClass(className) {
			var content;

			if (!this.document) return;

			content = this.content || this.document.body;

			if (content) {
				content.classList.add(className);
			}
		}

		/**
   * Remove a class from the contents container
   * @param {string} removeClass
   */

	}, {
		key: "removeClass",
		value: function removeClass(className) {
			var content;

			if (!this.document) return;

			content = this.content || this.document.body;

			if (content) {
				content.classList.remove(className);
			}
		}

		/**
   * Add DOM event listeners
   * @private
   */

	}, {
		key: "addEventListeners",
		value: function addEventListeners() {
			if (!this.document) {
				return;
			}

			this._triggerEvent = this.triggerEvent.bind(this);

			_constants.DOM_EVENTS.forEach(function (eventName) {
				this.document.addEventListener(eventName, this._triggerEvent, { passive: true });
			}, this);
		}

		/**
   * Remove DOM event listeners
   * @private
   */

	}, {
		key: "removeEventListeners",
		value: function removeEventListeners() {
			if (!this.document) {
				return;
			}
			_constants.DOM_EVENTS.forEach(function (eventName) {
				this.document.removeEventListener(eventName, this._triggerEvent, { passive: true });
			}, this);
			this._triggerEvent = undefined;
		}

		/**
   * Emit passed browser events
   * @private
   */

	}, {
		key: "triggerEvent",
		value: function triggerEvent(e) {
			this.emit(e.type, e);
		}

		/**
   * Add listener for text selection
   * @private
   */

	}, {
		key: "addSelectionListeners",
		value: function addSelectionListeners() {
			if (!this.document) {
				return;
			}
			this._onSelectionChange = this.onSelectionChange.bind(this);
			this.document.addEventListener("selectionchange", this._onSelectionChange, { passive: true });
		}

		/**
   * Remove listener for text selection
   * @private
   */

	}, {
		key: "removeSelectionListeners",
		value: function removeSelectionListeners() {
			if (!this.document) {
				return;
			}
			this.document.removeEventListener("selectionchange", this._onSelectionChange, { passive: true });
			this._onSelectionChange = undefined;
		}

		/**
   * Handle getting text on selection
   * @private
   */

	}, {
		key: "onSelectionChange",
		value: function onSelectionChange(e) {
			if (this.selectionEndTimeout) {
				clearTimeout(this.selectionEndTimeout);
			}
			this.selectionEndTimeout = setTimeout(function () {
				var selection = this.window.getSelection();
				this.triggerSelectedEvent(selection);
			}.bind(this), 250);
		}

		/**
   * Emit event on text selection
   * @private
   */

	}, {
		key: "triggerSelectedEvent",
		value: function triggerSelectedEvent(selection) {
			var range, cfirange;

			if (selection && selection.rangeCount > 0) {
				range = selection.getRangeAt(0);
				if (!range.collapsed) {
					// cfirange = this.section.cfiFromRange(range);
					cfirange = new _epubcfi2.default(range, this.cfiBase).toString();
					this.emit(_constants.EVENTS.CONTENTS.SELECTED, cfirange);
					this.emit(_constants.EVENTS.CONTENTS.SELECTED_RANGE, range);
				}
			}
		}

		/**
   * Get a Dom Range from EpubCFI
   * @param {EpubCFI} _cfi
   * @param {string} [ignoreClass]
   * @returns {Range} range
   */

	}, {
		key: "range",
		value: function range(_cfi, ignoreClass) {
			var cfi = new _epubcfi2.default(_cfi);
			return cfi.toRange(this.document, ignoreClass);
		}

		/**
   * Get an EpubCFI from a Dom Range
   * @param {Range} range
   * @param {string} [ignoreClass]
   * @returns {EpubCFI} cfi
   */

	}, {
		key: "cfiFromRange",
		value: function cfiFromRange(range, ignoreClass) {
			return new _epubcfi2.default(range, this.cfiBase, ignoreClass).toString();
		}

		/**
   * Get an EpubCFI from a Dom node
   * @param {node} node
   * @param {string} [ignoreClass]
   * @returns {EpubCFI} cfi
   */

	}, {
		key: "cfiFromNode",
		value: function cfiFromNode(node, ignoreClass) {
			return new _epubcfi2.default(node, this.cfiBase, ignoreClass).toString();
		}

		// TODO: find where this is used - remove?

	}, {
		key: "map",
		value: function map(layout) {
			var map = new _mapping2.default(layout);
			return map.section();
		}

		/**
   * Size the contents to a given width and height
   * @param {number} [width]
   * @param {number} [height]
   */

	}, {
		key: "size",
		value: function size(width, height) {
			var viewport = { scale: 1.0, scalable: "no" };

			this.layoutStyle("scrolling");

			if (width >= 0) {
				this.width(width);
				viewport.width = width;
				this.css("padding", "0 " + width / 12 + "px");
			}

			if (height >= 0) {
				this.height(height);
				viewport.height = height;
			}

			this.css("margin", "0");
			this.css("box-sizing", "border-box");

			this.viewport(viewport);
		}

		/**
   * Apply columns to the contents for pagination
   * @param {number} width
   * @param {number} height
   * @param {number} columnWidth
   * @param {number} gap
   */

	}, {
		key: "columns",
		value: function columns(width, height, columnWidth, gap, dir) {
			var COLUMN_AXIS = (0, _core.prefixed)("column-axis");
			var COLUMN_GAP = (0, _core.prefixed)("column-gap");
			var COLUMN_WIDTH = (0, _core.prefixed)("column-width");
			var COLUMN_FILL = (0, _core.prefixed)("column-fill");

			var writingMode = this.writingMode();
			var axis = writingMode.indexOf("vertical") === 0 ? "vertical" : "horizontal";

			this.layoutStyle("paginated");

			if (dir === "rtl" && axis === "horizontal") {
				this.direction(dir);
			}

			this.width(width);
			this.height(height);

			// Deal with Mobile trying to scale to viewport
			this.viewport({ width: width, height: height, scale: 1.0, scalable: "no" });

			// TODO: inline-block needs more testing
			// Fixes Safari column cut offs, but causes RTL issues
			// this.css("display", "inline-block");

			this.css("overflow-y", "hidden");
			this.css("margin", "0", true);

			if (axis === "vertical") {
				this.css("padding-top", gap / 2 + "px", true);
				this.css("padding-bottom", gap / 2 + "px", true);
				this.css("padding-left", "20px");
				this.css("padding-right", "20px");
				this.css(COLUMN_AXIS, "vertical");
			} else {
				this.css("padding-top", "20px");
				this.css("padding-bottom", "20px");
				this.css("padding-left", gap / 2 + "px", true);
				this.css("padding-right", gap / 2 + "px", true);
				this.css(COLUMN_AXIS, "horizontal");
			}

			this.css("box-sizing", "border-box");
			this.css("max-width", "inherit");

			this.css(COLUMN_FILL, "auto");

			this.css(COLUMN_GAP, gap + "px");
			this.css(COLUMN_WIDTH, columnWidth + "px");

			// Fix glyph clipping in WebKit
			// https://github.com/futurepress/epub.js/issues/983
			this.css("-webkit-line-box-contain", "block glyphs replaced");
		}

		/**
   * Scale contents from center
   * @param {number} scale
   * @param {number} offsetX
   * @param {number} offsetY
   */

	}, {
		key: "scaler",
		value: function scaler(scale, offsetX, offsetY) {
			var scaleStr = "scale(" + scale + ")";
			var translateStr = "";
			// this.css("position", "absolute"));
			this.css("transform-origin", "top left");

			if (offsetX >= 0 || offsetY >= 0) {
				translateStr = " translate(" + (offsetX || 0) + "px, " + (offsetY || 0) + "px )";
			}

			this.css("transform", scaleStr + translateStr);
		}

		/**
   * Fit contents into a fixed width and height
   * @param {number} width
   * @param {number} height
   */

	}, {
		key: "fit",
		value: function fit(width, height, section) {
			var viewport = this.viewport();
			var viewportWidth = parseInt(viewport.width);
			var viewportHeight = parseInt(viewport.height);
			var widthScale = width / viewportWidth;
			var heightScale = height / viewportHeight;
			var scale = widthScale < heightScale ? widthScale : heightScale;

			// the translate does not work as intended, elements can end up unaligned
			// var offsetY = (height - (viewportHeight * scale)) / 2;
			// var offsetX = 0;
			// if (this.sectionIndex % 2 === 1) {
			// 	offsetX = width - (viewportWidth * scale);
			// }

			this.layoutStyle("paginated");

			// scale needs width and height to be set
			this.width(viewportWidth);
			this.height(viewportHeight);
			this.overflow("hidden");

			// Scale to the correct size
			this.scaler(scale, 0, 0);
			// this.scaler(scale, offsetX > 0 ? offsetX : 0, offsetY);

			// background images are not scaled by transform
			this.css("background-size", viewportWidth * scale + "px " + viewportHeight * scale + "px");

			this.css("background-color", "transparent");
			if (section && section.properties.includes("page-spread-left")) {
				// set margin since scale is weird
				var marginLeft = width - viewportWidth * scale;
				this.css("margin-left", marginLeft + "px");
			}
		}

		/**
   * Set the direction of the text
   * @param {string} [dir="ltr"] "rtl" | "ltr"
   */

	}, {
		key: "direction",
		value: function direction(dir) {
			if (this.documentElement) {
				this.documentElement.style["direction"] = dir;
			}
		}
	}, {
		key: "mapPage",
		value: function mapPage(cfiBase, layout, start, end, dev) {
			var mapping = new _mapping2.default(layout, dev);

			return mapping.page(this, cfiBase, start, end);
		}

		/**
   * Emit event when link in content is clicked
   * @private
   */

	}, {
		key: "linksHandler",
		value: function linksHandler() {
			var _this2 = this;

			(0, _replacements.replaceLinks)(this.content, function (href) {
				_this2.emit(_constants.EVENTS.CONTENTS.LINK_CLICKED, href);
			});
		}

		/**
   * Set the writingMode of the text
   * @param {string} [mode="horizontal-tb"] "horizontal-tb" | "vertical-rl" | "vertical-lr"
   */

	}, {
		key: "writingMode",
		value: function writingMode(mode) {
			var WRITING_MODE = (0, _core.prefixed)("writing-mode");

			if (mode && this.documentElement) {
				this.documentElement.style[WRITING_MODE] = mode;
			}

			return this.window.getComputedStyle(this.documentElement)[WRITING_MODE] || '';
		}

		/**
   * Set the layoutStyle of the content
   * @param {string} [style="paginated"] "scrolling" | "paginated"
   * @private
   */

	}, {
		key: "layoutStyle",
		value: function layoutStyle(style) {

			if (style) {
				this._layoutStyle = style;
				navigator.epubReadingSystem.layoutStyle = this._layoutStyle;
			}

			return this._layoutStyle || "paginated";
		}

		/**
   * Add the epubReadingSystem object to the navigator
   * @param {string} name
   * @param {string} version
   * @private
   */

	}, {
		key: "epubReadingSystem",
		value: function epubReadingSystem(name, version) {
			navigator.epubReadingSystem = {
				name: name,
				version: version,
				layoutStyle: this.layoutStyle(),
				hasFeature: function hasFeature(feature) {
					switch (feature) {
						case "dom-manipulation":
							return true;
						case "layout-changes":
							return true;
						case "touch-events":
							return true;
						case "mouse-events":
							return true;
						case "keyboard-events":
							return true;
						case "spine-scripting":
							return false;
						default:
							return false;
					}
				}
			};
			return navigator.epubReadingSystem;
		}
	}, {
		key: "destroy",
		value: function destroy() {
			// Stop observing
			if (this.observer) {
				this.observer.disconnect();
			}

			this.document.removeEventListener('transitionend', this._resizeCheck);

			this.removeListeners();
		}
	}], [{
		key: "listenedEvents",
		get: function get() {
			return _constants.DOM_EVENTS;
		}
	}]);

	return Contents;
}();

(0, _eventEmitter2.default)(Contents.prototype);

exports.default = Contents;
module.exports = exports["default"];

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventEmitter = __webpack_require__(3);

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

var _core = __webpack_require__(0);

var _scrolltype = __webpack_require__(59);

var _scrolltype2 = _interopRequireDefault(_scrolltype);

var _mapping = __webpack_require__(19);

var _mapping2 = _interopRequireDefault(_mapping);

var _queue = __webpack_require__(12);

var _queue2 = _interopRequireDefault(_queue);

var _stage = __webpack_require__(60);

var _stage2 = _interopRequireDefault(_stage);

var _views = __webpack_require__(70);

var _views2 = _interopRequireDefault(_views);

var _constants = __webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DefaultViewManager = function () {
	function DefaultViewManager(options) {
		_classCallCheck(this, DefaultViewManager);

		this.name = "default";
		this.optsSettings = options.settings;
		this.View = options.view;
		this.request = options.request;
		this.renditionQueue = options.queue;
		this.q = new _queue2.default(this);

		this.settings = (0, _core.extend)(this.settings || {}, {
			infinite: true,
			hidden: false,
			width: undefined,
			height: undefined,
			axis: undefined,
			flow: "scrolled",
			ignoreClass: "",
			fullsize: undefined
		});

		(0, _core.extend)(this.settings, options.settings || {});

		this.viewSettings = {
			ignoreClass: this.settings.ignoreClass,
			axis: this.settings.axis,
			flow: this.settings.flow,
			layout: this.layout,
			method: this.settings.method, // srcdoc, blobUrl, write
			width: 0,
			height: 0,
			forceEvenPages: true
		};

		this.rendered = false;
	}

	_createClass(DefaultViewManager, [{
		key: "render",
		value: function render(element, size) {
			var tag = element.tagName;

			if (typeof this.settings.fullsize === "undefined" && tag && (tag.toLowerCase() == "body" || tag.toLowerCase() == "html")) {
				this.settings.fullsize = true;
			}

			if (this.settings.fullsize) {
				this.settings.overflow = "visible";
				this.overflow = this.settings.overflow;
			}

			this.settings.size = size;

			this.settings.rtlScrollType = (0, _scrolltype2.default)();

			// Save the stage
			this.stage = new _stage2.default({
				width: size.width,
				height: size.height,
				overflow: this.overflow,
				hidden: this.settings.hidden,
				axis: this.settings.axis,
				fullsize: this.settings.fullsize,
				direction: this.settings.direction
			});

			this.stage.attachTo(element);

			// Get this stage container div
			this.container = this.stage.getContainer();

			// Views array methods
			this.views = new _views2.default(this.container);

			// Calculate Stage Size
			this._bounds = this.bounds();
			this._stageSize = this.stage.size();

			// Set the dimensions for views
			this.viewSettings.width = this._stageSize.width;
			this.viewSettings.height = this._stageSize.height;

			// Function to handle a resize event.
			// Will only attach if width and height are both fixed.
			this.stage.onResize(this.onResized.bind(this));

			this.stage.onOrientationChange(this.onOrientationChange.bind(this));

			// Add Event Listeners
			this.addEventListeners();

			// Add Layout method
			// this.applyLayoutMethod();
			if (this.layout) {
				this.updateLayout();
			}

			this.rendered = true;
		}
	}, {
		key: "addEventListeners",
		value: function addEventListeners() {
			var scroller;

			window.addEventListener("unload", function (e) {
				this.destroy();
			}.bind(this));

			if (!this.settings.fullsize) {
				scroller = this.container;
			} else {
				scroller = window;
			}

			this._onScroll = this.onScroll.bind(this);
			scroller.addEventListener("scroll", this._onScroll);
		}
	}, {
		key: "removeEventListeners",
		value: function removeEventListeners() {
			var scroller;

			if (!this.settings.fullsize) {
				scroller = this.container;
			} else {
				scroller = window;
			}

			scroller.removeEventListener("scroll", this._onScroll);
			this._onScroll = undefined;
		}
	}, {
		key: "destroy",
		value: function destroy() {
			clearTimeout(this.orientationTimeout);
			clearTimeout(this.resizeTimeout);
			clearTimeout(this.afterScrolled);

			this.clear();

			this.removeEventListeners();

			this.stage.destroy();

			this.rendered = false;

			/*
   		clearTimeout(this.trimTimeout);
   	if(this.settings.hidden) {
   		this.element.removeChild(this.wrapper);
   	} else {
   		this.element.removeChild(this.container);
   	}
   */
		}
	}, {
		key: "onOrientationChange",
		value: function onOrientationChange(e) {
			var _window = window,
			    orientation = _window.orientation;


			if (this.optsSettings.resizeOnOrientationChange) {
				this.resize();
			}

			// Per ampproject:
			// In IOS 10.3, the measured size of an element is incorrect if the
			// element size depends on window size directly and the measurement
			// happens in window.resize event. Adding a timeout for correct
			// measurement. See https://github.com/ampproject/amphtml/issues/8479
			clearTimeout(this.orientationTimeout);
			this.orientationTimeout = setTimeout(function () {
				this.orientationTimeout = undefined;

				if (this.optsSettings.resizeOnOrientationChange) {
					this.resize();
				}

				this.emit(_constants.EVENTS.MANAGERS.ORIENTATION_CHANGE, orientation);
			}.bind(this), 500);
		}
	}, {
		key: "onResized",
		value: function onResized(e) {
			this.resize();
		}
	}, {
		key: "resize",
		value: function resize(width, height, epubcfi) {
			var stageSize = this.stage.size(width, height);

			// For Safari, wait for orientation to catch up
			// if the window is a square
			this.winBounds = (0, _core.windowBounds)();
			if (this.orientationTimeout && this.winBounds.width === this.winBounds.height) {
				// reset the stage size for next resize
				this._stageSize = undefined;
				return;
			}

			if (this._stageSize && this._stageSize.width === stageSize.width && this._stageSize.height === stageSize.height) {
				// Size is the same, no need to resize
				return;
			}

			this._stageSize = stageSize;

			this._bounds = this.bounds();

			// Clear current views
			this.clear();

			// Update for new views
			this.viewSettings.width = this._stageSize.width;
			this.viewSettings.height = this._stageSize.height;

			this.updateLayout();

			this.emit(_constants.EVENTS.MANAGERS.RESIZED, {
				width: this._stageSize.width,
				height: this._stageSize.height
			}, epubcfi);
		}
	}, {
		key: "createView",
		value: function createView(section, forceRight) {
			return new this.View(section, (0, _core.extend)(this.viewSettings, { forceRight: forceRight }));
		}
	}, {
		key: "handleNextPrePaginated",
		value: function handleNextPrePaginated(forceRight, section, action) {
			var next = void 0;

			if (this.layout.name === "pre-paginated" && this.layout.divisor > 1) {
				if (forceRight || section.index === 0) {
					// First page (cover) should stand alone for pre-paginated books
					return;
				}
				next = section.next();
				if (next && !next.properties.includes("page-spread-left")) {
					return action.call(this, next);
				}
			}
		}
	}, {
		key: "display",
		value: function display(section, target) {

			var displaying = new _core.defer();
			var displayed = displaying.promise;

			// Check if moving to target is needed
			if (target === section.href || (0, _core.isNumber)(target)) {
				target = undefined;
			}

			// Check to make sure the section we want isn't already shown
			var visible = this.views.find(section);

			// View is already shown, just move to correct location in view
			if (visible && section && this.layout.name !== "pre-paginated") {
				var offset = visible.offset();

				if (this.settings.direction === "ltr") {
					this.scrollTo(offset.left, offset.top, true);
				} else {
					var width = visible.width();
					this.scrollTo(offset.left + width, offset.top, true);
				}

				if (target) {
					var _offset = visible.locationOf(target);
					this.moveTo(_offset);
				}

				displaying.resolve();
				return displayed;
			}

			// Hide all current views
			this.clear();

			var forceRight = false;
			if (this.layout.name === "pre-paginated" && this.layout.divisor === 2 && section.properties.includes("page-spread-right")) {
				forceRight = true;
			}

			this.add(section, forceRight).then(function (view) {

				// Move to correct place within the section, if needed
				if (target) {
					var _offset2 = view.locationOf(target);
					this.moveTo(_offset2);
				}
			}.bind(this), function (err) {
				displaying.reject(err);
			}).then(function () {
				return this.handleNextPrePaginated(forceRight, section, this.add);
			}.bind(this)).then(function () {

				this.views.show();

				displaying.resolve();
			}.bind(this));
			// .then(function(){
			// 	return this.hooks.display.trigger(view);
			// }.bind(this))
			// .then(function(){
			// 	this.views.show();
			// }.bind(this));
			return displayed;
		}
	}, {
		key: "afterDisplayed",
		value: function afterDisplayed(view) {
			this.emit(_constants.EVENTS.MANAGERS.ADDED, view);
		}
	}, {
		key: "afterResized",
		value: function afterResized(view) {
			this.emit(_constants.EVENTS.MANAGERS.RESIZE, view.section);
		}
	}, {
		key: "moveTo",
		value: function moveTo(offset) {
			var distX = 0,
			    distY = 0;

			if (!this.isPaginated) {
				distY = offset.top;
			} else {
				distX = Math.floor(offset.left / this.layout.delta) * this.layout.delta;

				if (distX + this.layout.delta > this.container.scrollWidth) {
					distX = this.container.scrollWidth - this.layout.delta;
				}
			}
			this.scrollTo(distX, distY, true);
		}
	}, {
		key: "add",
		value: function add(section, forceRight) {
			var _this = this;

			var view = this.createView(section, forceRight);

			this.views.append(view);

			// view.on(EVENTS.VIEWS.SHOWN, this.afterDisplayed.bind(this));
			view.onDisplayed = this.afterDisplayed.bind(this);
			view.onResize = this.afterResized.bind(this);

			view.on(_constants.EVENTS.VIEWS.AXIS, function (axis) {
				_this.updateAxis(axis);
			});

			return view.display(this.request);
		}
	}, {
		key: "append",
		value: function append(section, forceRight) {
			var _this2 = this;

			var view = this.createView(section, forceRight);
			this.views.append(view);

			view.onDisplayed = this.afterDisplayed.bind(this);
			view.onResize = this.afterResized.bind(this);

			view.on(_constants.EVENTS.VIEWS.AXIS, function (axis) {
				_this2.updateAxis(axis);
			});

			return view.display(this.request);
		}
	}, {
		key: "prepend",
		value: function prepend(section, forceRight) {
			var _this3 = this;

			var view = this.createView(section, forceRight);

			view.on(_constants.EVENTS.VIEWS.RESIZED, function (bounds) {
				_this3.counter(bounds);
			});

			this.views.prepend(view);

			view.onDisplayed = this.afterDisplayed.bind(this);
			view.onResize = this.afterResized.bind(this);

			view.on(_constants.EVENTS.VIEWS.AXIS, function (axis) {
				_this3.updateAxis(axis);
			});

			return view.display(this.request);
		}
	}, {
		key: "counter",
		value: function counter(bounds) {
			if (this.settings.axis === "vertical") {
				this.scrollBy(0, bounds.heightDelta, true);
			} else {
				this.scrollBy(bounds.widthDelta, 0, true);
			}
		}

		// resizeView(view) {
		//
		// 	if(this.settings.globalLayoutProperties.layout === "pre-paginated") {
		// 		view.lock("both", this.bounds.width, this.bounds.height);
		// 	} else {
		// 		view.lock("width", this.bounds.width, this.bounds.height);
		// 	}
		//
		// };

	}, {
		key: "next",
		value: function next() {
			var next;
			var left;

			var dir = this.settings.direction;

			if (!this.views.length) return;

			if (this.isPaginated && this.settings.axis === "horizontal" && (!dir || dir === "ltr")) {

				this.scrollLeft = this.container.scrollLeft;

				left = this.container.scrollLeft + this.container.offsetWidth + this.layout.delta;

				if (left <= this.container.scrollWidth) {
					this.scrollBy(this.layout.delta, 0, true);
				} else {
					next = this.views.last().section.next();
				}
			} else if (this.isPaginated && this.settings.axis === "horizontal" && dir === "rtl") {

				this.scrollLeft = this.container.scrollLeft;

				if (this.settings.rtlScrollType === "default") {
					left = this.container.scrollLeft;

					if (left > 0) {
						this.scrollBy(this.layout.delta, 0, true);
					} else {
						next = this.views.last().section.next();
					}
				} else {
					left = this.container.scrollLeft + this.layout.delta * -1;

					if (left > this.container.scrollWidth * -1) {
						this.scrollBy(this.layout.delta, 0, true);
					} else {
						next = this.views.last().section.next();
					}
				}
			} else if (this.isPaginated && this.settings.axis === "vertical") {

				this.scrollTop = this.container.scrollTop;

				var top = this.container.scrollTop + this.container.offsetHeight;

				if (top < this.container.scrollHeight) {
					this.scrollBy(0, this.layout.height, true);
				} else {
					next = this.views.last().section.next();
				}
			} else {
				next = this.views.last().section.next();
			}

			if (next) {
				this.clear();

				var forceRight = false;
				if (this.layout.name === "pre-paginated" && this.layout.divisor === 2 && next.properties.includes("page-spread-right")) {
					forceRight = true;
				}

				return this.append(next, forceRight).then(function () {
					return this.handleNextPrePaginated(forceRight, next, this.append);
				}.bind(this), function (err) {
					return err;
				}).then(function () {
					this.views.show();
				}.bind(this));
			}
		}
	}, {
		key: "prev",
		value: function prev() {
			var prev;
			var left;
			var dir = this.settings.direction;

			if (!this.views.length) return;

			if (this.isPaginated && this.settings.axis === "horizontal" && (!dir || dir === "ltr")) {

				this.scrollLeft = this.container.scrollLeft;

				left = this.container.scrollLeft;

				if (left > 0) {
					this.scrollBy(-this.layout.delta, 0, true);
				} else {
					prev = this.views.first().section.prev();
				}
			} else if (this.isPaginated && this.settings.axis === "horizontal" && dir === "rtl") {

				this.scrollLeft = this.container.scrollLeft;

				if (this.settings.rtlScrollType === "default") {
					left = this.container.scrollLeft + this.container.offsetWidth;

					if (left < this.container.scrollWidth) {
						this.scrollBy(-this.layout.delta, 0, true);
					} else {
						prev = this.views.first().section.prev();
					}
				} else {
					left = this.container.scrollLeft;

					if (left < 0) {
						this.scrollBy(-this.layout.delta, 0, true);
					} else {
						prev = this.views.first().section.prev();
					}
				}
			} else if (this.isPaginated && this.settings.axis === "vertical") {

				this.scrollTop = this.container.scrollTop;

				var top = this.container.scrollTop;

				if (top > 0) {
					this.scrollBy(0, -this.layout.height, true);
				} else {
					prev = this.views.first().section.prev();
				}
			} else {

				prev = this.views.first().section.prev();
			}

			if (prev) {
				this.clear();

				var forceRight = false;
				if (this.layout.name === "pre-paginated" && this.layout.divisor === 2 && _typeof(prev.prev()) !== "object") {
					forceRight = true;
				}

				return this.prepend(prev, forceRight).then(function () {
					var left;
					if (this.layout.name === "pre-paginated" && this.layout.divisor > 1) {
						left = prev.prev();
						if (left) {
							return this.prepend(left);
						}
					}
				}.bind(this), function (err) {
					return err;
				}).then(function () {
					if (this.isPaginated && this.settings.axis === "horizontal") {
						if (this.settings.direction === "rtl") {
							if (this.settings.rtlScrollType === "default") {
								this.scrollTo(0, 0, true);
							} else {
								this.scrollTo(this.container.scrollWidth * -1 + this.layout.delta, 0, true);
							}
						} else {
							this.scrollTo(this.container.scrollWidth - this.layout.delta, 0, true);
						}
					}
					this.views.show();
				}.bind(this));
			}
		}
	}, {
		key: "current",
		value: function current() {
			var visible = this.visible();
			if (visible.length) {
				// Current is the last visible view
				return visible[visible.length - 1];
			}
			return null;
		}
	}, {
		key: "clear",
		value: function clear() {

			// this.q.clear();

			if (this.views) {
				this.views.hide();
				this.scrollTo(0, 0, true);
				this.views.clear();
			}
		}
	}, {
		key: "currentLocation",
		value: function currentLocation() {

			if (this.settings.axis === "vertical") {
				this.location = this.scrolledLocation();
			} else {
				this.location = this.paginatedLocation();
			}
			return this.location;
		}
	}, {
		key: "scrolledLocation",
		value: function scrolledLocation() {
			var _this4 = this;

			var visible = this.visible();
			var container = this.container.getBoundingClientRect();
			var pageHeight = container.height < window.innerHeight ? container.height : window.innerHeight;

			var offset = 0;
			var used = 0;

			if (this.settings.fullsize) {
				offset = window.scrollY;
			}

			var sections = visible.map(function (view) {
				var _view$section = view.section,
				    index = _view$section.index,
				    href = _view$section.href;

				var position = view.position();
				var height = view.height();

				var startPos = offset + container.top - position.top + used;
				var endPos = startPos + pageHeight - used;
				if (endPos > height) {
					endPos = height;
					used = endPos - startPos;
				}

				var totalPages = _this4.layout.count(height, pageHeight).pages;

				var currPage = Math.ceil(startPos / pageHeight);
				var pages = [];
				var endPage = Math.ceil(endPos / pageHeight);

				pages = [];
				for (var i = currPage; i <= endPage; i++) {
					var pg = i + 1;
					pages.push(pg);
				}

				var mapping = _this4.mapping.page(view.contents, view.section.cfiBase, startPos, endPos);

				return {
					index: index,
					href: href,
					pages: pages,
					totalPages: totalPages,
					mapping: mapping
				};
			});

			return sections;
		}
	}, {
		key: "paginatedLocation",
		value: function paginatedLocation() {
			var _this5 = this;

			var visible = this.visible();
			var container = this.container.getBoundingClientRect();

			var left = 0;
			var used = 0;

			if (this.settings.fullsize) {
				left = window.scrollX;
			}

			var sections = visible.map(function (view) {
				var _view$section2 = view.section,
				    index = _view$section2.index,
				    href = _view$section2.href;

				var offset = view.offset().left;
				var position = view.position().left;
				var width = view.width();

				// Find mapping
				var start = left + container.left - position + offset + used;
				var end = start + _this5.layout.width - used;

				var mapping = _this5.mapping.page(view.contents, view.section.cfiBase, start, end);

				var totalPages = _this5.layout.count(width).pages;
				var startPage = Math.floor(start / _this5.layout.pageWidth);
				var pages = [];
				var endPage = Math.floor(end / _this5.layout.pageWidth);

				// start page should not be negative
				if (startPage < 0) {
					startPage = 0;
					endPage = endPage + 1;
				}

				// Reverse page counts for rtl
				if (_this5.settings.direction === "rtl") {
					var tempStartPage = startPage;
					startPage = totalPages - endPage;
					endPage = totalPages - tempStartPage;
				}

				for (var i = startPage + 1; i <= endPage; i++) {
					var pg = i;
					pages.push(pg);
				}

				return {
					index: index,
					href: href,
					pages: pages,
					totalPages: totalPages,
					mapping: mapping
				};
			});

			return sections;
		}
	}, {
		key: "isVisible",
		value: function isVisible(view, offsetPrev, offsetNext, _container) {
			var position = view.position();
			var container = _container || this.bounds();

			if (this.settings.axis === "horizontal" && position.right > container.left - offsetPrev && position.left < container.right + offsetNext) {

				return true;
			} else if (this.settings.axis === "vertical" && position.bottom > container.top - offsetPrev && position.top < container.bottom + offsetNext) {

				return true;
			}

			return false;
		}
	}, {
		key: "visible",
		value: function visible() {
			var container = this.bounds();
			var views = this.views.displayed();
			var viewsLength = views.length;
			var visible = [];
			var isVisible;
			var view;

			for (var i = 0; i < viewsLength; i++) {
				view = views[i];
				isVisible = this.isVisible(view, 0, 0, container);

				if (isVisible === true) {
					visible.push(view);
				}
			}
			return visible;
		}
	}, {
		key: "scrollBy",
		value: function scrollBy(x, y, silent) {
			var dir = this.settings.direction === "rtl" ? -1 : 1;

			if (silent) {
				this.ignore = true;
			}

			if (!this.settings.fullsize) {
				if (x) this.container.scrollLeft += x * dir;
				if (y) this.container.scrollTop += y;
			} else {
				window.scrollBy(x * dir, y * dir);
			}
			this.scrolled = true;
		}
	}, {
		key: "scrollTo",
		value: function scrollTo(x, y, silent) {
			if (silent) {
				this.ignore = true;
			}

			if (!this.settings.fullsize) {
				this.container.scrollLeft = x;
				this.container.scrollTop = y;
			} else {
				window.scrollTo(x, y);
			}
			this.scrolled = true;
		}
	}, {
		key: "onScroll",
		value: function onScroll() {
			var scrollTop = void 0;
			var scrollLeft = void 0;

			if (!this.settings.fullsize) {
				scrollTop = this.container.scrollTop;
				scrollLeft = this.container.scrollLeft;
			} else {
				scrollTop = window.scrollY;
				scrollLeft = window.scrollX;
			}

			this.scrollTop = scrollTop;
			this.scrollLeft = scrollLeft;

			if (!this.ignore) {
				this.emit(_constants.EVENTS.MANAGERS.SCROLL, {
					top: scrollTop,
					left: scrollLeft
				});

				clearTimeout(this.afterScrolled);
				this.afterScrolled = setTimeout(function () {
					this.emit(_constants.EVENTS.MANAGERS.SCROLLED, {
						top: this.scrollTop,
						left: this.scrollLeft
					});
				}.bind(this), 20);
			} else {
				this.ignore = false;
			}
		}
	}, {
		key: "bounds",
		value: function bounds() {
			var bounds;

			bounds = this.stage.bounds();

			return bounds;
		}
	}, {
		key: "applyLayout",
		value: function applyLayout(layout) {

			this.layout = layout;
			this.updateLayout();
			if (this.views && this.views.length > 0 && this.layout.name === "pre-paginated") {
				this.display(this.views.first().section);
			}
			// this.manager.layout(this.layout.format);
		}
	}, {
		key: "updateLayout",
		value: function updateLayout() {

			if (!this.stage) {
				return;
			}

			this._stageSize = this.stage.size();

			if (!this.isPaginated) {
				this.layout.calculate(this._stageSize.width, this._stageSize.height);
			} else {
				this.layout.calculate(this._stageSize.width, this._stageSize.height, this.settings.gap);

				// Set the look ahead offset for what is visible
				this.settings.offset = this.layout.delta;

				// this.stage.addStyleRules("iframe", [{"margin-right" : this.layout.gap + "px"}]);
			}

			// Set the dimensions for views
			this.viewSettings.width = this.layout.width;
			this.viewSettings.height = this.layout.height;

			this.setLayout(this.layout);
		}
	}, {
		key: "setLayout",
		value: function setLayout(layout) {

			this.viewSettings.layout = layout;

			this.mapping = new _mapping2.default(layout.props, this.settings.direction, this.settings.axis);

			if (this.views) {

				this.views.forEach(function (view) {
					if (view) {
						view.setLayout(layout);
					}
				});
			}
		}
	}, {
		key: "updateAxis",
		value: function updateAxis(axis, forceUpdate) {

			if (!this.isPaginated) {
				axis = "vertical";
			}

			if (!forceUpdate && axis === this.settings.axis) {
				return;
			}

			this.settings.axis = axis;

			this.stage && this.stage.axis(axis);

			this.viewSettings.axis = axis;

			if (this.mapping) {
				this.mapping = new _mapping2.default(this.layout.props, this.settings.direction, this.settings.axis);
			}

			if (this.layout) {
				if (axis === "vertical") {
					this.layout.spread("none");
				} else {
					this.layout.spread(this.layout.settings.spread);
				}
			}
		}
	}, {
		key: "updateFlow",
		value: function updateFlow(flow) {
			var defaultScrolledOverflow = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "auto";

			var isPaginated = flow === "paginated" || flow === "auto";

			this.isPaginated = isPaginated;

			if (flow === "scrolled-doc" || flow === "scrolled-continuous" || flow === "scrolled") {
				this.updateAxis("vertical");
			} else {
				this.updateAxis("horizontal");
			}

			this.viewSettings.flow = flow;

			if (!this.settings.overflow) {
				this.overflow = isPaginated ? "hidden" : defaultScrolledOverflow;
			} else {
				this.overflow = this.settings.overflow;
			}

			this.stage && this.stage.overflow(this.overflow);

			this.updateLayout();
		}
	}, {
		key: "getContents",
		value: function getContents() {
			var contents = [];
			if (!this.views) {
				return contents;
			}
			this.views.forEach(function (view) {
				var viewContents = view && view.contents;
				if (viewContents) {
					contents.push(viewContents);
				}
			});
			return contents;
		}
	}, {
		key: "direction",
		value: function direction() {
			var dir = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "ltr";

			this.settings.direction = dir;

			this.stage && this.stage.direction(dir);

			this.viewSettings.direction = dir;

			this.updateLayout();
		}
	}, {
		key: "isRendered",
		value: function isRendered() {
			return this.rendered;
		}
	}]);

	return DefaultViewManager;
}();

//-- Enable binding events to Manager


(0, _eventEmitter2.default)(DefaultViewManager.prototype);

exports.default = DefaultViewManager;
module.exports = exports["default"];

/***/ }),
/* 16 */
/***/ (function(module, exports) {

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

module.exports = isObject;


/***/ }),
/* 17 */
/***/ (function(module, exports) {

/*
 * DOM Level 2
 * Object DOMException
 * @see http://www.w3.org/TR/REC-DOM-Level-1/ecma-script-language-binding.html
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/ecma-script-binding.html
 */

function copy(src,dest){
	for(var p in src){
		dest[p] = src[p];
	}
}
/**
^\w+\.prototype\.([_\w]+)\s*=\s*((?:.*\{\s*?[\r\n][\s\S]*?^})|\S.*?(?=[;\r\n]));?
^\w+\.prototype\.([_\w]+)\s*=\s*(\S.*?(?=[;\r\n]));?
 */
function _extends(Class,Super){
	var pt = Class.prototype;
	if(Object.create){
		var ppt = Object.create(Super.prototype)
		pt.__proto__ = ppt;
	}
	if(!(pt instanceof Super)){
		function t(){};
		t.prototype = Super.prototype;
		t = new t();
		copy(pt,t);
		Class.prototype = pt = t;
	}
	if(pt.constructor != Class){
		if(typeof Class != 'function'){
			console.error("unknow Class:"+Class)
		}
		pt.constructor = Class
	}
}
var htmlns = 'http://www.w3.org/1999/xhtml' ;
// Node Types
var NodeType = {}
var ELEMENT_NODE                = NodeType.ELEMENT_NODE                = 1;
var ATTRIBUTE_NODE              = NodeType.ATTRIBUTE_NODE              = 2;
var TEXT_NODE                   = NodeType.TEXT_NODE                   = 3;
var CDATA_SECTION_NODE          = NodeType.CDATA_SECTION_NODE          = 4;
var ENTITY_REFERENCE_NODE       = NodeType.ENTITY_REFERENCE_NODE       = 5;
var ENTITY_NODE                 = NodeType.ENTITY_NODE                 = 6;
var PROCESSING_INSTRUCTION_NODE = NodeType.PROCESSING_INSTRUCTION_NODE = 7;
var COMMENT_NODE                = NodeType.COMMENT_NODE                = 8;
var DOCUMENT_NODE               = NodeType.DOCUMENT_NODE               = 9;
var DOCUMENT_TYPE_NODE          = NodeType.DOCUMENT_TYPE_NODE          = 10;
var DOCUMENT_FRAGMENT_NODE      = NodeType.DOCUMENT_FRAGMENT_NODE      = 11;
var NOTATION_NODE               = NodeType.NOTATION_NODE               = 12;

// ExceptionCode
var ExceptionCode = {}
var ExceptionMessage = {};
var INDEX_SIZE_ERR              = ExceptionCode.INDEX_SIZE_ERR              = ((ExceptionMessage[1]="Index size error"),1);
var DOMSTRING_SIZE_ERR          = ExceptionCode.DOMSTRING_SIZE_ERR          = ((ExceptionMessage[2]="DOMString size error"),2);
var HIERARCHY_REQUEST_ERR       = ExceptionCode.HIERARCHY_REQUEST_ERR       = ((ExceptionMessage[3]="Hierarchy request error"),3);
var WRONG_DOCUMENT_ERR          = ExceptionCode.WRONG_DOCUMENT_ERR          = ((ExceptionMessage[4]="Wrong document"),4);
var INVALID_CHARACTER_ERR       = ExceptionCode.INVALID_CHARACTER_ERR       = ((ExceptionMessage[5]="Invalid character"),5);
var NO_DATA_ALLOWED_ERR         = ExceptionCode.NO_DATA_ALLOWED_ERR         = ((ExceptionMessage[6]="No data allowed"),6);
var NO_MODIFICATION_ALLOWED_ERR = ExceptionCode.NO_MODIFICATION_ALLOWED_ERR = ((ExceptionMessage[7]="No modification allowed"),7);
var NOT_FOUND_ERR               = ExceptionCode.NOT_FOUND_ERR               = ((ExceptionMessage[8]="Not found"),8);
var NOT_SUPPORTED_ERR           = ExceptionCode.NOT_SUPPORTED_ERR           = ((ExceptionMessage[9]="Not supported"),9);
var INUSE_ATTRIBUTE_ERR         = ExceptionCode.INUSE_ATTRIBUTE_ERR         = ((ExceptionMessage[10]="Attribute in use"),10);
//level2
var INVALID_STATE_ERR        	= ExceptionCode.INVALID_STATE_ERR        	= ((ExceptionMessage[11]="Invalid state"),11);
var SYNTAX_ERR               	= ExceptionCode.SYNTAX_ERR               	= ((ExceptionMessage[12]="Syntax error"),12);
var INVALID_MODIFICATION_ERR 	= ExceptionCode.INVALID_MODIFICATION_ERR 	= ((ExceptionMessage[13]="Invalid modification"),13);
var NAMESPACE_ERR            	= ExceptionCode.NAMESPACE_ERR           	= ((ExceptionMessage[14]="Invalid namespace"),14);
var INVALID_ACCESS_ERR       	= ExceptionCode.INVALID_ACCESS_ERR      	= ((ExceptionMessage[15]="Invalid access"),15);


function DOMException(code, message) {
	if(message instanceof Error){
		var error = message;
	}else{
		error = this;
		Error.call(this, ExceptionMessage[code]);
		this.message = ExceptionMessage[code];
		if(Error.captureStackTrace) Error.captureStackTrace(this, DOMException);
	}
	error.code = code;
	if(message) this.message = this.message + ": " + message;
	return error;
};
DOMException.prototype = Error.prototype;
copy(ExceptionCode,DOMException)
/**
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-536297177
 * The NodeList interface provides the abstraction of an ordered collection of nodes, without defining or constraining how this collection is implemented. NodeList objects in the DOM are live.
 * The items in the NodeList are accessible via an integral index, starting from 0.
 */
function NodeList() {
};
NodeList.prototype = {
	/**
	 * The number of nodes in the list. The range of valid child node indices is 0 to length-1 inclusive.
	 * @standard level1
	 */
	length:0, 
	/**
	 * Returns the indexth item in the collection. If index is greater than or equal to the number of nodes in the list, this returns null.
	 * @standard level1
	 * @param index  unsigned long 
	 *   Index into the collection.
	 * @return Node
	 * 	The node at the indexth position in the NodeList, or null if that is not a valid index. 
	 */
	item: function(index) {
		return this[index] || null;
	},
	toString:function(isHTML,nodeFilter){
		for(var buf = [], i = 0;i<this.length;i++){
			serializeToString(this[i],buf,isHTML,nodeFilter);
		}
		return buf.join('');
	}
};
function LiveNodeList(node,refresh){
	this._node = node;
	this._refresh = refresh
	_updateLiveList(this);
}
function _updateLiveList(list){
	var inc = list._node._inc || list._node.ownerDocument._inc;
	if(list._inc != inc){
		var ls = list._refresh(list._node);
		//console.log(ls.length)
		__set__(list,'length',ls.length);
		copy(ls,list);
		list._inc = inc;
	}
}
LiveNodeList.prototype.item = function(i){
	_updateLiveList(this);
	return this[i];
}

_extends(LiveNodeList,NodeList);
/**
 * 
 * Objects implementing the NamedNodeMap interface are used to represent collections of nodes that can be accessed by name. Note that NamedNodeMap does not inherit from NodeList; NamedNodeMaps are not maintained in any particular order. Objects contained in an object implementing NamedNodeMap may also be accessed by an ordinal index, but this is simply to allow convenient enumeration of the contents of a NamedNodeMap, and does not imply that the DOM specifies an order to these Nodes.
 * NamedNodeMap objects in the DOM are live.
 * used for attributes or DocumentType entities 
 */
function NamedNodeMap() {
};

function _findNodeIndex(list,node){
	var i = list.length;
	while(i--){
		if(list[i] === node){return i}
	}
}

function _addNamedNode(el,list,newAttr,oldAttr){
	if(oldAttr){
		list[_findNodeIndex(list,oldAttr)] = newAttr;
	}else{
		list[list.length++] = newAttr;
	}
	if(el){
		newAttr.ownerElement = el;
		var doc = el.ownerDocument;
		if(doc){
			oldAttr && _onRemoveAttribute(doc,el,oldAttr);
			_onAddAttribute(doc,el,newAttr);
		}
	}
}
function _removeNamedNode(el,list,attr){
	//console.log('remove attr:'+attr)
	var i = _findNodeIndex(list,attr);
	if(i>=0){
		var lastIndex = list.length-1
		while(i<lastIndex){
			list[i] = list[++i]
		}
		list.length = lastIndex;
		if(el){
			var doc = el.ownerDocument;
			if(doc){
				_onRemoveAttribute(doc,el,attr);
				attr.ownerElement = null;
			}
		}
	}else{
		throw DOMException(NOT_FOUND_ERR,new Error(el.tagName+'@'+attr))
	}
}
NamedNodeMap.prototype = {
	length:0,
	item:NodeList.prototype.item,
	getNamedItem: function(key) {
//		if(key.indexOf(':')>0 || key == 'xmlns'){
//			return null;
//		}
		//console.log()
		var i = this.length;
		while(i--){
			var attr = this[i];
			//console.log(attr.nodeName,key)
			if(attr.nodeName == key){
				return attr;
			}
		}
	},
	setNamedItem: function(attr) {
		var el = attr.ownerElement;
		if(el && el!=this._ownerElement){
			throw new DOMException(INUSE_ATTRIBUTE_ERR);
		}
		var oldAttr = this.getNamedItem(attr.nodeName);
		_addNamedNode(this._ownerElement,this,attr,oldAttr);
		return oldAttr;
	},
	/* returns Node */
	setNamedItemNS: function(attr) {// raises: WRONG_DOCUMENT_ERR,NO_MODIFICATION_ALLOWED_ERR,INUSE_ATTRIBUTE_ERR
		var el = attr.ownerElement, oldAttr;
		if(el && el!=this._ownerElement){
			throw new DOMException(INUSE_ATTRIBUTE_ERR);
		}
		oldAttr = this.getNamedItemNS(attr.namespaceURI,attr.localName);
		_addNamedNode(this._ownerElement,this,attr,oldAttr);
		return oldAttr;
	},

	/* returns Node */
	removeNamedItem: function(key) {
		var attr = this.getNamedItem(key);
		_removeNamedNode(this._ownerElement,this,attr);
		return attr;
		
		
	},// raises: NOT_FOUND_ERR,NO_MODIFICATION_ALLOWED_ERR
	
	//for level2
	removeNamedItemNS:function(namespaceURI,localName){
		var attr = this.getNamedItemNS(namespaceURI,localName);
		_removeNamedNode(this._ownerElement,this,attr);
		return attr;
	},
	getNamedItemNS: function(namespaceURI, localName) {
		var i = this.length;
		while(i--){
			var node = this[i];
			if(node.localName == localName && node.namespaceURI == namespaceURI){
				return node;
			}
		}
		return null;
	}
};
/**
 * @see http://www.w3.org/TR/REC-DOM-Level-1/level-one-core.html#ID-102161490
 */
function DOMImplementation(/* Object */ features) {
	this._features = {};
	if (features) {
		for (var feature in features) {
			 this._features = features[feature];
		}
	}
};

DOMImplementation.prototype = {
	hasFeature: function(/* string */ feature, /* string */ version) {
		var versions = this._features[feature.toLowerCase()];
		if (versions && (!version || version in versions)) {
			return true;
		} else {
			return false;
		}
	},
	// Introduced in DOM Level 2:
	createDocument:function(namespaceURI,  qualifiedName, doctype){// raises:INVALID_CHARACTER_ERR,NAMESPACE_ERR,WRONG_DOCUMENT_ERR
		var doc = new Document();
		doc.implementation = this;
		doc.childNodes = new NodeList();
		doc.doctype = doctype;
		if(doctype){
			doc.appendChild(doctype);
		}
		if(qualifiedName){
			var root = doc.createElementNS(namespaceURI,qualifiedName);
			doc.appendChild(root);
		}
		return doc;
	},
	// Introduced in DOM Level 2:
	createDocumentType:function(qualifiedName, publicId, systemId){// raises:INVALID_CHARACTER_ERR,NAMESPACE_ERR
		var node = new DocumentType();
		node.name = qualifiedName;
		node.nodeName = qualifiedName;
		node.publicId = publicId;
		node.systemId = systemId;
		// Introduced in DOM Level 2:
		//readonly attribute DOMString        internalSubset;
		
		//TODO:..
		//  readonly attribute NamedNodeMap     entities;
		//  readonly attribute NamedNodeMap     notations;
		return node;
	}
};


/**
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-1950641247
 */

function Node() {
};

Node.prototype = {
	firstChild : null,
	lastChild : null,
	previousSibling : null,
	nextSibling : null,
	attributes : null,
	parentNode : null,
	childNodes : null,
	ownerDocument : null,
	nodeValue : null,
	namespaceURI : null,
	prefix : null,
	localName : null,
	// Modified in DOM Level 2:
	insertBefore:function(newChild, refChild){//raises 
		return _insertBefore(this,newChild,refChild);
	},
	replaceChild:function(newChild, oldChild){//raises 
		this.insertBefore(newChild,oldChild);
		if(oldChild){
			this.removeChild(oldChild);
		}
	},
	removeChild:function(oldChild){
		return _removeChild(this,oldChild);
	},
	appendChild:function(newChild){
		return this.insertBefore(newChild,null);
	},
	hasChildNodes:function(){
		return this.firstChild != null;
	},
	cloneNode:function(deep){
		return cloneNode(this.ownerDocument||this,this,deep);
	},
	// Modified in DOM Level 2:
	normalize:function(){
		var child = this.firstChild;
		while(child){
			var next = child.nextSibling;
			if(next && next.nodeType == TEXT_NODE && child.nodeType == TEXT_NODE){
				this.removeChild(next);
				child.appendData(next.data);
			}else{
				child.normalize();
				child = next;
			}
		}
	},
  	// Introduced in DOM Level 2:
	isSupported:function(feature, version){
		return this.ownerDocument.implementation.hasFeature(feature,version);
	},
    // Introduced in DOM Level 2:
    hasAttributes:function(){
    	return this.attributes.length>0;
    },
    lookupPrefix:function(namespaceURI){
    	var el = this;
    	while(el){
    		var map = el._nsMap;
    		//console.dir(map)
    		if(map){
    			for(var n in map){
    				if(map[n] == namespaceURI){
    					return n;
    				}
    			}
    		}
    		el = el.nodeType == ATTRIBUTE_NODE?el.ownerDocument : el.parentNode;
    	}
    	return null;
    },
    // Introduced in DOM Level 3:
    lookupNamespaceURI:function(prefix){
    	var el = this;
    	while(el){
    		var map = el._nsMap;
    		//console.dir(map)
    		if(map){
    			if(prefix in map){
    				return map[prefix] ;
    			}
    		}
    		el = el.nodeType == ATTRIBUTE_NODE?el.ownerDocument : el.parentNode;
    	}
    	return null;
    },
    // Introduced in DOM Level 3:
    isDefaultNamespace:function(namespaceURI){
    	var prefix = this.lookupPrefix(namespaceURI);
    	return prefix == null;
    }
};


function _xmlEncoder(c){
	return c == '<' && '&lt;' ||
         c == '>' && '&gt;' ||
         c == '&' && '&amp;' ||
         c == '"' && '&quot;' ||
         '&#'+c.charCodeAt()+';'
}


copy(NodeType,Node);
copy(NodeType,Node.prototype);

/**
 * @param callback return true for continue,false for break
 * @return boolean true: break visit;
 */
function _visitNode(node,callback){
	if(callback(node)){
		return true;
	}
	if(node = node.firstChild){
		do{
			if(_visitNode(node,callback)){return true}
        }while(node=node.nextSibling)
    }
}



function Document(){
}
function _onAddAttribute(doc,el,newAttr){
	doc && doc._inc++;
	var ns = newAttr.namespaceURI ;
	if(ns == 'http://www.w3.org/2000/xmlns/'){
		//update namespace
		el._nsMap[newAttr.prefix?newAttr.localName:''] = newAttr.value
	}
}
function _onRemoveAttribute(doc,el,newAttr,remove){
	doc && doc._inc++;
	var ns = newAttr.namespaceURI ;
	if(ns == 'http://www.w3.org/2000/xmlns/'){
		//update namespace
		delete el._nsMap[newAttr.prefix?newAttr.localName:'']
	}
}
function _onUpdateChild(doc,el,newChild){
	if(doc && doc._inc){
		doc._inc++;
		//update childNodes
		var cs = el.childNodes;
		if(newChild){
			cs[cs.length++] = newChild;
		}else{
			//console.log(1)
			var child = el.firstChild;
			var i = 0;
			while(child){
				cs[i++] = child;
				child =child.nextSibling;
			}
			cs.length = i;
		}
	}
}

/**
 * attributes;
 * children;
 * 
 * writeable properties:
 * nodeValue,Attr:value,CharacterData:data
 * prefix
 */
function _removeChild(parentNode,child){
	var previous = child.previousSibling;
	var next = child.nextSibling;
	if(previous){
		previous.nextSibling = next;
	}else{
		parentNode.firstChild = next
	}
	if(next){
		next.previousSibling = previous;
	}else{
		parentNode.lastChild = previous;
	}
	_onUpdateChild(parentNode.ownerDocument,parentNode);
	return child;
}
/**
 * preformance key(refChild == null)
 */
function _insertBefore(parentNode,newChild,nextChild){
	var cp = newChild.parentNode;
	if(cp){
		cp.removeChild(newChild);//remove and update
	}
	if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
		var newFirst = newChild.firstChild;
		if (newFirst == null) {
			return newChild;
		}
		var newLast = newChild.lastChild;
	}else{
		newFirst = newLast = newChild;
	}
	var pre = nextChild ? nextChild.previousSibling : parentNode.lastChild;

	newFirst.previousSibling = pre;
	newLast.nextSibling = nextChild;
	
	
	if(pre){
		pre.nextSibling = newFirst;
	}else{
		parentNode.firstChild = newFirst;
	}
	if(nextChild == null){
		parentNode.lastChild = newLast;
	}else{
		nextChild.previousSibling = newLast;
	}
	do{
		newFirst.parentNode = parentNode;
	}while(newFirst !== newLast && (newFirst= newFirst.nextSibling))
	_onUpdateChild(parentNode.ownerDocument||parentNode,parentNode);
	//console.log(parentNode.lastChild.nextSibling == null)
	if (newChild.nodeType == DOCUMENT_FRAGMENT_NODE) {
		newChild.firstChild = newChild.lastChild = null;
	}
	return newChild;
}
function _appendSingleChild(parentNode,newChild){
	var cp = newChild.parentNode;
	if(cp){
		var pre = parentNode.lastChild;
		cp.removeChild(newChild);//remove and update
		var pre = parentNode.lastChild;
	}
	var pre = parentNode.lastChild;
	newChild.parentNode = parentNode;
	newChild.previousSibling = pre;
	newChild.nextSibling = null;
	if(pre){
		pre.nextSibling = newChild;
	}else{
		parentNode.firstChild = newChild;
	}
	parentNode.lastChild = newChild;
	_onUpdateChild(parentNode.ownerDocument,parentNode,newChild);
	return newChild;
	//console.log("__aa",parentNode.lastChild.nextSibling == null)
}
Document.prototype = {
	//implementation : null,
	nodeName :  '#document',
	nodeType :  DOCUMENT_NODE,
	doctype :  null,
	documentElement :  null,
	_inc : 1,
	
	insertBefore :  function(newChild, refChild){//raises 
		if(newChild.nodeType == DOCUMENT_FRAGMENT_NODE){
			var child = newChild.firstChild;
			while(child){
				var next = child.nextSibling;
				this.insertBefore(child,refChild);
				child = next;
			}
			return newChild;
		}
		if(this.documentElement == null && newChild.nodeType == ELEMENT_NODE){
			this.documentElement = newChild;
		}
		
		return _insertBefore(this,newChild,refChild),(newChild.ownerDocument = this),newChild;
	},
	removeChild :  function(oldChild){
		if(this.documentElement == oldChild){
			this.documentElement = null;
		}
		return _removeChild(this,oldChild);
	},
	// Introduced in DOM Level 2:
	importNode : function(importedNode,deep){
		return importNode(this,importedNode,deep);
	},
	// Introduced in DOM Level 2:
	getElementById :	function(id){
		var rtv = null;
		_visitNode(this.documentElement,function(node){
			if(node.nodeType == ELEMENT_NODE){
				if(node.getAttribute('id') == id){
					rtv = node;
					return true;
				}
			}
		})
		return rtv;
	},
	
	//document factory method:
	createElement :	function(tagName){
		var node = new Element();
		node.ownerDocument = this;
		node.nodeName = tagName;
		node.tagName = tagName;
		node.childNodes = new NodeList();
		var attrs	= node.attributes = new NamedNodeMap();
		attrs._ownerElement = node;
		return node;
	},
	createDocumentFragment :	function(){
		var node = new DocumentFragment();
		node.ownerDocument = this;
		node.childNodes = new NodeList();
		return node;
	},
	createTextNode :	function(data){
		var node = new Text();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createComment :	function(data){
		var node = new Comment();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createCDATASection :	function(data){
		var node = new CDATASection();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createProcessingInstruction :	function(target,data){
		var node = new ProcessingInstruction();
		node.ownerDocument = this;
		node.tagName = node.target = target;
		node.nodeValue= node.data = data;
		return node;
	},
	createAttribute :	function(name){
		var node = new Attr();
		node.ownerDocument	= this;
		node.name = name;
		node.nodeName	= name;
		node.localName = name;
		node.specified = true;
		return node;
	},
	createEntityReference :	function(name){
		var node = new EntityReference();
		node.ownerDocument	= this;
		node.nodeName	= name;
		return node;
	},
	// Introduced in DOM Level 2:
	createElementNS :	function(namespaceURI,qualifiedName){
		var node = new Element();
		var pl = qualifiedName.split(':');
		var attrs	= node.attributes = new NamedNodeMap();
		node.childNodes = new NodeList();
		node.ownerDocument = this;
		node.nodeName = qualifiedName;
		node.tagName = qualifiedName;
		node.namespaceURI = namespaceURI;
		if(pl.length == 2){
			node.prefix = pl[0];
			node.localName = pl[1];
		}else{
			//el.prefix = null;
			node.localName = qualifiedName;
		}
		attrs._ownerElement = node;
		return node;
	},
	// Introduced in DOM Level 2:
	createAttributeNS :	function(namespaceURI,qualifiedName){
		var node = new Attr();
		var pl = qualifiedName.split(':');
		node.ownerDocument = this;
		node.nodeName = qualifiedName;
		node.name = qualifiedName;
		node.namespaceURI = namespaceURI;
		node.specified = true;
		if(pl.length == 2){
			node.prefix = pl[0];
			node.localName = pl[1];
		}else{
			//el.prefix = null;
			node.localName = qualifiedName;
		}
		return node;
	}
};
_extends(Document,Node);


function Element() {
	this._nsMap = {};
};
Element.prototype = {
	nodeType : ELEMENT_NODE,
	hasAttribute : function(name){
		return this.getAttributeNode(name)!=null;
	},
	getAttribute : function(name){
		var attr = this.getAttributeNode(name);
		return attr && attr.value || '';
	},
	getAttributeNode : function(name){
		return this.attributes.getNamedItem(name);
	},
	setAttribute : function(name, value){
		var attr = this.ownerDocument.createAttribute(name);
		attr.value = attr.nodeValue = "" + value;
		this.setAttributeNode(attr)
	},
	removeAttribute : function(name){
		var attr = this.getAttributeNode(name)
		attr && this.removeAttributeNode(attr);
	},
	
	//four real opeartion method
	appendChild:function(newChild){
		if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
			return this.insertBefore(newChild,null);
		}else{
			return _appendSingleChild(this,newChild);
		}
	},
	setAttributeNode : function(newAttr){
		return this.attributes.setNamedItem(newAttr);
	},
	setAttributeNodeNS : function(newAttr){
		return this.attributes.setNamedItemNS(newAttr);
	},
	removeAttributeNode : function(oldAttr){
		//console.log(this == oldAttr.ownerElement)
		return this.attributes.removeNamedItem(oldAttr.nodeName);
	},
	//get real attribute name,and remove it by removeAttributeNode
	removeAttributeNS : function(namespaceURI, localName){
		var old = this.getAttributeNodeNS(namespaceURI, localName);
		old && this.removeAttributeNode(old);
	},
	
	hasAttributeNS : function(namespaceURI, localName){
		return this.getAttributeNodeNS(namespaceURI, localName)!=null;
	},
	getAttributeNS : function(namespaceURI, localName){
		var attr = this.getAttributeNodeNS(namespaceURI, localName);
		return attr && attr.value || '';
	},
	setAttributeNS : function(namespaceURI, qualifiedName, value){
		var attr = this.ownerDocument.createAttributeNS(namespaceURI, qualifiedName);
		attr.value = attr.nodeValue = "" + value;
		this.setAttributeNode(attr)
	},
	getAttributeNodeNS : function(namespaceURI, localName){
		return this.attributes.getNamedItemNS(namespaceURI, localName);
	},
	
	getElementsByTagName : function(tagName){
		return new LiveNodeList(this,function(base){
			var ls = [];
			_visitNode(base,function(node){
				if(node !== base && node.nodeType == ELEMENT_NODE && (tagName === '*' || node.tagName == tagName)){
					ls.push(node);
				}
			});
			return ls;
		});
	},
	getElementsByTagNameNS : function(namespaceURI, localName){
		return new LiveNodeList(this,function(base){
			var ls = [];
			_visitNode(base,function(node){
				if(node !== base && node.nodeType === ELEMENT_NODE && (namespaceURI === '*' || node.namespaceURI === namespaceURI) && (localName === '*' || node.localName == localName)){
					ls.push(node);
				}
			});
			return ls;
			
		});
	}
};
Document.prototype.getElementsByTagName = Element.prototype.getElementsByTagName;
Document.prototype.getElementsByTagNameNS = Element.prototype.getElementsByTagNameNS;


_extends(Element,Node);
function Attr() {
};
Attr.prototype.nodeType = ATTRIBUTE_NODE;
_extends(Attr,Node);


function CharacterData() {
};
CharacterData.prototype = {
	data : '',
	substringData : function(offset, count) {
		return this.data.substring(offset, offset+count);
	},
	appendData: function(text) {
		text = this.data+text;
		this.nodeValue = this.data = text;
		this.length = text.length;
	},
	insertData: function(offset,text) {
		this.replaceData(offset,0,text);
	
	},
	appendChild:function(newChild){
		throw new Error(ExceptionMessage[HIERARCHY_REQUEST_ERR])
	},
	deleteData: function(offset, count) {
		this.replaceData(offset,count,"");
	},
	replaceData: function(offset, count, text) {
		var start = this.data.substring(0,offset);
		var end = this.data.substring(offset+count);
		text = start + text + end;
		this.nodeValue = this.data = text;
		this.length = text.length;
	}
}
_extends(CharacterData,Node);
function Text() {
};
Text.prototype = {
	nodeName : "#text",
	nodeType : TEXT_NODE,
	splitText : function(offset) {
		var text = this.data;
		var newText = text.substring(offset);
		text = text.substring(0, offset);
		this.data = this.nodeValue = text;
		this.length = text.length;
		var newNode = this.ownerDocument.createTextNode(newText);
		if(this.parentNode){
			this.parentNode.insertBefore(newNode, this.nextSibling);
		}
		return newNode;
	}
}
_extends(Text,CharacterData);
function Comment() {
};
Comment.prototype = {
	nodeName : "#comment",
	nodeType : COMMENT_NODE
}
_extends(Comment,CharacterData);

function CDATASection() {
};
CDATASection.prototype = {
	nodeName : "#cdata-section",
	nodeType : CDATA_SECTION_NODE
}
_extends(CDATASection,CharacterData);


function DocumentType() {
};
DocumentType.prototype.nodeType = DOCUMENT_TYPE_NODE;
_extends(DocumentType,Node);

function Notation() {
};
Notation.prototype.nodeType = NOTATION_NODE;
_extends(Notation,Node);

function Entity() {
};
Entity.prototype.nodeType = ENTITY_NODE;
_extends(Entity,Node);

function EntityReference() {
};
EntityReference.prototype.nodeType = ENTITY_REFERENCE_NODE;
_extends(EntityReference,Node);

function DocumentFragment() {
};
DocumentFragment.prototype.nodeName =	"#document-fragment";
DocumentFragment.prototype.nodeType =	DOCUMENT_FRAGMENT_NODE;
_extends(DocumentFragment,Node);


function ProcessingInstruction() {
}
ProcessingInstruction.prototype.nodeType = PROCESSING_INSTRUCTION_NODE;
_extends(ProcessingInstruction,Node);
function XMLSerializer(){}
XMLSerializer.prototype.serializeToString = function(node,isHtml,nodeFilter){
	return nodeSerializeToString.call(node,isHtml,nodeFilter);
}
Node.prototype.toString = nodeSerializeToString;
function nodeSerializeToString(isHtml,nodeFilter){
	var buf = [];
	var refNode = this.nodeType == 9?this.documentElement:this;
	var prefix = refNode.prefix;
	var uri = refNode.namespaceURI;
	
	if(uri && prefix == null){
		//console.log(prefix)
		var prefix = refNode.lookupPrefix(uri);
		if(prefix == null){
			//isHTML = true;
			var visibleNamespaces=[
			{namespace:uri,prefix:null}
			//{namespace:uri,prefix:''}
			]
		}
	}
	serializeToString(this,buf,isHtml,nodeFilter,visibleNamespaces);
	//console.log('###',this.nodeType,uri,prefix,buf.join(''))
	return buf.join('');
}
function needNamespaceDefine(node,isHTML, visibleNamespaces) {
	var prefix = node.prefix||'';
	var uri = node.namespaceURI;
	if (!prefix && !uri){
		return false;
	}
	if (prefix === "xml" && uri === "http://www.w3.org/XML/1998/namespace" 
		|| uri == 'http://www.w3.org/2000/xmlns/'){
		return false;
	}
	
	var i = visibleNamespaces.length 
	//console.log('@@@@',node.tagName,prefix,uri,visibleNamespaces)
	while (i--) {
		var ns = visibleNamespaces[i];
		// get namespace prefix
		//console.log(node.nodeType,node.tagName,ns.prefix,prefix)
		if (ns.prefix == prefix){
			return ns.namespace != uri;
		}
	}
	//console.log(isHTML,uri,prefix=='')
	//if(isHTML && prefix ==null && uri == 'http://www.w3.org/1999/xhtml'){
	//	return false;
	//}
	//node.flag = '11111'
	//console.error(3,true,node.flag,node.prefix,node.namespaceURI)
	return true;
}
function serializeToString(node,buf,isHTML,nodeFilter,visibleNamespaces){
	if(nodeFilter){
		node = nodeFilter(node);
		if(node){
			if(typeof node == 'string'){
				buf.push(node);
				return;
			}
		}else{
			return;
		}
		//buf.sort.apply(attrs, attributeSorter);
	}
	switch(node.nodeType){
	case ELEMENT_NODE:
		if (!visibleNamespaces) visibleNamespaces = [];
		var startVisibleNamespaces = visibleNamespaces.length;
		var attrs = node.attributes;
		var len = attrs.length;
		var child = node.firstChild;
		var nodeName = node.tagName;
		
		isHTML =  (htmlns === node.namespaceURI) ||isHTML 
		buf.push('<',nodeName);
		
		
		
		for(var i=0;i<len;i++){
			// add namespaces for attributes
			var attr = attrs.item(i);
			if (attr.prefix == 'xmlns') {
				visibleNamespaces.push({ prefix: attr.localName, namespace: attr.value });
			}else if(attr.nodeName == 'xmlns'){
				visibleNamespaces.push({ prefix: '', namespace: attr.value });
			}
		}
		for(var i=0;i<len;i++){
			var attr = attrs.item(i);
			if (needNamespaceDefine(attr,isHTML, visibleNamespaces)) {
				var prefix = attr.prefix||'';
				var uri = attr.namespaceURI;
				var ns = prefix ? ' xmlns:' + prefix : " xmlns";
				buf.push(ns, '="' , uri , '"');
				visibleNamespaces.push({ prefix: prefix, namespace:uri });
			}
			serializeToString(attr,buf,isHTML,nodeFilter,visibleNamespaces);
		}
		// add namespace for current node		
		if (needNamespaceDefine(node,isHTML, visibleNamespaces)) {
			var prefix = node.prefix||'';
			var uri = node.namespaceURI;
			var ns = prefix ? ' xmlns:' + prefix : " xmlns";
			buf.push(ns, '="' , uri , '"');
			visibleNamespaces.push({ prefix: prefix, namespace:uri });
		}
		
		if(child || isHTML && !/^(?:meta|link|img|br|hr|input)$/i.test(nodeName)){
			buf.push('>');
			//if is cdata child node
			if(isHTML && /^script$/i.test(nodeName)){
				while(child){
					if(child.data){
						buf.push(child.data);
					}else{
						serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
					}
					child = child.nextSibling;
				}
			}else
			{
				while(child){
					serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
					child = child.nextSibling;
				}
			}
			buf.push('</',nodeName,'>');
		}else{
			buf.push('/>');
		}
		// remove added visible namespaces
		//visibleNamespaces.length = startVisibleNamespaces;
		return;
	case DOCUMENT_NODE:
	case DOCUMENT_FRAGMENT_NODE:
		var child = node.firstChild;
		while(child){
			serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
			child = child.nextSibling;
		}
		return;
	case ATTRIBUTE_NODE:
		return buf.push(' ',node.name,'="',node.value.replace(/[<&"]/g,_xmlEncoder),'"');
	case TEXT_NODE:
		return buf.push(node.data.replace(/[<&]/g,_xmlEncoder));
	case CDATA_SECTION_NODE:
		return buf.push( '<![CDATA[',node.data,']]>');
	case COMMENT_NODE:
		return buf.push( "<!--",node.data,"-->");
	case DOCUMENT_TYPE_NODE:
		var pubid = node.publicId;
		var sysid = node.systemId;
		buf.push('<!DOCTYPE ',node.name);
		if(pubid){
			buf.push(' PUBLIC "',pubid);
			if (sysid && sysid!='.') {
				buf.push( '" "',sysid);
			}
			buf.push('">');
		}else if(sysid && sysid!='.'){
			buf.push(' SYSTEM "',sysid,'">');
		}else{
			var sub = node.internalSubset;
			if(sub){
				buf.push(" [",sub,"]");
			}
			buf.push(">");
		}
		return;
	case PROCESSING_INSTRUCTION_NODE:
		return buf.push( "<?",node.target," ",node.data,"?>");
	case ENTITY_REFERENCE_NODE:
		return buf.push( '&',node.nodeName,';');
	//case ENTITY_NODE:
	//case NOTATION_NODE:
	default:
		buf.push('??',node.nodeName);
	}
}
function importNode(doc,node,deep){
	var node2;
	switch (node.nodeType) {
	case ELEMENT_NODE:
		node2 = node.cloneNode(false);
		node2.ownerDocument = doc;
		//var attrs = node2.attributes;
		//var len = attrs.length;
		//for(var i=0;i<len;i++){
			//node2.setAttributeNodeNS(importNode(doc,attrs.item(i),deep));
		//}
	case DOCUMENT_FRAGMENT_NODE:
		break;
	case ATTRIBUTE_NODE:
		deep = true;
		break;
	//case ENTITY_REFERENCE_NODE:
	//case PROCESSING_INSTRUCTION_NODE:
	////case TEXT_NODE:
	//case CDATA_SECTION_NODE:
	//case COMMENT_NODE:
	//	deep = false;
	//	break;
	//case DOCUMENT_NODE:
	//case DOCUMENT_TYPE_NODE:
	//cannot be imported.
	//case ENTITY_NODE:
	//case NOTATION_NODE：
	//can not hit in level3
	//default:throw e;
	}
	if(!node2){
		node2 = node.cloneNode(false);//false
	}
	node2.ownerDocument = doc;
	node2.parentNode = null;
	if(deep){
		var child = node.firstChild;
		while(child){
			node2.appendChild(importNode(doc,child,deep));
			child = child.nextSibling;
		}
	}
	return node2;
}
//
//var _relationMap = {firstChild:1,lastChild:1,previousSibling:1,nextSibling:1,
//					attributes:1,childNodes:1,parentNode:1,documentElement:1,doctype,};
function cloneNode(doc,node,deep){
	var node2 = new node.constructor();
	for(var n in node){
		var v = node[n];
		if(typeof v != 'object' ){
			if(v != node2[n]){
				node2[n] = v;
			}
		}
	}
	if(node.childNodes){
		node2.childNodes = new NodeList();
	}
	node2.ownerDocument = doc;
	switch (node2.nodeType) {
	case ELEMENT_NODE:
		var attrs	= node.attributes;
		var attrs2	= node2.attributes = new NamedNodeMap();
		var len = attrs.length
		attrs2._ownerElement = node2;
		for(var i=0;i<len;i++){
			node2.setAttributeNode(cloneNode(doc,attrs.item(i),true));
		}
		break;;
	case ATTRIBUTE_NODE:
		deep = true;
	}
	if(deep){
		var child = node.firstChild;
		while(child){
			node2.appendChild(cloneNode(doc,child,deep));
			child = child.nextSibling;
		}
	}
	return node2;
}

function __set__(object,key,value){
	object[key] = value
}
//do dynamic
try{
	if(Object.defineProperty){
		Object.defineProperty(LiveNodeList.prototype,'length',{
			get:function(){
				_updateLiveList(this);
				return this.$$length;
			}
		});
		Object.defineProperty(Node.prototype,'textContent',{
			get:function(){
				return getTextContent(this);
			},
			set:function(data){
				switch(this.nodeType){
				case ELEMENT_NODE:
				case DOCUMENT_FRAGMENT_NODE:
					while(this.firstChild){
						this.removeChild(this.firstChild);
					}
					if(data || String(data)){
						this.appendChild(this.ownerDocument.createTextNode(data));
					}
					break;
				default:
					//TODO:
					this.data = data;
					this.value = data;
					this.nodeValue = data;
				}
			}
		})
		
		function getTextContent(node){
			switch(node.nodeType){
			case ELEMENT_NODE:
			case DOCUMENT_FRAGMENT_NODE:
				var buf = [];
				node = node.firstChild;
				while(node){
					if(node.nodeType!==7 && node.nodeType !==8){
						buf.push(getTextContent(node));
					}
					node = node.nextSibling;
				}
				return buf.join('');
			default:
				return node.nodeValue;
			}
		}
		__set__ = function(object,key,value){
			//console.log(value)
			object['$$'+key] = value
		}
	}
}catch(e){//ie8
}

//if(typeof require == 'function'){
	exports.DOMImplementation = DOMImplementation;
	exports.XMLSerializer = XMLSerializer;
//}


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
// import Mapping from "./mapping";


// Default Views


// Default View Managers


var _eventEmitter = __webpack_require__(3);

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

var _core = __webpack_require__(0);

var _hook = __webpack_require__(11);

var _hook2 = _interopRequireDefault(_hook);

var _epubcfi = __webpack_require__(1);

var _epubcfi2 = _interopRequireDefault(_epubcfi);

var _queue = __webpack_require__(12);

var _queue2 = _interopRequireDefault(_queue);

var _layout = __webpack_require__(53);

var _layout2 = _interopRequireDefault(_layout);

var _themes = __webpack_require__(54);

var _themes2 = _interopRequireDefault(_themes);

var _contents = __webpack_require__(14);

var _contents2 = _interopRequireDefault(_contents);

var _annotations = __webpack_require__(55);

var _annotations2 = _interopRequireDefault(_annotations);

var _constants = __webpack_require__(2);

var _iframe = __webpack_require__(20);

var _iframe2 = _interopRequireDefault(_iframe);

var _index = __webpack_require__(15);

var _index2 = _interopRequireDefault(_index);

var _index3 = __webpack_require__(24);

var _index4 = _interopRequireDefault(_index3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Displays an Epub as a series of Views for each Section.
 * Requires Manager and View class to handle specifics of rendering
 * the section content.
 * @class
 * @param {Book} book
 * @param {object} [options]
 * @param {number} [options.width]
 * @param {number} [options.height]
 * @param {string} [options.ignoreClass] class for the cfi parser to ignore
 * @param {string | function | object} [options.manager='default']
 * @param {string | function} [options.view='iframe']
 * @param {string} [options.layout] layout to force
 * @param {string} [options.spread] force spread value
 * @param {number} [options.minSpreadWidth] overridden by spread: none (never) / both (always)
 * @param {string} [options.stylesheet] url of stylesheet to be injected
 * @param {boolean} [options.resizeOnOrientationChange] false to disable orientation events
 * @param {string} [options.script] url of script to be injected
 * @param {boolean | object} [options.snap=false] use snap scrolling
 */
var Rendition = function () {
	function Rendition(book, options) {
		_classCallCheck(this, Rendition);

		this.settings = (0, _core.extend)(this.settings || {}, {
			width: null,
			height: null,
			ignoreClass: "",
			manager: "default",
			view: "iframe",
			flow: null,
			layout: null,
			spread: null,
			minSpreadWidth: 800,
			stylesheet: null,
			resizeOnOrientationChange: true,
			script: null,
			snap: false,
			defaultDirection: "ltr"
		});

		(0, _core.extend)(this.settings, options);

		if (_typeof(this.settings.manager) === "object") {
			this.manager = this.settings.manager;
		}

		this.book = book;

		/**
   * Adds Hook methods to the Rendition prototype
   * @member {object} hooks
   * @property {Hook} hooks.content
   * @memberof Rendition
   */
		this.hooks = {};
		this.hooks.display = new _hook2.default(this);
		this.hooks.serialize = new _hook2.default(this);
		this.hooks.content = new _hook2.default(this);
		this.hooks.unloaded = new _hook2.default(this);
		this.hooks.layout = new _hook2.default(this);
		this.hooks.render = new _hook2.default(this);
		this.hooks.show = new _hook2.default(this);

		this.hooks.content.register(this.handleLinks.bind(this));
		this.hooks.content.register(this.passEvents.bind(this));
		this.hooks.content.register(this.adjustImages.bind(this));

		this.book.spine.hooks.content.register(this.injectIdentifier.bind(this));

		if (this.settings.stylesheet) {
			this.book.spine.hooks.content.register(this.injectStylesheet.bind(this));
		}

		if (this.settings.script) {
			this.book.spine.hooks.content.register(this.injectScript.bind(this));
		}

		/**
   * @member {Themes} themes
   * @memberof Rendition
   */
		this.themes = new _themes2.default(this);

		/**
   * @member {Annotations} annotations
   * @memberof Rendition
   */
		this.annotations = new _annotations2.default(this);

		this.epubcfi = new _epubcfi2.default();

		this.q = new _queue2.default(this);

		/**
   * A Rendered Location Range
   * @typedef location
   * @type {Object}
   * @property {object} start
   * @property {string} start.index
   * @property {string} start.href
   * @property {object} start.displayed
   * @property {EpubCFI} start.cfi
   * @property {number} start.location
   * @property {number} start.percentage
   * @property {number} start.displayed.page
   * @property {number} start.displayed.total
   * @property {object} end
   * @property {string} end.index
   * @property {string} end.href
   * @property {object} end.displayed
   * @property {EpubCFI} end.cfi
   * @property {number} end.location
   * @property {number} end.percentage
   * @property {number} end.displayed.page
   * @property {number} end.displayed.total
   * @property {boolean} atStart
   * @property {boolean} atEnd
   * @memberof Rendition
   */
		this.location = undefined;

		// Hold queue until book is opened
		this.q.enqueue(this.book.opened);

		this.starting = new _core.defer();
		/**
   * @member {promise} started returns after the rendition has started
   * @memberof Rendition
   */
		this.started = this.starting.promise;
		// Block the queue until rendering is started
		this.q.enqueue(this.start);
	}

	/**
  * Set the manager function
  * @param {function} manager
  */


	_createClass(Rendition, [{
		key: "setManager",
		value: function setManager(manager) {
			this.manager = manager;
		}

		/**
   * Require the manager from passed string, or as a class function
   * @param  {string|object} manager [description]
   * @return {method}
   */

	}, {
		key: "requireManager",
		value: function requireManager(manager) {
			var viewManager;

			// If manager is a string, try to load from imported managers
			if (typeof manager === "string" && manager === "default") {
				viewManager = _index2.default;
			} else if (typeof manager === "string" && manager === "continuous") {
				viewManager = _index4.default;
			} else {
				// otherwise, assume we were passed a class function
				viewManager = manager;
			}

			return viewManager;
		}

		/**
   * Require the view from passed string, or as a class function
   * @param  {string|object} view
   * @return {view}
   */

	}, {
		key: "requireView",
		value: function requireView(view) {
			var View;

			// If view is a string, try to load from imported views,
			if (typeof view == "string" && view === "iframe") {
				View = _iframe2.default;
			} else {
				// otherwise, assume we were passed a class function
				View = view;
			}

			return View;
		}

		/**
   * Start the rendering
   * @return {Promise} rendering has started
   */

	}, {
		key: "start",
		value: function start() {
			if (!this.settings.layout && (this.book.package.metadata.layout === "pre-paginated" || this.book.displayOptions.fixedLayout === "true")) {
				this.settings.layout = "pre-paginated";
			}
			switch (this.book.package.metadata.spread) {
				case 'none':
					this.settings.spread = 'none';
					break;
				case 'both':
					this.settings.spread = true;
					break;
			}

			if (!this.manager) {
				this.ViewManager = this.requireManager(this.settings.manager);
				this.View = this.requireView(this.settings.view);

				this.manager = new this.ViewManager({
					view: this.View,
					queue: this.q,
					request: this.book.load.bind(this.book),
					settings: this.settings
				});
			}

			this.direction(this.book.package.metadata.direction || this.settings.defaultDirection);

			// Parse metadata to get layout props
			this.settings.globalLayoutProperties = this.determineLayoutProperties(this.book.package.metadata);

			this.flow(this.settings.globalLayoutProperties.flow);

			this.layout(this.settings.globalLayoutProperties);

			// Listen for displayed views
			this.manager.on(_constants.EVENTS.MANAGERS.ADDED, this.afterDisplayed.bind(this));
			this.manager.on(_constants.EVENTS.MANAGERS.REMOVED, this.afterRemoved.bind(this));

			// Listen for resizing
			this.manager.on(_constants.EVENTS.MANAGERS.RESIZED, this.onResized.bind(this));

			// Listen for rotation
			this.manager.on(_constants.EVENTS.MANAGERS.ORIENTATION_CHANGE, this.onOrientationChange.bind(this));

			// Listen for scroll changes
			this.manager.on(_constants.EVENTS.MANAGERS.SCROLLED, this.reportLocation.bind(this));

			/**
    * Emit that rendering has started
    * @event started
    * @memberof Rendition
    */
			this.emit(_constants.EVENTS.RENDITION.STARTED);

			// Start processing queue
			this.starting.resolve();
		}

		/**
   * Call to attach the container to an element in the dom
   * Container must be attached before rendering can begin
   * @param  {element} element to attach to
   * @return {Promise}
   */

	}, {
		key: "attachTo",
		value: function attachTo(element) {

			return this.q.enqueue(function () {

				// Start rendering
				this.manager.render(element, {
					"width": this.settings.width,
					"height": this.settings.height
				});

				/**
     * Emit that rendering has attached to an element
     * @event attached
     * @memberof Rendition
     */
				this.emit(_constants.EVENTS.RENDITION.ATTACHED);
			}.bind(this));
		}

		/**
   * Display a point in the book
   * The request will be added to the rendering Queue,
   * so it will wait until book is opened, rendering started
   * and all other rendering tasks have finished to be called.
   * @param  {string} target Url or EpubCFI
   * @return {Promise}
   */

	}, {
		key: "display",
		value: function display(target) {
			if (this.displaying) {
				this.displaying.resolve();
			}
			return this.q.enqueue(this._display, target);
		}

		/**
   * Tells the manager what to display immediately
   * @private
   * @param  {string} target Url or EpubCFI
   * @return {Promise}
   */

	}, {
		key: "_display",
		value: function _display(target) {
			var _this = this;

			if (!this.book) {
				return;
			}
			var isCfiString = this.epubcfi.isCfiString(target);
			var displaying = new _core.defer();
			var displayed = displaying.promise;
			var section;
			var moveTo;

			this.displaying = displaying;

			// Check if this is a book percentage
			if (this.book.locations.length() && (0, _core.isFloat)(target)) {
				target = this.book.locations.cfiFromPercentage(parseFloat(target));
			}

			section = this.book.spine.get(target);

			if (!section) {
				displaying.reject(new Error("No Section Found"));
				return displayed;
			}

			this.manager.display(section, target).then(function () {
				displaying.resolve(section);
				_this.displaying = undefined;

				/**
     * Emit that a section has been displayed
     * @event displayed
     * @param {Section} section
     * @memberof Rendition
     */
				_this.emit(_constants.EVENTS.RENDITION.DISPLAYED, section);
				_this.reportLocation();
			}, function (err) {
				/**
     * Emit that has been an error displaying
     * @event displayError
     * @param {Section} section
     * @memberof Rendition
     */
				_this.emit(_constants.EVENTS.RENDITION.DISPLAY_ERROR, err);
			});

			return displayed;
		}

		/*
  render(view, show) {
  		// view.onLayout = this.layout.format.bind(this.layout);
  	view.create();
  		// Fit to size of the container, apply padding
  	this.manager.resizeView(view);
  		// Render Chain
  	return view.section.render(this.book.request)
  		.then(function(contents){
  			return view.load(contents);
  		}.bind(this))
  		.then(function(doc){
  			return this.hooks.content.trigger(view, this);
  		}.bind(this))
  		.then(function(){
  			this.layout.format(view.contents);
  			return this.hooks.layout.trigger(view, this);
  		}.bind(this))
  		.then(function(){
  			return view.display();
  		}.bind(this))
  		.then(function(){
  			return this.hooks.render.trigger(view, this);
  		}.bind(this))
  		.then(function(){
  			if(show !== false) {
  				this.q.enqueue(function(view){
  					view.show();
  				}, view);
  			}
  			// this.map = new Map(view, this.layout);
  			this.hooks.show.trigger(view, this);
  			this.trigger("rendered", view.section);
  			}.bind(this))
  		.catch(function(e){
  			this.trigger("loaderror", e);
  		}.bind(this));
  	}
  */

		/**
   * Report what section has been displayed
   * @private
   * @param  {*} view
   */

	}, {
		key: "afterDisplayed",
		value: function afterDisplayed(view) {
			var _this2 = this;

			view.on(_constants.EVENTS.VIEWS.MARK_CLICKED, function (cfiRange, data) {
				return _this2.triggerMarkEvent(cfiRange, data, view.contents);
			});

			this.hooks.render.trigger(view, this).then(function () {
				if (view.contents) {
					_this2.hooks.content.trigger(view.contents, _this2).then(function () {
						/**
       * Emit that a section has been rendered
       * @event rendered
       * @param {Section} section
       * @param {View} view
       * @memberof Rendition
       */
						_this2.emit(_constants.EVENTS.RENDITION.RENDERED, view.section, view);
					});
				} else {
					_this2.emit(_constants.EVENTS.RENDITION.RENDERED, view.section, view);
				}
			});
		}

		/**
   * Report what has been removed
   * @private
   * @param  {*} view
   */

	}, {
		key: "afterRemoved",
		value: function afterRemoved(view) {
			var _this3 = this;

			this.hooks.unloaded.trigger(view, this).then(function () {
				/**
     * Emit that a section has been removed
     * @event removed
     * @param {Section} section
     * @param {View} view
     * @memberof Rendition
     */
				_this3.emit(_constants.EVENTS.RENDITION.REMOVED, view.section, view);
			});
		}

		/**
   * Report resize events and display the last seen location
   * @private
   */

	}, {
		key: "onResized",
		value: function onResized(size, epubcfi) {

			/**
    * Emit that the rendition has been resized
    * @event resized
    * @param {number} width
    * @param {height} height
    * @param {string} epubcfi (optional)
    * @memberof Rendition
    */
			this.emit(_constants.EVENTS.RENDITION.RESIZED, {
				width: size.width,
				height: size.height
			}, epubcfi);

			if (this.location && this.location.start) {
				this.display(epubcfi || this.location.start.cfi);
			}
		}

		/**
   * Report orientation events and display the last seen location
   * @private
   */

	}, {
		key: "onOrientationChange",
		value: function onOrientationChange(orientation) {
			/**
    * Emit that the rendition has been rotated
    * @event orientationchange
    * @param {string} orientation
    * @memberof Rendition
    */
			this.emit(_constants.EVENTS.RENDITION.ORIENTATION_CHANGE, orientation);
		}

		/**
   * Move the Rendition to a specific offset
   * Usually you would be better off calling display()
   * @param {object} offset
   */

	}, {
		key: "moveTo",
		value: function moveTo(offset) {
			this.manager.moveTo(offset);
		}

		/**
   * Trigger a resize of the views
   * @param {number} [width]
   * @param {number} [height]
   * @param {string} [epubcfi] (optional)
   */

	}, {
		key: "resize",
		value: function resize(width, height, epubcfi) {
			if (width) {
				this.settings.width = width;
			}
			if (height) {
				this.settings.height = height;
			}
			this.manager.resize(width, height, epubcfi);
		}

		/**
   * Clear all rendered views
   */

	}, {
		key: "clear",
		value: function clear() {
			this.manager.clear();
		}

		/**
   * Go to the next "page" in the rendition
   * @return {Promise}
   */

	}, {
		key: "next",
		value: function next() {
			return this.q.enqueue(this.manager.next.bind(this.manager)).then(this.reportLocation.bind(this));
		}

		/**
   * Go to the previous "page" in the rendition
   * @return {Promise}
   */

	}, {
		key: "prev",
		value: function prev() {
			return this.q.enqueue(this.manager.prev.bind(this.manager)).then(this.reportLocation.bind(this));
		}

		//-- http://www.idpf.org/epub/301/spec/epub-publications.html#meta-properties-rendering
		/**
   * Determine the Layout properties from metadata and settings
   * @private
   * @param  {object} metadata
   * @return {object} properties
   */

	}, {
		key: "determineLayoutProperties",
		value: function determineLayoutProperties(metadata) {
			var properties;
			var layout = this.settings.layout || metadata.layout || "reflowable";
			var spread = this.settings.spread || metadata.spread || "auto";
			var orientation = this.settings.orientation || metadata.orientation || "auto";
			var flow = this.settings.flow || metadata.flow || "auto";
			var viewport = metadata.viewport || "";
			var minSpreadWidth = this.settings.minSpreadWidth || metadata.minSpreadWidth || 800;
			var direction = this.settings.direction || metadata.direction || "ltr";

			if ((this.settings.width === 0 || this.settings.width > 0) && (this.settings.height === 0 || this.settings.height > 0)) {
				// viewport = "width="+this.settings.width+", height="+this.settings.height+"";
			}

			properties = {
				layout: layout,
				spread: spread,
				orientation: orientation,
				flow: flow,
				viewport: viewport,
				minSpreadWidth: minSpreadWidth,
				direction: direction
			};

			return properties;
		}

		/**
   * Adjust the flow of the rendition to paginated or scrolled
   * (scrolled-continuous vs scrolled-doc are handled by different view managers)
   * @param  {string} flow
   */

	}, {
		key: "flow",
		value: function flow(_flow2) {
			var _flow = _flow2;
			if (_flow2 === "scrolled" || _flow2 === "scrolled-doc" || _flow2 === "scrolled-continuous") {
				_flow = "scrolled";
			}

			if (_flow2 === "auto" || _flow2 === "paginated") {
				_flow = "paginated";
			}

			this.settings.flow = _flow2;

			if (this._layout) {
				this._layout.flow(_flow);
			}

			if (this.manager && this._layout) {
				this.manager.applyLayout(this._layout);
			}

			if (this.manager) {
				this.manager.updateFlow(_flow);
			}

			if (this.manager && this.manager.isRendered() && this.location) {
				this.manager.clear();
				this.display(this.location.start.cfi);
			}
		}

		/**
   * Adjust the layout of the rendition to reflowable or pre-paginated
   * @param  {object} settings
   */

	}, {
		key: "layout",
		value: function layout(settings) {
			var _this4 = this;

			if (settings) {
				this._layout = new _layout2.default(settings);
				this._layout.spread(settings.spread, this.settings.minSpreadWidth);

				// this.mapping = new Mapping(this._layout.props);

				this._layout.on(_constants.EVENTS.LAYOUT.UPDATED, function (props, changed) {
					_this4.emit(_constants.EVENTS.RENDITION.LAYOUT, props, changed);
				});
			}

			if (this.manager && this._layout) {
				this.manager.applyLayout(this._layout);
			}

			return this._layout;
		}

		/**
   * Adjust if the rendition uses spreads
   * @param  {string} spread none | auto (TODO: implement landscape, portrait, both)
   * @param  {int} [min] min width to use spreads at
   */

	}, {
		key: "spread",
		value: function spread(_spread, min) {

			this.settings.spread = _spread;

			if (min) {
				this.settings.minSpreadWidth = min;
			}

			if (this._layout) {
				this._layout.spread(_spread, min);
			}

			if (this.manager && this.manager.isRendered()) {
				this.manager.updateLayout();
			}
		}

		/**
   * Adjust the direction of the rendition
   * @param  {string} dir
   */

	}, {
		key: "direction",
		value: function direction(dir) {

			this.settings.direction = dir || "ltr";

			if (this.manager) {
				this.manager.direction(this.settings.direction);
			}

			if (this.manager && this.manager.isRendered() && this.location) {
				this.manager.clear();
				this.display(this.location.start.cfi);
			}
		}

		/**
   * Report the current location
   * @fires relocated
   * @fires locationChanged
   */

	}, {
		key: "reportLocation",
		value: function reportLocation() {
			return this.q.enqueue(function reportedLocation() {
				requestAnimationFrame(function reportedLocationAfterRAF() {
					var location = this.manager.currentLocation();
					if (location && location.then && typeof location.then === "function") {
						location.then(function (result) {
							var located = this.located(result);

							if (!located || !located.start || !located.end) {
								return;
							}

							this.location = located;

							this.emit(_constants.EVENTS.RENDITION.LOCATION_CHANGED, {
								index: this.location.start.index,
								href: this.location.start.href,
								start: this.location.start.cfi,
								end: this.location.end.cfi,
								percentage: this.location.start.percentage
							});

							this.emit(_constants.EVENTS.RENDITION.RELOCATED, this.location);
						}.bind(this));
					} else if (location) {
						var located = this.located(location);

						if (!located || !located.start || !located.end) {
							return;
						}

						this.location = located;

						/**
       * @event locationChanged
       * @deprecated
       * @type {object}
       * @property {number} index
       * @property {string} href
       * @property {EpubCFI} start
       * @property {EpubCFI} end
       * @property {number} percentage
       * @memberof Rendition
       */
						this.emit(_constants.EVENTS.RENDITION.LOCATION_CHANGED, {
							index: this.location.start.index,
							href: this.location.start.href,
							start: this.location.start.cfi,
							end: this.location.end.cfi,
							percentage: this.location.start.percentage
						});

						/**
       * @event relocated
       * @type {displayedLocation}
       * @memberof Rendition
       */
						this.emit(_constants.EVENTS.RENDITION.RELOCATED, this.location);
					}
				}.bind(this));
			}.bind(this));
		}

		/**
   * Get the Current Location object
   * @return {displayedLocation | promise} location (may be a promise)
   */

	}, {
		key: "currentLocation",
		value: function currentLocation() {
			var location = this.manager.currentLocation();
			if (location && location.then && typeof location.then === "function") {
				location.then(function (result) {
					var located = this.located(result);
					return located;
				}.bind(this));
			} else if (location) {
				var located = this.located(location);
				return located;
			}
		}

		/**
   * Creates a Rendition#locationRange from location
   * passed by the Manager
   * @returns {displayedLocation}
   * @private
   */

	}, {
		key: "located",
		value: function located(location) {
			if (!location.length) {
				return {};
			}
			var start = location[0];
			var end = location[location.length - 1];

			var located = {
				start: {
					index: start.index,
					href: start.href,
					cfi: start.mapping.start,
					displayed: {
						page: start.pages[0] || 1,
						total: start.totalPages
					}
				},
				end: {
					index: end.index,
					href: end.href,
					cfi: end.mapping.end,
					displayed: {
						page: end.pages[end.pages.length - 1] || 1,
						total: end.totalPages
					}
				}
			};

			var locationStart = this.book.locations.locationFromCfi(start.mapping.start);
			var locationEnd = this.book.locations.locationFromCfi(end.mapping.end);

			if (locationStart != null) {
				located.start.location = locationStart;
				located.start.percentage = this.book.locations.percentageFromLocation(locationStart);
			}
			if (locationEnd != null) {
				located.end.location = locationEnd;
				located.end.percentage = this.book.locations.percentageFromLocation(locationEnd);
			}

			var pageStart = this.book.pageList.pageFromCfi(start.mapping.start);
			var pageEnd = this.book.pageList.pageFromCfi(end.mapping.end);

			if (pageStart != -1) {
				located.start.page = pageStart;
			}
			if (pageEnd != -1) {
				located.end.page = pageEnd;
			}

			if (end.index === this.book.spine.last().index && located.end.displayed.page >= located.end.displayed.total) {
				located.atEnd = true;
			}

			if (start.index === this.book.spine.first().index && located.start.displayed.page === 1) {
				located.atStart = true;
			}

			return located;
		}

		/**
   * Remove and Clean Up the Rendition
   */

	}, {
		key: "destroy",
		value: function destroy() {
			// Clear the queue
			// this.q.clear();
			// this.q = undefined;

			this.manager && this.manager.destroy();

			this.book = undefined;

			// this.views = null;

			// this.hooks.display.clear();
			// this.hooks.serialize.clear();
			// this.hooks.content.clear();
			// this.hooks.layout.clear();
			// this.hooks.render.clear();
			// this.hooks.show.clear();
			// this.hooks = {};

			// this.themes.destroy();
			// this.themes = undefined;

			// this.epubcfi = undefined;

			// this.starting = undefined;
			// this.started = undefined;

		}

		/**
   * Pass the events from a view's Contents
   * @private
   * @param  {Contents} view contents
   */

	}, {
		key: "passEvents",
		value: function passEvents(contents) {
			var _this5 = this;

			_constants.DOM_EVENTS.forEach(function (e) {
				contents.on(e, function (ev) {
					return _this5.triggerViewEvent(ev, contents);
				});
			});

			contents.on(_constants.EVENTS.CONTENTS.SELECTED, function (e) {
				return _this5.triggerSelectedEvent(e, contents);
			});
		}

		/**
   * Emit events passed by a view
   * @private
   * @param  {event} e
   */

	}, {
		key: "triggerViewEvent",
		value: function triggerViewEvent(e, contents) {
			this.emit(e.type, e, contents);
		}

		/**
   * Emit a selection event's CFI Range passed from a a view
   * @private
   * @param  {EpubCFI} cfirange
   */

	}, {
		key: "triggerSelectedEvent",
		value: function triggerSelectedEvent(cfirange, contents) {
			/**
    * Emit that a text selection has occured
    * @event selected
    * @param {EpubCFI} cfirange
    * @param {Contents} contents
    * @memberof Rendition
    */
			this.emit(_constants.EVENTS.RENDITION.SELECTED, cfirange, contents);
		}

		/**
   * Emit a markClicked event with the cfiRange and data from a mark
   * @private
   * @param  {EpubCFI} cfirange
   */

	}, {
		key: "triggerMarkEvent",
		value: function triggerMarkEvent(cfiRange, data, contents) {
			/**
    * Emit that a mark was clicked
    * @event markClicked
    * @param {EpubCFI} cfirange
    * @param {object} data
    * @param {Contents} contents
    * @memberof Rendition
    */
			this.emit(_constants.EVENTS.RENDITION.MARK_CLICKED, cfiRange, data, contents);
		}

		/**
   * Get a Range from a Visible CFI
   * @param  {string} cfi EpubCfi String
   * @param  {string} ignoreClass
   * @return {range}
   */

	}, {
		key: "getRange",
		value: function getRange(cfi, ignoreClass) {
			var _cfi = new _epubcfi2.default(cfi);
			var found = this.manager.visible().filter(function (view) {
				if (_cfi.spinePos === view.index) return true;
			});

			// Should only every return 1 item
			if (found.length) {
				return found[0].contents.range(_cfi, ignoreClass);
			}
		}

		/**
   * Hook to adjust images to fit in columns
   * @param  {Contents} contents
   * @private
   */

	}, {
		key: "adjustImages",
		value: function adjustImages(contents) {

			if (this._layout.name === "pre-paginated") {
				return new Promise(function (resolve) {
					resolve();
				});
			}

			var computed = contents.window.getComputedStyle(contents.content, null);
			var height = (contents.content.offsetHeight - (parseFloat(computed.paddingTop) + parseFloat(computed.paddingBottom))) * .95;
			var horizontalPadding = parseFloat(computed.paddingLeft) + parseFloat(computed.paddingRight);

			contents.addStylesheetRules({
				"img": {
					"max-width": (this._layout.columnWidth ? this._layout.columnWidth - horizontalPadding + "px" : "100%") + "!important",
					"max-height": height + "px" + "!important",
					"object-fit": "contain",
					"page-break-inside": "avoid",
					"break-inside": "avoid",
					"box-sizing": "border-box"
				},
				"svg": {
					"max-width": (this._layout.columnWidth ? this._layout.columnWidth - horizontalPadding + "px" : "100%") + "!important",
					"max-height": height + "px" + "!important",
					"page-break-inside": "avoid",
					"break-inside": "avoid"
				}
			});

			return new Promise(function (resolve, reject) {
				// Wait to apply
				setTimeout(function () {
					resolve();
				}, 1);
			});
		}

		/**
   * Get the Contents object of each rendered view
   * @returns {Contents[]}
   */

	}, {
		key: "getContents",
		value: function getContents() {
			return this.manager ? this.manager.getContents() : [];
		}

		/**
   * Get the views member from the manager
   * @returns {Views}
   */

	}, {
		key: "views",
		value: function views() {
			var views = this.manager ? this.manager.views : undefined;
			return views || [];
		}

		/**
   * Hook to handle link clicks in rendered content
   * @param  {Contents} contents
   * @private
   */

	}, {
		key: "handleLinks",
		value: function handleLinks(contents) {
			var _this6 = this;

			if (contents) {
				contents.on(_constants.EVENTS.CONTENTS.LINK_CLICKED, function (href) {
					var relative = _this6.book.path.relative(href);
					_this6.display(relative);
				});
			}
		}

		/**
   * Hook to handle injecting stylesheet before
   * a Section is serialized
   * @param  {document} doc
   * @param  {Section} section
   * @private
   */

	}, {
		key: "injectStylesheet",
		value: function injectStylesheet(doc, section) {
			var style = doc.createElement("link");
			style.setAttribute("type", "text/css");
			style.setAttribute("rel", "stylesheet");
			style.setAttribute("href", this.settings.stylesheet);
			doc.getElementsByTagName("head")[0].appendChild(style);
		}

		/**
   * Hook to handle injecting scripts before
   * a Section is serialized
   * @param  {document} doc
   * @param  {Section} section
   * @private
   */

	}, {
		key: "injectScript",
		value: function injectScript(doc, section) {
			var script = doc.createElement("script");
			script.setAttribute("type", "text/javascript");
			script.setAttribute("src", this.settings.script);
			script.textContent = " "; // Needed to prevent self closing tag
			doc.getElementsByTagName("head")[0].appendChild(script);
		}

		/**
   * Hook to handle the document identifier before
   * a Section is serialized
   * @param  {document} doc
   * @param  {Section} section
   * @private
   */

	}, {
		key: "injectIdentifier",
		value: function injectIdentifier(doc, section) {
			var ident = this.book.packaging.metadata.identifier;
			var meta = doc.createElement("meta");
			meta.setAttribute("name", "dc.relation.ispartof");
			if (ident) {
				meta.setAttribute("content", ident);
			}
			doc.getElementsByTagName("head")[0].appendChild(meta);
		}
	}]);

	return Rendition;
}();

//-- Enable binding events to Renderer


(0, _eventEmitter2.default)(Rendition.prototype);

exports.default = Rendition;
module.exports = exports["default"];

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _epubcfi = __webpack_require__(1);

var _epubcfi2 = _interopRequireDefault(_epubcfi);

var _core = __webpack_require__(0);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Map text locations to CFI ranges
 * @class
 * @param {Layout} layout Layout to apply
 * @param {string} [direction="ltr"] Text direction
 * @param {string} [axis="horizontal"] vertical or horizontal axis
 * @param {boolean} [dev] toggle developer highlighting
 */
var Mapping = function () {
	function Mapping(layout, direction, axis, dev) {
		_classCallCheck(this, Mapping);

		this.layout = layout;
		this.horizontal = axis === "horizontal" ? true : false;
		this.direction = direction || "ltr";
		this._dev = dev;
	}

	/**
  * Find CFI pairs for entire section at once
  */


	_createClass(Mapping, [{
		key: "section",
		value: function section(view) {
			var ranges = this.findRanges(view);
			var map = this.rangeListToCfiList(view.section.cfiBase, ranges);

			return map;
		}

		/**
   * Find CFI pairs for a page
   * @param {Contents} contents Contents from view
   * @param {string} cfiBase string of the base for a cfi
   * @param {number} start position to start at
   * @param {number} end position to end at
   */

	}, {
		key: "page",
		value: function page(contents, cfiBase, start, end) {
			var root = contents && contents.document ? contents.document.body : false;
			var result;

			if (!root) {
				return;
			}

			result = this.rangePairToCfiPair(cfiBase, {
				start: this.findStart(root, start, end),
				end: this.findEnd(root, start, end)
			});

			if (this._dev === true) {
				var doc = contents.document;
				var startRange = new _epubcfi2.default(result.start).toRange(doc);
				var endRange = new _epubcfi2.default(result.end).toRange(doc);

				var selection = doc.defaultView.getSelection();
				var r = doc.createRange();
				selection.removeAllRanges();
				r.setStart(startRange.startContainer, startRange.startOffset);
				r.setEnd(endRange.endContainer, endRange.endOffset);
				selection.addRange(r);
			}

			return result;
		}

		/**
   * Walk a node, preforming a function on each node it finds
   * @private
   * @param {Node} root Node to walkToNode
   * @param {function} func walk function
   * @return {*} returns the result of the walk function
   */

	}, {
		key: "walk",
		value: function walk(root, func) {
			// IE11 has strange issue, if root is text node IE throws exception on
			// calling treeWalker.nextNode(), saying
			// Unexpected call to method or property access instead of returing null value
			if (root && root.nodeType === Node.TEXT_NODE) {
				return;
			}
			// safeFilter is required so that it can work in IE as filter is a function for IE
			// and for other browser filter is an object.
			var filter = {
				acceptNode: function acceptNode(node) {
					if (node.data.trim().length > 0) {
						return NodeFilter.FILTER_ACCEPT;
					} else {
						return NodeFilter.FILTER_REJECT;
					}
				}
			};
			var safeFilter = filter.acceptNode;
			safeFilter.acceptNode = filter.acceptNode;

			var treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, safeFilter, false);
			var node;
			var result;
			while (node = treeWalker.nextNode()) {
				result = func(node);
				if (result) break;
			}

			return result;
		}
	}, {
		key: "findRanges",
		value: function findRanges(view) {
			var columns = [];
			var scrollWidth = view.contents.scrollWidth();
			var spreads = Math.ceil(scrollWidth / this.layout.spreadWidth);
			var count = spreads * this.layout.divisor;
			var columnWidth = this.layout.columnWidth;
			var gap = this.layout.gap;
			var start, end;

			for (var i = 0; i < count.pages; i++) {
				start = (columnWidth + gap) * i;
				end = columnWidth * (i + 1) + gap * i;
				columns.push({
					start: this.findStart(view.document.body, start, end),
					end: this.findEnd(view.document.body, start, end)
				});
			}

			return columns;
		}

		/**
   * Find Start Range
   * @private
   * @param {Node} root root node
   * @param {number} start position to start at
   * @param {number} end position to end at
   * @return {Range}
   */

	}, {
		key: "findStart",
		value: function findStart(root, start, end) {
			var _this = this;

			var stack = [root];
			var $el;
			var found;
			var $prev = root;

			while (stack.length) {

				$el = stack.shift();

				found = this.walk($el, function (node) {
					var left, right, top, bottom;
					var elPos;
					var elRange;

					elPos = (0, _core.nodeBounds)(node);

					if (_this.horizontal && _this.direction === "ltr") {

						left = _this.horizontal ? elPos.left : elPos.top;
						right = _this.horizontal ? elPos.right : elPos.bottom;

						if (left >= start && left <= end) {
							return node;
						} else if (right > start) {
							return node;
						} else {
							$prev = node;
							stack.push(node);
						}
					} else if (_this.horizontal && _this.direction === "rtl") {

						left = elPos.left;
						right = elPos.right;

						if (right <= end && right >= start) {
							return node;
						} else if (left < end) {
							return node;
						} else {
							$prev = node;
							stack.push(node);
						}
					} else {

						top = elPos.top;
						bottom = elPos.bottom;

						if (top >= start && top <= end) {
							return node;
						} else if (bottom > start) {
							return node;
						} else {
							$prev = node;
							stack.push(node);
						}
					}
				});

				if (found) {
					return this.findTextStartRange(found, start, end);
				}
			}

			// Return last element
			return this.findTextStartRange($prev, start, end);
		}

		/**
   * Find End Range
   * @private
   * @param {Node} root root node
   * @param {number} start position to start at
   * @param {number} end position to end at
   * @return {Range}
   */

	}, {
		key: "findEnd",
		value: function findEnd(root, start, end) {
			var _this2 = this;

			var stack = [root];
			var $el;
			var $prev = root;
			var found;

			while (stack.length) {

				$el = stack.shift();

				found = this.walk($el, function (node) {

					var left, right, top, bottom;
					var elPos;
					var elRange;

					elPos = (0, _core.nodeBounds)(node);

					if (_this2.horizontal && _this2.direction === "ltr") {

						left = Math.round(elPos.left);
						right = Math.round(elPos.right);

						if (left > end && $prev) {
							return $prev;
						} else if (right > end) {
							return node;
						} else {
							$prev = node;
							stack.push(node);
						}
					} else if (_this2.horizontal && _this2.direction === "rtl") {

						left = Math.round(_this2.horizontal ? elPos.left : elPos.top);
						right = Math.round(_this2.horizontal ? elPos.right : elPos.bottom);

						if (right < start && $prev) {
							return $prev;
						} else if (left < start) {
							return node;
						} else {
							$prev = node;
							stack.push(node);
						}
					} else {

						top = Math.round(elPos.top);
						bottom = Math.round(elPos.bottom);

						if (top > end && $prev) {
							return $prev;
						} else if (bottom > end) {
							return node;
						} else {
							$prev = node;
							stack.push(node);
						}
					}
				});

				if (found) {
					return this.findTextEndRange(found, start, end);
				}
			}

			// end of chapter
			return this.findTextEndRange($prev, start, end);
		}

		/**
   * Find Text Start Range
   * @private
   * @param {Node} root root node
   * @param {number} start position to start at
   * @param {number} end position to end at
   * @return {Range}
   */

	}, {
		key: "findTextStartRange",
		value: function findTextStartRange(node, start, end) {
			var ranges = this.splitTextNodeIntoRanges(node);
			var range;
			var pos;
			var left, top, right;

			for (var i = 0; i < ranges.length; i++) {
				range = ranges[i];

				pos = range.getBoundingClientRect();

				if (this.horizontal && this.direction === "ltr") {

					left = pos.left;
					if (left >= start) {
						return range;
					}
				} else if (this.horizontal && this.direction === "rtl") {

					right = pos.right;
					if (right <= end) {
						return range;
					}
				} else {

					top = pos.top;
					if (top >= start) {
						return range;
					}
				}

				// prev = range;
			}

			return ranges[0];
		}

		/**
   * Find Text End Range
   * @private
   * @param {Node} root root node
   * @param {number} start position to start at
   * @param {number} end position to end at
   * @return {Range}
   */

	}, {
		key: "findTextEndRange",
		value: function findTextEndRange(node, start, end) {
			var ranges = this.splitTextNodeIntoRanges(node);
			var prev;
			var range;
			var pos;
			var left, right, top, bottom;

			for (var i = 0; i < ranges.length; i++) {
				range = ranges[i];

				pos = range.getBoundingClientRect();

				if (this.horizontal && this.direction === "ltr") {

					left = pos.left;
					right = pos.right;

					if (left > end && prev) {
						return prev;
					} else if (right > end) {
						return range;
					}
				} else if (this.horizontal && this.direction === "rtl") {

					left = pos.left;
					right = pos.right;

					if (right < start && prev) {
						return prev;
					} else if (left < start) {
						return range;
					}
				} else {

					top = pos.top;
					bottom = pos.bottom;

					if (top > end && prev) {
						return prev;
					} else if (bottom > end) {
						return range;
					}
				}

				prev = range;
			}

			// Ends before limit
			return ranges[ranges.length - 1];
		}

		/**
   * Split up a text node into ranges for each word
   * @private
   * @param {Node} root root node
   * @param {string} [_splitter] what to split on
   * @return {Range[]}
   */

	}, {
		key: "splitTextNodeIntoRanges",
		value: function splitTextNodeIntoRanges(node, _splitter) {
			var ranges = [];
			var textContent = node.textContent || "";
			var text = textContent.trim();
			var range;
			var doc = node.ownerDocument;
			var splitter = _splitter || " ";

			var pos = text.indexOf(splitter);

			if (pos === -1 || node.nodeType != Node.TEXT_NODE) {
				range = doc.createRange();
				range.selectNodeContents(node);
				return [range];
			}

			range = doc.createRange();
			range.setStart(node, 0);
			range.setEnd(node, pos);
			ranges.push(range);
			range = false;

			while (pos != -1) {

				pos = text.indexOf(splitter, pos + 1);
				if (pos > 0) {

					if (range) {
						range.setEnd(node, pos);
						ranges.push(range);
					}

					range = doc.createRange();
					range.setStart(node, pos + 1);
				}
			}

			if (range) {
				range.setEnd(node, text.length);
				ranges.push(range);
			}

			return ranges;
		}

		/**
   * Turn a pair of ranges into a pair of CFIs
   * @private
   * @param {string} cfiBase base string for an EpubCFI
   * @param {object} rangePair { start: Range, end: Range }
   * @return {object} { start: "epubcfi(...)", end: "epubcfi(...)" }
   */

	}, {
		key: "rangePairToCfiPair",
		value: function rangePairToCfiPair(cfiBase, rangePair) {

			var startRange = rangePair.start;
			var endRange = rangePair.end;

			startRange.collapse(true);
			endRange.collapse(false);

			var startCfi = new _epubcfi2.default(startRange, cfiBase).toString();
			var endCfi = new _epubcfi2.default(endRange, cfiBase).toString();

			return {
				start: startCfi,
				end: endCfi
			};
		}
	}, {
		key: "rangeListToCfiList",
		value: function rangeListToCfiList(cfiBase, columns) {
			var map = [];
			var cifPair;

			for (var i = 0; i < columns.length; i++) {
				cifPair = this.rangePairToCfiPair(cfiBase, columns[i]);

				map.push(cifPair);
			}

			return map;
		}

		/**
   * Set the axis for mapping
   * @param {string} axis horizontal | vertical
   * @return {boolean} is it horizontal?
   */

	}, {
		key: "axis",
		value: function axis(_axis) {
			if (_axis) {
				this.horizontal = _axis === "horizontal" ? true : false;
			}
			return this.horizontal;
		}
	}]);

	return Mapping;
}();

exports.default = Mapping;
module.exports = exports["default"];

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventEmitter = __webpack_require__(3);

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

var _core = __webpack_require__(0);

var _epubcfi = __webpack_require__(1);

var _epubcfi2 = _interopRequireDefault(_epubcfi);

var _contents = __webpack_require__(14);

var _contents2 = _interopRequireDefault(_contents);

var _constants = __webpack_require__(2);

var _marksPane = __webpack_require__(56);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var IframeView = function () {
	function IframeView(section, options) {
		_classCallCheck(this, IframeView);

		this.settings = (0, _core.extend)({
			ignoreClass: "",
			axis: options.layout && options.layout.props.flow === "scrolled" ? "vertical" : "horizontal",
			direction: undefined,
			width: 0,
			height: 0,
			layout: undefined,
			globalLayoutProperties: {},
			method: undefined,
			forceRight: false
		}, options || {});

		this.id = "epubjs-view-" + (0, _core.uuid)();
		this.section = section;
		this.index = section.index;

		this.element = this.container(this.settings.axis);

		this.added = false;
		this.displayed = false;
		this.rendered = false;

		// this.width  = this.settings.width;
		// this.height = this.settings.height;

		this.fixedWidth = 0;
		this.fixedHeight = 0;

		// Blank Cfi for Parsing
		this.epubcfi = new _epubcfi2.default();

		this.layout = this.settings.layout;
		// Dom events to listen for
		// this.listenedEvents = ["keydown", "keyup", "keypressed", "mouseup", "mousedown", "click", "touchend", "touchstart"];

		this.pane = undefined;
		this.highlights = {};
		this.underlines = {};
		this.marks = {};
	}

	_createClass(IframeView, [{
		key: "container",
		value: function container(axis) {
			var element = document.createElement("div");

			element.classList.add("epub-view");

			// this.element.style.minHeight = "100px";
			element.style.height = "0px";
			element.style.width = "0px";
			element.style.overflow = "hidden";
			element.style.position = "relative";
			element.style.display = "block";

			if (axis && axis == "horizontal") {
				element.style.flex = "none";
			} else {
				element.style.flex = "initial";
			}

			return element;
		}
	}, {
		key: "create",
		value: function create() {

			if (this.iframe) {
				return this.iframe;
			}

			if (!this.element) {
				this.element = this.createContainer();
			}

			this.iframe = document.createElement("iframe");
			this.iframe.id = this.id;
			this.iframe.scrolling = "no"; // Might need to be removed: breaks ios width calculations
			this.iframe.style.overflow = "hidden";
			this.iframe.seamless = "seamless";
			// Back up if seamless isn't supported
			this.iframe.style.border = "none";

			this.iframe.setAttribute("enable-annotation", "true");

			this.resizing = true;

			// this.iframe.style.display = "none";
			this.element.style.visibility = "hidden";
			this.iframe.style.visibility = "hidden";

			this.iframe.style.width = "0";
			this.iframe.style.height = "0";
			this._width = 0;
			this._height = 0;

			this.element.setAttribute("ref", this.index);

			this.added = true;

			this.elementBounds = (0, _core.bounds)(this.element);

			// if(width || height){
			//   this.resize(width, height);
			// } else if(this.width && this.height){
			//   this.resize(this.width, this.height);
			// } else {
			//   this.iframeBounds = bounds(this.iframe);
			// }


			if ("srcdoc" in this.iframe) {
				this.supportsSrcdoc = true;
			} else {
				this.supportsSrcdoc = false;
			}

			if (!this.settings.method) {
				this.settings.method = this.supportsSrcdoc ? "srcdoc" : "write";
			}

			return this.iframe;
		}
	}, {
		key: "render",
		value: function render(request, show) {

			// view.onLayout = this.layout.format.bind(this.layout);
			this.create();

			// Fit to size of the container, apply padding
			this.size();

			if (!this.sectionRender) {
				this.sectionRender = this.section.render(request);
			}

			// Render Chain
			return this.sectionRender.then(function (contents) {
				return this.load(contents);
			}.bind(this)).then(function () {
				var _this = this;

				// apply the layout function to the contents
				this.layout.format(this.contents, this.section);

				// find and report the writingMode axis
				var writingMode = this.contents.writingMode();
				var axis = writingMode.indexOf("vertical") === 0 ? "vertical" : "horizontal";

				this.setAxis(axis);
				this.emit(_constants.EVENTS.VIEWS.AXIS, axis);

				// Listen for events that require an expansion of the iframe
				this.addListeners();

				return new Promise(function (resolve, reject) {
					// Expand the iframe to the full size of the content
					_this.expand();
					//
					if (_this.settings.forceRight) {
						_this.element.style.marginLeft = _this.width() + "px";
					}
					resolve();
				});
			}.bind(this), function (e) {
				this.emit(_constants.EVENTS.VIEWS.LOAD_ERROR, e);
				return new Promise(function (resolve, reject) {
					reject(e);
				});
			}.bind(this)).then(function () {
				this.emit(_constants.EVENTS.VIEWS.RENDERED, this.section);
			}.bind(this));
		}
	}, {
		key: "reset",
		value: function reset() {
			if (this.iframe) {
				this.iframe.style.width = "0";
				this.iframe.style.height = "0";
				this._width = 0;
				this._height = 0;
				this._textWidth = undefined;
				this._contentWidth = undefined;
				this._textHeight = undefined;
				this._contentHeight = undefined;
			}
			this._needsReframe = true;
		}

		// Determine locks base on settings

	}, {
		key: "size",
		value: function size(_width, _height) {
			var width = _width || this.settings.width;
			var height = _height || this.settings.height;

			if (this.layout.name === "pre-paginated") {
				this.lock("both", width, height);
			} else if (this.settings.axis === "horizontal") {
				this.lock("height", width, height);
			} else {
				this.lock("width", width, height);
			}

			this.settings.width = width;
			this.settings.height = height;
		}

		// Lock an axis to element dimensions, taking borders into account

	}, {
		key: "lock",
		value: function lock(what, width, height) {
			var elBorders = (0, _core.borders)(this.element);
			var iframeBorders;

			if (this.iframe) {
				iframeBorders = (0, _core.borders)(this.iframe);
			} else {
				iframeBorders = { width: 0, height: 0 };
			}

			if (what == "width" && (0, _core.isNumber)(width)) {
				this.lockedWidth = width - elBorders.width - iframeBorders.width;
				// this.resize(this.lockedWidth, width); //  width keeps ratio correct
			}

			if (what == "height" && (0, _core.isNumber)(height)) {
				this.lockedHeight = height - elBorders.height - iframeBorders.height;
				// this.resize(width, this.lockedHeight);
			}

			if (what === "both" && (0, _core.isNumber)(width) && (0, _core.isNumber)(height)) {

				this.lockedWidth = width - elBorders.width - iframeBorders.width;
				this.lockedHeight = height - elBorders.height - iframeBorders.height;
				// this.resize(this.lockedWidth, this.lockedHeight);
			}

			if (this.displayed && this.iframe) {

				// this.contents.layout();
				this.expand();
			}
		}

		// Resize a single axis based on content dimensions

	}, {
		key: "expand",
		value: function expand(force) {
			var width = this.lockedWidth;
			var height = this.lockedHeight;
			var columns;

			var textWidth, textHeight;

			if (!this.iframe || this._expanding) return;

			this._expanding = true;

			if (this.layout.name === "pre-paginated") {
				width = this.layout.columnWidth;
				height = this.layout.height;
			}
			// Expand Horizontally
			else if (this.settings.axis === "horizontal") {
					// Get the width of the text
					width = this.contents.textWidth();

					if (width % this.layout.pageWidth > 0) {
						width = Math.ceil(width / this.layout.pageWidth) * this.layout.pageWidth;
					}

					if (this.settings.forceEvenPages) {
						columns = width / this.layout.pageWidth;
						if (this.layout.divisor > 1 && this.layout.name === "reflowable" && columns % 2 > 0) {
							// add a blank page
							width += this.layout.pageWidth;
						}
					}
				} // Expand Vertically
				else if (this.settings.axis === "vertical") {
						height = this.contents.textHeight();
					}

			// Only Resize if dimensions have changed or
			// if Frame is still hidden, so needs reframing
			if (this._needsReframe || width != this._width || height != this._height) {
				this.reframe(width, height);
			}

			this._expanding = false;
		}
	}, {
		key: "reframe",
		value: function reframe(width, height) {
			var _this2 = this;

			var size;

			if ((0, _core.isNumber)(width)) {
				this.element.style.width = width + "px";
				this.iframe.style.width = width + "px";
				this._width = width;
			}

			if ((0, _core.isNumber)(height)) {
				this.element.style.height = height + "px";
				this.iframe.style.height = height + "px";
				this._height = height;
			}

			var widthDelta = this.prevBounds ? width - this.prevBounds.width : width;
			var heightDelta = this.prevBounds ? height - this.prevBounds.height : height;

			size = {
				width: width,
				height: height,
				widthDelta: widthDelta,
				heightDelta: heightDelta
			};

			this.pane && this.pane.render();

			requestAnimationFrame(function () {
				var mark = void 0;
				for (var m in _this2.marks) {
					if (_this2.marks.hasOwnProperty(m)) {
						mark = _this2.marks[m];
						_this2.placeMark(mark.element, mark.range);
					}
				}
			});

			this.onResize(this, size);

			this.emit(_constants.EVENTS.VIEWS.RESIZED, size);

			this.prevBounds = size;

			this.elementBounds = (0, _core.bounds)(this.element);
		}
	}, {
		key: "load",
		value: function load(contents) {
			var loading = new _core.defer();
			var loaded = loading.promise;

			if (!this.iframe) {
				loading.reject(new Error("No Iframe Available"));
				return loaded;
			}

			this.iframe.onload = function (event) {

				this.onLoad(event, loading);
			}.bind(this);

			if (this.settings.method === "blobUrl") {
				this.blobUrl = (0, _core.createBlobUrl)(contents, "application/xhtml+xml");
				this.iframe.src = this.blobUrl;
				this.element.appendChild(this.iframe);
			} else if (this.settings.method === "srcdoc") {
				this.iframe.srcdoc = contents;
				this.element.appendChild(this.iframe);
			} else {

				this.element.appendChild(this.iframe);

				this.document = this.iframe.contentDocument;

				if (!this.document) {
					loading.reject(new Error("No Document Available"));
					return loaded;
				}

				this.iframe.contentDocument.open();
				// For Cordova windows platform
				if (window.MSApp && MSApp.execUnsafeLocalFunction) {
					var outerThis = this;
					MSApp.execUnsafeLocalFunction(function () {
						outerThis.iframe.contentDocument.write(contents);
					});
				} else {
					this.iframe.contentDocument.write(contents);
				}
				this.iframe.contentDocument.close();
			}

			return loaded;
		}
	}, {
		key: "onLoad",
		value: function onLoad(event, promise) {
			var _this3 = this;

			this.window = this.iframe.contentWindow;
			this.document = this.iframe.contentDocument;

			this.contents = new _contents2.default(this.document, this.document.body, this.section.cfiBase, this.section.index);

			this.rendering = false;

			var link = this.document.querySelector("link[rel='canonical']");
			if (link) {
				link.setAttribute("href", this.section.canonical);
			} else {
				link = this.document.createElement("link");
				link.setAttribute("rel", "canonical");
				link.setAttribute("href", this.section.canonical);
				this.document.querySelector("head").appendChild(link);
			}

			this.contents.on(_constants.EVENTS.CONTENTS.EXPAND, function () {
				if (_this3.displayed && _this3.iframe) {
					_this3.expand();
					if (_this3.contents) {
						_this3.layout.format(_this3.contents);
					}
				}
			});

			this.contents.on(_constants.EVENTS.CONTENTS.RESIZE, function (e) {
				if (_this3.displayed && _this3.iframe) {
					_this3.expand();
					if (_this3.contents) {
						_this3.layout.format(_this3.contents);
					}
				}
			});

			promise.resolve(this.contents);
		}
	}, {
		key: "setLayout",
		value: function setLayout(layout) {
			this.layout = layout;

			if (this.contents) {
				this.layout.format(this.contents);
				this.expand();
			}
		}
	}, {
		key: "setAxis",
		value: function setAxis(axis) {

			// Force vertical for scrolled
			if (this.layout.props.flow === "scrolled") {
				axis = "vertical";
			}

			this.settings.axis = axis;

			if (axis == "horizontal") {
				this.element.style.flex = "none";
			} else {
				this.element.style.flex = "initial";
			}

			this.size();
		}
	}, {
		key: "addListeners",
		value: function addListeners() {
			//TODO: Add content listeners for expanding
		}
	}, {
		key: "removeListeners",
		value: function removeListeners(layoutFunc) {
			//TODO: remove content listeners for expanding
		}
	}, {
		key: "display",
		value: function display(request) {
			var displayed = new _core.defer();

			if (!this.displayed) {

				this.render(request).then(function () {

					this.emit(_constants.EVENTS.VIEWS.DISPLAYED, this);
					this.onDisplayed(this);

					this.displayed = true;
					displayed.resolve(this);
				}.bind(this), function (err) {
					displayed.reject(err, this);
				});
			} else {
				displayed.resolve(this);
			}

			return displayed.promise;
		}
	}, {
		key: "show",
		value: function show() {

			this.element.style.visibility = "visible";

			if (this.iframe) {
				this.iframe.style.visibility = "visible";

				// Remind Safari to redraw the iframe
				this.iframe.style.transform = "translateZ(0)";
				this.iframe.offsetWidth;
				this.iframe.style.transform = null;
			}

			this.emit(_constants.EVENTS.VIEWS.SHOWN, this);
		}
	}, {
		key: "hide",
		value: function hide() {
			// this.iframe.style.display = "none";
			this.element.style.visibility = "hidden";
			this.iframe.style.visibility = "hidden";

			this.stopExpanding = true;
			this.emit(_constants.EVENTS.VIEWS.HIDDEN, this);
		}
	}, {
		key: "offset",
		value: function offset() {
			return {
				top: this.element.offsetTop,
				left: this.element.offsetLeft
			};
		}
	}, {
		key: "width",
		value: function width() {
			return this._width;
		}
	}, {
		key: "height",
		value: function height() {
			return this._height;
		}
	}, {
		key: "position",
		value: function position() {
			return this.element.getBoundingClientRect();
		}
	}, {
		key: "locationOf",
		value: function locationOf(target) {
			var parentPos = this.iframe.getBoundingClientRect();
			var targetPos = this.contents.locationOf(target, this.settings.ignoreClass);

			return {
				"left": targetPos.left,
				"top": targetPos.top
			};
		}
	}, {
		key: "onDisplayed",
		value: function onDisplayed(view) {
			// Stub, override with a custom functions
		}
	}, {
		key: "onResize",
		value: function onResize(view, e) {
			// Stub, override with a custom functions
		}
	}, {
		key: "bounds",
		value: function bounds(force) {
			if (force || !this.elementBounds) {
				this.elementBounds = (0, _core.bounds)(this.element);
			}

			return this.elementBounds;
		}
	}, {
		key: "highlight",
		value: function highlight(cfiRange) {
			var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
			var cb = arguments[2];

			var _this4 = this;

			var className = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "epubjs-hl";
			var styles = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

			if (!this.contents) {
				return;
			}
			var attributes = Object.assign({ "fill": "yellow", "fill-opacity": "0.3", "mix-blend-mode": "multiply" }, styles);
			var range = this.contents.range(cfiRange);

			var emitter = function emitter() {
				_this4.emit(_constants.EVENTS.VIEWS.MARK_CLICKED, cfiRange, data);
			};

			data["epubcfi"] = cfiRange;

			if (!this.pane) {
				this.pane = new _marksPane.Pane(this.iframe, this.element);
			}

			var m = new _marksPane.Highlight(range, className, data, attributes);
			try {
			var h = this.pane.addMark(m);

			this.highlights[cfiRange] = { "mark": h, "element": h.element, "listeners": [emitter, cb] };

			h.element.setAttribute("ref", className);
			h.element.addEventListener("click", emitter);
			h.element.addEventListener("touchstart", emitter);

			if (cb) {
				h.element.addEventListener("click", cb);
				h.element.addEventListener("touchstart", cb);
			}
			return h;
			} catch (e) {}
		}
	}, {
		key: "underline",
		value: function underline(cfiRange) {
			var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
			var cb = arguments[2];

			var _this5 = this;

			var className = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "epubjs-ul";
			var styles = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

			if (!this.contents) {
				return;
			}
			var attributes = Object.assign({ "stroke": "black", "stroke-opacity": "0.3", "mix-blend-mode": "multiply" }, styles);
			var range = this.contents.range(cfiRange);
			var emitter = function emitter() {
				_this5.emit(_constants.EVENTS.VIEWS.MARK_CLICKED, cfiRange, data);
			};

			data["epubcfi"] = cfiRange;

			if (!this.pane) {
				this.pane = new _marksPane.Pane(this.iframe, this.element);
			}

			var m = new _marksPane.Underline(range, className, data, attributes);
			var h = this.pane.addMark(m);

			this.underlines[cfiRange] = { "mark": h, "element": h.element, "listeners": [emitter, cb] };

			h.element.setAttribute("ref", className);
			h.element.addEventListener("click", emitter);
			h.element.addEventListener("touchstart", emitter);

			if (cb) {
				h.element.addEventListener("click", cb);
				h.element.addEventListener("touchstart", cb);
			}
			return h;
		}
	}, {
		key: "mark",
		value: function mark(cfiRange) {
			var _this6 = this;

			var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
			var cb = arguments[2];

			if (!this.contents) {
				return;
			}

			if (cfiRange in this.marks) {
				var item = this.marks[cfiRange];
				return item;
			}

			var range = this.contents.range(cfiRange);
			if (!range) {
				return;
			}
			var container = range.commonAncestorContainer;
			var parent = container.nodeType === 1 ? container : container.parentNode;

			var emitter = function emitter(e) {
				_this6.emit(_constants.EVENTS.VIEWS.MARK_CLICKED, cfiRange, data);
			};

			if (range.collapsed && container.nodeType === 1) {
				range = new Range();
				range.selectNodeContents(container);
			} else if (range.collapsed) {
				// Webkit doesn't like collapsed ranges
				range = new Range();
				range.selectNodeContents(parent);
			}

			var mark = this.document.createElement("a");
			mark.setAttribute("ref", "epubjs-mk");
			mark.style.position = "absolute";

			mark.dataset["epubcfi"] = cfiRange;

			if (data) {
				Object.keys(data).forEach(function (key) {
					mark.dataset[key] = data[key];
				});
			}

			if (cb) {
				mark.addEventListener("click", cb);
				mark.addEventListener("touchstart", cb);
			}

			mark.addEventListener("click", emitter);
			mark.addEventListener("touchstart", emitter);

			this.placeMark(mark, range);

			this.element.appendChild(mark);

			this.marks[cfiRange] = { "element": mark, "range": range, "listeners": [emitter, cb] };

			return parent;
		}
	}, {
		key: "placeMark",
		value: function placeMark(element, range) {
			var top = void 0,
			    right = void 0,
			    left = void 0;

			if (this.layout.name === "pre-paginated" || this.settings.axis !== "horizontal") {
				var pos = range.getBoundingClientRect();
				top = pos.top;
				right = pos.right;
			} else {
				// Element might break columns, so find the left most element
				var rects = range.getClientRects();

				var rect = void 0;
				for (var i = 0; i != rects.length; i++) {
					rect = rects[i];
					if (!left || rect.left < left) {
						left = rect.left;
						// right = rect.right;
						right = Math.ceil(left / this.layout.props.pageWidth) * this.layout.props.pageWidth - this.layout.gap / 2;
						top = rect.top;
					}
				}
			}

			element.style.top = top + "px";
			element.style.left = right + "px";
		}
	}, {
		key: "unhighlight",
		value: function unhighlight(cfiRange) {
			var item = void 0;
			if (cfiRange in this.highlights) {
				item = this.highlights[cfiRange];

				this.pane.removeMark(item.mark);
				item.listeners.forEach(function (l) {
					if (l) {
						item.element.removeEventListener("click", l);
						item.element.removeEventListener("touchstart", l);
					};
				});
				delete this.highlights[cfiRange];
			}
		}
	}, {
		key: "ununderline",
		value: function ununderline(cfiRange) {
			var item = void 0;
			if (cfiRange in this.underlines) {
				item = this.underlines[cfiRange];
				this.pane.removeMark(item.mark);
				item.listeners.forEach(function (l) {
					if (l) {
						item.element.removeEventListener("click", l);
						item.element.removeEventListener("touchstart", l);
					};
				});
				delete this.underlines[cfiRange];
			}
		}
	}, {
		key: "unmark",
		value: function unmark(cfiRange) {
			var item = void 0;
			if (cfiRange in this.marks) {
				item = this.marks[cfiRange];
				this.element.removeChild(item.element);
				item.listeners.forEach(function (l) {
					if (l) {
						item.element.removeEventListener("click", l);
						item.element.removeEventListener("touchstart", l);
					};
				});
				delete this.marks[cfiRange];
			}
		}
	}, {
		key: "destroy",
		value: function destroy() {

			for (var cfiRange in this.highlights) {
				this.unhighlight(cfiRange);
			}

			for (var _cfiRange in this.underlines) {
				this.ununderline(_cfiRange);
			}

			for (var _cfiRange2 in this.marks) {
				this.unmark(_cfiRange2);
			}

			if (this.blobUrl) {
				(0, _core.revokeBlobUrl)(this.blobUrl);
			}

			if (this.displayed) {
				this.displayed = false;

				this.removeListeners();
				this.contents.destroy();

				this.stopExpanding = true;
				this.element.removeChild(this.iframe);

				this.iframe = undefined;
				this.contents = undefined;

				this._textWidth = null;
				this._textHeight = null;
				this._width = null;
				this._height = null;
			}

			// this.element.style.height = "0px";
			// this.element.style.width = "0px";
		}
	}]);

	return IframeView;
}();

(0, _eventEmitter2.default)(IframeView.prototype);

exports.default = IframeView;
module.exports = exports["default"];

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(16),
    now = __webpack_require__(62),
    toNumber = __webpack_require__(64);

/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        timeWaiting = wait - timeSinceLastCall;

    return maxing
      ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        clearTimeout(timerId);
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

module.exports = debounce;


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

var freeGlobal = __webpack_require__(63);

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

module.exports = root;


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

var root = __webpack_require__(22);

/** Built-in value references. */
var Symbol = root.Symbol;

module.exports = Symbol;


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _core = __webpack_require__(0);

var _default = __webpack_require__(15);

var _default2 = _interopRequireDefault(_default);

var _snap = __webpack_require__(71);

var _snap2 = _interopRequireDefault(_snap);

var _constants = __webpack_require__(2);

var _debounce = __webpack_require__(21);

var _debounce2 = _interopRequireDefault(_debounce);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ContinuousViewManager = function (_DefaultViewManager) {
	_inherits(ContinuousViewManager, _DefaultViewManager);

	function ContinuousViewManager(options) {
		_classCallCheck(this, ContinuousViewManager);

		var _this = _possibleConstructorReturn(this, (ContinuousViewManager.__proto__ || Object.getPrototypeOf(ContinuousViewManager)).call(this, options));

		_this.name = "continuous";

		_this.settings = (0, _core.extend)(_this.settings || {}, {
			infinite: true,
			overflow: undefined,
			axis: undefined,
			flow: "scrolled",
			offset: 500,
			offsetDelta: 250,
			width: undefined,
			height: undefined,
			snap: false,
			afterScrolledTimeout: 10
		});

		(0, _core.extend)(_this.settings, options.settings || {});

		// Gap can be 0, but defaults doesn't handle that
		if (options.settings.gap != "undefined" && options.settings.gap === 0) {
			_this.settings.gap = options.settings.gap;
		}

		_this.viewSettings = {
			ignoreClass: _this.settings.ignoreClass,
			axis: _this.settings.axis,
			flow: _this.settings.flow,
			layout: _this.layout,
			width: 0,
			height: 0,
			forceEvenPages: false
		};

		_this.scrollTop = 0;
		_this.scrollLeft = 0;
		return _this;
	}

	_createClass(ContinuousViewManager, [{
		key: "display",
		value: function display(section, target) {
			return _default2.default.prototype.display.call(this, section, target).then(function () {
				return this.fill();
			}.bind(this));
		}
	}, {
		key: "fill",
		value: function fill(_full) {
			var _this2 = this;

			var full = _full || new _core.defer();

			this.q.enqueue(function () {
				return _this2.check();
			}).then(function (result) {
				if (result) {
					_this2.fill(full);
				} else {
					full.resolve();
				}
			});

			return full.promise;
		}
	}, {
		key: "moveTo",
		value: function moveTo(offset) {
			// var bounds = this.stage.bounds();
			// var dist = Math.floor(offset.top / bounds.height) * bounds.height;
			var distX = 0,
			    distY = 0;

			var offsetX = 0,
			    offsetY = 0;

			if (!this.isPaginated) {
				distY = offset.top;
				offsetY = offset.top + this.settings.offsetDelta;
			} else {
				distX = Math.floor(offset.left / this.layout.delta) * this.layout.delta;
				offsetX = distX + this.settings.offsetDelta;
			}

			if (distX > 0 || distY > 0) {
				this.scrollBy(distX, distY, true);
			}
		}
	}, {
		key: "afterResized",
		value: function afterResized(view) {
			this.emit(_constants.EVENTS.MANAGERS.RESIZE, view.section);
		}

		// Remove Previous Listeners if present

	}, {
		key: "removeShownListeners",
		value: function removeShownListeners(view) {

			// view.off("shown", this.afterDisplayed);
			// view.off("shown", this.afterDisplayedAbove);
			view.onDisplayed = function () {};
		}
	}, {
		key: "add",
		value: function add(section) {
			var _this3 = this;

			var view = this.createView(section);

			this.views.append(view);

			view.on(_constants.EVENTS.VIEWS.RESIZED, function (bounds) {
				view.expanded = true;
			});

			view.on(_constants.EVENTS.VIEWS.AXIS, function (axis) {
				_this3.updateAxis(axis);
			});

			// view.on(EVENTS.VIEWS.SHOWN, this.afterDisplayed.bind(this));
			view.onDisplayed = this.afterDisplayed.bind(this);
			view.onResize = this.afterResized.bind(this);

			return view.display(this.request);
		}
	}, {
		key: "append",
		value: function append(section) {
			var _this4 = this;

			var view = this.createView(section);

			view.on(_constants.EVENTS.VIEWS.RESIZED, function (bounds) {
				view.expanded = true;
			});

			view.on(_constants.EVENTS.VIEWS.AXIS, function (axis) {
				_this4.updateAxis(axis);
			});

			this.views.append(view);

			view.onDisplayed = this.afterDisplayed.bind(this);

			return view;
		}
	}, {
		key: "prepend",
		value: function prepend(section) {
			var _this5 = this;

			var view = this.createView(section);

			view.on(_constants.EVENTS.VIEWS.RESIZED, function (bounds) {
				_this5.counter(bounds);
				view.expanded = true;
			});

			view.on(_constants.EVENTS.VIEWS.AXIS, function (axis) {
				_this5.updateAxis(axis);
			});

			this.views.prepend(view);

			view.onDisplayed = this.afterDisplayed.bind(this);

			return view;
		}
	}, {
		key: "counter",
		value: function counter(bounds) {
			if (this.settings.axis === "vertical") {
				this.scrollBy(0, bounds.heightDelta, true);
			} else {
				this.scrollBy(bounds.widthDelta, 0, true);
			}
		}
	}, {
		key: "update",
		value: function update(_offset) {
			var container = this.bounds();
			var views = this.views.all();
			var viewsLength = views.length;
			var visible = [];
			var offset = typeof _offset != "undefined" ? _offset : this.settings.offset || 0;
			var isVisible;
			var view;

			var updating = new _core.defer();
			var promises = [];
			for (var i = 0; i < viewsLength; i++) {
				view = views[i];

				isVisible = this.isVisible(view, offset, offset, container);

				if (isVisible === true) {
					// console.log("visible " + view.index);

					if (!view.displayed) {
						var displayed = view.display(this.request).then(function (view) {
							view.show();
						}, function (err) {
							view.hide();
						});
						promises.push(displayed);
					} else {
						view.show();
					}
					visible.push(view);
				} else {
					this.q.enqueue(view.destroy.bind(view));
					// console.log("hidden " + view.index);

					clearTimeout(this.trimTimeout);
					this.trimTimeout = setTimeout(function () {
						this.q.enqueue(this.trim.bind(this));
					}.bind(this), 250);
				}
			}

			if (promises.length) {
				return Promise.all(promises).catch(function (err) {
					updating.reject(err);
				});
			} else {
				updating.resolve();
				return updating.promise;
			}
		}
	}, {
		key: "check",
		value: function check(_offsetLeft, _offsetTop) {
			var _this6 = this;

			var checking = new _core.defer();
			var newViews = [];

			var horizontal = this.settings.axis === "horizontal";
			var delta = this.settings.offset || 0;

			if (_offsetLeft && horizontal) {
				delta = _offsetLeft;
			}

			if (_offsetTop && !horizontal) {
				delta = _offsetTop;
			}

			var bounds = this._bounds; // bounds saved this until resize

			var rtl = this.settings.direction === "rtl";
			var dir = horizontal && rtl ? -1 : 1; //RTL reverses scrollTop

			var offset = horizontal ? this.scrollLeft : this.scrollTop * dir;
			var visibleLength = horizontal ? Math.floor(bounds.width) : bounds.height;
			var contentLength = horizontal ? this.container.scrollWidth : this.container.scrollHeight;

			var prepend = function prepend() {
				var first = _this6.views.first();
				var prev = first && first.section.prev();

				if (prev) {
					newViews.push(_this6.prepend(prev));
				}
			};

			var append = function append() {
				var last = _this6.views.last();
				var next = last && last.section.next();

				if (next) {
					newViews.push(_this6.append(next));
				}
			};
			//Horizontal negative scrolling
			if (horizontal && rtl && this.settings.rtlScrollType === "negative") {

				if (offset - delta <= -1 * contentLength) {
					append();
				}

				if (offset + delta > 0) {
					prepend();
				}
			}
			//default scrolling
			else {
					if (offset + visibleLength + delta >= contentLength) {
						if (horizontal && rtl) {
							prepend();
						} else {
							append();
						}
					}

					if (offset - delta < 0) {
						if (horizontal && rtl) {
							append();
						} else {
							prepend();
						}
					}
				}

			var promises = newViews.map(function (view) {
				return view.display(_this6.request);
			});

			if (newViews.length) {
				return Promise.all(promises).then(function () {
					return _this6.check();
				}).then(function () {
					// Check to see if anything new is on screen after rendering
					return _this6.update(delta);
				}, function (err) {
					return err;
				});
			} else {
				this.q.enqueue(function () {
					this.update();
				}.bind(this));
				checking.resolve(false);
				return checking.promise;
			}
		}
	}, {
		key: "trim",
		value: function trim() {
			var task = new _core.defer();
			var displayed = this.views.displayed();
			var first = displayed[0];
			var last = displayed[displayed.length - 1];
			var firstIndex = this.views.indexOf(first);
			var lastIndex = this.views.indexOf(last);
			var above = this.views.slice(0, firstIndex);
			var below = this.views.slice(lastIndex + 1);

			// Erase all but last above
			for (var i = 0; i < above.length - 1; i++) {
				this.erase(above[i], above);
			}

			// Erase all except first below
			for (var j = 1; j < below.length; j++) {
				this.erase(below[j]);
			}

			task.resolve();
			return task.promise;
		}
	}, {
		key: "erase",
		value: function erase(view, above) {
			//Trim

			var prevTop;
			var prevLeft;

			if (!this.settings.fullsize) {
				prevTop = this.container.scrollTop;
				prevLeft = this.container.scrollLeft;
			} else {
				prevTop = window.scrollY;
				prevLeft = window.scrollX;
			}

			var bounds = view.bounds();

			this.views.remove(view);

			if (above) {
				if (this.settings.axis === "vertical") {
					this.scrollTo(0, prevTop - bounds.height, true);
				} else {
					if (this.settings.direction === 'rtl') {
						if (this.settings.rtlScrollType === "default") {
							this.scrollTo(prevLeft, 0, true);
						} else {
							this.scrollTo(prevLeft + Math.floor(bounds.width), 0, true);
						}
					} else {
						this.scrollTo(prevLeft - Math.floor(bounds.width), 0, true);
					}
				}
			}
		}
	}, {
		key: "addEventListeners",
		value: function addEventListeners(stage) {

			window.addEventListener("unload", function (e) {
				this.ignore = true;
				// this.scrollTo(0,0);
				this.destroy();
			}.bind(this));

			this.addScrollListeners();

			if (this.isPaginated && this.settings.snap) {
				this.snapper = new _snap2.default(this, this.settings.snap && _typeof(this.settings.snap) === "object" && this.settings.snap);
			}
		}
	}, {
		key: "addScrollListeners",
		value: function addScrollListeners() {
			var scroller;

			this.tick = _core.requestAnimationFrame;

			if (!this.settings.fullsize) {
				this.prevScrollTop = this.container.scrollTop;
				this.prevScrollLeft = this.container.scrollLeft;
			} else {
				this.prevScrollTop = window.scrollY;
				this.prevScrollLeft = window.scrollX;
			}

			this.scrollDeltaVert = 0;
			this.scrollDeltaHorz = 0;

			if (!this.settings.fullsize) {
				scroller = this.container;
				this.scrollTop = this.container.scrollTop;
				this.scrollLeft = this.container.scrollLeft;
			} else {
				scroller = window;
				this.scrollTop = window.scrollY;
				this.scrollLeft = window.scrollX;
			}

			this._onScroll = this.onScroll.bind(this);
			scroller.addEventListener("scroll", this._onScroll);
			this._scrolled = (0, _debounce2.default)(this.scrolled.bind(this), 30);
			// this.tick.call(window, this.onScroll.bind(this));

			this.didScroll = false;
		}
	}, {
		key: "removeEventListeners",
		value: function removeEventListeners() {
			var scroller;

			if (!this.settings.fullsize) {
				scroller = this.container;
			} else {
				scroller = window;
			}

			scroller.removeEventListener("scroll", this._onScroll);
			this._onScroll = undefined;
		}
	}, {
		key: "onScroll",
		value: function onScroll() {
			var scrollTop = void 0;
			var scrollLeft = void 0;
			var dir = this.settings.direction === "rtl" ? -1 : 1;

			if (!this.settings.fullsize) {
				scrollTop = this.container.scrollTop;
				scrollLeft = this.container.scrollLeft;
			} else {
				scrollTop = window.scrollY * dir;
				scrollLeft = window.scrollX * dir;
			}

			this.scrollTop = scrollTop;
			this.scrollLeft = scrollLeft;

			if (!this.ignore) {

				this._scrolled();
			} else {
				this.ignore = false;
			}

			this.scrollDeltaVert += Math.abs(scrollTop - this.prevScrollTop);
			this.scrollDeltaHorz += Math.abs(scrollLeft - this.prevScrollLeft);

			this.prevScrollTop = scrollTop;
			this.prevScrollLeft = scrollLeft;

			clearTimeout(this.scrollTimeout);
			this.scrollTimeout = setTimeout(function () {
				this.scrollDeltaVert = 0;
				this.scrollDeltaHorz = 0;
			}.bind(this), 150);

			clearTimeout(this.afterScrolled);

			this.didScroll = false;
		}
	}, {
		key: "scrolled",
		value: function scrolled() {

			this.q.enqueue(function () {
				this.check();
			}.bind(this));

			this.emit(_constants.EVENTS.MANAGERS.SCROLL, {
				top: this.scrollTop,
				left: this.scrollLeft
			});

			clearTimeout(this.afterScrolled);
			this.afterScrolled = setTimeout(function () {

				// Don't report scroll if we are about the snap
				if (this.snapper && this.snapper.supportsTouch && this.snapper.needsSnap()) {
					return;
				}

				this.emit(_constants.EVENTS.MANAGERS.SCROLLED, {
					top: this.scrollTop,
					left: this.scrollLeft
				});
			}.bind(this), this.settings.afterScrolledTimeout);
		}
	}, {
		key: "next",
		value: function next() {

			var dir = this.settings.direction;
			var delta = this.layout.props.name === "pre-paginated" && this.layout.props.spread ? this.layout.props.delta * 2 : this.layout.props.delta;

			if (!this.views.length) return;

			if (this.isPaginated && this.settings.axis === "horizontal") {

				this.scrollBy(delta, 0, true);
			} else {

				this.scrollBy(0, this.layout.height, true);
			}

			this.q.enqueue(function () {
				this.check();
			}.bind(this));
		}
	}, {
		key: "prev",
		value: function prev() {

			var dir = this.settings.direction;
			var delta = this.layout.props.name === "pre-paginated" && this.layout.props.spread ? this.layout.props.delta * 2 : this.layout.props.delta;

			if (!this.views.length) return;

			if (this.isPaginated && this.settings.axis === "horizontal") {

				this.scrollBy(-delta, 0, true);
			} else {

				this.scrollBy(0, -this.layout.height, true);
			}

			this.q.enqueue(function () {
				this.check();
			}.bind(this));
		}

		// updateAxis(axis, forceUpdate){
		//
		// 	super.updateAxis(axis, forceUpdate);
		//
		// 	if (axis === "vertical") {
		// 		this.settings.infinite = true;
		// 	} else {
		// 		this.settings.infinite = false;
		// 	}
		// }

	}, {
		key: "updateFlow",
		value: function updateFlow(flow) {
			if (this.rendered && this.snapper) {
				this.snapper.destroy();
				this.snapper = undefined;
			}

			_get(ContinuousViewManager.prototype.__proto__ || Object.getPrototypeOf(ContinuousViewManager.prototype), "updateFlow", this).call(this, flow, "scroll");

			if (this.rendered && this.isPaginated && this.settings.snap) {
				this.snapper = new _snap2.default(this, this.settings.snap && _typeof(this.settings.snap) === "object" && this.settings.snap);
			}
		}
	}, {
		key: "destroy",
		value: function destroy() {
			_get(ContinuousViewManager.prototype.__proto__ || Object.getPrototypeOf(ContinuousViewManager.prototype), "destroy", this).call(this);

			if (this.snapper) {
				this.snapper.destroy();
			}
		}
	}]);

	return ContinuousViewManager;
}(_default2.default);

exports.default = ContinuousViewManager;
module.exports = exports["default"];

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _book = __webpack_require__(26);

var _book2 = _interopRequireDefault(_book);

var _rendition = __webpack_require__(18);

var _rendition2 = _interopRequireDefault(_rendition);

var _epubcfi = __webpack_require__(1);

var _epubcfi2 = _interopRequireDefault(_epubcfi);

var _contents = __webpack_require__(14);

var _contents2 = _interopRequireDefault(_contents);

var _core = __webpack_require__(0);

var utils = _interopRequireWildcard(_core);

var _constants = __webpack_require__(2);

var _urlPolyfill = __webpack_require__(77);

var URLpolyfill = _interopRequireWildcard(_urlPolyfill);

var _iframe = __webpack_require__(20);

var _iframe2 = _interopRequireDefault(_iframe);

var _default = __webpack_require__(15);

var _default2 = _interopRequireDefault(_default);

var _continuous = __webpack_require__(24);

var _continuous2 = _interopRequireDefault(_continuous);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Creates a new Book
 * @param {string|ArrayBuffer} url URL, Path or ArrayBuffer
 * @param {object} options to pass to the book
 * @returns {Book} a new Book object
 * @example ePub("/path/to/book.epub", {})
 */
function ePub(url, options) {
  return new _book2.default(url, options);
}

ePub.VERSION = _constants.EPUBJS_VERSION;

if (typeof global !== "undefined") {
  global.EPUBJS_VERSION = _constants.EPUBJS_VERSION;
}

ePub.Book = _book2.default;
ePub.Rendition = _rendition2.default;
ePub.Contents = _contents2.default;
ePub.CFI = _epubcfi2.default;
ePub.utils = utils;

exports.default = ePub;
module.exports = exports["default"];
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventEmitter = __webpack_require__(3);

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

var _core = __webpack_require__(0);

var _url = __webpack_require__(6);

var _url2 = _interopRequireDefault(_url);

var _path = __webpack_require__(4);

var _path2 = _interopRequireDefault(_path);

var _spine = __webpack_require__(43);

var _spine2 = _interopRequireDefault(_spine);

var _locations = __webpack_require__(47);

var _locations2 = _interopRequireDefault(_locations);

var _container = __webpack_require__(48);

var _container2 = _interopRequireDefault(_container);

var _packaging = __webpack_require__(49);

var _packaging2 = _interopRequireDefault(_packaging);

var _navigation = __webpack_require__(50);

var _navigation2 = _interopRequireDefault(_navigation);

var _resources = __webpack_require__(51);

var _resources2 = _interopRequireDefault(_resources);

var _pagelist = __webpack_require__(52);

var _pagelist2 = _interopRequireDefault(_pagelist);

var _rendition = __webpack_require__(18);

var _rendition2 = _interopRequireDefault(_rendition);

var _archive = __webpack_require__(72);

var _archive2 = _interopRequireDefault(_archive);

var _request2 = __webpack_require__(9);

var _request3 = _interopRequireDefault(_request2);

var _epubcfi = __webpack_require__(1);

var _epubcfi2 = _interopRequireDefault(_epubcfi);

var _store = __webpack_require__(74);

var _store2 = _interopRequireDefault(_store);

var _displayoptions = __webpack_require__(76);

var _displayoptions2 = _interopRequireDefault(_displayoptions);

var _constants = __webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CONTAINER_PATH = "META-INF/container.xml";
var IBOOKS_DISPLAY_OPTIONS_PATH = "META-INF/com.apple.ibooks.display-options.xml";

var INPUT_TYPE = {
	BINARY: "binary",
	BASE64: "base64",
	EPUB: "epub",
	OPF: "opf",
	MANIFEST: "json",
	DIRECTORY: "directory"
};

/**
 * An Epub representation with methods for the loading, parsing and manipulation
 * of its contents.
 * @class
 * @param {string} [url]
 * @param {object} [options]
 * @param {method} [options.requestMethod] a request function to use instead of the default
 * @param {boolean} [options.requestCredentials=undefined] send the xhr request withCredentials
 * @param {object} [options.requestHeaders=undefined] send the xhr request headers
 * @param {string} [options.encoding=binary] optional to pass 'binary' or base64' for archived Epubs
 * @param {string} [options.replacements=none] use base64, blobUrl, or none for replacing assets in archived Epubs
 * @param {method} [options.canonical] optional function to determine canonical urls for a path
 * @param {string} [options.openAs] optional string to determine the input type
 * @param {string} [options.store=false] cache the contents in local storage, value should be the name of the reader
 * @returns {Book}
 * @example new Book("/path/to/book.epub", {})
 * @example new Book({ replacements: "blobUrl" })
 */

var Book = function () {
	function Book(url, options) {
		var _this = this;

		_classCallCheck(this, Book);

		// Allow passing just options to the Book
		if (typeof options === "undefined" && typeof url !== "string" && url instanceof Blob === false && url instanceof ArrayBuffer === false) {
			options = url;
			url = undefined;
		}

		this.settings = (0, _core.extend)(this.settings || {}, {
			requestMethod: undefined,
			requestCredentials: undefined,
			requestHeaders: undefined,
			encoding: undefined,
			replacements: undefined,
			canonical: undefined,
			openAs: undefined,
			store: undefined
		});

		(0, _core.extend)(this.settings, options);

		// Promises
		this.opening = new _core.defer();
		/**
   * @member {promise} opened returns after the book is loaded
   * @memberof Book
   */
		this.opened = this.opening.promise;
		this.isOpen = false;

		this.loading = {
			manifest: new _core.defer(),
			spine: new _core.defer(),
			metadata: new _core.defer(),
			cover: new _core.defer(),
			navigation: new _core.defer(),
			pageList: new _core.defer(),
			resources: new _core.defer(),
			displayOptions: new _core.defer()
		};

		this.loaded = {
			manifest: this.loading.manifest.promise,
			spine: this.loading.spine.promise,
			metadata: this.loading.metadata.promise,
			cover: this.loading.cover.promise,
			navigation: this.loading.navigation.promise,
			pageList: this.loading.pageList.promise,
			resources: this.loading.resources.promise,
			displayOptions: this.loading.displayOptions.promise
		};

		/**
   * @member {promise} ready returns after the book is loaded and parsed
   * @memberof Book
   * @private
   */
		this.ready = Promise.all([this.loaded.manifest, this.loaded.spine, this.loaded.metadata, this.loaded.cover, this.loaded.navigation, this.loaded.resources, this.loaded.displayOptions]);

		// Queue for methods used before opening
		this.isRendered = false;
		// this._q = queue(this);

		/**
   * @member {method} request
   * @memberof Book
   * @private
   */
		this.request = this.settings.requestMethod || _request3.default;

		/**
   * @member {Spine} spine
   * @memberof Book
   */
		this.spine = new _spine2.default();

		/**
   * @member {Locations} locations
   * @memberof Book
   */
		this.locations = new _locations2.default(this.spine, this.load.bind(this));

		/**
   * @member {Navigation} navigation
   * @memberof Book
   */
		this.navigation = undefined;

		/**
   * @member {PageList} pagelist
   * @memberof Book
   */
		this.pageList = undefined;

		/**
   * @member {Url} url
   * @memberof Book
   * @private
   */
		this.url = undefined;

		/**
   * @member {Path} path
   * @memberof Book
   * @private
   */
		this.path = undefined;

		/**
   * @member {boolean} archived
   * @memberof Book
   * @private
   */
		this.archived = false;

		/**
   * @member {Archive} archive
   * @memberof Book
   * @private
   */
		this.archive = undefined;

		/**
   * @member {Store} storage
   * @memberof Book
   * @private
   */
		this.storage = undefined;

		/**
   * @member {Resources} resources
   * @memberof Book
   * @private
   */
		this.resources = undefined;

		/**
   * @member {Rendition} rendition
   * @memberof Book
   * @private
   */
		this.rendition = undefined;

		/**
   * @member {Container} container
   * @memberof Book
   * @private
   */
		this.container = undefined;

		/**
   * @member {Packaging} packaging
   * @memberof Book
   * @private
   */
		this.packaging = undefined;

		/**
   * @member {DisplayOptions} displayOptions
   * @memberof DisplayOptions
   * @private
   */
		this.displayOptions = undefined;

		// this.toc = undefined;
		if (this.settings.store) {
			this.store(this.settings.store);
		}

		if (url) {
			this.open(url, this.settings.openAs).catch(function (error) {
				var err = new Error("Cannot load book at " + url);
				_this.emit(_constants.EVENTS.BOOK.OPEN_FAILED, err);
			});
		}
	}

	/**
  * Open a epub or url
  * @param {string | ArrayBuffer} input Url, Path or ArrayBuffer
  * @param {string} [what="binary", "base64", "epub", "opf", "json", "directory"] force opening as a certain type
  * @returns {Promise} of when the book has been loaded
  * @example book.open("/path/to/book.epub")
  */


	_createClass(Book, [{
		key: "open",
		value: function open(input, what) {
			var opening;
			var type = what || this.determineType(input);

			if (type === INPUT_TYPE.BINARY) {
				this.archived = true;
				this.url = new _url2.default("/", "");
				opening = this.openEpub(input);
			} else if (type === INPUT_TYPE.BASE64) {
				this.archived = true;
				this.url = new _url2.default("/", "");
				opening = this.openEpub(input, type);
			} else if (type === INPUT_TYPE.EPUB) {
				this.archived = true;
				this.url = new _url2.default("/", "");
				opening = this.request(input, "binary", this.settings.requestCredentials, this.settings.requestHeaders).then(this.openEpub.bind(this));
			} else if (type == INPUT_TYPE.OPF) {
				this.url = new _url2.default(input);
				opening = this.openPackaging(this.url.Path.toString());
			} else if (type == INPUT_TYPE.MANIFEST) {
				this.url = new _url2.default(input);
				opening = this.openManifest(this.url.Path.toString());
			} else {
				this.url = new _url2.default(input);
				opening = this.openContainer(CONTAINER_PATH).then(this.openPackaging.bind(this));
			}

			return opening;
		}

		/**
   * Open an archived epub
   * @private
   * @param  {binary} data
   * @param  {string} [encoding]
   * @return {Promise}
   */

	}, {
		key: "openEpub",
		value: function openEpub(data, encoding) {
			var _this2 = this;

			return this.unarchive(data, encoding || this.settings.encoding).then(function () {
				return _this2.openContainer(CONTAINER_PATH);
			}).then(function (packagePath) {
				return _this2.openPackaging(packagePath);
			});
		}

		/**
   * Open the epub container
   * @private
   * @param  {string} url
   * @return {string} packagePath
   */

	}, {
		key: "openContainer",
		value: function openContainer(url) {
			var _this3 = this;

			return this.load(url).then(function (xml) {
				_this3.container = new _container2.default(xml);
				return _this3.resolve(_this3.container.packagePath);
			});
		}

		/**
   * Open the Open Packaging Format Xml
   * @private
   * @param  {string} url
   * @return {Promise}
   */

	}, {
		key: "openPackaging",
		value: function openPackaging(url) {
			var _this4 = this;

			this.path = new _path2.default(url);
			return this.load(url).then(function (xml) {
				_this4.packaging = new _packaging2.default(xml);
				return _this4.unpack(_this4.packaging);
			});
		}

		/**
   * Open the manifest JSON
   * @private
   * @param  {string} url
   * @return {Promise}
   */

	}, {
		key: "openManifest",
		value: function openManifest(url) {
			var _this5 = this;

			this.path = new _path2.default(url);
			return this.load(url).then(function (json) {
				_this5.packaging = new _packaging2.default();
				_this5.packaging.load(json);
				return _this5.unpack(_this5.packaging);
			});
		}

	/* Add a method to load a JSON manifest directly */
	}, {
		key: "openJSON",
		value: function openJSON(json) {
			this.packaging = new _packaging2.default();
			this.packaging.load(json);
			return this.unpack(this.packaging);
		}

		/**
   * Load a resource from the Book
   * @param  {string} path path to the resource to load
   * @return {Promise}     returns a promise with the requested resource
   */

	}, {
		key: "load",
		value: function load(path) {
			var resolved = this.resolve(path);
			if (this.archived) {
				return this.archive.request(resolved);
			} else {
				return this.request(resolved, null, this.settings.requestCredentials, this.settings.requestHeaders);
			}
		}

		/**
   * Resolve a path to it's absolute position in the Book
   * @param  {string} path
   * @param  {boolean} [absolute] force resolving the full URL
   * @return {string}          the resolved path string
   */

	}, {
		key: "resolve",
		value: function resolve(path, absolute) {
			if (!path) {
				return;
			}
			var resolved = path;
			var isAbsolute = path.indexOf("://") > -1;

			if (isAbsolute) {
				return path;
			}

			if (this.path) {
				resolved = this.path.resolve(path);
			}

			if (absolute != false && this.url) {
				resolved = this.url.resolve(resolved);
			}

			return resolved;
		}

		/**
   * Get a canonical link to a path
   * @param  {string} path
   * @return {string} the canonical path string
   */

	}, {
		key: "canonical",
		value: function canonical(path) {
			var url = path;

			if (!path) {
				return "";
			}

			if (this.settings.canonical) {
				url = this.settings.canonical(path);
			} else {
				url = this.resolve(path, true);
			}

			return url;
		}

		/**
   * Determine the type of they input passed to open
   * @private
   * @param  {string} input
   * @return {string}  binary | directory | epub | opf
   */

	}, {
		key: "determineType",
		value: function determineType(input) {
			var url;
			var path;
			var extension;

			if (this.settings.encoding === "base64") {
				return INPUT_TYPE.BASE64;
			}

			if (typeof input != "string") {
				return INPUT_TYPE.BINARY;
			}

			url = new _url2.default(input);
			path = url.path();
			extension = path.extension;

			// If there's a search string, remove it before determining type
			if (extension) {
				extension = extension.replace(/\?.*$/, "");
			}

			if (!extension) {
				return INPUT_TYPE.DIRECTORY;
			}

			if (extension === "epub") {
				return INPUT_TYPE.EPUB;
			}

			if (extension === "opf") {
				return INPUT_TYPE.OPF;
			}

			if (extension === "json") {
				return INPUT_TYPE.MANIFEST;
			}
		}

		/**
   * unpack the contents of the Books packaging
   * @private
   * @param {Packaging} packaging object
   */

	}, {
		key: "unpack",
		value: function unpack(packaging) {
			var _this6 = this;

			this.package = packaging; //TODO: deprecated this

			if (this.packaging.metadata.layout === "") {
				// rendition:layout not set - check display options if book is pre-paginated
				this.load(this.url.resolve(IBOOKS_DISPLAY_OPTIONS_PATH)).then(function (xml) {
					_this6.displayOptions = new _displayoptions2.default(xml);
					_this6.loading.displayOptions.resolve(_this6.displayOptions);
				}).catch(function (err) {
					_this6.displayOptions = new _displayoptions2.default();
					_this6.loading.displayOptions.resolve(_this6.displayOptions);
				});
			} else {
				this.displayOptions = new _displayoptions2.default();
				this.loading.displayOptions.resolve(this.displayOptions);
			}

			this.spine.unpack(this.packaging, this.resolve.bind(this), this.canonical.bind(this));

			this.resources = new _resources2.default(this.packaging.manifest, {
				archive: this.archive,
				resolver: this.resolve.bind(this),
				request: this.request.bind(this),
				replacements: this.settings.replacements || (this.archived ? "blobUrl" : "base64")
			});

			this.loadNavigation(this.packaging).then(function () {
				// this.toc = this.navigation.toc;
				_this6.loading.navigation.resolve(_this6.navigation);
			});

			if (this.packaging.coverPath) {
				this.cover = this.resolve(this.packaging.coverPath);
			}
			// Resolve promises
			this.loading.manifest.resolve(this.packaging.manifest);
			this.loading.metadata.resolve(this.packaging.metadata);
			this.loading.spine.resolve(this.spine);
			this.loading.cover.resolve(this.cover);
			this.loading.resources.resolve(this.resources);
			this.loading.pageList.resolve(this.pageList);

			this.isOpen = true;

			if (this.archived || this.settings.replacements && this.settings.replacements != "none") {
				this.replacements().then(function () {
					_this6.loaded.displayOptions.then(function () {
						_this6.opening.resolve(_this6);
					});
				}).catch(function (err) {
					console.error(err);
				});
			} else {
				// Resolve book opened promise
				this.loaded.displayOptions.then(function () {
					_this6.opening.resolve(_this6);
				});
			}
		}

		/**
   * Load Navigation and PageList from package
   * @private
   * @param {Packaging} packaging
   */

	}, {
		key: "loadNavigation",
		value: function loadNavigation(packaging) {
			var _this7 = this;

			var navPath = packaging.navPath || packaging.ncxPath;
			var toc = packaging.toc;

			// From json manifest
			if (toc) {
				return new Promise(function (resolve, reject) {
					_this7.navigation = new _navigation2.default(toc);

					if (packaging.pageList) {
						_this7.pageList = new _pagelist2.default(packaging.pageList); // TODO: handle page lists from Manifest
					} else _this7.pageList = new _pagelist2.default(); // Fix pageList undefined when loading from manifest

					resolve(_this7.navigation);
				});
			}

			if (!navPath) {
				return new Promise(function (resolve, reject) {
					_this7.navigation = new _navigation2.default();
					_this7.pageList = new _pagelist2.default();

					resolve(_this7.navigation);
				});
			}

			return this.load(navPath, "xml").then(function (xml) {
				_this7.navigation = new _navigation2.default(xml);
				_this7.pageList = new _pagelist2.default(xml);
				return _this7.navigation;
			});
		}

		/**
   * Gets a Section of the Book from the Spine
   * Alias for `book.spine.get`
   * @param {string} target
   * @return {Section}
   */

	}, {
		key: "section",
		value: function section(target) {
			return this.spine.get(target);
		}

		/**
   * Sugar to render a book to an element
   * @param  {element | string} element element or string to add a rendition to
   * @param  {object} [options]
   * @return {Rendition}
   */

	}, {
		key: "renderTo",
		value: function renderTo(element, options) {
			this.rendition = new _rendition2.default(this, options);
			this.rendition.attachTo(element);

			return this.rendition;
		}

		/**
   * Set if request should use withCredentials
   * @param {boolean} credentials
   */

	}, {
		key: "setRequestCredentials",
		value: function setRequestCredentials(credentials) {
			this.settings.requestCredentials = credentials;
		}

		/**
   * Set headers request should use
   * @param {object} headers
   */

	}, {
		key: "setRequestHeaders",
		value: function setRequestHeaders(headers) {
			this.settings.requestHeaders = headers;
		}

		/**
   * Unarchive a zipped epub
   * @private
   * @param  {binary} input epub data
   * @param  {string} [encoding]
   * @return {Archive}
   */

	}, {
		key: "unarchive",
		value: function unarchive(input, encoding) {
			this.archive = new _archive2.default();
			return this.archive.open(input, encoding);
		}

		/**
   * Store the epubs contents
   * @private
   * @param  {binary} input epub data
   * @param  {string} [encoding]
   * @return {Store}
   */

	}, {
		key: "store",
		value: function store(name) {
			var _this8 = this;

			// Use "blobUrl" or "base64" for replacements
			var replacementsSetting = this.settings.replacements && this.settings.replacements !== "none";
			// Save original url
			var originalUrl = this.url;
			// Save original request method
			var requester = this.settings.requestMethod || _request3.default.bind(this);
			// Create new Store
			this.storage = new _store2.default(name, requester, this.resolve.bind(this));
			// Replace request method to go through store
			this.request = this.storage.request.bind(this.storage);

			this.opened.then(function () {
				if (_this8.archived) {
					_this8.storage.requester = _this8.archive.request.bind(_this8.archive);
				}
				// Substitute hook
				var substituteResources = function substituteResources(output, section) {
					section.output = _this8.resources.substitute(output, section.url);
				};

				// Set to use replacements
				_this8.resources.settings.replacements = replacementsSetting || "blobUrl";
				// Create replacement urls
				_this8.resources.replacements().then(function () {
					return _this8.resources.replaceCss();
				});

				_this8.storage.on("offline", function () {
					// Remove url to use relative resolving for hrefs
					_this8.url = new _url2.default("/", "");
					// Add hook to replace resources in contents
					_this8.spine.hooks.serialize.register(substituteResources);
				});

				_this8.storage.on("online", function () {
					// Restore original url
					_this8.url = originalUrl;
					// Remove hook
					_this8.spine.hooks.serialize.deregister(substituteResources);
				});
			});

			return this.storage;
		}

		/**
   * Get the cover url
   * @return {Promise<?string>} coverUrl
   */

	}, {
		key: "coverUrl",
		value: function coverUrl() {
			var _this9 = this;

			return this.loaded.cover.then(function () {
				if (!_this9.cover) {
					return null;
				}

				if (_this9.archived) {
					return _this9.archive.createUrl(_this9.cover);
				} else {
					return _this9.cover;
				}
			});
		}

		/**
   * Load replacement urls
   * @private
   * @return {Promise} completed loading urls
   */

	}, {
		key: "replacements",
		value: function replacements() {
			var _this10 = this;

			this.spine.hooks.serialize.register(function (output, section) {
				section.output = _this10.resources.substitute(output, section.url);
			});

			return this.resources.replacements().then(function () {
				return _this10.resources.replaceCss();
			});
		}

		/**
   * Find a DOM Range for a given CFI Range
   * @param  {EpubCFI} cfiRange a epub cfi range
   * @return {Range}
   */

	}, {
		key: "getRange",
		value: function getRange(cfiRange) {
			var cfi = new _epubcfi2.default(cfiRange);
			var item = this.spine.get(cfi.spinePos);
			var _request = this.load.bind(this);
			if (!item) {
				return new Promise(function (resolve, reject) {
					reject("CFI could not be found");
				});
			}
			return item.load(_request).then(function (contents) {
				var range = cfi.toRange(item.document);
				return range;
			});
		}

		/**
   * Generates the Book Key using the identifer in the manifest or other string provided
   * @param  {string} [identifier] to use instead of metadata identifier
   * @return {string} key
   */

	}, {
		key: "key",
		value: function key(identifier) {
			var ident = identifier || this.packaging.metadata.identifier || this.url.filename;
			return "epubjs:" + _constants.EPUBJS_VERSION + ":" + ident;
		}

		/**
   * Destroy the Book and all associated objects
   */

	}, {
		key: "destroy",
		value: function destroy() {
			this.opened = undefined;
			this.loading = undefined;
			this.loaded = undefined;
			this.ready = undefined;

			this.isOpen = false;
			this.isRendered = false;

			this.spine && this.spine.destroy();
			this.locations && this.locations.destroy();
			this.pageList && this.pageList.destroy();
			this.archive && this.archive.destroy();
			this.resources && this.resources.destroy();
			this.container && this.container.destroy();
			this.packaging && this.packaging.destroy();
			this.rendition && this.rendition.destroy();
			this.displayOptions && this.displayOptions.destroy();

			this.spine = undefined;
			this.locations = undefined;
			this.pageList = undefined;
			this.archive = undefined;
			this.resources = undefined;
			this.container = undefined;
			this.packaging = undefined;
			this.rendition = undefined;

			this.navigation = undefined;
			this.url = undefined;
			this.path = undefined;
			this.archived = false;
		}
	}]);

	return Book;
}();

//-- Enable binding events to book


(0, _eventEmitter2.default)(Book.prototype);

exports.default = Book;
module.exports = exports["default"];

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var assign        = __webpack_require__(28)
  , normalizeOpts = __webpack_require__(36)
  , isCallable    = __webpack_require__(37)
  , contains      = __webpack_require__(38)

  , d;

d = module.exports = function (dscr, value/*, options*/) {
	var c, e, w, options, desc;
	if ((arguments.length < 2) || (typeof dscr !== 'string')) {
		options = value;
		value = dscr;
		dscr = null;
	} else {
		options = arguments[2];
	}
	if (dscr == null) {
		c = w = true;
		e = false;
	} else {
		c = contains.call(dscr, 'c');
		e = contains.call(dscr, 'e');
		w = contains.call(dscr, 'w');
	}

	desc = { value: value, configurable: c, enumerable: e, writable: w };
	return !options ? desc : assign(normalizeOpts(options), desc);
};

d.gs = function (dscr, get, set/*, options*/) {
	var c, e, options, desc;
	if (typeof dscr !== 'string') {
		options = set;
		set = get;
		get = dscr;
		dscr = null;
	} else {
		options = arguments[3];
	}
	if (get == null) {
		get = undefined;
	} else if (!isCallable(get)) {
		options = get;
		get = set = undefined;
	} else if (set == null) {
		set = undefined;
	} else if (!isCallable(set)) {
		options = set;
		set = undefined;
	}
	if (dscr == null) {
		c = true;
		e = false;
	} else {
		c = contains.call(dscr, 'c');
		e = contains.call(dscr, 'e');
	}

	desc = { get: get, set: set, configurable: c, enumerable: e };
	return !options ? desc : assign(normalizeOpts(options), desc);
};


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(29)()
	? Object.assign
	: __webpack_require__(30);


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function () {
	var assign = Object.assign, obj;
	if (typeof assign !== "function") return false;
	obj = { foo: "raz" };
	assign(obj, { bar: "dwa" }, { trzy: "trzy" });
	return (obj.foo + obj.bar + obj.trzy) === "razdwatrzy";
};


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var keys  = __webpack_require__(31)
  , value = __webpack_require__(35)
  , max   = Math.max;

module.exports = function (dest, src /*, …srcn*/) {
	var error, i, length = max(arguments.length, 2), assign;
	dest = Object(value(dest));
	assign = function (key) {
		try {
			dest[key] = src[key];
		} catch (e) {
			if (!error) error = e;
		}
	};
	for (i = 1; i < length; ++i) {
		src = arguments[i];
		keys(src).forEach(assign);
	}
	if (error !== undefined) throw error;
	return dest;
};


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(32)()
	? Object.keys
	: __webpack_require__(33);


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function () {
	try {
		Object.keys("primitive");
		return true;
	} catch (e) {
 return false;
}
};


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isValue = __webpack_require__(10);

var keys = Object.keys;

module.exports = function (object) {
	return keys(isValue(object) ? Object(object) : object);
};


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// eslint-disable-next-line no-empty-function
module.exports = function () {};


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isValue = __webpack_require__(10);

module.exports = function (value) {
	if (!isValue(value)) throw new TypeError("Cannot use null or undefined");
	return value;
};


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isValue = __webpack_require__(10);

var forEach = Array.prototype.forEach, create = Object.create;

var process = function (src, obj) {
	var key;
	for (key in src) obj[key] = src[key];
};

// eslint-disable-next-line no-unused-vars
module.exports = function (opts1 /*, …options*/) {
	var result = create(null);
	forEach.call(arguments, function (options) {
		if (!isValue(options)) return;
		process(Object(options), result);
	});
	return result;
};


/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Deprecated



module.exports = function (obj) {
 return typeof obj === "function";
};


/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(39)()
	? String.prototype.contains
	: __webpack_require__(40);


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var str = "razdwatrzy";

module.exports = function () {
	if (typeof str.contains !== "function") return false;
	return (str.contains("dwa") === true) && (str.contains("foo") === false);
};


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var indexOf = String.prototype.indexOf;

module.exports = function (searchString/*, position*/) {
	return indexOf.call(this, searchString, arguments[1]) > -1;
};


/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (fn) {
	if (typeof fn !== "function") throw new TypeError(fn + " is not a function");
	return fn;
};


/***/ }),
/* 42 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_42__;

/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _epubcfi = __webpack_require__(1);

var _epubcfi2 = _interopRequireDefault(_epubcfi);

var _hook = __webpack_require__(11);

var _hook2 = _interopRequireDefault(_hook);

var _section = __webpack_require__(44);

var _section2 = _interopRequireDefault(_section);

var _replacements = __webpack_require__(8);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * A collection of Spine Items
 */
var Spine = function () {
	function Spine() {
		_classCallCheck(this, Spine);

		this.spineItems = [];
		this.spineByHref = {};
		this.spineById = {};

		this.hooks = {};
		this.hooks.serialize = new _hook2.default();
		this.hooks.content = new _hook2.default();

		// Register replacements
		this.hooks.content.register(_replacements.replaceBase);
		this.hooks.content.register(_replacements.replaceCanonical);
		this.hooks.content.register(_replacements.replaceMeta);

		this.epubcfi = new _epubcfi2.default();

		this.loaded = false;

		this.items = undefined;
		this.manifest = undefined;
		this.spineNodeIndex = undefined;
		this.baseUrl = undefined;
		this.length = undefined;
	}

	/**
  * Unpack items from a opf into spine items
  * @param  {Packaging} _package
  * @param  {method} resolver URL resolver
  * @param  {method} canonical Resolve canonical url
  */


	_createClass(Spine, [{
		key: "unpack",
		value: function unpack(_package, resolver, canonical) {
			var _this = this;

			this.items = _package.spine;
			this.manifest = _package.manifest;
			this.spineNodeIndex = _package.spineNodeIndex;
			this.baseUrl = _package.baseUrl || _package.basePath || "";
			this.length = this.items.length;

			this.items.forEach(function (item, index) {
				var manifestItem = _this.manifest[item.idref];
				var spineItem;

				item.index = index;
				item.cfiBase = _this.epubcfi.generateChapterComponent(_this.spineNodeIndex, item.index, item.idref);

				if (item.href) {
					item.url = resolver(item.href, true);
					item.canonical = canonical(item.href);
				}

				if (manifestItem) {
					item.href = manifestItem.href;
					item.url = resolver(item.href, true);
					item.canonical = canonical(item.href);

					if (manifestItem.properties.length) {
						item.properties.push.apply(item.properties, manifestItem.properties);
					}
				}

				if (item.linear === "yes") {
					item.prev = function () {
						var prevIndex = item.index;
						while (prevIndex > 0) {
							var prev = this.get(prevIndex - 1);
							if (prev && prev.linear) {
								return prev;
							}
							prevIndex -= 1;
						}
						return;
					}.bind(_this);
					item.next = function () {
						var nextIndex = item.index;
						while (nextIndex < this.spineItems.length - 1) {
							var next = this.get(nextIndex + 1);
							if (next && next.linear) {
								return next;
							}
							nextIndex += 1;
						}
						return;
					}.bind(_this);
				} else {
					item.prev = function () {
						return;
					};
					item.next = function () {
						return;
					};
				}

				spineItem = new _section2.default(item, _this.hooks);

				_this.append(spineItem);
			});

			this.loaded = true;
		}

		/**
   * Get an item from the spine
   * @param  {string|number} [target]
   * @return {Section} section
   * @example spine.get();
   * @example spine.get(1);
   * @example spine.get("chap1.html");
   * @example spine.get("#id1234");
   */

	}, {
		key: "get",
		value: function get(target) {
			var index = 0;

			if (typeof target === "undefined") {
				while (index < this.spineItems.length) {
					var next = this.spineItems[index];
					if (next && next.linear) {
						break;
					}
					index += 1;
				}
			} else if (this.epubcfi.isCfiString(target)) {
				var cfi = new _epubcfi2.default(target);
				index = cfi.spinePos;
			} else if (typeof target === "number" || isNaN(target) === false) {
				index = target;
			} else if (typeof target === "string" && target.indexOf("#") === 0) {
				index = this.spineById[target.substring(1)];
			} else if (typeof target === "string") {
				// Remove fragments
				target = target.split("#")[0];
				index = this.spineByHref[target] || this.spineByHref[encodeURI(target)];
			}

			return this.spineItems[index] || null;
		}

		/**
   * Append a Section to the Spine
   * @private
   * @param  {Section} section
   */

	}, {
		key: "append",
		value: function append(section) {
			var index = this.spineItems.length;
			section.index = index;

			this.spineItems.push(section);

			// Encode and Decode href lookups
			// see pr for details: https://github.com/futurepress/epub.js/pull/358
			this.spineByHref[decodeURI(section.href)] = index;
			this.spineByHref[encodeURI(section.href)] = index;
			this.spineByHref[section.href] = index;

			this.spineById[section.idref] = index;

			return index;
		}

		/**
   * Prepend a Section to the Spine
   * @private
   * @param  {Section} section
   */

	}, {
		key: "prepend",
		value: function prepend(section) {
			// var index = this.spineItems.unshift(section);
			this.spineByHref[section.href] = 0;
			this.spineById[section.idref] = 0;

			// Re-index
			this.spineItems.forEach(function (item, index) {
				item.index = index;
			});

			return 0;
		}

		// insert(section, index) {
		//
		// };

		/**
   * Remove a Section from the Spine
   * @private
   * @param  {Section} section
   */

	}, {
		key: "remove",
		value: function remove(section) {
			var index = this.spineItems.indexOf(section);

			if (index > -1) {
				delete this.spineByHref[section.href];
				delete this.spineById[section.idref];

				return this.spineItems.splice(index, 1);
			}
		}

		/**
   * Loop over the Sections in the Spine
   * @return {method} forEach
   */

	}, {
		key: "each",
		value: function each() {
			return this.spineItems.forEach.apply(this.spineItems, arguments);
		}

		/**
   * Find the first Section in the Spine
   * @return {Section} first section
   */

	}, {
		key: "first",
		value: function first() {
			var index = 0;

			do {
				var next = this.get(index);

				if (next && next.linear) {
					return next;
				}
				index += 1;
			} while (index < this.spineItems.length);
		}

		/**
   * Find the last Section in the Spine
   * @return {Section} last section
   */

	}, {
		key: "last",
		value: function last() {
			var index = this.spineItems.length - 1;

			do {
				var prev = this.get(index);
				if (prev && prev.linear) {
					return prev;
				}
				index -= 1;
			} while (index >= 0);
		}
	}, {
		key: "destroy",
		value: function destroy() {
			this.each(function (section) {
				return section.destroy();
			});

			this.spineItems = undefined;
			this.spineByHref = undefined;
			this.spineById = undefined;

			this.hooks.serialize.clear();
			this.hooks.content.clear();
			this.hooks = undefined;

			this.epubcfi = undefined;

			this.loaded = false;

			this.items = undefined;
			this.manifest = undefined;
			this.spineNodeIndex = undefined;
			this.baseUrl = undefined;
			this.length = undefined;
		}
	}]);

	return Spine;
}();

exports.default = Spine;
module.exports = exports["default"];

/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _core = __webpack_require__(0);

var _epubcfi = __webpack_require__(1);

var _epubcfi2 = _interopRequireDefault(_epubcfi);

var _hook = __webpack_require__(11);

var _hook2 = _interopRequireDefault(_hook);

var _replacements = __webpack_require__(8);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Represents a Section of the Book
 *
 * In most books this is equivelent to a Chapter
 * @param {object} item  The spine item representing the section
 * @param {object} hooks hooks for serialize and content
 */
var Section = function () {
	function Section(item, hooks) {
		_classCallCheck(this, Section);

		this.idref = item.idref;
		this.linear = item.linear === "yes";
		this.properties = item.properties;
		this.index = item.index;
		this.href = item.href;
		this.url = item.url;
		this.canonical = item.canonical;
		this.next = item.next;
		this.prev = item.prev;

		this.cfiBase = item.cfiBase;

		if (hooks) {
			this.hooks = hooks;
		} else {
			this.hooks = {};
			this.hooks.serialize = new _hook2.default(this);
			this.hooks.content = new _hook2.default(this);
		}

		this.document = undefined;
		this.contents = undefined;
		this.output = undefined;
	}

	/**
  * Load the section from its url
  * @param  {method} [_request] a request method to use for loading
  * @return {document} a promise with the xml document
  */


	_createClass(Section, [{
		key: "load",
		value: function load(_request) {
			var request = _request || this.request || __webpack_require__(9);
			var loading = new _core.defer();
			var loaded = loading.promise;

			if (this.contents) {
				loading.resolve(this.contents);
			} else {
				request(this.url).then(function (xml) {
					// when the url has no extension, `request` won't parse it,
					// so we'll just have to parse it ourselves
					if (typeof xml === 'string') {
						const parser = new DOMParser();
						xml = parser.parseFromString(xml, 'text/html');
					}

					// var directory = new Url(this.url).directory;

					this.document = xml;
					this.contents = xml.documentElement;

					return this.hooks.content.trigger(this.document, this);
				}.bind(this)).then(function () {
					loading.resolve(this.contents);
				}.bind(this)).catch(function (error) {
					loading.reject(error);
				});
			}

			return loaded;
		}

		/**
   * Adds a base tag for resolving urls in the section
   * @private
   */

	}, {
		key: "base",
		value: function base() {
			return (0, _replacements.replaceBase)(this.document, this);
		}

		/**
   * Render the contents of a section
   * @param  {method} [_request] a request method to use for loading
   * @return {string} output a serialized XML Document
   */

	}, {
		key: "render",
		value: function render(_request) {
			var rendering = new _core.defer();
			var rendered = rendering.promise;
			this.output; // TODO: better way to return this from hooks?

			this.load(_request).then(function (contents) {
				var userAgent = typeof navigator !== 'undefined' && navigator.userAgent || '';
				var isIE = userAgent.indexOf('Trident') >= 0;
				var Serializer;
				if (typeof XMLSerializer === "undefined" || isIE) {
					Serializer = __webpack_require__(45).XMLSerializer;
				} else {
					Serializer = XMLSerializer;
				}
				var serializer = new Serializer();
				this.output = serializer.serializeToString(contents);
				return this.output;
			}.bind(this)).then(function () {
				return this.hooks.serialize.trigger(this.output, this);
			}.bind(this)).then(function () {
				rendering.resolve(this.output);
			}.bind(this)).catch(function (error) {
				rendering.reject(error);
			});

			return rendered;
		}

		/**
   * Find a string in a section
   * @param  {string} _query The query string to find
   * @return {object[]} A list of matches, with form {cfi, excerpt}
   */

	}, {
		key: "find",
		value: function find(_query) {
			var section = this;
			var matches = [];
			var query = _query.toLowerCase();
			var find = function find(node) {
				var text = node.textContent.toLowerCase();
				var range = section.document.createRange();
				var cfi;
				var pos;
				var last = -1;
				var excerpt;
				var limit = 150;

				while (pos != -1) {
					// Search for the query
					pos = text.indexOf(query, last + 1);

					if (pos != -1) {
						// We found it! Generate a CFI
						range = section.document.createRange();
						range.setStart(node, pos);
						range.setEnd(node, pos + query.length);

						cfi = section.cfiFromRange(range);

						// Generate the excerpt
						if (node.textContent.length < limit) {
							excerpt = node.textContent;
						} else {
							excerpt = node.textContent.substring(pos - limit / 2, pos + limit / 2);
							excerpt = "..." + excerpt + "...";
						}

						// Add the CFI to the matches list
						matches.push({
							cfi: cfi,
							excerpt: excerpt
						});
					}

					last = pos;
				}
			};

			(0, _core.sprint)(section.document, function (node) {
				find(node);
			});

			return matches;
		}
	}, {
		key: "search",


		/**
   * Search a string in multiple sequential Element of the section. If the document.createTreeWalker api is missed(eg: IE8), use `find` as a fallback.
   * @param  {string} _query The query string to search
   * @param  {int} maxSeqEle The maximum number of Element that are combined for search, defualt value is 5.
   * @return {object[]} A list of matches, with form {cfi, excerpt}
   */
		value: function search(_query) {
			var maxSeqEle = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;

			if (typeof document.createTreeWalker == "undefined") {
				return this.find(_query);
			}
			var matches = [];
			var excerptLimit = 150;
			var section = this;
			var query = _query.toLowerCase();
			var search = function search(nodeList) {
				var textWithCase = nodeList.reduce(function (acc, current) {
					return acc + current.textContent;
				}, "");
				var text = textWithCase.toLowerCase();
				var pos = text.indexOf(query);
				if (pos != -1) {
					var startNodeIndex = 0,
					    endPos = pos + query.length;
					var endNodeIndex = 0,
					    l = 0;
					if (pos < nodeList[startNodeIndex].length) {
						var cfi = void 0;
						while (endNodeIndex < nodeList.length - 1) {
							l += nodeList[endNodeIndex].length;
							if (endPos <= l) {
								break;
							}
							endNodeIndex += 1;
						}

						var startNode = nodeList[startNodeIndex],
						    endNode = nodeList[endNodeIndex];
						var range = section.document.createRange();
						range.setStart(startNode, pos);
						var beforeEndLengthCount = nodeList.slice(0, endNodeIndex).reduce(function (acc, current) {
							return acc + current.textContent.length;
						}, 0);
						range.setEnd(endNode, beforeEndLengthCount > endPos ? endPos : endPos - beforeEndLengthCount);
						cfi = section.cfiFromRange(range);

						var excerpt = nodeList.slice(0, endNodeIndex + 1).reduce(function (acc, current) {
							return acc + current.textContent;
						}, "");
						if (excerpt.length > excerptLimit) {
							excerpt = excerpt.substring(pos - excerptLimit / 2, pos + excerptLimit / 2);
							excerpt = "..." + excerpt + "...";
						}
						matches.push({
							cfi: cfi,
							excerpt: excerpt
						});
					}
				}
			};

			var treeWalker = document.createTreeWalker(section.document, NodeFilter.SHOW_TEXT, null, false);
			var node = void 0,
			    nodeList = [];
			while (node = treeWalker.nextNode()) {
				nodeList.push(node);
				if (nodeList.length == maxSeqEle) {
					search(nodeList.slice(0, maxSeqEle));
					nodeList = nodeList.slice(1, maxSeqEle);
				}
			}
			if (nodeList.length > 0) {
				search(nodeList);
			}
			return matches;
		}

		/**
  * Reconciles the current chapters layout properies with
  * the global layout properities.
  * @param {object} globalLayout  The global layout settings object, chapter properties string
  * @return {object} layoutProperties Object with layout properties
  */

	}, {
		key: "reconcileLayoutSettings",
		value: function reconcileLayoutSettings(globalLayout) {
			//-- Get the global defaults
			var settings = {
				layout: globalLayout.layout,
				spread: globalLayout.spread,
				orientation: globalLayout.orientation
			};

			//-- Get the chapter's display type
			this.properties.forEach(function (prop) {
				var rendition = prop.replace("rendition:", "");
				var split = rendition.indexOf("-");
				var property, value;

				if (split != -1) {
					property = rendition.slice(0, split);
					value = rendition.slice(split + 1);

					settings[property] = value;
				}
			});
			return settings;
		}

		/**
   * Get a CFI from a Range in the Section
   * @param  {range} _range
   * @return {string} cfi an EpubCFI string
   */

	}, {
		key: "cfiFromRange",
		value: function cfiFromRange(_range) {
			return new _epubcfi2.default(_range, this.cfiBase).toString();
		}

		/**
   * Get a CFI from an Element in the Section
   * @param  {element} el
   * @return {string} cfi an EpubCFI string
   */

	}, {
		key: "cfiFromElement",
		value: function cfiFromElement(el) {
			return new _epubcfi2.default(el, this.cfiBase).toString();
		}

		/**
   * Unload the section document
   */

	}, {
		key: "unload",
		value: function unload() {
			this.document = undefined;
			this.contents = undefined;
			this.output = undefined;
		}
	}, {
		key: "destroy",
		value: function destroy() {
			this.unload();
			this.hooks.serialize.clear();
			this.hooks.content.clear();

			this.hooks = undefined;
			this.idref = undefined;
			this.linear = undefined;
			this.properties = undefined;
			this.index = undefined;
			this.href = undefined;
			this.url = undefined;
			this.next = undefined;
			this.prev = undefined;

			this.cfiBase = undefined;
		}
	}]);

	return Section;
}();

exports.default = Section;
module.exports = exports["default"];

/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

function DOMParser(options){
	this.options = options ||{locator:{}};
	
}
DOMParser.prototype.parseFromString = function(source,mimeType){
	var options = this.options;
	var sax =  new XMLReader();
	var domBuilder = options.domBuilder || new DOMHandler();//contentHandler and LexicalHandler
	var errorHandler = options.errorHandler;
	var locator = options.locator;
	var defaultNSMap = options.xmlns||{};
	var entityMap = {'lt':'<','gt':'>','amp':'&','quot':'"','apos':"'"}
	if(locator){
		domBuilder.setDocumentLocator(locator)
	}
	
	sax.errorHandler = buildErrorHandler(errorHandler,domBuilder,locator);
	sax.domBuilder = options.domBuilder || domBuilder;
	if(/\/x?html?$/.test(mimeType)){
		entityMap.nbsp = '\xa0';
		entityMap.copy = '\xa9';
		defaultNSMap['']= 'http://www.w3.org/1999/xhtml';
	}
	defaultNSMap.xml = defaultNSMap.xml || 'http://www.w3.org/XML/1998/namespace';
	if(source){
		sax.parse(source,defaultNSMap,entityMap);
	}else{
		sax.errorHandler.error("invalid doc source");
	}
	return domBuilder.doc;
}
function buildErrorHandler(errorImpl,domBuilder,locator){
	if(!errorImpl){
		if(domBuilder instanceof DOMHandler){
			return domBuilder;
		}
		errorImpl = domBuilder ;
	}
	var errorHandler = {}
	var isCallback = errorImpl instanceof Function;
	locator = locator||{}
	function build(key){
		var fn = errorImpl[key];
		if(!fn && isCallback){
			fn = errorImpl.length == 2?function(msg){errorImpl(key,msg)}:errorImpl;
		}
		errorHandler[key] = fn && function(msg){
			fn('[xmldom '+key+']\t'+msg+_locator(locator));
		}||function(){};
	}
	build('warning');
	build('error');
	build('fatalError');
	return errorHandler;
}

//console.log('#\n\n\n\n\n\n\n####')
/**
 * +ContentHandler+ErrorHandler
 * +LexicalHandler+EntityResolver2
 * -DeclHandler-DTDHandler 
 * 
 * DefaultHandler:EntityResolver, DTDHandler, ContentHandler, ErrorHandler
 * DefaultHandler2:DefaultHandler,LexicalHandler, DeclHandler, EntityResolver2
 * @link http://www.saxproject.org/apidoc/org/xml/sax/helpers/DefaultHandler.html
 */
function DOMHandler() {
    this.cdata = false;
}
function position(locator,node){
	node.lineNumber = locator.lineNumber;
	node.columnNumber = locator.columnNumber;
}
/**
 * @see org.xml.sax.ContentHandler#startDocument
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html
 */ 
DOMHandler.prototype = {
	startDocument : function() {
    	this.doc = new DOMImplementation().createDocument(null, null, null);
    	if (this.locator) {
        	this.doc.documentURI = this.locator.systemId;
    	}
	},
	startElement:function(namespaceURI, localName, qName, attrs) {
		var doc = this.doc;
	    var el = doc.createElementNS(namespaceURI, qName||localName);
	    var len = attrs.length;
	    appendElement(this, el);
	    this.currentElement = el;
	    
		this.locator && position(this.locator,el)
	    for (var i = 0 ; i < len; i++) {
	        var namespaceURI = attrs.getURI(i);
	        var value = attrs.getValue(i);
	        var qName = attrs.getQName(i);
			var attr = doc.createAttributeNS(namespaceURI, qName);
			this.locator &&position(attrs.getLocator(i),attr);
			attr.value = attr.nodeValue = value;
			el.setAttributeNode(attr)
	    }
	},
	endElement:function(namespaceURI, localName, qName) {
		var current = this.currentElement
		var tagName = current.tagName;
		this.currentElement = current.parentNode;
	},
	startPrefixMapping:function(prefix, uri) {
	},
	endPrefixMapping:function(prefix) {
	},
	processingInstruction:function(target, data) {
	    var ins = this.doc.createProcessingInstruction(target, data);
	    this.locator && position(this.locator,ins)
	    appendElement(this, ins);
	},
	ignorableWhitespace:function(ch, start, length) {
	},
	characters:function(chars, start, length) {
		chars = _toString.apply(this,arguments)
		//console.log(chars)
		if(chars){
			if (this.cdata) {
				var charNode = this.doc.createCDATASection(chars);
			} else {
				var charNode = this.doc.createTextNode(chars);
			}
			if(this.currentElement){
				this.currentElement.appendChild(charNode);
			}else if(/^\s*$/.test(chars)){
				this.doc.appendChild(charNode);
				//process xml
			}
			this.locator && position(this.locator,charNode)
		}
	},
	skippedEntity:function(name) {
	},
	endDocument:function() {
		this.doc.normalize();
	},
	setDocumentLocator:function (locator) {
	    if(this.locator = locator){// && !('lineNumber' in locator)){
	    	locator.lineNumber = 0;
	    }
	},
	//LexicalHandler
	comment:function(chars, start, length) {
		chars = _toString.apply(this,arguments)
	    var comm = this.doc.createComment(chars);
	    this.locator && position(this.locator,comm)
	    appendElement(this, comm);
	},
	
	startCDATA:function() {
	    //used in characters() methods
	    this.cdata = true;
	},
	endCDATA:function() {
	    this.cdata = false;
	},
	
	startDTD:function(name, publicId, systemId) {
		var impl = this.doc.implementation;
	    if (impl && impl.createDocumentType) {
	        var dt = impl.createDocumentType(name, publicId, systemId);
	        this.locator && position(this.locator,dt)
	        appendElement(this, dt);
	    }
	},
	/**
	 * @see org.xml.sax.ErrorHandler
	 * @link http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
	 */
	warning:function(error) {
		console.warn('[xmldom warning]\t'+error,_locator(this.locator));
	},
	error:function(error) {
		console.error('[xmldom error]\t'+error,_locator(this.locator));
	},
	fatalError:function(error) {
		console.error('[xmldom fatalError]\t'+error,_locator(this.locator));
	    throw error;
	}
}
function _locator(l){
	if(l){
		return '\n@'+(l.systemId ||'')+'#[line:'+l.lineNumber+',col:'+l.columnNumber+']'
	}
}
function _toString(chars,start,length){
	if(typeof chars == 'string'){
		return chars.substr(start,length)
	}else{//java sax connect width xmldom on rhino(what about: "? && !(chars instanceof String)")
		if(chars.length >= start+length || start){
			return new java.lang.String(chars,start,length)+'';
		}
		return chars;
	}
}

/*
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/LexicalHandler.html
 * used method of org.xml.sax.ext.LexicalHandler:
 *  #comment(chars, start, length)
 *  #startCDATA()
 *  #endCDATA()
 *  #startDTD(name, publicId, systemId)
 *
 *
 * IGNORED method of org.xml.sax.ext.LexicalHandler:
 *  #endDTD()
 *  #startEntity(name)
 *  #endEntity(name)
 *
 *
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/DeclHandler.html
 * IGNORED method of org.xml.sax.ext.DeclHandler
 * 	#attributeDecl(eName, aName, type, mode, value)
 *  #elementDecl(name, model)
 *  #externalEntityDecl(name, publicId, systemId)
 *  #internalEntityDecl(name, value)
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/EntityResolver2.html
 * IGNORED method of org.xml.sax.EntityResolver2
 *  #resolveEntity(String name,String publicId,String baseURI,String systemId)
 *  #resolveEntity(publicId, systemId)
 *  #getExternalSubset(name, baseURI)
 * @link http://www.saxproject.org/apidoc/org/xml/sax/DTDHandler.html
 * IGNORED method of org.xml.sax.DTDHandler
 *  #notationDecl(name, publicId, systemId) {};
 *  #unparsedEntityDecl(name, publicId, systemId, notationName) {};
 */
"endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(/\w+/g,function(key){
	DOMHandler.prototype[key] = function(){return null}
})

/* Private static helpers treated below as private instance methods, so don't need to add these to the public API; we might use a Relator to also get rid of non-standard public properties */
function appendElement (hander,node) {
    if (!hander.currentElement) {
        hander.doc.appendChild(node);
    } else {
        hander.currentElement.appendChild(node);
    }
}//appendChild and setAttributeNS are preformance key

//if(typeof require == 'function'){
	var XMLReader = __webpack_require__(46).XMLReader;
	var DOMImplementation = exports.DOMImplementation = __webpack_require__(17).DOMImplementation;
	exports.XMLSerializer = __webpack_require__(17).XMLSerializer ;
	exports.DOMParser = DOMParser;
//}


/***/ }),
/* 46 */
/***/ (function(module, exports) {

//[4]   	NameStartChar	   ::=   	":" | [A-Z] | "_" | [a-z] | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x2FF] | [#x370-#x37D] | [#x37F-#x1FFF] | [#x200C-#x200D] | [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
//[4a]   	NameChar	   ::=   	NameStartChar | "-" | "." | [0-9] | #xB7 | [#x0300-#x036F] | [#x203F-#x2040]
//[5]   	Name	   ::=   	NameStartChar (NameChar)*
var nameStartChar = /[A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]///\u10000-\uEFFFF
var nameChar = new RegExp("[\\-\\.0-9"+nameStartChar.source.slice(1,-1)+"\\u00B7\\u0300-\\u036F\\u203F-\\u2040]");
var tagNamePattern = new RegExp('^'+nameStartChar.source+nameChar.source+'*(?:\:'+nameStartChar.source+nameChar.source+'*)?$');
//var tagNamePattern = /^[a-zA-Z_][\w\-\.]*(?:\:[a-zA-Z_][\w\-\.]*)?$/
//var handlers = 'resolveEntity,getExternalSubset,characters,endDocument,endElement,endPrefixMapping,ignorableWhitespace,processingInstruction,setDocumentLocator,skippedEntity,startDocument,startElement,startPrefixMapping,notationDecl,unparsedEntityDecl,error,fatalError,warning,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,comment,endCDATA,endDTD,endEntity,startCDATA,startDTD,startEntity'.split(',')

//S_TAG,	S_ATTR,	S_EQ,	S_ATTR_NOQUOT_VALUE
//S_ATTR_SPACE,	S_ATTR_END,	S_TAG_SPACE, S_TAG_CLOSE
var S_TAG = 0;//tag name offerring
var S_ATTR = 1;//attr name offerring 
var S_ATTR_SPACE=2;//attr name end and space offer
var S_EQ = 3;//=space?
var S_ATTR_NOQUOT_VALUE = 4;//attr value(no quot value only)
var S_ATTR_END = 5;//attr value end and no space(quot end)
var S_TAG_SPACE = 6;//(attr value end || tag end ) && (space offer)
var S_TAG_CLOSE = 7;//closed el<el />

function XMLReader(){
	
}

XMLReader.prototype = {
	parse:function(source,defaultNSMap,entityMap){
		var domBuilder = this.domBuilder;
		domBuilder.startDocument();
		_copy(defaultNSMap ,defaultNSMap = {})
		parse(source,defaultNSMap,entityMap,
				domBuilder,this.errorHandler);
		domBuilder.endDocument();
	}
}
function parse(source,defaultNSMapCopy,entityMap,domBuilder,errorHandler){
	function fixedFromCharCode(code) {
		// String.prototype.fromCharCode does not supports
		// > 2 bytes unicode chars directly
		if (code > 0xffff) {
			code -= 0x10000;
			var surrogate1 = 0xd800 + (code >> 10)
				, surrogate2 = 0xdc00 + (code & 0x3ff);

			return String.fromCharCode(surrogate1, surrogate2);
		} else {
			return String.fromCharCode(code);
		}
	}
	function entityReplacer(a){
		var k = a.slice(1,-1);
		if(k in entityMap){
			return entityMap[k]; 
		}else if(k.charAt(0) === '#'){
			return fixedFromCharCode(parseInt(k.substr(1).replace('x','0x')))
		}else{
			errorHandler.error('entity not found:'+a);
			return a;
		}
	}
	function appendText(end){//has some bugs
		if(end>start){
			var xt = source.substring(start,end).replace(/&#?\w+;/g,entityReplacer);
			locator&&position(start);
			domBuilder.characters(xt,0,end-start);
			start = end
		}
	}
	function position(p,m){
		while(p>=lineEnd && (m = linePattern.exec(source))){
			lineStart = m.index;
			lineEnd = lineStart + m[0].length;
			locator.lineNumber++;
			//console.log('line++:',locator,startPos,endPos)
		}
		locator.columnNumber = p-lineStart+1;
	}
	var lineStart = 0;
	var lineEnd = 0;
	var linePattern = /.*(?:\r\n?|\n)|.*$/g
	var locator = domBuilder.locator;
	
	var parseStack = [{currentNSMap:defaultNSMapCopy}]
	var closeMap = {};
	var start = 0;
	while(true){
		try{
			var tagStart = source.indexOf('<',start);
			if(tagStart<0){
				if(!source.substr(start).match(/^\s*$/)){
					var doc = domBuilder.doc;
	    			var text = doc.createTextNode(source.substr(start));
	    			doc.appendChild(text);
	    			domBuilder.currentElement = text;
				}
				return;
			}
			if(tagStart>start){
				appendText(tagStart);
			}
			switch(source.charAt(tagStart+1)){
			case '/':
				var end = source.indexOf('>',tagStart+3);
				var tagName = source.substring(tagStart+2,end);
				var config = parseStack.pop();
				if(end<0){
					
	        		tagName = source.substring(tagStart+2).replace(/[\s<].*/,'');
	        		//console.error('#@@@@@@'+tagName)
	        		errorHandler.error("end tag name: "+tagName+' is not complete:'+config.tagName);
	        		end = tagStart+1+tagName.length;
	        	}else if(tagName.match(/\s</)){
	        		tagName = tagName.replace(/[\s<].*/,'');
	        		errorHandler.error("end tag name: "+tagName+' maybe not complete');
	        		end = tagStart+1+tagName.length;
				}
				//console.error(parseStack.length,parseStack)
				//console.error(config);
				var localNSMap = config.localNSMap;
				var endMatch = config.tagName == tagName;
				var endIgnoreCaseMach = endMatch || config.tagName&&config.tagName.toLowerCase() == tagName.toLowerCase()
		        if(endIgnoreCaseMach){
		        	domBuilder.endElement(config.uri,config.localName,tagName);
					if(localNSMap){
						for(var prefix in localNSMap){
							domBuilder.endPrefixMapping(prefix) ;
						}
					}
					if(!endMatch){
		            	errorHandler.fatalError("end tag name: "+tagName+' is not match the current start tagName:'+config.tagName );
					}
		        }else{
		        	parseStack.push(config)
		        }
				
				end++;
				break;
				// end elment
			case '?':// <?...?>
				locator&&position(tagStart);
				end = parseInstruction(source,tagStart,domBuilder);
				break;
			case '!':// <!doctype,<![CDATA,<!--
				locator&&position(tagStart);
				end = parseDCC(source,tagStart,domBuilder,errorHandler);
				break;
			default:
				locator&&position(tagStart);
				var el = new ElementAttributes();
				var currentNSMap = parseStack[parseStack.length-1].currentNSMap;
				//elStartEnd
				var end = parseElementStartPart(source,tagStart,el,currentNSMap,entityReplacer,errorHandler);
				var len = el.length;
				
				
				if(!el.closed && fixSelfClosed(source,end,el.tagName,closeMap)){
					el.closed = true;
					if(!entityMap.nbsp){
						errorHandler.warning('unclosed xml attribute');
					}
				}
				if(locator && len){
					var locator2 = copyLocator(locator,{});
					//try{//attribute position fixed
					for(var i = 0;i<len;i++){
						var a = el[i];
						position(a.offset);
						a.locator = copyLocator(locator,{});
					}
					//}catch(e){console.error('@@@@@'+e)}
					domBuilder.locator = locator2
					if(appendElement(el,domBuilder,currentNSMap)){
						parseStack.push(el)
					}
					domBuilder.locator = locator;
				}else{
					if(appendElement(el,domBuilder,currentNSMap)){
						parseStack.push(el)
					}
				}
				
				
				
				if(el.uri === 'http://www.w3.org/1999/xhtml' && !el.closed){
					end = parseHtmlSpecialContent(source,end,el.tagName,entityReplacer,domBuilder)
				}else{
					end++;
				}
			}
		}catch(e){
			errorHandler.error('element parse error: '+e)
			//errorHandler.error('element parse error: '+e);
			end = -1;
			//throw e;
		}
		if(end>start){
			start = end;
		}else{
			//TODO: 这里有可能sax回退，有位置错误风险
			appendText(Math.max(tagStart,start)+1);
		}
	}
}
function copyLocator(f,t){
	t.lineNumber = f.lineNumber;
	t.columnNumber = f.columnNumber;
	return t;
}

/**
 * @see #appendElement(source,elStartEnd,el,selfClosed,entityReplacer,domBuilder,parseStack);
 * @return end of the elementStartPart(end of elementEndPart for selfClosed el)
 */
function parseElementStartPart(source,start,el,currentNSMap,entityReplacer,errorHandler){
	var attrName;
	var value;
	var p = ++start;
	var s = S_TAG;//status
	while(true){
		var c = source.charAt(p);
		switch(c){
		case '=':
			if(s === S_ATTR){//attrName
				attrName = source.slice(start,p);
				s = S_EQ;
			}else if(s === S_ATTR_SPACE){
				s = S_EQ;
			}else{
				//fatalError: equal must after attrName or space after attrName
				throw new Error('attribute equal must after attrName');
			}
			break;
		case '\'':
		case '"':
			if(s === S_EQ || s === S_ATTR //|| s == S_ATTR_SPACE
				){//equal
				if(s === S_ATTR){
					errorHandler.warning('attribute value must after "="')
					attrName = source.slice(start,p)
				}
				start = p+1;
				p = source.indexOf(c,start)
				if(p>0){
					value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
					el.add(attrName,value,start-1);
					s = S_ATTR_END;
				}else{
					//fatalError: no end quot match
					throw new Error('attribute value no end \''+c+'\' match');
				}
			}else if(s == S_ATTR_NOQUOT_VALUE){
				value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
				//console.log(attrName,value,start,p)
				el.add(attrName,value,start);
				//console.dir(el)
				errorHandler.warning('attribute "'+attrName+'" missed start quot('+c+')!!');
				start = p+1;
				s = S_ATTR_END
			}else{
				//fatalError: no equal before
				throw new Error('attribute value must after "="');
			}
			break;
		case '/':
			switch(s){
			case S_TAG:
				el.setTagName(source.slice(start,p));
			case S_ATTR_END:
			case S_TAG_SPACE:
			case S_TAG_CLOSE:
				s =S_TAG_CLOSE;
				el.closed = true;
			case S_ATTR_NOQUOT_VALUE:
			case S_ATTR:
			case S_ATTR_SPACE:
				break;
			//case S_EQ:
			default:
				throw new Error("attribute invalid close char('/')")
			}
			break;
		case ''://end document
			//throw new Error('unexpected end of input')
			errorHandler.error('unexpected end of input');
			if(s == S_TAG){
				el.setTagName(source.slice(start,p));
			}
			return p;
		case '>':
			switch(s){
			case S_TAG:
				el.setTagName(source.slice(start,p));
			case S_ATTR_END:
			case S_TAG_SPACE:
			case S_TAG_CLOSE:
				break;//normal
			case S_ATTR_NOQUOT_VALUE://Compatible state
			case S_ATTR:
				value = source.slice(start,p);
				if(value.slice(-1) === '/'){
					el.closed  = true;
					value = value.slice(0,-1)
				}
			case S_ATTR_SPACE:
				if(s === S_ATTR_SPACE){
					value = attrName;
				}
				if(s == S_ATTR_NOQUOT_VALUE){
					errorHandler.warning('attribute "'+value+'" missed quot(")!!');
					el.add(attrName,value.replace(/&#?\w+;/g,entityReplacer),start)
				}else{
					if(currentNSMap[''] !== 'http://www.w3.org/1999/xhtml' || !value.match(/^(?:disabled|checked|selected)$/i)){
						errorHandler.warning('attribute "'+value+'" missed value!! "'+value+'" instead!!')
					}
					el.add(value,value,start)
				}
				break;
			case S_EQ:
				throw new Error('attribute value missed!!');
			}
//			console.log(tagName,tagNamePattern,tagNamePattern.test(tagName))
			return p;
		/*xml space '\x20' | #x9 | #xD | #xA; */
		case '\u0080':
			c = ' ';
		default:
			if(c<= ' '){//space
				switch(s){
				case S_TAG:
					el.setTagName(source.slice(start,p));//tagName
					s = S_TAG_SPACE;
					break;
				case S_ATTR:
					attrName = source.slice(start,p)
					s = S_ATTR_SPACE;
					break;
				case S_ATTR_NOQUOT_VALUE:
					var value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
					errorHandler.warning('attribute "'+value+'" missed quot(")!!');
					el.add(attrName,value,start)
				case S_ATTR_END:
					s = S_TAG_SPACE;
					break;
				//case S_TAG_SPACE:
				//case S_EQ:
				//case S_ATTR_SPACE:
				//	void();break;
				//case S_TAG_CLOSE:
					//ignore warning
				}
			}else{//not space
//S_TAG,	S_ATTR,	S_EQ,	S_ATTR_NOQUOT_VALUE
//S_ATTR_SPACE,	S_ATTR_END,	S_TAG_SPACE, S_TAG_CLOSE
				switch(s){
				//case S_TAG:void();break;
				//case S_ATTR:void();break;
				//case S_ATTR_NOQUOT_VALUE:void();break;
				case S_ATTR_SPACE:
					var tagName =  el.tagName;
					if(currentNSMap[''] !== 'http://www.w3.org/1999/xhtml' || !attrName.match(/^(?:disabled|checked|selected)$/i)){
						errorHandler.warning('attribute "'+attrName+'" missed value!! "'+attrName+'" instead2!!')
					}
					el.add(attrName,attrName,start);
					start = p;
					s = S_ATTR;
					break;
				case S_ATTR_END:
					errorHandler.warning('attribute space is required"'+attrName+'"!!')
				case S_TAG_SPACE:
					s = S_ATTR;
					start = p;
					break;
				case S_EQ:
					s = S_ATTR_NOQUOT_VALUE;
					start = p;
					break;
				case S_TAG_CLOSE:
					throw new Error("elements closed character '/' and '>' must be connected to");
				}
			}
		}//end outer switch
		//console.log('p++',p)
		p++;
	}
}
/**
 * @return true if has new namespace define
 */
function appendElement(el,domBuilder,currentNSMap){
	var tagName = el.tagName;
	var localNSMap = null;
	//var currentNSMap = parseStack[parseStack.length-1].currentNSMap;
	var i = el.length;
	while(i--){
		var a = el[i];
		var qName = a.qName;
		var value = a.value;
		var nsp = qName.indexOf(':');
		if(nsp>0){
			var prefix = a.prefix = qName.slice(0,nsp);
			var localName = qName.slice(nsp+1);
			var nsPrefix = prefix === 'xmlns' && localName
		}else{
			localName = qName;
			prefix = null
			nsPrefix = qName === 'xmlns' && ''
		}
		//can not set prefix,because prefix !== ''
		a.localName = localName ;
		//prefix == null for no ns prefix attribute 
		if(nsPrefix !== false){//hack!!
			if(localNSMap == null){
				localNSMap = {}
				//console.log(currentNSMap,0)
				_copy(currentNSMap,currentNSMap={})
				//console.log(currentNSMap,1)
			}
			currentNSMap[nsPrefix] = localNSMap[nsPrefix] = value;
			a.uri = 'http://www.w3.org/2000/xmlns/'
			domBuilder.startPrefixMapping(nsPrefix, value) 
		}
	}
	var i = el.length;
	while(i--){
		a = el[i];
		var prefix = a.prefix;
		if(prefix){//no prefix attribute has no namespace
			if(prefix === 'xml'){
				a.uri = 'http://www.w3.org/XML/1998/namespace';
			}if(prefix !== 'xmlns'){
				a.uri = currentNSMap[prefix || '']
				
				//{console.log('###'+a.qName,domBuilder.locator.systemId+'',currentNSMap,a.uri)}
			}
		}
	}
	var nsp = tagName.indexOf(':');
	if(nsp>0){
		prefix = el.prefix = tagName.slice(0,nsp);
		localName = el.localName = tagName.slice(nsp+1);
	}else{
		prefix = null;//important!!
		localName = el.localName = tagName;
	}
	//no prefix element has default namespace
	var ns = el.uri = currentNSMap[prefix || ''];
	domBuilder.startElement(ns,localName,tagName,el);
	//endPrefixMapping and startPrefixMapping have not any help for dom builder
	//localNSMap = null
	if(el.closed){
		domBuilder.endElement(ns,localName,tagName);
		if(localNSMap){
			for(prefix in localNSMap){
				domBuilder.endPrefixMapping(prefix) 
			}
		}
	}else{
		el.currentNSMap = currentNSMap;
		el.localNSMap = localNSMap;
		//parseStack.push(el);
		return true;
	}
}
function parseHtmlSpecialContent(source,elStartEnd,tagName,entityReplacer,domBuilder){
	if(/^(?:script|textarea)$/i.test(tagName)){
		var elEndStart =  source.indexOf('</'+tagName+'>',elStartEnd);
		var text = source.substring(elStartEnd+1,elEndStart);
		if(/[&<]/.test(text)){
			if(/^script$/i.test(tagName)){
				//if(!/\]\]>/.test(text)){
					//lexHandler.startCDATA();
					domBuilder.characters(text,0,text.length);
					//lexHandler.endCDATA();
					return elEndStart;
				//}
			}//}else{//text area
				text = text.replace(/&#?\w+;/g,entityReplacer);
				domBuilder.characters(text,0,text.length);
				return elEndStart;
			//}
			
		}
	}
	return elStartEnd+1;
}
function fixSelfClosed(source,elStartEnd,tagName,closeMap){
	//if(tagName in closeMap){
	var pos = closeMap[tagName];
	if(pos == null){
		//console.log(tagName)
		pos =  source.lastIndexOf('</'+tagName+'>')
		if(pos<elStartEnd){//忘记闭合
			pos = source.lastIndexOf('</'+tagName)
		}
		closeMap[tagName] =pos
	}
	return pos<elStartEnd;
	//} 
}
function _copy(source,target){
	for(var n in source){target[n] = source[n]}
}
function parseDCC(source,start,domBuilder,errorHandler){//sure start with '<!'
	var next= source.charAt(start+2)
	switch(next){
	case '-':
		if(source.charAt(start + 3) === '-'){
			var end = source.indexOf('-->',start+4);
			//append comment source.substring(4,end)//<!--
			if(end>start){
				domBuilder.comment(source,start+4,end-start-4);
				return end+3;
			}else{
				errorHandler.error("Unclosed comment");
				return -1;
			}
		}else{
			//error
			return -1;
		}
	default:
		if(source.substr(start+3,6) == 'CDATA['){
			var end = source.indexOf(']]>',start+9);
			domBuilder.startCDATA();
			domBuilder.characters(source,start+9,end-start-9);
			domBuilder.endCDATA() 
			return end+3;
		}
		//<!DOCTYPE
		//startDTD(java.lang.String name, java.lang.String publicId, java.lang.String systemId) 
		var matchs = split(source,start);
		var len = matchs.length;
		if(len>1 && /!doctype/i.test(matchs[0][0])){
			var name = matchs[1][0];
			var pubid = len>3 && /^public$/i.test(matchs[2][0]) && matchs[3][0]
			var sysid = len>4 && matchs[4][0];
			var lastMatch = matchs[len-1]
			domBuilder.startDTD(name,pubid && pubid.replace(/^(['"])(.*?)\1$/,'$2'),
					sysid && sysid.replace(/^(['"])(.*?)\1$/,'$2'));
			domBuilder.endDTD();
			
			return lastMatch.index+lastMatch[0].length
		}
	}
	return -1;
}



function parseInstruction(source,start,domBuilder){
	var end = source.indexOf('?>',start);
	if(end){
		var match = source.substring(start,end).match(/^<\?(\S*)\s*([\s\S]*?)\s*$/);
		if(match){
			var len = match[0].length;
			domBuilder.processingInstruction(match[1], match[2]) ;
			return end+2;
		}else{//error
			return -1;
		}
	}
	return -1;
}

/**
 * @param source
 */
function ElementAttributes(source){
	
}
ElementAttributes.prototype = {
	setTagName:function(tagName){
		if(!tagNamePattern.test(tagName)){
			throw new Error('invalid tagName:'+tagName)
		}
		this.tagName = tagName
	},
	add:function(qName,value,offset){
		if(!tagNamePattern.test(qName)){
			throw new Error('invalid attribute:'+qName)
		}
		this[this.length++] = {qName:qName,value:value,offset:offset}
	},
	length:0,
	getLocalName:function(i){return this[i].localName},
	getLocator:function(i){return this[i].locator},
	getQName:function(i){return this[i].qName},
	getURI:function(i){return this[i].uri},
	getValue:function(i){return this[i].value}
//	,getIndex:function(uri, localName)){
//		if(localName){
//			
//		}else{
//			var qName = uri
//		}
//	},
//	getValue:function(){return this.getValue(this.getIndex.apply(this,arguments))},
//	getType:function(uri,localName){}
//	getType:function(i){},
}




function _set_proto_(thiz,parent){
	thiz.__proto__ = parent;
	return thiz;
}
if(!(_set_proto_({},_set_proto_.prototype) instanceof _set_proto_)){
	_set_proto_ = function(thiz,parent){
		function p(){};
		p.prototype = parent;
		p = new p();
		for(parent in thiz){
			p[parent] = thiz[parent];
		}
		return p;
	}
}

function split(source,start){
	var match;
	var buf = [];
	var reg = /'[^']+'|"[^"]+"|[^\s<>\/=]+=?|(\/?\s*>|<)/g;
	reg.lastIndex = start;
	reg.exec(source);//skip <
	while(match = reg.exec(source)){
		buf.push(match);
		if(match[1])return buf;
	}
}

exports.XMLReader = XMLReader;



/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _core = __webpack_require__(0);

var _queue = __webpack_require__(12);

var _queue2 = _interopRequireDefault(_queue);

var _epubcfi = __webpack_require__(1);

var _epubcfi2 = _interopRequireDefault(_epubcfi);

var _constants = __webpack_require__(2);

var _eventEmitter = __webpack_require__(3);

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Find Locations for a Book
 * @param {Spine} spine
 * @param {request} request
 * @param {number} [pause=100]
 */
var Locations = function () {
	function Locations(spine, request, pause) {
		_classCallCheck(this, Locations);

		this.spine = spine;
		this.request = request;
		this.pause = pause || 100;

		this.q = new _queue2.default(this);
		this.epubcfi = new _epubcfi2.default();

		this._locations = [];
		this._locationsWords = [];
		this.total = 0;

		this.break = 150;

		this._current = 0;

		this._wordCounter = 0;

		this.currentLocation = '';
		this._currentCfi = '';
		this.processingTimeout = undefined;
	}

	/**
  * Load all of sections in the book to generate locations
  * @param  {int} chars how many chars to split on
  * @return {object} locations
  */


	_createClass(Locations, [{
		key: "generate",
		value: function generate(chars) {

			if (chars) {
				this.break = chars;
			}

			this.q.pause();

			this.spine.each(function (section) {
				if (section.linear) {
					this.q.enqueue(this.process.bind(this), section);
				}
			}.bind(this));

			return this.q.run().then(function () {
				this.total = this._locations.length - 1;

				if (this._currentCfi) {
					this.currentLocation = this._currentCfi;
				}

				return this._locations;
				// console.log(this.percentage(this.book.rendition.location.start), this.percentage(this.book.rendition.location.end));
			}.bind(this));
		}
	}, {
		key: "createRange",
		value: function createRange() {
			return {
				startContainer: undefined,
				startOffset: undefined,
				endContainer: undefined,
				endOffset: undefined
			};
		}
	}, {
		key: "process",
		value: function process(section) {

			return section.load(this.request).then(function (contents) {
				var completed = new _core.defer();
				var locations = this.parse(contents, section.cfiBase);
				this._locations = this._locations.concat(locations);

				section.unload();

				this.processingTimeout = setTimeout(function () {
					return completed.resolve(locations);
				}, this.pause);
				return completed.promise;
			}.bind(this));
		}
	}, {
		key: "parse",
		value: function parse(contents, cfiBase, chars) {
			var locations = [];
			var range;
			var doc = contents.ownerDocument;
			var body = (0, _core.qs)(doc, "body");
			var counter = 0;
			var prev;
			var _break = chars || this.break;
			var parser = function parser(node) {
				var len = node.length;
				var dist;
				var pos = 0;

				if (node.textContent.trim().length === 0) {
					return false; // continue
				}

				// Start range
				if (counter == 0) {
					range = this.createRange();
					range.startContainer = node;
					range.startOffset = 0;
				}

				dist = _break - counter;

				// Node is smaller than a break,
				// skip over it
				if (dist > len) {
					counter += len;
					pos = len;
				}

				while (pos < len) {
					dist = _break - counter;

					if (counter === 0) {
						// Start new range
						pos += 1;
						range = this.createRange();
						range.startContainer = node;
						range.startOffset = pos;
					}

					// pos += dist;

					// Gone over
					if (pos + dist >= len) {
						// Continue counter for next node
						counter += len - pos;
						// break
						pos = len;
						// At End
					} else {
						// Advance pos
						pos += dist;

						// End the previous range
						range.endContainer = node;
						range.endOffset = pos;
						// cfi = section.cfiFromRange(range);
						var cfi = new _epubcfi2.default(range, cfiBase).toString();
						locations.push(cfi);
						counter = 0;
					}
				}
				prev = node;
			};

			(0, _core.sprint)(body, parser.bind(this));

			// Close remaining
			if (range && range.startContainer && prev) {
				range.endContainer = prev;
				range.endOffset = prev.length;
				var cfi = new _epubcfi2.default(range, cfiBase).toString();
				locations.push(cfi);
				counter = 0;
			}

			return locations;
		}

		/**
   * Load all of sections in the book to generate locations
   * @param  {string} startCfi start position
   * @param  {int} wordCount how many words to split on
   * @param  {int} count result count
   * @return {object} locations
   */

	}, {
		key: "generateFromWords",
		value: function generateFromWords(startCfi, wordCount, count) {
			var start = startCfi ? new _epubcfi2.default(startCfi) : undefined;
			this.q.pause();
			this._locationsWords = [];
			this._wordCounter = 0;

			this.spine.each(function (section) {
				if (section.linear) {
					if (start) {
						if (section.index >= start.spinePos) {
							this.q.enqueue(this.processWords.bind(this), section, wordCount, start, count);
						}
					} else {
						this.q.enqueue(this.processWords.bind(this), section, wordCount, start, count);
					}
				}
			}.bind(this));

			return this.q.run().then(function () {
				if (this._currentCfi) {
					this.currentLocation = this._currentCfi;
				}

				return this._locationsWords;
			}.bind(this));
		}
	}, {
		key: "processWords",
		value: function processWords(section, wordCount, startCfi, count) {
			if (count && this._locationsWords.length >= count) {
				return Promise.resolve();
			}

			return section.load(this.request).then(function (contents) {
				var completed = new _core.defer();
				var locations = this.parseWords(contents, section, wordCount, startCfi);
				var remainingCount = count - this._locationsWords.length;
				this._locationsWords = this._locationsWords.concat(locations.length >= count ? locations.slice(0, remainingCount) : locations);

				section.unload();

				this.processingTimeout = setTimeout(function () {
					return completed.resolve(locations);
				}, this.pause);
				return completed.promise;
			}.bind(this));
		}

		//http://stackoverflow.com/questions/18679576/counting-words-in-string

	}, {
		key: "countWords",
		value: function countWords(s) {
			s = s.replace(/(^\s*)|(\s*$)/gi, ""); //exclude  start and end white-space
			s = s.replace(/[ ]{2,}/gi, " "); //2 or more space to 1
			s = s.replace(/\n /, "\n"); // exclude newline with a start spacing
			return s.split(" ").length;
		}
	}, {
		key: "parseWords",
		value: function parseWords(contents, section, wordCount, startCfi) {
			var cfiBase = section.cfiBase;
			var locations = [];
			var doc = contents.ownerDocument;
			var body = (0, _core.qs)(doc, "body");
			var prev;
			var _break = wordCount;
			var foundStartNode = startCfi ? startCfi.spinePos !== section.index : true;
			var startNode;
			if (startCfi && section.index === startCfi.spinePos) {
				startNode = startCfi.findNode(startCfi.range ? startCfi.path.steps.concat(startCfi.start.steps) : startCfi.path.steps, contents.ownerDocument);
			}
			var parser = function parser(node) {
				if (!foundStartNode) {
					if (node === startNode) {
						foundStartNode = true;
					} else {
						return false;
					}
				}
				if (node.textContent.length < 10) {
					if (node.textContent.trim().length === 0) {
						return false;
					}
				}
				var len = this.countWords(node.textContent);
				var dist;
				var pos = 0;

				if (len === 0) {
					return false; // continue
				}

				dist = _break - this._wordCounter;

				// Node is smaller than a break,
				// skip over it
				if (dist > len) {
					this._wordCounter += len;
					pos = len;
				}

				while (pos < len) {
					dist = _break - this._wordCounter;

					// Gone over
					if (pos + dist >= len) {
						// Continue counter for next node
						this._wordCounter += len - pos;
						// break
						pos = len;
						// At End
					} else {
						// Advance pos
						pos += dist;

						var cfi = new _epubcfi2.default(node, cfiBase);
						locations.push({ cfi: cfi.toString(), wordCount: this._wordCounter });
						this._wordCounter = 0;
					}
				}
				prev = node;
			};

			(0, _core.sprint)(body, parser.bind(this));

			return locations;
		}

		/**
   * Get a location from an EpubCFI
   * @param {EpubCFI} cfi
   * @return {number}
   */

	}, {
		key: "locationFromCfi",
		value: function locationFromCfi(cfi) {
			var loc = void 0;
			if (_epubcfi2.default.prototype.isCfiString(cfi)) {
				cfi = new _epubcfi2.default(cfi);
			}
			// Check if the location has not been set yet
			if (this._locations.length === 0) {
				return -1;
			}

			loc = (0, _core.locationOf)(cfi, this._locations, this.epubcfi.compare);

			if (loc > this.total) {
				return this.total;
			}

			return loc;
		}

		/**
   * Get a percentage position in locations from an EpubCFI
   * @param {EpubCFI} cfi
   * @return {number}
   */

	}, {
		key: "percentageFromCfi",
		value: function percentageFromCfi(cfi) {
			if (this._locations.length === 0) {
				return null;
			}
			// Find closest cfi
			var loc = this.locationFromCfi(cfi);
			// Get percentage in total
			return this.percentageFromLocation(loc);
		}

		/**
   * Get a percentage position from a location index
   * @param {number} location
   * @return {number}
   */

	}, {
		key: "percentageFromLocation",
		value: function percentageFromLocation(loc) {
			if (!loc || !this.total) {
				return 0;
			}

			return loc / this.total;
		}

		/**
   * Get an EpubCFI from location index
   * @param {number} loc
   * @return {EpubCFI} cfi
   */

	}, {
		key: "cfiFromLocation",
		value: function cfiFromLocation(loc) {
			var cfi = -1;
			// check that pg is an int
			if (typeof loc != "number") {
				loc = parseInt(loc);
			}

			if (loc >= 0 && loc < this._locations.length) {
				cfi = this._locations[loc];
			}

			return cfi;
		}

		/**
   * Get an EpubCFI from location percentage
   * @param {number} percentage
   * @return {EpubCFI} cfi
   */

	}, {
		key: "cfiFromPercentage",
		value: function cfiFromPercentage(percentage) {
			var loc = void 0;
			if (percentage > 1) {
				console.warn("Normalize cfiFromPercentage value to between 0 - 1");
			}

			// Make sure 1 goes to very end
			if (percentage >= 1) {
				var cfi = new _epubcfi2.default(this._locations[this.total]);
				cfi.collapse();
				return cfi.toString();
			}

			loc = Math.ceil(this.total * percentage);
			return this.cfiFromLocation(loc);
		}

		/**
   * Load locations from JSON
   * @param {json} locations
   */

	}, {
		key: "load",
		value: function load(locations) {
			if (typeof locations === "string") {
				this._locations = JSON.parse(locations);
			} else {
				this._locations = locations;
			}
			this.total = this._locations.length - 1;
			return this._locations;
		}

		/**
   * Save locations to JSON
   * @return {json}
   */

	}, {
		key: "save",
		value: function save() {
			return JSON.stringify(this._locations);
		}
	}, {
		key: "getCurrent",
		value: function getCurrent() {
			return this._current;
		}
	}, {
		key: "setCurrent",
		value: function setCurrent(curr) {
			var loc;

			if (typeof curr == "string") {
				this._currentCfi = curr;
			} else if (typeof curr == "number") {
				this._current = curr;
			} else {
				return;
			}

			if (this._locations.length === 0) {
				return;
			}

			if (typeof curr == "string") {
				loc = this.locationFromCfi(curr);
				this._current = loc;
			} else {
				loc = curr;
			}

			this.emit(_constants.EVENTS.LOCATIONS.CHANGED, {
				percentage: this.percentageFromLocation(loc)
			});
		}

		/**
   * Get the current location
   */

	}, {
		key: "length",


		/**
   * Locations length
   */
		value: function length() {
			return this._locations.length;
		}
	}, {
		key: "destroy",
		value: function destroy() {
			this.spine = undefined;
			this.request = undefined;
			this.pause = undefined;

			this.q.stop();
			this.q = undefined;
			this.epubcfi = undefined;

			this._locations = undefined;
			this.total = undefined;

			this.break = undefined;
			this._current = undefined;

			this.currentLocation = undefined;
			this._currentCfi = undefined;
			clearTimeout(this.processingTimeout);
		}
	}, {
		key: "currentLocation",
		get: function get() {
			return this._current;
		}

		/**
   * Set the current location
   */
		,
		set: function set(curr) {
			this.setCurrent(curr);
		}
	}]);

	return Locations;
}();

(0, _eventEmitter2.default)(Locations.prototype);

exports.default = Locations;
module.exports = exports["default"];

/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _pathWebpack = __webpack_require__(7);

var _pathWebpack2 = _interopRequireDefault(_pathWebpack);

var _core = __webpack_require__(0);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Handles Parsing and Accessing an Epub Container
 * @class
 * @param {document} [containerDocument] xml document
 */
var Container = function () {
	function Container(containerDocument) {
		_classCallCheck(this, Container);

		this.packagePath = '';
		this.directory = '';
		this.encoding = '';

		if (containerDocument) {
			this.parse(containerDocument);
		}
	}

	/**
  * Parse the Container XML
  * @param  {document} containerDocument
  */


	_createClass(Container, [{
		key: "parse",
		value: function parse(containerDocument) {
			//-- <rootfile full-path="OPS/package.opf" media-type="application/oebps-package+xml"/>
			var rootfile;

			if (!containerDocument) {
				throw new Error("Container File Not Found");
			}

			rootfile = (0, _core.qs)(containerDocument, "rootfile");

			if (!rootfile) {
				throw new Error("No RootFile Found");
			}

			this.packagePath = rootfile.getAttribute("full-path");
			this.directory = _pathWebpack2.default.dirname(this.packagePath);
			this.encoding = containerDocument.xmlEncoding;
		}
	}, {
		key: "destroy",
		value: function destroy() {
			this.packagePath = undefined;
			this.directory = undefined;
			this.encoding = undefined;
		}
	}]);

	return Container;
}();

exports.default = Container;
module.exports = exports["default"];

/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _core = __webpack_require__(0);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Open Packaging Format Parser
 * @class
 * @param {document} packageDocument OPF XML
 */
var Packaging = function () {
	function Packaging(packageDocument) {
		_classCallCheck(this, Packaging);

		this.manifest = {};
		this.navPath = '';
		this.ncxPath = '';
		this.coverPath = '';
		this.spineNodeIndex = 0;
		this.spine = [];
		this.metadata = {};

		if (packageDocument) {
			this.parse(packageDocument);
		}
	}

	/**
  * Parse OPF XML
  * @param  {document} packageDocument OPF XML
  * @return {object} parsed package parts
  */


	_createClass(Packaging, [{
		key: 'parse',
		value: function parse(packageDocument) {
			var metadataNode, manifestNode, spineNode;

			if (!packageDocument) {
				throw new Error("Package File Not Found");
			}

			metadataNode = (0, _core.qs)(packageDocument, "metadata");
			if (!metadataNode) {
				throw new Error("No Metadata Found");
			}

			manifestNode = (0, _core.qs)(packageDocument, "manifest");
			if (!manifestNode) {
				throw new Error("No Manifest Found");
			}

			spineNode = (0, _core.qs)(packageDocument, "spine");
			if (!spineNode) {
				throw new Error("No Spine Found");
			}

			this.manifest = this.parseManifest(manifestNode);
			this.navPath = this.findNavPath(manifestNode);
			this.ncxPath = this.findNcxPath(manifestNode, spineNode);
			this.coverPath = this.findCoverPath(packageDocument);

			this.spineNodeIndex = (0, _core.indexOfElementNode)(spineNode);

			this.spine = this.parseSpine(spineNode, this.manifest);

			this.uniqueIdentifier = this.findUniqueIdentifier(packageDocument);
			this.metadata = this.parseMetadata(metadataNode);

			this.metadata.direction = spineNode.getAttribute("page-progression-direction");

			return {
				"metadata": this.metadata,
				"spine": this.spine,
				"manifest": this.manifest,
				"navPath": this.navPath,
				"ncxPath": this.ncxPath,
				"coverPath": this.coverPath,
				"spineNodeIndex": this.spineNodeIndex
			};
		}

		/**
   * Parse Metadata
   * @private
   * @param  {node} xml
   * @return {object} metadata
   */

	}, {
		key: 'parseMetadata',
		value: function parseMetadata(xml) {
			var metadata = {};

			const DC_NS = "http://purl.org/dc/elements/1.1/"
			const OPF_NS = "http://www.idpf.org/2007/opf"
			const getElementText = node => node ? node.childNodes[0].nodeValue : null
			const getElementsNS = (ns, tagName) =>
				[...xml.getElementsByTagNameNS(ns, tagName)]
					.filter(node => node.childNodes.length)
			const metas = [...xml.getElementsByTagName('meta')]
			const getRefiningMetas = id => metas.filter(meta =>
				meta.getAttribute('refines') === '#' + id)

			const getPropertyMetas = (el, prop) => {
				const id = el.getAttribute('id')
				const metas = getRefiningMetas(id)
				if (metas) {
					const refined = metas
						.filter(meta => meta.getAttribute('property') === prop)
					if (refined) return refined
				}
			}
			const getProperty = (el, ns, prop, one = true) => {
				const attribute = el.getAttributeNS(ns, prop)
				const metas = getPropertyMetas(el, prop)
				return metas && metas.length
					? (one ? getElementText(metas[0]) : metas.map(getElementText))
					: attribute
			}

			const titles = getElementsNS(DC_NS, "title")
				.map(x => {
					return {
						type: getProperty(x, OPF_NS, 'title-type'),
						seq: getProperty(x, OPF_NS, 'display-seq'),
						label: getElementText(x)
					}
				})
			metadata.titles = titles
			const mainTitle = titles.find(x => x.type === 'main')
			if (mainTitle) metadata.title = mainTitle.label
			else metadata.title = this.getElementText(xml, "title");

			metadata.creator = this.getElementText(xml, "creator");
			metadata.description = this.getElementText(xml, "description");

			metadata.subjects = getElementsNS(DC_NS, "subject")
				.map(x => {
					return {
						authority: getProperty(x, OPF_NS, 'authority'),
						term: getProperty(x, OPF_NS, 'term'),
						label: getElementText(x)
					}
				})

			metadata.sources = getElementsNS(DC_NS, "source")
				.map(getElementText)

			metadata.collections = metas
			    .filter(meta => meta.getAttribute('property') === 'belongs-to-collection')
			 	.map(meta => {
			 		return {
			 			type: getProperty(meta, OPF_NS, 'collection-type'),
			 			label: getElementText(meta)
			 		}
			 	})

			metadata.contributors = getElementsNS(DC_NS, "contributor")
				.map(x => {
					return {
						role: getProperty(x, OPF_NS, 'role', false),
						scheme: getProperty(x, OPF_NS, 'scheme', false),
						label: getElementText(x)
					}
				})

			metadata.pubdate = this.getElementText(xml, "date");

			metadata.publisher = this.getElementText(xml, "publisher");

			metadata.identifier = this.getElementText(xml, "identifier");
			metadata.language = this.getElementText(xml, "language");
			metadata.rights = this.getElementText(xml, "rights");

			metadata.modified_date = this.getPropertyText(xml, "dcterms:modified");

			metadata.layout = this.getPropertyText(xml, "rendition:layout");
			metadata.orientation = this.getPropertyText(xml, "rendition:orientation");
			metadata.flow = this.getPropertyText(xml, "rendition:flow");
			metadata.viewport = this.getPropertyText(xml, "rendition:viewport");
			metadata.media_active_class = this.getPropertyText(xml, "media:active-class");
			metadata.spread = this.getPropertyText(xml, "rendition:spread");
			// metadata.page_prog_dir = packageXml.querySelector("spine").getAttribute("page-progression-direction");

			return metadata;
		}

		/**
   * Parse Manifest
   * @private
   * @param  {node} manifestXml
   * @return {object} manifest
   */

	}, {
		key: 'parseManifest',
		value: function parseManifest(manifestXml) {
			var manifest = {};

			//-- Turn items into an array
			// var selected = manifestXml.querySelectorAll("item");
			var selected = (0, _core.qsa)(manifestXml, "item");
			var items = Array.prototype.slice.call(selected);

			//-- Create an object with the id as key
			items.forEach(function (item) {
				var id = item.getAttribute("id"),
				    href = item.getAttribute("href") || "",
				    type = item.getAttribute("media-type") || "",
				    overlay = item.getAttribute("media-overlay") || "",
				    properties = item.getAttribute("properties") || "";

				manifest[id] = {
					"href": href,
					// "url" : href,
					"type": type,
					"overlay": overlay,
					"properties": properties.length ? properties.split(" ") : []
				};
			});

			return manifest;
		}

		/**
   * Parse Spine
   * @private
   * @param  {node} spineXml
   * @param  {Packaging.manifest} manifest
   * @return {object} spine
   */

	}, {
		key: 'parseSpine',
		value: function parseSpine(spineXml, manifest) {
			var spine = [];

			var selected = (0, _core.qsa)(spineXml, "itemref");
			var items = Array.prototype.slice.call(selected);

			// var epubcfi = new EpubCFI();

			//-- Add to array to mantain ordering and cross reference with manifest
			items.forEach(function (item, index) {
				var idref = item.getAttribute("idref");
				// var cfiBase = epubcfi.generateChapterComponent(spineNodeIndex, index, Id);
				var props = item.getAttribute("properties") || "";
				var propArray = props.length ? props.split(" ") : [];
				// var manifestProps = manifest[Id].properties;
				// var manifestPropArray = manifestProps.length ? manifestProps.split(" ") : [];

				var itemref = {
					"idref": idref,
					"linear": item.getAttribute("linear") || "yes",
					"properties": propArray,
					// "href" : manifest[Id].href,
					// "url" :  manifest[Id].url,
					"index": index
					// "cfiBase" : cfiBase
				};
				spine.push(itemref);
			});

			return spine;
		}

		/**
   * Find Unique Identifier
   * @private
   * @param  {node} packageXml
   * @return {string} Unique Identifier text
   */

	}, {
		key: 'findUniqueIdentifier',
		value: function findUniqueIdentifier(packageXml) {
			var uniqueIdentifierId = packageXml.documentElement.getAttribute("unique-identifier");
			if (!uniqueIdentifierId) {
				return "";
			}
			var identifier = packageXml.getElementById(uniqueIdentifierId);
			if (!identifier) {
				return "";
			}

			if (identifier.localName === "identifier" && identifier.namespaceURI === "http://purl.org/dc/elements/1.1/") {
				return identifier.childNodes.length > 0 ? identifier.childNodes[0].nodeValue.trim() : "";
			}

			return "";
		}

		/**
   * Find TOC NAV
   * @private
   * @param {element} manifestNode
   * @return {string}
   */

	}, {
		key: 'findNavPath',
		value: function findNavPath(manifestNode) {
			// Find item with property "nav"
			// Should catch nav irregardless of order
			// var node = manifestNode.querySelector("item[properties$='nav'], item[properties^='nav '], item[properties*=' nav ']");
			var node = (0, _core.qsp)(manifestNode, "item", { "properties": "nav" });
			return node ? node.getAttribute("href") : false;
		}

		/**
   * Find TOC NCX
   * media-type="application/x-dtbncx+xml" href="toc.ncx"
   * @private
   * @param {element} manifestNode
   * @param {element} spineNode
   * @return {string}
   */

	}, {
		key: 'findNcxPath',
		value: function findNcxPath(manifestNode, spineNode) {
			// var node = manifestNode.querySelector("item[media-type='application/x-dtbncx+xml']");
			var node = (0, _core.qsp)(manifestNode, "item", { "media-type": "application/x-dtbncx+xml" });
			var tocId;

			// If we can't find the toc by media-type then try to look for id of the item in the spine attributes as
			// according to http://www.idpf.org/epub/20/spec/OPF_2.0.1_draft.htm#Section2.4.1.2,
			// "The item that describes the NCX must be referenced by the spine toc attribute."
			if (!node) {
				tocId = spineNode.getAttribute("toc");
				if (tocId) {
					// node = manifestNode.querySelector("item[id='" + tocId + "']");
					node = manifestNode.querySelector('#' + tocId);
				}
			}

			return node ? node.getAttribute("href") : false;
		}

		/**
   * Find the Cover Path
   * <item properties="cover-image" id="ci" href="cover.svg" media-type="image/svg+xml" />
   * Fallback for Epub 2.0
   * @private
   * @param  {node} packageXml
   * @return {string} href
   */

	}, {
		key: 'findCoverPath',
		value: function findCoverPath(packageXml) {
			var pkg = (0, _core.qs)(packageXml, "package");
			var epubVersion = pkg.getAttribute("version");

			if (epubVersion === "2.0") {
				var metaCover = (0, _core.qsp)(packageXml, "meta", { "name": "cover" });
				if (metaCover) {
					var coverId = metaCover.getAttribute("content");
					// var cover = packageXml.querySelector("item[id='" + coverId + "']");
					var cover = packageXml.getElementById(coverId);
					return cover ? cover.getAttribute("href") : "";
				} else {
					return false;
				}
			} else {
				// var node = packageXml.querySelector("item[properties='cover-image']");
				var node = (0, _core.qsp)(packageXml, "item", { "properties": "cover-image" });
				return node ? node.getAttribute("href") : "";
			}
		}

		/**
   * Get text of a namespaced element
   * @private
   * @param  {node} xml
   * @param  {string} tag
   * @return {string} text
   */

	}, {
		key: 'getElementText',
		value: function getElementText(xml, tag) {
			var found = xml.getElementsByTagNameNS("http://purl.org/dc/elements/1.1/", tag);
			var el;

			if (!found || found.length === 0) return "";

			el = found[0];

			if (el.childNodes.length) {
				return el.childNodes[0].nodeValue;
			}

			return "";
		}

		/**
   * Get text by property
   * @private
   * @param  {node} xml
   * @param  {string} property
   * @return {string} text
   */

	}, {
		key: 'getPropertyText',
		value: function getPropertyText(xml, property) {
			var el = (0, _core.qsp)(xml, "meta", { "property": property });

			if (el && el.childNodes.length) {
				return el.childNodes[0].nodeValue;
			}

			return "";
		}

		/**
   * Load JSON Manifest
   * @param  {document} packageDocument OPF XML
   * @return {object} parsed package parts
   */

	}, {
		key: 'load',
		value: function load(json) {
			var _this = this;

			this.metadata = json.metadata;

			var spine = json.readingOrder || json.spine;
			this.spine = spine.map(function (item, index) {
				item.index = index;
				item.linear = item.linear || "yes";
				return item;
			});

			json.resources.forEach(function (item, index) {
				_this.manifest[index] = item;

				if (item.rel && item.rel[0] === "cover") {
					_this.coverPath = item.href;
				}
			});

			this.spineNodeIndex = 0;

			this.toc = json.toc.map(function (item, index) {
				item.label = item.title;
				return item;
			});

			return {
				"metadata": this.metadata,
				"spine": this.spine,
				"manifest": this.manifest,
				"navPath": this.navPath,
				"ncxPath": this.ncxPath,
				"coverPath": this.coverPath,
				"spineNodeIndex": this.spineNodeIndex,
				"toc": this.toc
			};
		}
	}, {
		key: 'destroy',
		value: function destroy() {
			this.manifest = undefined;
			this.navPath = undefined;
			this.ncxPath = undefined;
			this.coverPath = undefined;
			this.spineNodeIndex = undefined;
			this.spine = undefined;
			this.metadata = undefined;
		}
	}]);

	return Packaging;
}();

exports.default = Packaging;
module.exports = exports['default'];

/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _core = __webpack_require__(0);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Navigation Parser
 * @param {document} xml navigation html / xhtml / ncx
 */
var Navigation = function () {
	function Navigation(xml) {
		_classCallCheck(this, Navigation);

		this.toc = [];
		this.tocByHref = {};
		this.tocById = {};

		this.landmarks = [];
		this.landmarksByType = {};

		this.length = 0;
		if (xml) {
			this.parse(xml);
		}
	}

	/**
  * Parse out the navigation items
  * @param {document} xml navigation html / xhtml / ncx
  */


	_createClass(Navigation, [{
		key: "parse",
		value: function parse(xml) {
			var isXml = xml.nodeType;
			var html = void 0;
			var ncx = void 0;

			if (isXml) {
				html = (0, _core.qs)(xml, "html");
				ncx = (0, _core.qs)(xml, "ncx");
			}

			if (!isXml) {
				this.toc = this.load(xml);
			} else if (html) {
				this.toc = this.parseNav(xml);
				this.landmarks = this.parseLandmarks(xml);
			} else if (ncx) {
				this.toc = this.parseNcx(xml);
			}

			this.length = 0;

			this.unpack(this.toc);
		}

		/**
   * Unpack navigation items
   * @private
   * @param  {array} toc
   */

	}, {
		key: "unpack",
		value: function unpack(toc) {
			var item;

			for (var i = 0; i < toc.length; i++) {
				item = toc[i];

				if (item.href) {
					this.tocByHref[item.href] = i;
				}

				if (item.id) {
					this.tocById[item.id] = i;
				}

				this.length++;

				if (item.subitems.length) {
					this.unpack(item.subitems);
				}
			}
		}

		/**
   * Get an item from the navigation
   * @param  {string} target
   * @return {object} navItem
   */

	}, {
		key: "get",
		value: function get(target) {
			var index;

			if (!target) {
				return this.toc;
			}

			if (target.indexOf("#") === 0) {
				index = this.tocById[target.substring(1)];
			} else if (target in this.tocByHref) {
				index = this.tocByHref[target];
			}

			return this.getByIndex(target, index, this.toc);
		}

		/**
   * Get an item from navigation subitems recursively by index
   * @param  {string} target
   * @param  {number} index
   * @param  {array} navItems
   * @return {object} navItem
   */

	}, {
		key: "getByIndex",
		value: function getByIndex(target, index, navItems) {
			if (navItems.length === 0) {
				return;
			}

			var item = navItems[index];
			if (item && (target === item.id || target === item.href)) {
				return item;
			} else {
				var result = void 0;
				for (var i = 0; i < navItems.length; ++i) {
					result = this.getByIndex(target, index, navItems[i].subitems);
					if (result) {
						break;
					}
				}
				return result;
			}
		}

		/**
   * Get a landmark by type
   * List of types: https://idpf.github.io/epub-vocabs/structure/
   * @param  {string} type
   * @return {object} landmarkItem
   */

	}, {
		key: "landmark",
		value: function landmark(type) {
			var index;

			if (!type) {
				return this.landmarks;
			}

			index = this.landmarksByType[type];

			return this.landmarks[index];
		}

		/**
   * Parse toc from a Epub > 3.0 Nav
   * @private
   * @param  {document} navHtml
   * @return {array} navigation list
   */

	}, {
		key: "parseNav",
		value: function parseNav(navHtml) {
			var navElement = (0, _core.querySelectorByType)(navHtml, "nav", "toc");
			var navItems = navElement ? (0, _core.qsa)(navElement, "li") : [];
			var length = navItems.length;
			var i;
			var toc = {};
			var list = [];
			var item, parent;

			if (!navItems || length === 0) return list;

			for (i = 0; i < length; ++i) {
				item = this.navItem(navItems[i]);
				if (item) {
					toc[item.id] = item;
					if (!item.parent) {
						list.push(item);
					} else {
						parent = toc[item.parent];
						parent.subitems.push(item);
					}
				}
			}

			return list;
		}

		/**
   * Create a navItem
   * @private
   * @param  {element} item
   * @return {object} navItem
   */

	}, {
		key: "navItem",
		value: function navItem(item) {
			var id = item.getAttribute("id") || undefined;
			var content = (0, _core.filterChildren)(item, "a", true);

			if (!content) {
				return;
			}

			var src = content.getAttribute("href") || "";

			if (!id) {
				id = src;
			}
			var text = content.textContent || "";
			var subitems = [];
			var parentItem = (0, _core.getParentByTagName)(item, "li");
			var parent = void 0;

			if (parentItem) {
				parent = parentItem.getAttribute("id");
				if (!parent) {
					var parentContent = (0, _core.filterChildren)(parentItem, "a", true);
					parent = parentContent && parentContent.getAttribute("href");
				}
			}

			while (!parent && parentItem) {
				parentItem = (0, _core.getParentByTagName)(parentItem, "li");
				if (parentItem) {
					parent = parentItem.getAttribute("id");
					if (!parent) {
						var _parentContent = (0, _core.filterChildren)(parentItem, "a", true);
						parent = _parentContent && _parentContent.getAttribute("href");
					}
				}
			}

			return {
				"id": id,
				"href": src,
				"label": text,
				"subitems": subitems,
				"parent": parent
			};
		}

		/**
   * Parse landmarks from a Epub > 3.0 Nav
   * @private
   * @param  {document} navHtml
   * @return {array} landmarks list
   */

	}, {
		key: "parseLandmarks",
		value: function parseLandmarks(navHtml) {
			var navElement = (0, _core.querySelectorByType)(navHtml, "nav", "landmarks");
			var navItems = navElement ? (0, _core.qsa)(navElement, "li") : [];
			var length = navItems.length;
			var i;
			var list = [];
			var item;

			if (!navItems || length === 0) return list;

			for (i = 0; i < length; ++i) {
				item = this.landmarkItem(navItems[i]);
				if (item) {
					list.push(item);
					this.landmarksByType[item.type] = i;
				}
			}

			return list;
		}

		/**
   * Create a landmarkItem
   * @private
   * @param  {element} item
   * @return {object} landmarkItem
   */

	}, {
		key: "landmarkItem",
		value: function landmarkItem(item) {
			var content = (0, _core.filterChildren)(item, "a", true);

			if (!content) {
				return;
			}

			var type = content.getAttributeNS("http://www.idpf.org/2007/ops", "type") || undefined;
			var href = content.getAttribute("href") || "";
			var text = content.textContent || "";

			return {
				"href": href,
				"label": text,
				"type": type
			};
		}

		/**
   * Parse from a Epub > 3.0 NC
   * @private
   * @param  {document} navHtml
   * @return {array} navigation list
   */

	}, {
		key: "parseNcx",
		value: function parseNcx(tocXml) {
			var navPoints = (0, _core.qsa)(tocXml, "navPoint");
			var length = navPoints.length;
			var i;
			var toc = {};
			var list = [];
			var item, parent;

			if (!navPoints || length === 0) return list;

			for (i = 0; i < length; ++i) {
				item = this.ncxItem(navPoints[i]);
				toc[item.id] = item;
				if (!item.parent) {
					list.push(item);
				} else {
					parent = toc[item.parent];
					parent.subitems.push(item);
				}
			}

			return list;
		}

		/**
   * Create a ncxItem
   * @private
   * @param  {element} item
   * @return {object} ncxItem
   */

	}, {
		key: "ncxItem",
		value: function ncxItem(item) {
			var id = item.getAttribute("id") || false,
			    content = (0, _core.qs)(item, "content"),
			    src = content.getAttribute("src"),
			    navLabel = (0, _core.qs)(item, "navLabel"),
			    text = navLabel.textContent ? navLabel.textContent : "",
			    subitems = [],
			    parentNode = item.parentNode,
			    parent;

			if (parentNode && (parentNode.nodeName === "navPoint" || parentNode.nodeName.split(':').slice(-1)[0] === "navPoint")) {
				parent = parentNode.getAttribute("id");
			}

			return {
				"id": id,
				"href": src,
				"label": text,
				"subitems": subitems,
				"parent": parent
			};
		}

		/**
   * Load Spine Items
   * @param  {object} json the items to be loaded
   * @return {Array} navItems
   */

	}, {
		key: "load",
		value: function load(json) {
			var _this = this;

			return json.map(function (item) {
				item.label = item.title;
				item.subitems = item.children ? _this.load(item.children) : [];
				return item;
			});
		}

		/**
   * forEach pass through
   * @param  {Function} fn function to run on each item
   * @return {method} forEach loop
   */

	}, {
		key: "forEach",
		value: function forEach(fn) {
			return this.toc.forEach(fn);
		}
	}]);

	return Navigation;
}();

exports.default = Navigation;
module.exports = exports["default"];

/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _replacements = __webpack_require__(8);

var _core = __webpack_require__(0);

var _url = __webpack_require__(6);

var _url2 = _interopRequireDefault(_url);

var _mime = __webpack_require__(13);

var _mime2 = _interopRequireDefault(_mime);

var _path = __webpack_require__(4);

var _path2 = _interopRequireDefault(_path);

var _pathWebpack = __webpack_require__(7);

var _pathWebpack2 = _interopRequireDefault(_pathWebpack);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Handle Package Resources
 * @class
 * @param {Manifest} manifest
 * @param {object} [options]
 * @param {string} [options.replacements="base64"]
 * @param {Archive} [options.archive]
 * @param {method} [options.resolver]
 */
var Resources = function () {
	function Resources(manifest, options) {
		_classCallCheck(this, Resources);

		this.settings = {
			replacements: options && options.replacements || "base64",
			archive: options && options.archive,
			resolver: options && options.resolver,
			request: options && options.request
		};

		this.process(manifest);
	}

	/**
  * Process resources
  * @param {Manifest} manifest
  */


	_createClass(Resources, [{
		key: "process",
		value: function process(manifest) {
			this.manifest = manifest;
			this.resources = Object.keys(manifest).map(function (key) {
				return manifest[key];
			});

			this.replacementUrls = [];

			this.html = [];
			this.assets = [];
			this.css = [];

			this.urls = [];
			this.cssUrls = [];

			this.split();
			this.splitUrls();
		}

		/**
   * Split resources by type
   * @private
   */

	}, {
		key: "split",
		value: function split() {

			// HTML
			this.html = this.resources.filter(function (item) {
				if (item.type === "application/xhtml+xml" || item.type === "text/html") {
					return true;
				}
			});

			// Exclude HTML
			this.assets = this.resources.filter(function (item) {
				if (item.type !== "application/xhtml+xml" && item.type !== "text/html") {
					return true;
				}
			});

			// Only CSS
			this.css = this.resources.filter(function (item) {
				if (item.type === "text/css") {
					return true;
				}
			});
		}

		/**
   * Convert split resources into Urls
   * @private
   */

	}, {
		key: "splitUrls",
		value: function splitUrls() {

			// All Assets Urls
			this.urls = this.assets.map(function (item) {
				return item.href;
			}.bind(this));

			// Css Urls
			this.cssUrls = this.css.map(function (item) {
				return item.href;
			});
		}

		/**
   * Create a url to a resource
   * @param {string} url
   * @return {Promise<string>} Promise resolves with url string
   */

	}, {
		key: "createUrl",
		value: function createUrl(url) {
			var parsedUrl = new _url2.default(url);
			var mimeType = _mime2.default.lookup(parsedUrl.filename);

			if (this.settings.archive) {
				return this.settings.archive.createUrl(url, { "base64": this.settings.replacements === "base64" });
			} else {
				if (this.settings.replacements === "base64") {
					return this.settings.request(url, 'blob').then(function (blob) {
						return (0, _core.blob2base64)(blob);
					}).then(function (blob) {
						return (0, _core.createBase64Url)(blob, mimeType);
					});
				} else {
					return this.settings.request(url, 'blob').then(function (blob) {
						return (0, _core.createBlobUrl)(blob, mimeType);
					});
				}
			}
		}

		/**
   * Create blob urls for all the assets
   * @return {Promise}         returns replacement urls
   */

	}, {
		key: "replacements",
		value: function replacements() {
			var _this = this;

			if (this.settings.replacements === "none") {
				return new Promise(function (resolve) {
					resolve(this.urls);
				}.bind(this));
			}

			var replacements = this.urls.map(function (url) {
				var absolute = _this.settings.resolver(url);

				return _this.createUrl(absolute).catch(function (err) {
					console.error(err);
					return null;
				});
			});

			return Promise.all(replacements).then(function (replacementUrls) {
				_this.replacementUrls = replacementUrls.filter(function (url) {
					return typeof url === "string";
				});
				return replacementUrls;
			});
		}

		/**
   * Replace URLs in CSS resources
   * @private
   * @param  {Archive} [archive]
   * @param  {method} [resolver]
   * @return {Promise}
   */

	}, {
		key: "replaceCss",
		value: function replaceCss(archive, resolver) {
			var replaced = [];
			archive = archive || this.settings.archive;
			resolver = resolver || this.settings.resolver;
			this.cssUrls.forEach(function (href) {
				var replacement = this.createCssFile(href, archive, resolver).then(function (replacementUrl) {
					// switch the url in the replacementUrls
					var indexInUrls = this.urls.indexOf(href);
					if (indexInUrls > -1) {
						this.replacementUrls[indexInUrls] = replacementUrl;
					}
				}.bind(this));

				replaced.push(replacement);
			}.bind(this));
			return Promise.all(replaced);
		}

		/**
   * Create a new CSS file with the replaced URLs
   * @private
   * @param  {string} href the original css file
   * @return {Promise}  returns a BlobUrl to the new CSS file or a data url
   */

	}, {
		key: "createCssFile",
		value: function createCssFile(href) {
			var _this2 = this;

			var newUrl;

			if (_pathWebpack2.default.isAbsolute(href)) {
				return new Promise(function (resolve) {
					resolve();
				});
			}

			var absolute = this.settings.resolver(href);

			// Get the text of the css file from the archive
			var textResponse;

			if (this.settings.archive) {
				textResponse = this.settings.archive.getText(absolute);
			} else {
				textResponse = this.settings.request(absolute, "text");
			}

			// Get asset links relative to css file
			var relUrls = this.urls.map(function (assetHref) {
				var resolved = _this2.settings.resolver(assetHref);
				var relative = new _path2.default(absolute).relative(resolved);

				return relative;
			});

			if (!textResponse) {
				// file not found, don't replace
				return new Promise(function (resolve) {
					resolve();
				});
			}

			return textResponse.then(function (text) {
				// Replacements in the css text
				text = (0, _replacements.substitute)(text, relUrls, _this2.replacementUrls);

				// Get the new url
				if (_this2.settings.replacements === "base64") {
					newUrl = (0, _core.createBase64Url)(text, "text/css");
				} else {
					newUrl = (0, _core.createBlobUrl)(text, "text/css");
				}

				return newUrl;
			}, function (err) {
				// handle response errors
				return new Promise(function (resolve) {
					resolve();
				});
			});
		}

		/**
   * Resolve all resources URLs relative to an absolute URL
   * @param  {string} absolute to be resolved to
   * @param  {resolver} [resolver]
   * @return {string[]} array with relative Urls
   */

	}, {
		key: "relativeTo",
		value: function relativeTo(absolute, resolver) {
			resolver = resolver || this.settings.resolver;

			// Get Urls relative to current sections
			return this.urls.map(function (href) {
				var resolved = resolver(href);
				var relative = new _path2.default(absolute).relative(resolved);
				return relative;
			}.bind(this));
		}

		/**
   * Get a URL for a resource
   * @param  {string} path
   * @return {string} url
   */

	}, {
		key: "get",
		value: function get(path) {
			var indexInUrls = this.urls.indexOf(path);
			if (indexInUrls === -1) {
				return;
			}
			if (this.replacementUrls.length) {
				return new Promise(function (resolve, reject) {
					resolve(this.replacementUrls[indexInUrls]);
				}.bind(this));
			} else {
				return this.createUrl(path);
			}
		}

		/**
   * Substitute urls in content, with replacements,
   * relative to a url if provided
   * @param  {string} content
   * @param  {string} [url]   url to resolve to
   * @return {string}         content with urls substituted
   */

	}, {
		key: "substitute",
		value: function substitute(content, url) {
			var relUrls;
			if (url) {
				relUrls = this.relativeTo(url);
			} else {
				relUrls = this.urls;
			}
			return (0, _replacements.substitute)(content, relUrls, this.replacementUrls);
		}
	}, {
		key: "destroy",
		value: function destroy() {
			this.settings = undefined;
			this.manifest = undefined;
			this.resources = undefined;
			this.replacementUrls = undefined;
			this.html = undefined;
			this.assets = undefined;
			this.css = undefined;

			this.urls = undefined;
			this.cssUrls = undefined;
		}
	}]);

	return Resources;
}();

exports.default = Resources;
module.exports = exports["default"];

/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _epubcfi = __webpack_require__(1);

var _epubcfi2 = _interopRequireDefault(_epubcfi);

var _core = __webpack_require__(0);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Page List Parser
 * @param {document} [xml]
 */
var PageList = function () {
	function PageList(xml) {
		_classCallCheck(this, PageList);

		this.pages = [];
		this.locations = [];
		this.epubcfi = new _epubcfi2.default();

		this.firstPage = 0;
		this.lastPage = 0;
		this.totalPages = 0;

		this.toc = undefined;
		this.ncx = undefined;

		if (xml) {
			this.pageList = this.parse(xml);
		}

		if (this.pageList && this.pageList.length) {
			this.process(this.pageList);
		}
	}

	/**
  * Parse PageList Xml
  * @param  {document} xml
  */


	_createClass(PageList, [{
		key: "parse",
		value: function parse(xml) {
			var html = (0, _core.qs)(xml, "html");
			var ncx = (0, _core.qs)(xml, "ncx");

			if (html) {
				return this.parseNav(xml);
			} else if (ncx) {
				return this.parseNcx(xml);
			}
		}

		/**
   * Parse a Nav PageList
   * @private
   * @param  {node} navHtml
   * @return {PageList.item[]} list
   */

	}, {
		key: "parseNav",
		value: function parseNav(navHtml) {
			var navElement = (0, _core.querySelectorByType)(navHtml, "nav", "page-list");
			var navItems = navElement ? (0, _core.qsa)(navElement, "li") : [];
			var length = navItems.length;
			var i;
			var list = [];
			var item;

			if (!navItems || length === 0) return list;

			for (i = 0; i < length; ++i) {
				item = this.item(navItems[i]);
				list.push(item);
			}

			return list;
		}
	}, {
		key: "parseNcx",
		value: function parseNcx(navXml) {
			var list = [];
			var i = 0;
			var item;
			var pageList;
			var pageTargets;
			var length = 0;

			pageList = (0, _core.qs)(navXml, "pageList");
			if (!pageList) return list;

			pageTargets = (0, _core.qsa)(pageList, "pageTarget");
			length = pageTargets.length;

			if (!pageTargets || pageTargets.length === 0) {
				return list;
			}

			for (i = 0; i < length; ++i) {
				item = this.ncxItem(pageTargets[i]);
				list.push(item);
			}

			return list;
		}
	}, {
		key: "ncxItem",
		value: function ncxItem(item) {
			var navLabel = (0, _core.qs)(item, "navLabel");
			var navLabelText = (0, _core.qs)(navLabel, "text");
			var pageText = navLabelText.textContent;
			var content = (0, _core.qs)(item, "content");

			var href = content.getAttribute("src");
			var page = parseInt(pageText, 10);

			return {
				"href": href,
				"page": page
			};
		}

		/**
   * Page List Item
   * @private
   * @param  {node} item
   * @return {object} pageListItem
   */

	}, {
		key: "item",
		value: function item(_item) {
			var content = (0, _core.qs)(_item, "a"),
			    href = content.getAttribute("href") || "",
			    text = content.textContent || "",
			    page = parseInt(text),
			    isCfi = href.indexOf("epubcfi"),
			    split,
			    packageUrl,
			    cfi;

			if (isCfi != -1) {
				split = href.split("#");
				packageUrl = split[0];
				cfi = split.length > 1 ? split[1] : false;
				return {
					"cfi": cfi,
					"href": href,
					"packageUrl": packageUrl,
					"page": page
				};
			} else {
				return {
					"href": href,
					"page": page
				};
			}
		}

		/**
   * Process pageList items
   * @private
   * @param  {array} pageList
   */

	}, {
		key: "process",
		value: function process(pageList) {
			pageList.forEach(function (item) {
				this.pages.push(item.page);
				if (item.cfi) {
					this.locations.push(item.cfi);
				}
			}, this);
			this.firstPage = parseInt(this.pages[0]);
			this.lastPage = parseInt(this.pages[this.pages.length - 1]);
			this.totalPages = this.lastPage - this.firstPage;
		}

		/**
   * Get a PageList result from a EpubCFI
   * @param  {string} cfi EpubCFI String
   * @return {number} page
   */

	}, {
		key: "pageFromCfi",
		value: function pageFromCfi(cfi) {
			var pg = -1;

			// Check if the pageList has not been set yet
			if (this.locations.length === 0) {
				return -1;
			}

			// TODO: check if CFI is valid?

			// check if the cfi is in the location list
			// var index = this.locations.indexOf(cfi);
			var index = (0, _core.indexOfSorted)(cfi, this.locations, this.epubcfi.compare);
			if (index != -1) {
				pg = this.pages[index];
			} else {
				// Otherwise add it to the list of locations
				// Insert it in the correct position in the locations page
				//index = EPUBJS.core.insert(cfi, this.locations, this.epubcfi.compare);
				index = (0, _core.locationOf)(cfi, this.locations, this.epubcfi.compare);
				// Get the page at the location just before the new one, or return the first
				pg = index - 1 >= 0 ? this.pages[index - 1] : this.pages[0];
				if (pg !== undefined) {
					// Add the new page in so that the locations and page array match up
					//this.pages.splice(index, 0, pg);
				} else {
					pg = -1;
				}
			}
			return pg;
		}

		/**
   * Get an EpubCFI from a Page List Item
   * @param  {string | number} pg
   * @return {string} cfi
   */

	}, {
		key: "cfiFromPage",
		value: function cfiFromPage(pg) {
			var cfi = -1;
			// check that pg is an int
			if (typeof pg != "number") {
				pg = parseInt(pg);
			}

			// check if the cfi is in the page list
			// Pages could be unsorted.
			var index = this.pages.indexOf(pg);
			if (index != -1) {
				cfi = this.locations[index];
			}
			// TODO: handle pages not in the list
			return cfi;
		}

		/**
   * Get a Page from Book percentage
   * @param  {number} percent
   * @return {number} page
   */

	}, {
		key: "pageFromPercentage",
		value: function pageFromPercentage(percent) {
			var pg = Math.round(this.totalPages * percent);
			return pg;
		}

		/**
   * Returns a value between 0 - 1 corresponding to the location of a page
   * @param  {number} pg the page
   * @return {number} percentage
   */

	}, {
		key: "percentageFromPage",
		value: function percentageFromPage(pg) {
			var percentage = (pg - this.firstPage) / this.totalPages;
			return Math.round(percentage * 1000) / 1000;
		}

		/**
   * Returns a value between 0 - 1 corresponding to the location of a cfi
   * @param  {string} cfi EpubCFI String
   * @return {number} percentage
   */

	}, {
		key: "percentageFromCfi",
		value: function percentageFromCfi(cfi) {
			var pg = this.pageFromCfi(cfi);
			var percentage = this.percentageFromPage(pg);
			return percentage;
		}

		/**
   * Destroy
   */

	}, {
		key: "destroy",
		value: function destroy() {
			this.pages = undefined;
			this.locations = undefined;
			this.epubcfi = undefined;

			this.pageList = undefined;

			this.toc = undefined;
			this.ncx = undefined;
		}
	}]);

	return PageList;
}();

exports.default = PageList;
module.exports = exports["default"];

/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _core = __webpack_require__(0);

var _constants = __webpack_require__(2);

var _eventEmitter = __webpack_require__(3);

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Figures out the CSS values to apply for a layout
 * @class
 * @param {object} settings
 * @param {string} [settings.layout='reflowable']
 * @param {string} [settings.spread]
 * @param {number} [settings.minSpreadWidth=800]
 * @param {boolean} [settings.evenSpreads=false]
 */
var Layout = function () {
	function Layout(settings) {
		_classCallCheck(this, Layout);

		this.settings = settings;
		this.name = settings.layout || "reflowable";
		this._spread = settings.spread === "none" ? false : true;
		this._minSpreadWidth = settings.minSpreadWidth || 800;
		this._evenSpreads = settings.evenSpreads || false;

		if (settings.flow === "scrolled" || settings.flow === "scrolled-continuous" || settings.flow === "scrolled-doc") {
			this._flow = "scrolled";
		} else {
			this._flow = "paginated";
		}

		this.width = 0;
		this.height = 0;
		this.spreadWidth = 0;
		this.delta = 0;

		this.columnWidth = 0;
		this.gap = 0;
		this.divisor = 1;

		this.props = {
			name: this.name,
			spread: this._spread,
			flow: this._flow,
			width: 0,
			height: 0,
			spreadWidth: 0,
			delta: 0,
			columnWidth: 0,
			gap: 0,
			divisor: 1
		};
	}

	/**
  * Switch the flow between paginated and scrolled
  * @param  {string} flow paginated | scrolled
  * @return {string} simplified flow
  */


	_createClass(Layout, [{
		key: "flow",
		value: function flow(_flow) {
			if (typeof _flow != "undefined") {
				if (_flow === "scrolled" || _flow === "scrolled-continuous" || _flow === "scrolled-doc") {
					this._flow = "scrolled";
				} else {
					this._flow = "paginated";
				}
				// this.props.flow = this._flow;
				this.update({ flow: this._flow });
			}
			return this._flow;
		}

		/**
   * Switch between using spreads or not, and set the
   * width at which they switch to single.
   * @param  {string} spread "none" | "always" | "auto"
   * @param  {number} min integer in pixels
   * @return {boolean} spread true | false
   */

	}, {
		key: "spread",
		value: function spread(_spread, min) {

			if (_spread) {
				this._spread = _spread === "none" ? false : true;
				// this.props.spread = this._spread;
				this.update({ spread: this._spread });
			}

			if (min >= 0) {
				this._minSpreadWidth = min;
			}

			return this._spread;
		}

		/**
   * Calculate the dimensions of the pagination
   * @param  {number} _width  width of the rendering
   * @param  {number} _height height of the rendering
   * @param  {number} _gap    width of the gap between columns
   */

	}, {
		key: "calculate",
		value: function calculate(_width, _height, _gap) {

			var divisor = 1;
			var gap = _gap || 0;

			//-- Check the width and create even width columns
			// var fullWidth = Math.floor(_width);
			var width = _width;
			var height = _height;

			var section = Math.floor(width / 12);

			var columnWidth;
			var spreadWidth;
			var pageWidth;
			var delta;

			if (this._spread && width >= this._minSpreadWidth * 2
			&& this.name === "reflowable" && this._flow === "paginated") {
				divisor = 4;
				section = section / 2
			} else if (this._spread && width >= this._minSpreadWidth) {
				divisor = 2;
			} else {
				divisor = 1;
			}

			if (this.name === "reflowable" && this._flow === "paginated" && !(_gap >= 0)) {
				gap = section % 2 === 0 ? section : section - 1;
			}

			if (this.name === "pre-paginated") {
				gap = 0;
			}

			//-- Double Page
			if (divisor > 1) {
				// width = width - gap;
				// columnWidth = (width - gap) / divisor;
				// gap = gap / divisor;
				columnWidth = width / divisor - gap;
				pageWidth = columnWidth + gap;
			} else {
				columnWidth = width;
				pageWidth = width;
			}

			if (this.name === "pre-paginated" && divisor > 1) {
				width = columnWidth;
			}

			spreadWidth = columnWidth * divisor + gap;

			delta = width;

			this.width = width;
			this.height = height;
			this.spreadWidth = spreadWidth;
			this.pageWidth = pageWidth;
			this.delta = delta;

			this.columnWidth = columnWidth;
			this.gap = gap;
			this.divisor = divisor;

			// this.props.width = width;
			// this.props.height = _height;
			// this.props.spreadWidth = spreadWidth;
			// this.props.pageWidth = pageWidth;
			// this.props.delta = delta;
			//
			// this.props.columnWidth = colWidth;
			// this.props.gap = gap;
			// this.props.divisor = divisor;

			this.update({
				width: width,
				height: height,
				spreadWidth: spreadWidth,
				pageWidth: pageWidth,
				delta: delta,
				columnWidth: columnWidth,
				gap: gap,
				divisor: divisor
			});
		}

		/**
   * Apply Css to a Document
   * @param  {Contents} contents
   * @return {Promise}
   */

	}, {
		key: "format",
		value: function format(contents, section) {
			var formating;

			if (this.name === "pre-paginated") {
				formating = contents.fit(this.columnWidth, this.height, section);
			} else if (this._flow === "paginated") {
				formating = contents.columns(this.width, this.height, this.columnWidth, this.gap, this.settings.direction);
			} else {
				// scrolled
				formating = contents.size(this.width, null);
			}

			return formating; // might be a promise in some View Managers
		}

		/**
   * Count number of pages
   * @param  {number} totalLength
   * @param  {number} pageLength
   * @return {{spreads: Number, pages: Number}}
   */

	}, {
		key: "count",
		value: function count(totalLength, pageLength) {

			var spreads = void 0,
			    pages = void 0;

			if (this.name === "pre-paginated") {
				spreads = 1;
				pages = 1;
			} else if (this._flow === "paginated") {
				pageLength = pageLength || this.delta;
				spreads = Math.ceil(totalLength / pageLength);
				pages = spreads * this.divisor;
			} else {
				// scrolled
				pageLength = pageLength || this.height;
				spreads = Math.ceil(totalLength / pageLength);
				pages = spreads;
			}

			return {
				spreads: spreads,
				pages: pages
			};
		}

		/**
   * Update props that have changed
   * @private
   * @param  {object} props
   */

	}, {
		key: "update",
		value: function update(props) {
			var _this = this;

			// Remove props that haven't changed
			Object.keys(props).forEach(function (propName) {
				if (_this.props[propName] === props[propName]) {
					delete props[propName];
				}
			});

			if (Object.keys(props).length > 0) {
				var newProps = (0, _core.extend)(this.props, props);
				this.emit(_constants.EVENTS.LAYOUT.UPDATED, newProps, props);
			}
		}
	}]);

	return Layout;
}();

(0, _eventEmitter2.default)(Layout.prototype);

exports.default = Layout;
module.exports = exports["default"];

/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _url = __webpack_require__(6);

var _url2 = _interopRequireDefault(_url);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Themes to apply to displayed content
 * @class
 * @param {Rendition} rendition
 */
var Themes = function () {
	function Themes(rendition) {
		_classCallCheck(this, Themes);

		this.rendition = rendition;
		this._themes = {
			"default": {
				"rules": {},
				"url": "",
				"serialized": ""
			}
		};
		this._overrides = {};
		this._current = "default";
		this._injected = [];
		this.rendition.hooks.content.register(this.inject.bind(this));
		this.rendition.hooks.content.register(this.overrides.bind(this));
	}

	/**
  * Add themes to be used by a rendition
  * @param {object | Array<object> | string}
  * @example themes.register("light", "http://example.com/light.css")
  * @example themes.register("light", { "body": { "color": "purple"}})
  * @example themes.register({ "light" : {...}, "dark" : {...}})
  */


	_createClass(Themes, [{
		key: "register",
		value: function register() {
			if (arguments.length === 0) {
				return;
			}
			if (arguments.length === 1 && _typeof(arguments[0]) === "object") {
				return this.registerThemes(arguments[0]);
			}
			if (arguments.length === 1 && typeof arguments[0] === "string") {
				return this.default(arguments[0]);
			}
			if (arguments.length === 2 && typeof arguments[1] === "string") {
				return this.registerUrl(arguments[0], arguments[1]);
			}
			if (arguments.length === 2 && _typeof(arguments[1]) === "object") {
				return this.registerRules(arguments[0], arguments[1]);
			}
		}

		/**
   * Add a default theme to be used by a rendition
   * @param {object | string} theme
   * @example themes.register("http://example.com/default.css")
   * @example themes.register({ "body": { "color": "purple"}})
   */

	}, {
		key: "default",
		value: function _default(theme) {
			if (!theme) {
				return;
			}
			if (typeof theme === "string") {
				return this.registerUrl("default", theme);
			}
			if ((typeof theme === "undefined" ? "undefined" : _typeof(theme)) === "object") {
				return this.registerRules("default", theme);
			}
		}

		/**
   * Register themes object
   * @param {object} themes
   */

	}, {
		key: "registerThemes",
		value: function registerThemes(themes) {
			for (var theme in themes) {
				if (themes.hasOwnProperty(theme)) {
					if (typeof themes[theme] === "string") {
						this.registerUrl(theme, themes[theme]);
					} else {
						this.registerRules(theme, themes[theme]);
					}
				}
			}
		}

		/**
   * Register a theme by passing its css as string
   * @param {string} name 
   * @param {string} css 
   */

	}, {
		key: "registerCss",
		value: function registerCss(name, css) {
			this._themes[name] = { "serialized": css };
			if (this._injected[name] || name == 'default') {
				this.update(name);
			}
		}

		/**
   * Register a url
   * @param {string} name
   * @param {string} input
   */

	}, {
		key: "registerUrl",
		value: function registerUrl(name, input) {
			var url = new _url2.default(input);
			this._themes[name] = { "url": url.toString() };
			if (this._injected[name] || name == 'default') {
				this.update(name);
			}
		}

		/**
   * Register rule
   * @param {string} name
   * @param {object} rules
   */

	}, {
		key: "registerRules",
		value: function registerRules(name, rules) {
			this._themes[name] = { "rules": rules };
			// TODO: serialize css rules
			if (this._injected[name] || name == 'default') {
				this.update(name);
			}
		}

		/**
   * Select a theme
   * @param {string} name
   */

	}, {
		key: "select",
		value: function select(name) {
			var prev = this._current;
			var contents;

			this._current = name;
			this.update(name);

			contents = this.rendition.getContents();
			contents.forEach(function (content) {
				content.removeClass(prev);
				content.addClass(name);
			});
		}

		/**
   * Update a theme
   * @param {string} name
   */

	}, {
		key: "update",
		value: function update(name) {
			var _this = this;

			var contents = this.rendition.getContents();
			contents.forEach(function (content) {
				_this.add(name, content);
			});
		}

		/**
   * Inject all themes into contents
   * @param {Contents} contents
   */

	}, {
		key: "inject",
		value: function inject(contents) {
			var links = [];
			var themes = this._themes;
			var theme;

			for (var name in themes) {
				if (themes.hasOwnProperty(name) && (name === this._current || name === "default")) {
					theme = themes[name];
					if (theme.rules && Object.keys(theme.rules).length > 0 || theme.url && links.indexOf(theme.url) === -1) {
						this.add(name, contents);
					}
					this._injected.push(name);
				}
			}

			if (this._current != "default") {
				contents.addClass(this._current);
			}
		}

		/**
   * Add Theme to contents
   * @param {string} name
   * @param {Contents} contents
   */

	}, {
		key: "add",
		value: function add(name, contents) {
			var theme = this._themes[name];

			if (!theme || !contents) {
				return;
			}

			if (theme.url) {
				contents.addStylesheet(theme.url);
			} else if (theme.serialized) {
				contents.addStylesheetCss(theme.serialized, name);
				theme.injected = true;
			} else if (theme.rules) {
				contents.addStylesheetRules(theme.rules, name);
				theme.injected = true;
			}
		}

		/**
   * Add override
   * @param {string} name
   * @param {string} value
   * @param {boolean} priority
   */

	}, {
		key: "override",
		value: function override(name, value, priority) {
			var _this2 = this;

			var contents = this.rendition.getContents();

			this._overrides[name] = {
				value: value,
				priority: priority === true
			};

			contents.forEach(function (content) {
				content.css(name, _this2._overrides[name].value, _this2._overrides[name].priority);
			});
		}
	}, {
		key: "removeOverride",
		value: function removeOverride(name) {
			var contents = this.rendition.getContents();

			delete this._overrides[name];

			contents.forEach(function (content) {
				content.css(name);
			});
		}

		/**
   * Add all overrides
   * @param {Content} content
   */

	}, {
		key: "overrides",
		value: function overrides(contents) {
			var overrides = this._overrides;

			for (var rule in overrides) {
				if (overrides.hasOwnProperty(rule)) {
					contents.css(rule, overrides[rule].value, overrides[rule].priority);
				}
			}
		}

		/**
   * Adjust the font size of a rendition
   * @param {number} size
   */

	}, {
		key: "fontSize",
		value: function fontSize(size) {
			this.override("font-size", size);
		}

		/**
   * Adjust the font-family of a rendition
   * @param {string} f
   */

	}, {
		key: "font",
		value: function font(f) {
			this.override("font-family", f, true);
		}
	}, {
		key: "destroy",
		value: function destroy() {
			this.rendition = undefined;
			this._themes = undefined;
			this._overrides = undefined;
			this._current = undefined;
			this._injected = undefined;
		}
	}]);

	return Themes;
}();

exports.default = Themes;
module.exports = exports["default"];

/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventEmitter = __webpack_require__(3);

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

var _epubcfi = __webpack_require__(1);

var _epubcfi2 = _interopRequireDefault(_epubcfi);

var _constants = __webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
	* Handles managing adding & removing Annotations
	* @param {Rendition} rendition
	* @class
	*/
var Annotations = function () {
	function Annotations(rendition) {
		_classCallCheck(this, Annotations);

		this.rendition = rendition;
		this.highlights = [];
		this.underlines = [];
		this.marks = [];
		this._annotations = {};
		this._annotationsBySectionIndex = {};

		this.rendition.hooks.render.register(this.inject.bind(this));
		this.rendition.hooks.unloaded.register(this.clear.bind(this));
	}

	/**
  * Add an annotation to store
  * @param {string} type Type of annotation to add: "highlight", "underline", "mark"
  * @param {EpubCFI} cfiRange EpubCFI range to attach annotation to
  * @param {object} data Data to assign to annotation
  * @param {function} [cb] Callback after annotation is added
  * @param {string} className CSS class to assign to annotation
  * @param {object} styles CSS styles to assign to annotation
  * @returns {Annotation} annotation
  */


	_createClass(Annotations, [{
		key: "add",
		value: function add(type, cfiRange, data, cb, className, styles) {
			var hash = encodeURI(cfiRange + type);
			var cfi = new _epubcfi2.default(cfiRange);
			var sectionIndex = cfi.spinePos;
			var annotation = new Annotation({
				type: type,
				cfiRange: cfiRange,
				data: data,
				sectionIndex: sectionIndex,
				cb: cb,
				className: className,
				styles: styles
			});

			this._annotations[hash] = annotation;

			if (sectionIndex in this._annotationsBySectionIndex) {
				this._annotationsBySectionIndex[sectionIndex].push(hash);
			} else {
				this._annotationsBySectionIndex[sectionIndex] = [hash];
			}

			var views = this.rendition.views();

			views.forEach(function (view) {
				if (annotation.sectionIndex === view.index) {
					annotation.attach(view);
				}
			});

			return annotation;
		}

		/**
   * Remove an annotation from store
   * @param {EpubCFI} cfiRange EpubCFI range the annotation is attached to
   * @param {string} type Type of annotation to add: "highlight", "underline", "mark"
   */

	}, {
		key: "remove",
		value: function remove(cfiRange, type) {
			var _this = this;

			var hash = encodeURI(cfiRange + type);

			if (hash in this._annotations) {
				var annotation = this._annotations[hash];

				if (type && annotation.type !== type) {
					return;
				}

				var views = this.rendition.views();
				views.forEach(function (view) {
					_this._removeFromAnnotationBySectionIndex(annotation.sectionIndex, hash);
					if (annotation.sectionIndex === view.index) {
						annotation.detach(view);
					}
				});

				delete this._annotations[hash];
			}
		}

		/**
   * Remove an annotations by Section Index
   * @private
   */

	}, {
		key: "_removeFromAnnotationBySectionIndex",
		value: function _removeFromAnnotationBySectionIndex(sectionIndex, hash) {
			this._annotationsBySectionIndex[sectionIndex] = this._annotationsAt(sectionIndex).filter(function (h) {
				return h !== hash;
			});
		}

		/**
   * Get annotations by Section Index
   * @private
   */

	}, {
		key: "_annotationsAt",
		value: function _annotationsAt(index) {
			return this._annotationsBySectionIndex[index];
		}

		/**
   * Add a highlight to the store
   * @param {EpubCFI} cfiRange EpubCFI range to attach annotation to
   * @param {object} data Data to assign to annotation
   * @param {function} cb Callback after annotation is clicked
   * @param {string} className CSS class to assign to annotation
   * @param {object} styles CSS styles to assign to annotation
   */

	}, {
		key: "highlight",
		value: function highlight(cfiRange, data, cb, className, styles) {
			return this.add("highlight", cfiRange, data, cb, className, styles);
		}

		/**
   * Add a underline to the store
   * @param {EpubCFI} cfiRange EpubCFI range to attach annotation to
   * @param {object} data Data to assign to annotation
   * @param {function} cb Callback after annotation is clicked
   * @param {string} className CSS class to assign to annotation
   * @param {object} styles CSS styles to assign to annotation
   */

	}, {
		key: "underline",
		value: function underline(cfiRange, data, cb, className, styles) {
			return this.add("underline", cfiRange, data, cb, className, styles);
		}

		/**
   * Add a mark to the store
   * @param {EpubCFI} cfiRange EpubCFI range to attach annotation to
   * @param {object} data Data to assign to annotation
   * @param {function} cb Callback after annotation is clicked
   */

	}, {
		key: "mark",
		value: function mark(cfiRange, data, cb) {
			return this.add("mark", cfiRange, data, cb);
		}

		/**
   * iterate over annotations in the store
   */

	}, {
		key: "each",
		value: function each() {
			return this._annotations.forEach.apply(this._annotations, arguments);
		}

		/**
   * Hook for injecting annotation into a view
   * @param {View} view
   * @private
   */

	}, {
		key: "inject",
		value: function inject(view) {
			var _this2 = this;

			var sectionIndex = view.index;
			if (sectionIndex in this._annotationsBySectionIndex) {
				var annotations = this._annotationsBySectionIndex[sectionIndex];
				annotations.forEach(function (hash) {
					var annotation = _this2._annotations[hash];
					annotation.attach(view);
				});
			}
		}

		/**
   * Hook for removing annotation from a view
   * @param {View} view
   * @private
   */

	}, {
		key: "clear",
		value: function clear(view) {
			var _this3 = this;

			var sectionIndex = view.index;
			if (sectionIndex in this._annotationsBySectionIndex) {
				var annotations = this._annotationsBySectionIndex[sectionIndex];
				annotations.forEach(function (hash) {
					var annotation = _this3._annotations[hash];
					annotation.detach(view);
				});
			}
		}

		/**
   * [Not Implemented] Show annotations
   * @TODO: needs implementation in View
   */

	}, {
		key: "show",
		value: function show() {}

		/**
   * [Not Implemented] Hide annotations
   * @TODO: needs implementation in View
   */

	}, {
		key: "hide",
		value: function hide() {}
	}]);

	return Annotations;
}();

/**
 * Annotation object
 * @class
 * @param {object} options
 * @param {string} options.type Type of annotation to add: "highlight", "underline", "mark"
 * @param {EpubCFI} options.cfiRange EpubCFI range to attach annotation to
 * @param {object} options.data Data to assign to annotation
 * @param {int} options.sectionIndex Index in the Spine of the Section annotation belongs to
 * @param {function} [options.cb] Callback after annotation is clicked
 * @param {string} className CSS class to assign to annotation
 * @param {object} styles CSS styles to assign to annotation
 * @returns {Annotation} annotation
 */


var Annotation = function () {
	function Annotation(_ref) {
		var type = _ref.type,
		    cfiRange = _ref.cfiRange,
		    data = _ref.data,
		    sectionIndex = _ref.sectionIndex,
		    cb = _ref.cb,
		    className = _ref.className,
		    styles = _ref.styles;

		_classCallCheck(this, Annotation);

		this.type = type;
		this.cfiRange = cfiRange;
		this.data = data;
		this.sectionIndex = sectionIndex;
		this.mark = undefined;
		this.cb = cb;
		this.className = className;
		this.styles = styles;
	}

	/**
  * Update stored data
  * @param {object} data
  */


	_createClass(Annotation, [{
		key: "update",
		value: function update(data) {
			this.data = data;
		}

		/**
   * Add to a view
   * @param {View} view
   */

	}, {
		key: "attach",
		value: function attach(view) {
			var cfiRange = this.cfiRange,
			    data = this.data,
			    type = this.type,
			    mark = this.mark,
			    cb = this.cb,
			    className = this.className,
			    styles = this.styles;

			var result = void 0;

			if (type === "highlight") {
				result = view.highlight(cfiRange, data, cb, className, styles);
			} else if (type === "underline") {
				result = view.underline(cfiRange, data, cb, className, styles);
			} else if (type === "mark") {
				result = view.mark(cfiRange, data, cb);
			}

			this.mark = result;
			this.emit(_constants.EVENTS.ANNOTATION.ATTACH, result);
			return result;
		}

		/**
   * Remove from a view
   * @param {View} view
   */

	}, {
		key: "detach",
		value: function detach(view) {
			var cfiRange = this.cfiRange,
			    type = this.type;

			var result = void 0;

			if (view) {
				if (type === "highlight") {
					result = view.unhighlight(cfiRange);
				} else if (type === "underline") {
					result = view.ununderline(cfiRange);
				} else if (type === "mark") {
					result = view.unmark(cfiRange);
				}
			}

			this.mark = undefined;
			this.emit(_constants.EVENTS.ANNOTATION.DETACH, result);
			return result;
		}

		/**
   * [Not Implemented] Get text of an annotation
   * @TODO: needs implementation in contents
   */

	}, {
		key: "text",
		value: function text() {}
	}]);

	return Annotation;
}();

(0, _eventEmitter2.default)(Annotation.prototype);

exports.default = Annotations;
module.exports = exports["default"];

/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Underline = exports.Highlight = exports.Mark = exports.Pane = undefined;

var _get = function get(object, property, receiver) {
    if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);if (parent === null) {
            return undefined;
        } else {
            return get(parent, property, receiver);
        }
    } else if ("value" in desc) {
        return desc.value;
    } else {
        var getter = desc.get;if (getter === undefined) {
            return undefined;
        }return getter.call(receiver);
    }
};

var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
        }
    }return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
}();

var _svg = __webpack_require__(57);

var _svg2 = _interopRequireDefault(_svg);

var _events = __webpack_require__(58);

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
    }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var Pane = exports.Pane = function () {
    function Pane(target) {
        var container = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document.body;

        _classCallCheck(this, Pane);

        this.target = target;
        this.element = _svg2.default.createElement('svg');
        this.marks = [];

        // Match the coordinates of the target element
        this.element.style.position = 'absolute';
        // Disable pointer events
        this.element.setAttribute('pointer-events', 'none');

        // Set up mouse event proxying between the target element and the marks
        _events2.default.proxyMouse(this.target, this.marks);

        this.container = container;
        this.container.appendChild(this.element);

        this.render();
    }

    _createClass(Pane, [{
        key: 'addMark',
        value: function addMark(mark) {
            var g = _svg2.default.createElement('g');
            this.element.appendChild(g);
            mark.bind(g, this.container);

            this.marks.push(mark);

            mark.render();
            return mark;
        }
    }, {
        key: 'removeMark',
        value: function removeMark(mark) {
            var idx = this.marks.indexOf(mark);
            if (idx === -1) {
                return;
            }
            var el = mark.unbind();
            this.element.removeChild(el);
            this.marks.splice(idx, 1);
        }
    }, {
        key: 'render',
        value: function render() {
            setCoords(this.element, coords(this.target, this.container));
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.marks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var m = _step.value;

                    m.render();
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }
    }]);

    return Pane;
}();

var Mark = exports.Mark = function () {
    function Mark() {
        _classCallCheck(this, Mark);

        this.element = null;
    }

    _createClass(Mark, [{
        key: 'bind',
        value: function bind(element, container) {
            this.element = element;
            this.container = container;
        }
    }, {
        key: 'unbind',
        value: function unbind() {
            var el = this.element;
            this.element = null;
            return el;
        }
    }, {
        key: 'render',
        value: function render() {}
    }, {
        key: 'dispatchEvent',
        value: function dispatchEvent(e) {
            if (!this.element) return;
            this.element.dispatchEvent(e);
        }
    }, {
        key: 'getBoundingClientRect',
        value: function getBoundingClientRect() {
            return this.element.getBoundingClientRect();
        }
    }, {
        key: 'getClientRects',
        value: function getClientRects() {
            var rects = [];
            var el = this.element.firstChild;
            while (el) {
                rects.push(el.getBoundingClientRect());
                el = el.nextSibling;
            }
            return rects;
        }
    }, {
        key: 'filteredRanges',
        value: function filteredRanges() {
            var rects = Array.from(this.range.getClientRects());

            // De-duplicate the boxes
            return rects.filter(function (box) {
                for (var i = 0; i < rects.length; i++) {
                    if (rects[i] === box) {
                        return true;
                    }
                    var contained = contains(rects[i], box);
                    if (contained) {
                        return false;
                    }
                }
                return true;
            });
        }
    }]);

    return Mark;
}();

var Highlight = exports.Highlight = function (_Mark) {
    _inherits(Highlight, _Mark);

    function Highlight(range, className, data, attributes) {
        _classCallCheck(this, Highlight);

        var _this = _possibleConstructorReturn(this, (Highlight.__proto__ || Object.getPrototypeOf(Highlight)).call(this));

        _this.range = range;
        _this.className = className;
        _this.data = data || {};
        _this.attributes = attributes || {};
        return _this;
    }

    _createClass(Highlight, [{
        key: 'bind',
        value: function bind(element, container) {
            _get(Highlight.prototype.__proto__ || Object.getPrototypeOf(Highlight.prototype), 'bind', this).call(this, element, container);

            for (var attr in this.data) {
                if (this.data.hasOwnProperty(attr)) {
                    this.element.dataset[attr] = this.data[attr];
                }
            }

            for (var attr in this.attributes) {
                if (this.attributes.hasOwnProperty(attr)) {
                    this.element.setAttribute(attr, this.attributes[attr]);
                }
            }

            if (this.className) {
                this.element.classList.add(this.className);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            // Empty element
            while (this.element.firstChild) {
                this.element.removeChild(this.element.firstChild);
            }

            var docFrag = this.element.ownerDocument.createDocumentFragment();
            var filtered = this.filteredRanges();
            var offset = this.element.getBoundingClientRect();
            var container = this.container.getBoundingClientRect();

            for (var i = 0, len = filtered.length; i < len; i++) {
                var r = filtered[i];
                var el = _svg2.default.createElement('rect');
                el.setAttribute('x', r.left - offset.left + container.left);
                el.setAttribute('y', r.top - offset.top + container.top);
                el.setAttribute('height', r.height);
                el.setAttribute('width', r.width);
                docFrag.appendChild(el);
            }

            this.element.appendChild(docFrag);
        }
    }]);

    return Highlight;
}(Mark);

var Underline = exports.Underline = function (_Highlight) {
    _inherits(Underline, _Highlight);

    function Underline(range, className, data, attributes) {
        _classCallCheck(this, Underline);

        return _possibleConstructorReturn(this, (Underline.__proto__ || Object.getPrototypeOf(Underline)).call(this, range, className, data, attributes));
    }

    _createClass(Underline, [{
        key: 'render',
        value: function render() {
            // Empty element
            while (this.element.firstChild) {
                this.element.removeChild(this.element.firstChild);
            }

            var docFrag = this.element.ownerDocument.createDocumentFragment();
            var filtered = this.filteredRanges();
            var offset = this.element.getBoundingClientRect();
            var container = this.container.getBoundingClientRect();

            for (var i = 0, len = filtered.length; i < len; i++) {
                var r = filtered[i];

                var rect = _svg2.default.createElement('rect');
                rect.setAttribute('x', r.left - offset.left + container.left);
                rect.setAttribute('y', r.top - offset.top + container.top);
                rect.setAttribute('height', r.height);
                rect.setAttribute('width', r.width);
                rect.setAttribute('fill', 'none');

                var line = _svg2.default.createElement('line');
                line.setAttribute('x1', r.left - offset.left + container.left);
                line.setAttribute('x2', r.left - offset.left + container.left + r.width);
                line.setAttribute('y1', r.top - offset.top + container.top + r.height - 1);
                line.setAttribute('y2', r.top - offset.top + container.top + r.height - 1);

                line.setAttribute('stroke-width', 1);
                line.setAttribute('stroke', 'black'); //TODO: match text color?
                line.setAttribute('stroke-linecap', 'square');

                docFrag.appendChild(rect);

                docFrag.appendChild(line);
            }

            this.element.appendChild(docFrag);
        }
    }]);

    return Underline;
}(Highlight);

function coords(el, container) {
    var offset = container.getBoundingClientRect();
    var rect = el.getBoundingClientRect();

    return {
        top: rect.top - offset.top,
        left: rect.left - offset.left,
        height: el.scrollHeight,
        width: el.scrollWidth
    };
}

function setCoords(el, coords) {
    el.style.setProperty('top', coords.top + 'px', 'important');
    el.style.setProperty('left', coords.left + 'px', 'important');
    el.style.setProperty('height', coords.height + 'px', 'important');
    el.style.setProperty('width', coords.width + 'px', 'important');
}

function contains(rect1, rect2) {
    return rect2.right <= rect1.right && rect2.left >= rect1.left && rect2.top >= rect1.top && rect2.bottom <= rect1.bottom;
}

/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createElement = createElement;
function createElement(name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
}

exports.default = {
    createElement: createElement
};

/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.proxyMouse = proxyMouse;
exports.clone = clone;
// import 'babelify/polyfill'; // needed for Object.assign

exports.default = {
    proxyMouse: proxyMouse
};

/**
 * Start proxying all mouse events that occur on the target node to each node in
 * a set of tracked nodes.
 *
 * The items in tracked do not strictly have to be DOM Nodes, but they do have
 * to have dispatchEvent, getBoundingClientRect, and getClientRects methods.
 *
 * @param target {Node} The node on which to listen for mouse events.
 * @param tracked {Node[]} A (possibly mutable) array of nodes to which to proxy
 *                         events.
 */

function proxyMouse(target, tracked) {
    function dispatch(e) {
        // We walk through the set of tracked elements in reverse order so that
        // events are sent to those most recently added first.
        //
        // This is the least surprising behaviour as it simulates the way the
        // browser would work if items added later were drawn "on top of"
        // earlier ones.
        for (var i = tracked.length - 1; i >= 0; i--) {
            var t = tracked[i];
            var x = e.clientX;
            var y = e.clientY;

            if (e.touches && e.touches.length) {
                x = e.touches[0].clientX;
                y = e.touches[0].clientY;
            }

            if (!contains(t, target, x, y)) {
                continue;
            }

            // The event targets this mark, so dispatch a cloned event:
            t.dispatchEvent(clone(e));
            // We only dispatch the cloned event to the first matching mark.
            break;
        }
    }

    if (target.nodeName === "iframe" || target.nodeName === "IFRAME") {

        try {
            // Try to get the contents if same domain
            this.target = target.contentDocument;
        } catch (err) {
            this.target = target;
        }
    } else {
        this.target = target;
    }

    var _arr = ['mouseup', 'mousedown', 'click', 'touchstart'];
    for (var _i = 0; _i < _arr.length; _i++) {
        var ev = _arr[_i];
        this.target.addEventListener(ev, function (e) {
            return dispatch(e);
        }, false);
    }
}

/**
 * Clone a mouse event object.
 *
 * @param e {MouseEvent} A mouse event object to clone.
 * @returns {MouseEvent}
 */
function clone(e) {
    var opts = Object.assign({}, e, { bubbles: false });
    try {
        return new MouseEvent(e.type, opts);
    } catch (err) {
        // compat: webkit
        var copy = document.createEvent('MouseEvents');
        copy.initMouseEvent(e.type, false, opts.cancelable, opts.view, opts.detail, opts.screenX, opts.screenY, opts.clientX, opts.clientY, opts.ctrlKey, opts.altKey, opts.shiftKey, opts.metaKey, opts.button, opts.relatedTarget);
        return copy;
    }
}

/**
 * Check if the item contains the point denoted by the passed coordinates
 * @param item {Object} An object with getBoundingClientRect and getClientRects
 *                      methods.
 * @param x {Number}
 * @param y {Number}
 * @returns {Boolean}
 */
function contains(item, target, x, y) {
    // offset
    var offset = target.getBoundingClientRect();

    function rectContains(r, x, y) {
        var top = r.top - offset.top;
        var left = r.left - offset.left;
        var bottom = top + r.height;
        var right = left + r.width;
        return top <= y && left <= x && bottom > y && right > x;
    }

    // Check overall bounding box first
    var rect = item.getBoundingClientRect();
    if (!rectContains(rect, x, y)) {
        return false;
    }

    // Then continue to check each child rect
    var rects = item.getClientRects();
    for (var i = 0, len = rects.length; i < len; i++) {
        if (rectContains(rects[i], x, y)) {
            return true;
        }
    }
    return false;
}

/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = scrollType;
exports.createDefiner = createDefiner;
// Detect RTL scroll type
// Based on https://github.com/othree/jquery.rtl-scroll-type/blob/master/src/jquery.rtl-scroll.js
function scrollType() {
	var type = "reverse";
	var definer = createDefiner();
	document.body.appendChild(definer);

	if (definer.scrollLeft > 0) {
		type = "default";
	} else {
		if (typeof Element !== 'undefined' && Element.prototype.scrollIntoView) {
			definer.children[0].children[1].scrollIntoView();
			if (definer.scrollLeft < 0) {
				type = "negative";
			}
		} else {
			definer.scrollLeft = 1;
			if (definer.scrollLeft === 0) {
				type = "negative";
			}
		}
	}

	document.body.removeChild(definer);
	return type;
}

function createDefiner() {
	var definer = document.createElement('div');
	definer.dir = "rtl";

	definer.style.position = "fixed";
	definer.style.width = "1px";
	definer.style.height = "1px";
	definer.style.top = "0px";
	definer.style.left = "0px";
	definer.style.overflow = "hidden";

	var innerDiv = document.createElement('div');
	innerDiv.style.width = "2px";

	var spanA = document.createElement('span');
	spanA.style.width = "1px";
	spanA.style.display = "inline-block";

	var spanB = document.createElement('span');
	spanB.style.width = "1px";
	spanB.style.display = "inline-block";

	innerDiv.appendChild(spanA);
	innerDiv.appendChild(spanB);
	definer.appendChild(innerDiv);

	return definer;
}

/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _core = __webpack_require__(0);

var _throttle = __webpack_require__(61);

var _throttle2 = _interopRequireDefault(_throttle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Stage = function () {
	function Stage(_options) {
		_classCallCheck(this, Stage);

		this.settings = _options || {};
		this.id = "epubjs-container-" + (0, _core.uuid)();

		this.container = this.create(this.settings);

		if (this.settings.hidden) {
			this.wrapper = this.wrap(this.container);
		}
	}

	/*
 * Creates an element to render to.
 * Resizes to passed width and height or to the elements size
 */


	_createClass(Stage, [{
		key: "create",
		value: function create(options) {
			var height = options.height; // !== false ? options.height : "100%";
			var width = options.width; // !== false ? options.width : "100%";
			var overflow = options.overflow || false;
			var axis = options.axis || "vertical";
			var direction = options.direction;

			(0, _core.extend)(this.settings, options);

			if (options.height && (0, _core.isNumber)(options.height)) {
				height = options.height + "px";
			}

			if (options.width && (0, _core.isNumber)(options.width)) {
				width = options.width + "px";
			}

			// Create new container element
			var container = document.createElement("div");

			container.id = this.id;
			container.classList.add("epub-container");

			// Style Element
			// container.style.fontSize = "0";
			container.style.wordSpacing = "0";
			container.style.lineHeight = "0";
			container.style.verticalAlign = "top";
			container.style.position = "relative";

			if (axis === "horizontal") {
				// container.style.whiteSpace = "nowrap";
				container.style.display = "flex";
				container.style.flexDirection = "row";
				container.style.flexWrap = "nowrap";
			}

			if (width) {
				container.style.width = width;
			}

			if (height) {
				container.style.height = height;
			}

			if (overflow) {
				if (overflow === "scroll" && axis === "vertical") {
					container.style["overflow-y"] = overflow;
					container.style["overflow-x"] = "hidden";
				} else if (overflow === "scroll" && axis === "horizontal") {
					container.style["overflow-y"] = "hidden";
					container.style["overflow-x"] = overflow;
				} else {
					container.style["overflow"] = overflow;
				}
			}

			if (direction) {
				container.dir = direction;
				container.style["direction"] = direction;
			}

			if (direction && this.settings.fullsize) {
				document.body.style["direction"] = direction;
			}

			return container;
		}
	}, {
		key: "wrap",
		value: function wrap(container) {
			var wrapper = document.createElement("div");

			wrapper.style.visibility = "hidden";
			wrapper.style.overflow = "hidden";
			wrapper.style.width = "0";
			wrapper.style.height = "0";

			wrapper.appendChild(container);
			return wrapper;
		}
	}, {
		key: "getElement",
		value: function getElement(_element) {
			var element;

			if ((0, _core.isElement)(_element)) {
				element = _element;
			} else if (typeof _element === "string") {
				element = document.getElementById(_element);
			}

			if (!element) {
				throw new Error("Not an Element");
			}

			return element;
		}
	}, {
		key: "attachTo",
		value: function attachTo(what) {

			var element = this.getElement(what);
			var base;

			if (!element) {
				return;
			}

			if (this.settings.hidden) {
				base = this.wrapper;
			} else {
				base = this.container;
			}

			element.appendChild(base);

			this.element = element;

			return element;
		}
	}, {
		key: "getContainer",
		value: function getContainer() {
			return this.container;
		}
	}, {
		key: "onResize",
		value: function onResize(func) {
			// Only listen to window for resize event if width and height are not fixed.
			// This applies if it is set to a percent or auto.
			if (!(0, _core.isNumber)(this.settings.width) || !(0, _core.isNumber)(this.settings.height)) {
				this.resizeFunc = (0, _throttle2.default)(func, 50);
				window.addEventListener("resize", this.resizeFunc, false);
			}
		}
	}, {
		key: "onOrientationChange",
		value: function onOrientationChange(func) {
			this.orientationChangeFunc = func;
			window.addEventListener("orientationchange", this.orientationChangeFunc, false);
		}
	}, {
		key: "size",
		value: function size(width, height) {
			var bounds;
			var _width = width || this.settings.width;
			var _height = height || this.settings.height;

			// If width or height are set to false, inherit them from containing element
			if (width === null) {
				bounds = this.element.getBoundingClientRect();

				if (bounds.width) {
					width = Math.floor(bounds.width);
					this.container.style.width = width + "px";
				}
			} else {
				if ((0, _core.isNumber)(width)) {
					this.container.style.width = width + "px";
				} else {
					this.container.style.width = width;
				}
			}

			if (height === null) {
				bounds = bounds || this.element.getBoundingClientRect();

				if (bounds.height) {
					height = bounds.height;
					this.container.style.height = height + "px";
				}
			} else {
				if ((0, _core.isNumber)(height)) {
					this.container.style.height = height + "px";
				} else {
					this.container.style.height = height;
				}
			}

			if (!(0, _core.isNumber)(width)) {
				width = this.container.clientWidth;
			}

			if (!(0, _core.isNumber)(height)) {
				height = this.container.clientHeight;
			}

			this.containerStyles = window.getComputedStyle(this.container);

			this.containerPadding = {
				left: parseFloat(this.containerStyles["padding-left"]) || 0,
				right: parseFloat(this.containerStyles["padding-right"]) || 0,
				top: parseFloat(this.containerStyles["padding-top"]) || 0,
				bottom: parseFloat(this.containerStyles["padding-bottom"]) || 0
			};

			// Bounds not set, get them from window
			var _windowBounds = (0, _core.windowBounds)();
			var bodyStyles = window.getComputedStyle(document.body);
			var bodyPadding = {
				left: parseFloat(bodyStyles["padding-left"]) || 0,
				right: parseFloat(bodyStyles["padding-right"]) || 0,
				top: parseFloat(bodyStyles["padding-top"]) || 0,
				bottom: parseFloat(bodyStyles["padding-bottom"]) || 0
			};

			if (!_width) {
				width = _windowBounds.width - bodyPadding.left - bodyPadding.right;
			}

			if (this.settings.fullsize && !_height || !_height) {
				height = _windowBounds.height - bodyPadding.top - bodyPadding.bottom;
			}

			return {
				width: width - this.containerPadding.left - this.containerPadding.right,
				height: height - this.containerPadding.top - this.containerPadding.bottom
			};
		}
	}, {
		key: "bounds",
		value: function bounds() {
			var box = void 0;
			if (this.container.style.overflow !== "visible") {
				box = this.container && this.container.getBoundingClientRect();
			}

			if (!box || !box.width || !box.height) {
				return (0, _core.windowBounds)();
			} else {
				return box;
			}
		}
	}, {
		key: "getSheet",
		value: function getSheet() {
			var style = document.createElement("style");

			// WebKit hack --> https://davidwalsh.name/add-rules-stylesheets
			style.appendChild(document.createTextNode(""));

			document.head.appendChild(style);

			return style.sheet;
		}
	}, {
		key: "addStyleRules",
		value: function addStyleRules(selector, rulesArray) {
			var scope = "#" + this.id + " ";
			var rules = "";

			if (!this.sheet) {
				this.sheet = this.getSheet();
			}

			rulesArray.forEach(function (set) {
				for (var prop in set) {
					if (set.hasOwnProperty(prop)) {
						rules += prop + ":" + set[prop] + ";";
					}
				}
			});

			this.sheet.insertRule(scope + selector + " {" + rules + "}", 0);
		}
	}, {
		key: "axis",
		value: function axis(_axis) {
			if (_axis === "horizontal") {
				this.container.style.display = "flex";
				this.container.style.flexDirection = "row";
				this.container.style.flexWrap = "nowrap";
			} else {
				this.container.style.display = "block";
			}
			this.settings.axis = _axis;
		}

		// orientation(orientation) {
		// 	if (orientation === "landscape") {
		//
		// 	} else {
		//
		// 	}
		//
		// 	this.orientation = orientation;
		// }

	}, {
		key: "direction",
		value: function direction(dir) {
			if (this.container) {
				this.container.dir = dir;
				this.container.style["direction"] = dir;
			}

			if (this.settings.fullsize) {
				document.body.style["direction"] = dir;
			}
			this.settings.dir = dir;
		}
	}, {
		key: "overflow",
		value: function overflow(_overflow) {
			if (this.container) {
				if (_overflow === "scroll" && this.settings.axis === "vertical") {
					this.container.style["overflow-y"] = _overflow;
					this.container.style["overflow-x"] = "hidden";
				} else if (_overflow === "scroll" && this.settings.axis === "horizontal") {
					this.container.style["overflow-y"] = "hidden";
					this.container.style["overflow-x"] = _overflow;
				} else {
					this.container.style["overflow"] = _overflow;
				}
			}
			this.settings.overflow = _overflow;
		}
	}, {
		key: "destroy",
		value: function destroy() {
			var base;

			if (this.element) {

				if (this.settings.hidden) {
					base = this.wrapper;
				} else {
					base = this.container;
				}

				if (this.element.contains(this.container)) {
					this.element.removeChild(this.container);
				}

				window.removeEventListener("resize", this.resizeFunc);
				window.removeEventListener("orientationChange", this.orientationChangeFunc);
			}
		}
	}]);

	return Stage;
}();

exports.default = Stage;
module.exports = exports["default"];

/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

var debounce = __webpack_require__(21),
    isObject = __webpack_require__(16);

/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/**
 * Creates a throttled function that only invokes `func` at most once per
 * every `wait` milliseconds. The throttled function comes with a `cancel`
 * method to cancel delayed `func` invocations and a `flush` method to
 * immediately invoke them. Provide `options` to indicate whether `func`
 * should be invoked on the leading and/or trailing edge of the `wait`
 * timeout. The `func` is invoked with the last arguments provided to the
 * throttled function. Subsequent calls to the throttled function return the
 * result of the last `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the throttled function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.throttle` and `_.debounce`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to throttle.
 * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=true]
 *  Specify invoking on the leading edge of the timeout.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new throttled function.
 * @example
 *
 * // Avoid excessively updating the position while scrolling.
 * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
 *
 * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
 * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
 * jQuery(element).on('click', throttled);
 *
 * // Cancel the trailing throttled invocation.
 * jQuery(window).on('popstate', throttled.cancel);
 */
function throttle(func, wait, options) {
  var leading = true,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  if (isObject(options)) {
    leading = 'leading' in options ? !!options.leading : leading;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }
  return debounce(func, wait, {
    'leading': leading,
    'maxWait': wait,
    'trailing': trailing
  });
}

module.exports = throttle;


/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

var root = __webpack_require__(22);

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now = function() {
  return root.Date.now();
};

module.exports = now;


/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

module.exports = freeGlobal;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(16),
    isSymbol = __webpack_require__(65);

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

module.exports = toNumber;


/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__(66),
    isObjectLike = __webpack_require__(69);

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && baseGetTag(value) == symbolTag);
}

module.exports = isSymbol;


/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__(23),
    getRawTag = __webpack_require__(67),
    objectToString = __webpack_require__(68);

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

module.exports = baseGetTag;


/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__(23);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

module.exports = getRawTag;


/***/ }),
/* 68 */
/***/ (function(module, exports) {

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

module.exports = objectToString;


/***/ }),
/* 69 */
/***/ (function(module, exports) {

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

module.exports = isObjectLike;


/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Views = function () {
	function Views(container) {
		_classCallCheck(this, Views);

		this.container = container;
		this._views = [];
		this.length = 0;
		this.hidden = false;
	}

	_createClass(Views, [{
		key: "all",
		value: function all() {
			return this._views;
		}
	}, {
		key: "first",
		value: function first() {
			return this._views[0];
		}
	}, {
		key: "last",
		value: function last() {
			return this._views[this._views.length - 1];
		}
	}, {
		key: "indexOf",
		value: function indexOf(view) {
			return this._views.indexOf(view);
		}
	}, {
		key: "slice",
		value: function slice() {
			return this._views.slice.apply(this._views, arguments);
		}
	}, {
		key: "get",
		value: function get(i) {
			return this._views[i];
		}
	}, {
		key: "append",
		value: function append(view) {
			this._views.push(view);
			if (this.container) {
				this.container.appendChild(view.element);
			}
			this.length++;
			return view;
		}
	}, {
		key: "prepend",
		value: function prepend(view) {
			this._views.unshift(view);
			if (this.container) {
				this.container.insertBefore(view.element, this.container.firstChild);
			}
			this.length++;
			return view;
		}
	}, {
		key: "insert",
		value: function insert(view, index) {
			this._views.splice(index, 0, view);

			if (this.container) {
				if (index < this.container.children.length) {
					this.container.insertBefore(view.element, this.container.children[index]);
				} else {
					this.container.appendChild(view.element);
				}
			}

			this.length++;
			return view;
		}
	}, {
		key: "remove",
		value: function remove(view) {
			var index = this._views.indexOf(view);

			if (index > -1) {
				this._views.splice(index, 1);
			}

			this.destroy(view);

			this.length--;
		}
	}, {
		key: "destroy",
		value: function destroy(view) {
			if (view.displayed) {
				view.destroy();
			}

			if (this.container) {
				this.container.removeChild(view.element);
			}
			view = null;
		}

		// Iterators

	}, {
		key: "forEach",
		value: function forEach() {
			return this._views.forEach.apply(this._views, arguments);
		}
	}, {
		key: "clear",
		value: function clear() {
			// Remove all views
			var view;
			var len = this.length;

			if (!this.length) return;

			for (var i = 0; i < len; i++) {
				view = this._views[i];
				this.destroy(view);
			}

			this._views = [];
			this.length = 0;
		}
	}, {
		key: "find",
		value: function find(section) {

			var view;
			var len = this.length;

			for (var i = 0; i < len; i++) {
				view = this._views[i];
				if (view.displayed && view.section.index == section.index) {
					return view;
				}
			}
		}
	}, {
		key: "displayed",
		value: function displayed() {
			var displayed = [];
			var view;
			var len = this.length;

			for (var i = 0; i < len; i++) {
				view = this._views[i];
				if (view.displayed) {
					displayed.push(view);
				}
			}
			return displayed;
		}
	}, {
		key: "show",
		value: function show() {
			var view;
			var len = this.length;

			for (var i = 0; i < len; i++) {
				view = this._views[i];
				if (view.displayed) {
					view.show();
				}
			}
			this.hidden = false;
		}
	}, {
		key: "hide",
		value: function hide() {
			var view;
			var len = this.length;

			for (var i = 0; i < len; i++) {
				view = this._views[i];
				if (view.displayed) {
					view.hide();
				}
			}
			this.hidden = true;
		}
	}]);

	return Views;
}();

exports.default = Views;
module.exports = exports["default"];

/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _core = __webpack_require__(0);

var _constants = __webpack_require__(2);

var _eventEmitter = __webpack_require__(3);

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// easing equations from https://github.com/danro/easing-js/blob/master/easing.js
var PI_D2 = Math.PI / 2;
var EASING_EQUATIONS = {
	easeOutSine: function easeOutSine(pos) {
		return Math.sin(pos * PI_D2);
	},
	easeInOutSine: function easeInOutSine(pos) {
		return -0.5 * (Math.cos(Math.PI * pos) - 1);
	},
	easeInOutQuint: function easeInOutQuint(pos) {
		if ((pos /= 0.5) < 1) {
			return 0.5 * Math.pow(pos, 5);
		}
		return 0.5 * (Math.pow(pos - 2, 5) + 2);
	},
	easeInCubic: function easeInCubic(pos) {
		return Math.pow(pos, 3);
	}
};

var Snap = function () {
	function Snap(manager, options) {
		_classCallCheck(this, Snap);

		this.settings = (0, _core.extend)({
			duration: 80,
			minVelocity: 0.2,
			minDistance: 10,
			easing: EASING_EQUATIONS['easeInCubic']
		}, options || {});

		this.supportsTouch = this.supportsTouch();

		if (this.supportsTouch) {
			this.setup(manager);
		}
	}

	_createClass(Snap, [{
		key: "setup",
		value: function setup(manager) {
			this.manager = manager;

			this.layout = this.manager.layout;

			this.fullsize = this.manager.settings.fullsize;
			if (this.fullsize) {
				this.element = this.manager.stage.element;
				this.scroller = window;
				this.disableScroll();
			} else {
				this.element = this.manager.stage.container;
				this.scroller = this.element;
				this.element.style["WebkitOverflowScrolling"] = "touch";
			}

			// this.overflow = this.manager.overflow;

			// set lookahead offset to page width
			this.manager.settings.offset = this.layout.width;
			this.manager.settings.afterScrolledTimeout = this.settings.duration * 2;

			this.isVertical = this.manager.settings.axis === "vertical";

			// disable snapping if not paginated or axis in not horizontal
			if (!this.manager.isPaginated || this.isVertical) {
				return;
			}

			this.touchCanceler = false;
			this.resizeCanceler = false;
			this.snapping = false;

			this.scrollLeft;
			this.scrollTop;

			this.startTouchX = undefined;
			this.startTouchY = undefined;
			this.startTime = undefined;
			this.endTouchX = undefined;
			this.endTouchY = undefined;
			this.endTime = undefined;

			this.addListeners();
		}
	}, {
		key: "supportsTouch",
		value: function supportsTouch() {
			if ('ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch) {
				return true;
			}

			return false;
		}
	}, {
		key: "disableScroll",
		value: function disableScroll() {
			this.element.style.overflow = "hidden";
		}
	}, {
		key: "enableScroll",
		value: function enableScroll() {
			this.element.style.overflow = "";
		}
	}, {
		key: "addListeners",
		value: function addListeners() {
			this._onResize = this.onResize.bind(this);
			window.addEventListener('resize', this._onResize);

			this._onScroll = this.onScroll.bind(this);
			this.scroller.addEventListener('scroll', this._onScroll);

			this._onTouchStart = this.onTouchStart.bind(this);
			this.scroller.addEventListener('touchstart', this._onTouchStart, { passive: true });
			this.on('touchstart', this._onTouchStart);

			this._onTouchMove = this.onTouchMove.bind(this);
			this.scroller.addEventListener('touchmove', this._onTouchMove, { passive: true });
			this.on('touchmove', this._onTouchMove);

			this._onTouchEnd = this.onTouchEnd.bind(this);
			this.scroller.addEventListener('touchend', this._onTouchEnd, { passive: true });
			this.on('touchend', this._onTouchEnd);

			this._afterDisplayed = this.afterDisplayed.bind(this);
			this.manager.on(_constants.EVENTS.MANAGERS.ADDED, this._afterDisplayed);
		}
	}, {
		key: "removeListeners",
		value: function removeListeners() {
			window.removeEventListener('resize', this._onResize);
			this._onResize = undefined;

			this.scroller.removeEventListener('scroll', this._onScroll);
			this._onScroll = undefined;

			this.scroller.removeEventListener('touchstart', this._onTouchStart, { passive: true });
			this.off('touchstart', this._onTouchStart);
			this._onTouchStart = undefined;

			this.scroller.removeEventListener('touchmove', this._onTouchMove, { passive: true });
			this.off('touchmove', this._onTouchMove);
			this._onTouchMove = undefined;

			this.scroller.removeEventListener('touchend', this._onTouchEnd, { passive: true });
			this.off('touchend', this._onTouchEnd);
			this._onTouchEnd = undefined;

			this.manager.off(_constants.EVENTS.MANAGERS.ADDED, this._afterDisplayed);
			this._afterDisplayed = undefined;
		}
	}, {
		key: "afterDisplayed",
		value: function afterDisplayed(view) {
			var _this = this;

			var contents = view.contents;
			["touchstart", "touchmove", "touchend"].forEach(function (e) {
				contents.on(e, function (ev) {
					return _this.triggerViewEvent(ev, contents);
				});
			});
		}
	}, {
		key: "triggerViewEvent",
		value: function triggerViewEvent(e, contents) {
			this.emit(e.type, e, contents);
		}
	}, {
		key: "onScroll",
		value: function onScroll(e) {
			this.scrollLeft = this.fullsize ? window.scrollX : this.scroller.scrollLeft;
			this.scrollTop = this.fullsize ? window.scrollY : this.scroller.scrollTop;
		}
	}, {
		key: "onResize",
		value: function onResize(e) {
			this.resizeCanceler = true;
		}
	}, {
		key: "onTouchStart",
		value: function onTouchStart(e) {
			var _e$touches$ = e.touches[0],
			    screenX = _e$touches$.screenX,
			    screenY = _e$touches$.screenY;


			if (this.fullsize) {
				this.enableScroll();
			}

			this.touchCanceler = true;

			if (!this.startTouchX) {
				this.startTouchX = screenX;
				this.startTouchY = screenY;
				this.startTime = this.now();
			}

			this.endTouchX = screenX;
			this.endTouchY = screenY;
			this.endTime = this.now();
		}
	}, {
		key: "onTouchMove",
		value: function onTouchMove(e) {
			var _e$touches$2 = e.touches[0],
			    screenX = _e$touches$2.screenX,
			    screenY = _e$touches$2.screenY;

			var deltaY = Math.abs(screenY - this.endTouchY);

			this.touchCanceler = true;

			if (!this.fullsize && deltaY < 10) {
				this.element.scrollLeft -= screenX - this.endTouchX;
			}

			this.endTouchX = screenX;
			this.endTouchY = screenY;
			this.endTime = this.now();
		}
	}, {
		key: "onTouchEnd",
		value: function onTouchEnd(e) {
			if (this.fullsize) {
				this.disableScroll();
			}

			this.touchCanceler = false;

			var swipped = this.wasSwiped();

			if (swipped !== 0) {
				this.snap(swipped);
			} else {
				this.snap();
			}

			this.startTouchX = undefined;
			this.startTouchY = undefined;
			this.startTime = undefined;
			this.endTouchX = undefined;
			this.endTouchY = undefined;
			this.endTime = undefined;
		}
	}, {
		key: "wasSwiped",
		value: function wasSwiped() {
			var snapWidth = this.layout.pageWidth * this.layout.divisor;
			var distance = this.endTouchX - this.startTouchX;
			var absolute = Math.abs(distance);
			var time = this.endTime - this.startTime;
			var velocity = distance / time;
			var minVelocity = this.settings.minVelocity;

			if (absolute <= this.settings.minDistance || absolute >= snapWidth) {
				return 0;
			}

			if (velocity > minVelocity) {
				// previous
				return -1;
			} else if (velocity < -minVelocity) {
				// next
				return 1;
			}
		}
	}, {
		key: "needsSnap",
		value: function needsSnap() {
			var left = this.scrollLeft;
			var snapWidth = this.layout.pageWidth * this.layout.divisor;
			return left % snapWidth !== 0;
		}
	}, {
		key: "snap",
		value: function snap() {
			var howMany = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

			var left = this.scrollLeft;
			var snapWidth = this.layout.pageWidth * this.layout.divisor;
			var snapTo = Math.round(left / snapWidth) * snapWidth;

			if (howMany) {
				snapTo += howMany * snapWidth;
			}

			return this.smoothScrollTo(snapTo);
		}
	}, {
		key: "smoothScrollTo",
		value: function smoothScrollTo(destination) {
			var deferred = new _core.defer();
			var start = this.scrollLeft;
			var startTime = this.now();

			var duration = this.settings.duration;
			var easing = this.settings.easing;

			this.snapping = true;

			// add animation loop
			function tick() {
				var now = this.now();
				var time = Math.min(1, (now - startTime) / duration);
				var timeFunction = easing(time);

				if (this.touchCanceler || this.resizeCanceler) {
					this.resizeCanceler = false;
					this.snapping = false;
					deferred.resolve();
					return;
				}

				if (time < 1) {
					window.requestAnimationFrame(tick.bind(this));
					this.scrollTo(start + (destination - start) * time, 0);
				} else {
					this.scrollTo(destination, 0);
					this.snapping = false;
					deferred.resolve();
				}
			}

			tick.call(this);

			return deferred.promise;
		}
	}, {
		key: "scrollTo",
		value: function scrollTo() {
			var left = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
			var top = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

			if (this.fullsize) {
				window.scroll(left, top);
			} else {
				this.scroller.scrollLeft = left;
				this.scroller.scrollTop = top;
			}
		}
	}, {
		key: "now",
		value: function now() {
			return 'now' in window.performance ? performance.now() : new Date().getTime();
		}
	}, {
		key: "destroy",
		value: function destroy() {
			if (!this.scroller) {
				return;
			}

			if (this.fullsize) {
				this.enableScroll();
			}

			this.removeListeners();

			this.scroller = undefined;
		}
	}]);

	return Snap;
}();

(0, _eventEmitter2.default)(Snap.prototype);

exports.default = Snap;
module.exports = exports["default"];

/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _core = __webpack_require__(0);

var _request = __webpack_require__(9);

var _request2 = _interopRequireDefault(_request);

var _mime = __webpack_require__(13);

var _mime2 = _interopRequireDefault(_mime);

var _path = __webpack_require__(4);

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Handles Unzipping a requesting files from an Epub Archive
 * @class
 */
var Archive = function () {
	function Archive() {
		_classCallCheck(this, Archive);

		this.zip = undefined;
		this.urlCache = {};

		this.checkRequirements();
	}

	/**
  * Checks to see if JSZip exists in global namspace,
  * Requires JSZip if it isn't there
  * @private
  */


	_createClass(Archive, [{
		key: "checkRequirements",
		value: function checkRequirements() {
			try {
				if (typeof JSZip === "undefined") {
					var _JSZip = __webpack_require__(73);
					this.zip = new _JSZip();
				} else {
					this.zip = new JSZip();
				}
			} catch (e) {
				throw new Error("JSZip lib not loaded");
			}
		}

		/**
   * Open an archive
   * @param  {binary} input
   * @param  {boolean} [isBase64] tells JSZip if the input data is base64 encoded
   * @return {Promise} zipfile
   */

	}, {
		key: "open",
		value: function open(input, isBase64) {
			return this.zip.loadAsync(input, { "base64": isBase64 });
		}

		/**
   * Load and Open an archive
   * @param  {string} zipUrl
   * @param  {boolean} [isBase64] tells JSZip if the input data is base64 encoded
   * @return {Promise} zipfile
   */

	}, {
		key: "openUrl",
		value: function openUrl(zipUrl, isBase64) {
			return (0, _request2.default)(zipUrl, "binary").then(function (data) {
				return this.zip.loadAsync(data, { "base64": isBase64 });
			}.bind(this));
		}

		/**
   * Request a url from the archive
   * @param  {string} url  a url to request from the archive
   * @param  {string} [type] specify the type of the returned result
   * @return {Promise<Blob | string | JSON | Document | XMLDocument>}
   */

	}, {
		key: "request",
		value: function request(url, type) {
			var deferred = new _core.defer();
			var response;
			var path = new _path2.default(url);

			// If type isn't set, determine it from the file extension
			if (!type) {
				type = path.extension;
			}

			if (type == "blob") {
				response = this.getBlob(url);
			} else {
				response = this.getText(url);
			}

			if (response) {
				response.then(function (r) {
					var result = this.handleResponse(r, type);
					deferred.resolve(result);
				}.bind(this));
			} else {
				deferred.reject({
					message: "File not found in the epub: " + url,
					stack: new Error().stack
				});
			}
			return deferred.promise;
		}

		/**
   * Handle the response from request
   * @private
   * @param  {any} response
   * @param  {string} [type]
   * @return {any} the parsed result
   */

	}, {
		key: "handleResponse",
		value: function handleResponse(response, type) {
			var r;

			if (type == "json") {
				r = JSON.parse(response);
			} else if ((0, _core.isXml)(type)) {
				r = (0, _core.parse)(response, "text/xml");
			} else if (type == "xhtml") {
				r = (0, _core.parse)(response, "application/xhtml+xml");
			} else if (type == "html" || type == "htm") {
				r = (0, _core.parse)(response, /<\s*a[^>]*\/>/gi.test(response) ? "application/xhtml+xml" : "text/html");
			} else {
				r = response;
			}

			return r;
		}

		/**
   * Get a Blob from Archive by Url
   * @param  {string} url
   * @param  {string} [mimeType]
   * @return {Blob}
   */

	}, {
		key: "getBlob",
		value: function getBlob(url, mimeType) {
			var decodededUrl = window.decodeURIComponent(url.substr(1)); // Remove first slash
			var entry = this.zip.file(decodededUrl);

			if (entry) {
				mimeType = mimeType || _mime2.default.lookup(entry.name);
				return entry.async("uint8array").then(function (uint8array) {
					return new Blob([uint8array], { type: mimeType });
				});
			}
		}

		/**
   * Get Text from Archive by Url
   * @param  {string} url
   * @param  {string} [encoding]
   * @return {string}
   */

	}, {
		key: "getText",
		value: function getText(url, encoding) {
			var decodededUrl = window.decodeURIComponent(url.substr(1)); // Remove first slash
			var entry = this.zip.file(decodededUrl);

			if (entry) {
				return entry.async("string").then(function (text) {
					return text;
				});
			}
		}

		/**
   * Get a base64 encoded result from Archive by Url
   * @param  {string} url
   * @param  {string} [mimeType]
   * @return {string} base64 encoded
   */

	}, {
		key: "getBase64",
		value: function getBase64(url, mimeType) {
			var decodededUrl = window.decodeURIComponent(url.substr(1)); // Remove first slash
			var entry = this.zip.file(decodededUrl);

			if (entry) {
				mimeType = mimeType || _mime2.default.lookup(entry.name);
				return entry.async("base64").then(function (data) {
					return "data:" + mimeType + ";base64," + data;
				});
			}
		}

		/**
   * Create a Url from an unarchived item
   * @param  {string} url
   * @param  {object} [options.base64] use base64 encoding or blob url
   * @return {Promise} url promise with Url string
   */

	}, {
		key: "createUrl",
		value: function createUrl(url, options) {
			var deferred = new _core.defer();
			var _URL = window.URL || window.webkitURL || window.mozURL;
			var tempUrl;
			var response;
			var useBase64 = options && options.base64;

			if (url in this.urlCache) {
				deferred.resolve(this.urlCache[url]);
				return deferred.promise;
			}

			if (useBase64) {
				response = this.getBase64(url);

				if (response) {
					response.then(function (tempUrl) {

						this.urlCache[url] = tempUrl;
						deferred.resolve(tempUrl);
					}.bind(this));
				}
			} else {

				response = this.getBlob(url);

				if (response) {
					response.then(function (blob) {

						tempUrl = _URL.createObjectURL(blob);
						this.urlCache[url] = tempUrl;
						deferred.resolve(tempUrl);
					}.bind(this));
				}
			}

			if (!response) {
				deferred.reject({
					message: "File not found in the epub: " + url,
					stack: new Error().stack
				});
			}

			return deferred.promise;
		}

		/**
   * Revoke Temp Url for a achive item
   * @param  {string} url url of the item in the archive
   */

	}, {
		key: "revokeUrl",
		value: function revokeUrl(url) {
			var _URL = window.URL || window.webkitURL || window.mozURL;
			var fromCache = this.urlCache[url];
			if (fromCache) _URL.revokeObjectURL(fromCache);
		}
	}, {
		key: "destroy",
		value: function destroy() {
			var _URL = window.URL || window.webkitURL || window.mozURL;
			for (var fromCache in this.urlCache) {
				_URL.revokeObjectURL(fromCache);
			}
			this.zip = undefined;
			this.urlCache = {};
		}
	}]);

	return Archive;
}();

exports.default = Archive;
module.exports = exports["default"];

/***/ }),
/* 73 */
/***/ (function(module, exports) {

if(typeof __WEBPACK_EXTERNAL_MODULE_73__ === 'undefined') {var e = new Error("Cannot find module \"jszip\""); e.code = 'MODULE_NOT_FOUND'; throw e;}
module.exports = __WEBPACK_EXTERNAL_MODULE_73__;

/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _core = __webpack_require__(0);

var _request = __webpack_require__(9);

var _request2 = _interopRequireDefault(_request);

var _mime = __webpack_require__(13);

var _mime2 = _interopRequireDefault(_mime);

var _path = __webpack_require__(4);

var _path2 = _interopRequireDefault(_path);

var _eventEmitter = __webpack_require__(3);

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Handles saving and requesting files from local storage
 * @class
 * @param {string} name This should be the name of the application for modals
 * @param {function} [requester]
 * @param {function} [resolver]
 */
var Store = function () {
	function Store(name, requester, resolver) {
		_classCallCheck(this, Store);

		this.urlCache = {};

		this.storage = undefined;

		this.name = name;
		this.requester = requester || _request2.default;
		this.resolver = resolver;

		this.online = true;

		this.checkRequirements();

		this.addListeners();
	}

	/**
  * Checks to see if localForage exists in global namspace,
  * Requires localForage if it isn't there
  * @private
  */


	_createClass(Store, [{
		key: "checkRequirements",
		value: function checkRequirements() {
			try {
				var store = void 0;
				if (typeof localforage === "undefined") {
					store = __webpack_require__(75);
				} else {
					store = localforage;
				}
				this.storage = store.createInstance({
					name: this.name
				});
			} catch (e) {
				throw new Error("localForage lib not loaded");
			}
		}

		/**
   * Add online and offline event listeners
   * @private
   */

	}, {
		key: "addListeners",
		value: function addListeners() {
			this._status = this.status.bind(this);
			window.addEventListener('online', this._status);
			window.addEventListener('offline', this._status);
		}

		/**
   * Remove online and offline event listeners
   * @private
   */

	}, {
		key: "removeListeners",
		value: function removeListeners() {
			window.removeEventListener('online', this._status);
			window.removeEventListener('offline', this._status);
			this._status = undefined;
		}

		/**
   * Update the online / offline status
   * @private
   */

	}, {
		key: "status",
		value: function status(event) {
			var online = navigator.onLine;
			this.online = online;
			if (online) {
				this.emit("online", this);
			} else {
				this.emit("offline", this);
			}
		}

		/**
   * Add all of a book resources to the store
   * @param  {Resources} resources  book resources
   * @param  {boolean} [force] force resaving resources
   * @return {Promise<object>} store objects
   */

	}, {
		key: "add",
		value: function add(resources, force) {
			var _this = this;

			var mapped = resources.resources.map(function (item) {
				var href = item.href;

				var url = _this.resolver(href);
				var encodedUrl = window.encodeURIComponent(url);

				return _this.storage.getItem(encodedUrl).then(function (item) {
					if (!item || force) {
						return _this.requester(url, "binary").then(function (data) {
							return _this.storage.setItem(encodedUrl, data);
						});
					} else {
						return item;
					}
				});
			});
			return Promise.all(mapped);
		}

		/**
   * Put binary data from a url to storage
   * @param  {string} url  a url to request from storage
   * @param  {boolean} [withCredentials]
   * @param  {object} [headers]
   * @return {Promise<Blob>}
   */

	}, {
		key: "put",
		value: function put(url, withCredentials, headers) {
			var _this2 = this;

			var encodedUrl = window.encodeURIComponent(url);

			return this.storage.getItem(encodedUrl).then(function (result) {
				if (!result) {
					return _this2.requester(url, "binary", withCredentials, headers).then(function (data) {
						return _this2.storage.setItem(encodedUrl, data);
					});
				}
				return result;
			});
		}

		/**
   * Request a url
   * @param  {string} url  a url to request from storage
   * @param  {string} [type] specify the type of the returned result
   * @param  {boolean} [withCredentials]
   * @param  {object} [headers]
   * @return {Promise<Blob | string | JSON | Document | XMLDocument>}
   */

	}, {
		key: "request",
		value: function request(url, type, withCredentials, headers) {
			var _this3 = this;

			if (this.online) {
				// From network
				return this.requester(url, type, withCredentials, headers).then(function (data) {
					// save to store if not present
					_this3.put(url);
					return data;
				});
			} else {
				// From store
				return this.retrieve(url, type);
			}
		}

		/**
   * Request a url from storage
   * @param  {string} url  a url to request from storage
   * @param  {string} [type] specify the type of the returned result
   * @return {Promise<Blob | string | JSON | Document | XMLDocument>}
   */

	}, {
		key: "retrieve",
		value: function retrieve(url, type) {
			var _this4 = this;

			var deferred = new _core.defer();
			var response;
			var path = new _path2.default(url);

			// If type isn't set, determine it from the file extension
			if (!type) {
				type = path.extension;
			}

			if (type == "blob") {
				response = this.getBlob(url);
			} else {
				response = this.getText(url);
			}

			return response.then(function (r) {
				var deferred = new _core.defer();
				var result;
				if (r) {
					result = _this4.handleResponse(r, type);
					deferred.resolve(result);
				} else {
					deferred.reject({
						message: "File not found in storage: " + url,
						stack: new Error().stack
					});
				}
				return deferred.promise;
			});
		}

		/**
   * Handle the response from request
   * @private
   * @param  {any} response
   * @param  {string} [type]
   * @return {any} the parsed result
   */

	}, {
		key: "handleResponse",
		value: function handleResponse(response, type) {
			var r;

			if (type == "json") {
				r = JSON.parse(response);
			} else if ((0, _core.isXml)(type)) {
				r = (0, _core.parse)(response, "text/xml");
			} else if (type == "xhtml") {
				r = (0, _core.parse)(response, "application/xhtml+xml");
			} else if (type == "html" || type == "htm") {
				r = (0, _core.parse)(response, "text/html");
			} else {
				r = response;
			}

			return r;
		}

		/**
   * Get a Blob from Storage by Url
   * @param  {string} url
   * @param  {string} [mimeType]
   * @return {Blob}
   */

	}, {
		key: "getBlob",
		value: function getBlob(url, mimeType) {
			var encodedUrl = window.encodeURIComponent(url);

			return this.storage.getItem(encodedUrl).then(function (uint8array) {
				if (!uint8array) return;

				mimeType = mimeType || _mime2.default.lookup(url);

				return new Blob([uint8array], { type: mimeType });
			});
		}

		/**
   * Get Text from Storage by Url
   * @param  {string} url
   * @param  {string} [mimeType]
   * @return {string}
   */

	}, {
		key: "getText",
		value: function getText(url, mimeType) {
			var encodedUrl = window.encodeURIComponent(url);

			mimeType = mimeType || _mime2.default.lookup(url);

			return this.storage.getItem(encodedUrl).then(function (uint8array) {
				var deferred = new _core.defer();
				var reader = new FileReader();
				var blob;

				if (!uint8array) return;

				blob = new Blob([uint8array], { type: mimeType });

				reader.addEventListener("loadend", function () {
					deferred.resolve(reader.result);
				});

				reader.readAsText(blob, mimeType);

				return deferred.promise;
			});
		}

		/**
   * Get a base64 encoded result from Storage by Url
   * @param  {string} url
   * @param  {string} [mimeType]
   * @return {string} base64 encoded
   */

	}, {
		key: "getBase64",
		value: function getBase64(url, mimeType) {
			var encodedUrl = window.encodeURIComponent(url);

			mimeType = mimeType || _mime2.default.lookup(url);

			return this.storage.getItem(encodedUrl).then(function (uint8array) {
				var deferred = new _core.defer();
				var reader = new FileReader();
				var blob;

				if (!uint8array) return;

				blob = new Blob([uint8array], { type: mimeType });

				reader.addEventListener("loadend", function () {
					deferred.resolve(reader.result);
				});
				reader.readAsDataURL(blob, mimeType);

				return deferred.promise;
			});
		}

		/**
   * Create a Url from a stored item
   * @param  {string} url
   * @param  {object} [options.base64] use base64 encoding or blob url
   * @return {Promise} url promise with Url string
   */

	}, {
		key: "createUrl",
		value: function createUrl(url, options) {
			var deferred = new _core.defer();
			var _URL = window.URL || window.webkitURL || window.mozURL;
			var tempUrl;
			var response;
			var useBase64 = options && options.base64;

			if (url in this.urlCache) {
				deferred.resolve(this.urlCache[url]);
				return deferred.promise;
			}

			if (useBase64) {
				response = this.getBase64(url);

				if (response) {
					response.then(function (tempUrl) {

						this.urlCache[url] = tempUrl;
						deferred.resolve(tempUrl);
					}.bind(this));
				}
			} else {

				response = this.getBlob(url);

				if (response) {
					response.then(function (blob) {

						tempUrl = _URL.createObjectURL(blob);
						this.urlCache[url] = tempUrl;
						deferred.resolve(tempUrl);
					}.bind(this));
				}
			}

			if (!response) {
				deferred.reject({
					message: "File not found in storage: " + url,
					stack: new Error().stack
				});
			}

			return deferred.promise;
		}

		/**
   * Revoke Temp Url for a achive item
   * @param  {string} url url of the item in the store
   */

	}, {
		key: "revokeUrl",
		value: function revokeUrl(url) {
			var _URL = window.URL || window.webkitURL || window.mozURL;
			var fromCache = this.urlCache[url];
			if (fromCache) _URL.revokeObjectURL(fromCache);
		}
	}, {
		key: "destroy",
		value: function destroy() {
			var _URL = window.URL || window.webkitURL || window.mozURL;
			for (var fromCache in this.urlCache) {
				_URL.revokeObjectURL(fromCache);
			}
			this.urlCache = {};
			this.removeListeners();
		}
	}]);

	return Store;
}();

(0, _eventEmitter2.default)(Store.prototype);

exports.default = Store;
module.exports = exports["default"];

/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var require;var require;/*!
    localForage -- Offline Storage, Improved
    Version 1.7.3
    https://localforage.github.io/localForage
    (c) 2013-2017 Mozilla, Apache License 2.0
*/
(function(f){if(true){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.localforage = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return require(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw (f.code="MODULE_NOT_FOUND", f)}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
(function (global){
'use strict';
var Mutation = global.MutationObserver || global.WebKitMutationObserver;

var scheduleDrain;

{
  if (Mutation) {
    var called = 0;
    var observer = new Mutation(nextTick);
    var element = global.document.createTextNode('');
    observer.observe(element, {
      characterData: true
    });
    scheduleDrain = function () {
      element.data = (called = ++called % 2);
    };
  } else if (!global.setImmediate && typeof global.MessageChannel !== 'undefined') {
    var channel = new global.MessageChannel();
    channel.port1.onmessage = nextTick;
    scheduleDrain = function () {
      channel.port2.postMessage(0);
    };
  } else if ('document' in global && 'onreadystatechange' in global.document.createElement('script')) {
    scheduleDrain = function () {

      // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
      // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
      var scriptEl = global.document.createElement('script');
      scriptEl.onreadystatechange = function () {
        nextTick();

        scriptEl.onreadystatechange = null;
        scriptEl.parentNode.removeChild(scriptEl);
        scriptEl = null;
      };
      global.document.documentElement.appendChild(scriptEl);
    };
  } else {
    scheduleDrain = function () {
      setTimeout(nextTick, 0);
    };
  }
}

var draining;
var queue = [];
//named nextTick for less confusing stack traces
function nextTick() {
  draining = true;
  var i, oldQueue;
  var len = queue.length;
  while (len) {
    oldQueue = queue;
    queue = [];
    i = -1;
    while (++i < len) {
      oldQueue[i]();
    }
    len = queue.length;
  }
  draining = false;
}

module.exports = immediate;
function immediate(task) {
  if (queue.push(task) === 1 && !draining) {
    scheduleDrain();
  }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(_dereq_,module,exports){
'use strict';
var immediate = _dereq_(1);

/* istanbul ignore next */
function INTERNAL() {}

var handlers = {};

var REJECTED = ['REJECTED'];
var FULFILLED = ['FULFILLED'];
var PENDING = ['PENDING'];

module.exports = Promise;

function Promise(resolver) {
  if (typeof resolver !== 'function') {
    throw new TypeError('resolver must be a function');
  }
  this.state = PENDING;
  this.queue = [];
  this.outcome = void 0;
  if (resolver !== INTERNAL) {
    safelyResolveThenable(this, resolver);
  }
}

Promise.prototype["catch"] = function (onRejected) {
  return this.then(null, onRejected);
};
Promise.prototype.then = function (onFulfilled, onRejected) {
  if (typeof onFulfilled !== 'function' && this.state === FULFILLED ||
    typeof onRejected !== 'function' && this.state === REJECTED) {
    return this;
  }
  var promise = new this.constructor(INTERNAL);
  if (this.state !== PENDING) {
    var resolver = this.state === FULFILLED ? onFulfilled : onRejected;
    unwrap(promise, resolver, this.outcome);
  } else {
    this.queue.push(new QueueItem(promise, onFulfilled, onRejected));
  }

  return promise;
};
function QueueItem(promise, onFulfilled, onRejected) {
  this.promise = promise;
  if (typeof onFulfilled === 'function') {
    this.onFulfilled = onFulfilled;
    this.callFulfilled = this.otherCallFulfilled;
  }
  if (typeof onRejected === 'function') {
    this.onRejected = onRejected;
    this.callRejected = this.otherCallRejected;
  }
}
QueueItem.prototype.callFulfilled = function (value) {
  handlers.resolve(this.promise, value);
};
QueueItem.prototype.otherCallFulfilled = function (value) {
  unwrap(this.promise, this.onFulfilled, value);
};
QueueItem.prototype.callRejected = function (value) {
  handlers.reject(this.promise, value);
};
QueueItem.prototype.otherCallRejected = function (value) {
  unwrap(this.promise, this.onRejected, value);
};

function unwrap(promise, func, value) {
  immediate(function () {
    var returnValue;
    try {
      returnValue = func(value);
    } catch (e) {
      return handlers.reject(promise, e);
    }
    if (returnValue === promise) {
      handlers.reject(promise, new TypeError('Cannot resolve promise with itself'));
    } else {
      handlers.resolve(promise, returnValue);
    }
  });
}

handlers.resolve = function (self, value) {
  var result = tryCatch(getThen, value);
  if (result.status === 'error') {
    return handlers.reject(self, result.value);
  }
  var thenable = result.value;

  if (thenable) {
    safelyResolveThenable(self, thenable);
  } else {
    self.state = FULFILLED;
    self.outcome = value;
    var i = -1;
    var len = self.queue.length;
    while (++i < len) {
      self.queue[i].callFulfilled(value);
    }
  }
  return self;
};
handlers.reject = function (self, error) {
  self.state = REJECTED;
  self.outcome = error;
  var i = -1;
  var len = self.queue.length;
  while (++i < len) {
    self.queue[i].callRejected(error);
  }
  return self;
};

function getThen(obj) {
  // Make sure we only access the accessor once as required by the spec
  var then = obj && obj.then;
  if (obj && (typeof obj === 'object' || typeof obj === 'function') && typeof then === 'function') {
    return function appyThen() {
      then.apply(obj, arguments);
    };
  }
}

function safelyResolveThenable(self, thenable) {
  // Either fulfill, reject or reject with error
  var called = false;
  function onError(value) {
    if (called) {
      return;
    }
    called = true;
    handlers.reject(self, value);
  }

  function onSuccess(value) {
    if (called) {
      return;
    }
    called = true;
    handlers.resolve(self, value);
  }

  function tryToUnwrap() {
    thenable(onSuccess, onError);
  }

  var result = tryCatch(tryToUnwrap);
  if (result.status === 'error') {
    onError(result.value);
  }
}

function tryCatch(func, value) {
  var out = {};
  try {
    out.value = func(value);
    out.status = 'success';
  } catch (e) {
    out.status = 'error';
    out.value = e;
  }
  return out;
}

Promise.resolve = resolve;
function resolve(value) {
  if (value instanceof this) {
    return value;
  }
  return handlers.resolve(new this(INTERNAL), value);
}

Promise.reject = reject;
function reject(reason) {
  var promise = new this(INTERNAL);
  return handlers.reject(promise, reason);
}

Promise.all = all;
function all(iterable) {
  var self = this;
  if (Object.prototype.toString.call(iterable) !== '[object Array]') {
    return this.reject(new TypeError('must be an array'));
  }

  var len = iterable.length;
  var called = false;
  if (!len) {
    return this.resolve([]);
  }

  var values = new Array(len);
  var resolved = 0;
  var i = -1;
  var promise = new this(INTERNAL);

  while (++i < len) {
    allResolver(iterable[i], i);
  }
  return promise;
  function allResolver(value, i) {
    self.resolve(value).then(resolveFromAll, function (error) {
      if (!called) {
        called = true;
        handlers.reject(promise, error);
      }
    });
    function resolveFromAll(outValue) {
      values[i] = outValue;
      if (++resolved === len && !called) {
        called = true;
        handlers.resolve(promise, values);
      }
    }
  }
}

Promise.race = race;
function race(iterable) {
  var self = this;
  if (Object.prototype.toString.call(iterable) !== '[object Array]') {
    return this.reject(new TypeError('must be an array'));
  }

  var len = iterable.length;
  var called = false;
  if (!len) {
    return this.resolve([]);
  }

  var i = -1;
  var promise = new this(INTERNAL);

  while (++i < len) {
    resolver(iterable[i]);
  }
  return promise;
  function resolver(value) {
    self.resolve(value).then(function (response) {
      if (!called) {
        called = true;
        handlers.resolve(promise, response);
      }
    }, function (error) {
      if (!called) {
        called = true;
        handlers.reject(promise, error);
      }
    });
  }
}

},{"1":1}],3:[function(_dereq_,module,exports){
(function (global){
'use strict';
if (typeof global.Promise !== 'function') {
  global.Promise = _dereq_(2);
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"2":2}],4:[function(_dereq_,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function getIDB() {
    /* global indexedDB,webkitIndexedDB,mozIndexedDB,OIndexedDB,msIndexedDB */
    try {
        if (typeof indexedDB !== 'undefined') {
            return indexedDB;
        }
        if (typeof webkitIndexedDB !== 'undefined') {
            return webkitIndexedDB;
        }
        if (typeof mozIndexedDB !== 'undefined') {
            return mozIndexedDB;
        }
        if (typeof OIndexedDB !== 'undefined') {
            return OIndexedDB;
        }
        if (typeof msIndexedDB !== 'undefined') {
            return msIndexedDB;
        }
    } catch (e) {
        return;
    }
}

var idb = getIDB();

function isIndexedDBValid() {
    try {
        // Initialize IndexedDB; fall back to vendor-prefixed versions
        // if needed.
        if (!idb) {
            return false;
        }
        // We mimic PouchDB here;
        //
        // We test for openDatabase because IE Mobile identifies itself
        // as Safari. Oh the lulz...
        var isSafari = typeof openDatabase !== 'undefined' && /(Safari|iPhone|iPad|iPod)/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent) && !/BlackBerry/.test(navigator.platform);

        var hasFetch = typeof fetch === 'function' && fetch.toString().indexOf('[native code') !== -1;

        // Safari <10.1 does not meet our requirements for IDB support (#5572)
        // since Safari 10.1 shipped with fetch, we can use that to detect it
        return (!isSafari || hasFetch) && typeof indexedDB !== 'undefined' &&
        // some outdated implementations of IDB that appear on Samsung
        // and HTC Android devices <4.4 are missing IDBKeyRange
        // See: https://github.com/mozilla/localForage/issues/128
        // See: https://github.com/mozilla/localForage/issues/272
        typeof IDBKeyRange !== 'undefined';
    } catch (e) {
        return false;
    }
}

// Abstracts constructing a Blob object, so it also works in older
// browsers that don't support the native Blob constructor. (i.e.
// old QtWebKit versions, at least).
// Abstracts constructing a Blob object, so it also works in older
// browsers that don't support the native Blob constructor. (i.e.
// old QtWebKit versions, at least).
function createBlob(parts, properties) {
    /* global BlobBuilder,MSBlobBuilder,MozBlobBuilder,WebKitBlobBuilder */
    parts = parts || [];
    properties = properties || {};
    try {
        return new Blob(parts, properties);
    } catch (e) {
        if (e.name !== 'TypeError') {
            throw e;
        }
        var Builder = typeof BlobBuilder !== 'undefined' ? BlobBuilder : typeof MSBlobBuilder !== 'undefined' ? MSBlobBuilder : typeof MozBlobBuilder !== 'undefined' ? MozBlobBuilder : WebKitBlobBuilder;
        var builder = new Builder();
        for (var i = 0; i < parts.length; i += 1) {
            builder.append(parts[i]);
        }
        return builder.getBlob(properties.type);
    }
}

// This is CommonJS because lie is an external dependency, so Rollup
// can just ignore it.
if (typeof Promise === 'undefined') {
    // In the "nopromises" build this will just throw if you don't have
    // a global promise object, but it would throw anyway later.
    _dereq_(3);
}
var Promise$1 = Promise;

function executeCallback(promise, callback) {
    if (callback) {
        promise.then(function (result) {
            callback(null, result);
        }, function (error) {
            callback(error);
        });
    }
}

function executeTwoCallbacks(promise, callback, errorCallback) {
    if (typeof callback === 'function') {
        promise.then(callback);
    }

    if (typeof errorCallback === 'function') {
        promise["catch"](errorCallback);
    }
}

function normalizeKey(key) {
    // Cast the key to a string, as that's all we can set as a key.
    if (typeof key !== 'string') {
        console.warn(key + ' used as a key, but it is not a string.');
        key = String(key);
    }

    return key;
}

function getCallback() {
    if (arguments.length && typeof arguments[arguments.length - 1] === 'function') {
        return arguments[arguments.length - 1];
    }
}

// Some code originally from async_storage.js in
// [Gaia](https://github.com/mozilla-b2g/gaia).

var DETECT_BLOB_SUPPORT_STORE = 'local-forage-detect-blob-support';
var supportsBlobs = void 0;
var dbContexts = {};
var toString = Object.prototype.toString;

// Transaction Modes
var READ_ONLY = 'readonly';
var READ_WRITE = 'readwrite';

// Transform a binary string to an array buffer, because otherwise
// weird stuff happens when you try to work with the binary string directly.
// It is known.
// From http://stackoverflow.com/questions/14967647/ (continues on next line)
// encode-decode-image-with-base64-breaks-image (2013-04-21)
function _binStringToArrayBuffer(bin) {
    var length = bin.length;
    var buf = new ArrayBuffer(length);
    var arr = new Uint8Array(buf);
    for (var i = 0; i < length; i++) {
        arr[i] = bin.charCodeAt(i);
    }
    return buf;
}

//
// Blobs are not supported in all versions of IndexedDB, notably
// Chrome <37 and Android <5. In those versions, storing a blob will throw.
//
// Various other blob bugs exist in Chrome v37-42 (inclusive).
// Detecting them is expensive and confusing to users, and Chrome 37-42
// is at very low usage worldwide, so we do a hacky userAgent check instead.
//
// content-type bug: https://code.google.com/p/chromium/issues/detail?id=408120
// 404 bug: https://code.google.com/p/chromium/issues/detail?id=447916
// FileReader bug: https://code.google.com/p/chromium/issues/detail?id=447836
//
// Code borrowed from PouchDB. See:
// https://github.com/pouchdb/pouchdb/blob/master/packages/node_modules/pouchdb-adapter-idb/src/blobSupport.js
//
function _checkBlobSupportWithoutCaching(idb) {
    return new Promise$1(function (resolve) {
        var txn = idb.transaction(DETECT_BLOB_SUPPORT_STORE, READ_WRITE);
        var blob = createBlob(['']);
        txn.objectStore(DETECT_BLOB_SUPPORT_STORE).put(blob, 'key');

        txn.onabort = function (e) {
            // If the transaction aborts now its due to not being able to
            // write to the database, likely due to the disk being full
            e.preventDefault();
            e.stopPropagation();
            resolve(false);
        };

        txn.oncomplete = function () {
            var matchedChrome = navigator.userAgent.match(/Chrome\/(\d+)/);
            var matchedEdge = navigator.userAgent.match(/Edge\//);
            // MS Edge pretends to be Chrome 42:
            // https://msdn.microsoft.com/en-us/library/hh869301%28v=vs.85%29.aspx
            resolve(matchedEdge || !matchedChrome || parseInt(matchedChrome[1], 10) >= 43);
        };
    })["catch"](function () {
        return false; // error, so assume unsupported
    });
}

function _checkBlobSupport(idb) {
    if (typeof supportsBlobs === 'boolean') {
        return Promise$1.resolve(supportsBlobs);
    }
    return _checkBlobSupportWithoutCaching(idb).then(function (value) {
        supportsBlobs = value;
        return supportsBlobs;
    });
}

function _deferReadiness(dbInfo) {
    var dbContext = dbContexts[dbInfo.name];

    // Create a deferred object representing the current database operation.
    var deferredOperation = {};

    deferredOperation.promise = new Promise$1(function (resolve, reject) {
        deferredOperation.resolve = resolve;
        deferredOperation.reject = reject;
    });

    // Enqueue the deferred operation.
    dbContext.deferredOperations.push(deferredOperation);

    // Chain its promise to the database readiness.
    if (!dbContext.dbReady) {
        dbContext.dbReady = deferredOperation.promise;
    } else {
        dbContext.dbReady = dbContext.dbReady.then(function () {
            return deferredOperation.promise;
        });
    }
}

function _advanceReadiness(dbInfo) {
    var dbContext = dbContexts[dbInfo.name];

    // Dequeue a deferred operation.
    var deferredOperation = dbContext.deferredOperations.pop();

    // Resolve its promise (which is part of the database readiness
    // chain of promises).
    if (deferredOperation) {
        deferredOperation.resolve();
        return deferredOperation.promise;
    }
}

function _rejectReadiness(dbInfo, err) {
    var dbContext = dbContexts[dbInfo.name];

    // Dequeue a deferred operation.
    var deferredOperation = dbContext.deferredOperations.pop();

    // Reject its promise (which is part of the database readiness
    // chain of promises).
    if (deferredOperation) {
        deferredOperation.reject(err);
        return deferredOperation.promise;
    }
}

function _getConnection(dbInfo, upgradeNeeded) {
    return new Promise$1(function (resolve, reject) {
        dbContexts[dbInfo.name] = dbContexts[dbInfo.name] || createDbContext();

        if (dbInfo.db) {
            if (upgradeNeeded) {
                _deferReadiness(dbInfo);
                dbInfo.db.close();
            } else {
                return resolve(dbInfo.db);
            }
        }

        var dbArgs = [dbInfo.name];

        if (upgradeNeeded) {
            dbArgs.push(dbInfo.version);
        }

        var openreq = idb.open.apply(idb, dbArgs);

        if (upgradeNeeded) {
            openreq.onupgradeneeded = function (e) {
                var db = openreq.result;
                try {
                    db.createObjectStore(dbInfo.storeName);
                    if (e.oldVersion <= 1) {
                        // Added when support for blob shims was added
                        db.createObjectStore(DETECT_BLOB_SUPPORT_STORE);
                    }
                } catch (ex) {
                    if (ex.name === 'ConstraintError') {
                        console.warn('The database "' + dbInfo.name + '"' + ' has been upgraded from version ' + e.oldVersion + ' to version ' + e.newVersion + ', but the storage "' + dbInfo.storeName + '" already exists.');
                    } else {
                        throw ex;
                    }
                }
            };
        }

        openreq.onerror = function (e) {
            e.preventDefault();
            reject(openreq.error);
        };

        openreq.onsuccess = function () {
            resolve(openreq.result);
            _advanceReadiness(dbInfo);
        };
    });
}

function _getOriginalConnection(dbInfo) {
    return _getConnection(dbInfo, false);
}

function _getUpgradedConnection(dbInfo) {
    return _getConnection(dbInfo, true);
}

function _isUpgradeNeeded(dbInfo, defaultVersion) {
    if (!dbInfo.db) {
        return true;
    }

    var isNewStore = !dbInfo.db.objectStoreNames.contains(dbInfo.storeName);
    var isDowngrade = dbInfo.version < dbInfo.db.version;
    var isUpgrade = dbInfo.version > dbInfo.db.version;

    if (isDowngrade) {
        // If the version is not the default one
        // then warn for impossible downgrade.
        if (dbInfo.version !== defaultVersion) {
            console.warn('The database "' + dbInfo.name + '"' + " can't be downgraded from version " + dbInfo.db.version + ' to version ' + dbInfo.version + '.');
        }
        // Align the versions to prevent errors.
        dbInfo.version = dbInfo.db.version;
    }

    if (isUpgrade || isNewStore) {
        // If the store is new then increment the version (if needed).
        // This will trigger an "upgradeneeded" event which is required
        // for creating a store.
        if (isNewStore) {
            var incVersion = dbInfo.db.version + 1;
            if (incVersion > dbInfo.version) {
                dbInfo.version = incVersion;
            }
        }

        return true;
    }

    return false;
}

// encode a blob for indexeddb engines that don't support blobs
function _encodeBlob(blob) {
    return new Promise$1(function (resolve, reject) {
        var reader = new FileReader();
        reader.onerror = reject;
        reader.onloadend = function (e) {
            var base64 = btoa(e.target.result || '');
            resolve({
                __local_forage_encoded_blob: true,
                data: base64,
                type: blob.type
            });
        };
        reader.readAsBinaryString(blob);
    });
}

// decode an encoded blob
function _decodeBlob(encodedBlob) {
    var arrayBuff = _binStringToArrayBuffer(atob(encodedBlob.data));
    return createBlob([arrayBuff], { type: encodedBlob.type });
}

// is this one of our fancy encoded blobs?
function _isEncodedBlob(value) {
    return value && value.__local_forage_encoded_blob;
}

// Specialize the default `ready()` function by making it dependent
// on the current database operations. Thus, the driver will be actually
// ready when it's been initialized (default) *and* there are no pending
// operations on the database (initiated by some other instances).
function _fullyReady(callback) {
    var self = this;

    var promise = self._initReady().then(function () {
        var dbContext = dbContexts[self._dbInfo.name];

        if (dbContext && dbContext.dbReady) {
            return dbContext.dbReady;
        }
    });

    executeTwoCallbacks(promise, callback, callback);
    return promise;
}

// Try to establish a new db connection to replace the
// current one which is broken (i.e. experiencing
// InvalidStateError while creating a transaction).
function _tryReconnect(dbInfo) {
    _deferReadiness(dbInfo);

    var dbContext = dbContexts[dbInfo.name];
    var forages = dbContext.forages;

    for (var i = 0; i < forages.length; i++) {
        var forage = forages[i];
        if (forage._dbInfo.db) {
            forage._dbInfo.db.close();
            forage._dbInfo.db = null;
        }
    }
    dbInfo.db = null;

    return _getOriginalConnection(dbInfo).then(function (db) {
        dbInfo.db = db;
        if (_isUpgradeNeeded(dbInfo)) {
            // Reopen the database for upgrading.
            return _getUpgradedConnection(dbInfo);
        }
        return db;
    }).then(function (db) {
        // store the latest db reference
        // in case the db was upgraded
        dbInfo.db = dbContext.db = db;
        for (var i = 0; i < forages.length; i++) {
            forages[i]._dbInfo.db = db;
        }
    })["catch"](function (err) {
        _rejectReadiness(dbInfo, err);
        throw err;
    });
}

// FF doesn't like Promises (micro-tasks) and IDDB store operations,
// so we have to do it with callbacks
function createTransaction(dbInfo, mode, callback, retries) {
    if (retries === undefined) {
        retries = 1;
    }

    try {
        var tx = dbInfo.db.transaction(dbInfo.storeName, mode);
        callback(null, tx);
    } catch (err) {
        if (retries > 0 && (!dbInfo.db || err.name === 'InvalidStateError' || err.name === 'NotFoundError')) {
            return Promise$1.resolve().then(function () {
                if (!dbInfo.db || err.name === 'NotFoundError' && !dbInfo.db.objectStoreNames.contains(dbInfo.storeName) && dbInfo.version <= dbInfo.db.version) {
                    // increase the db version, to create the new ObjectStore
                    if (dbInfo.db) {
                        dbInfo.version = dbInfo.db.version + 1;
                    }
                    // Reopen the database for upgrading.
                    return _getUpgradedConnection(dbInfo);
                }
            }).then(function () {
                return _tryReconnect(dbInfo).then(function () {
                    createTransaction(dbInfo, mode, callback, retries - 1);
                });
            })["catch"](callback);
        }

        callback(err);
    }
}

function createDbContext() {
    return {
        // Running localForages sharing a database.
        forages: [],
        // Shared database.
        db: null,
        // Database readiness (promise).
        dbReady: null,
        // Deferred operations on the database.
        deferredOperations: []
    };
}

// Open the IndexedDB database (automatically creates one if one didn't
// previously exist), using any options set in the config.
function _initStorage(options) {
    var self = this;
    var dbInfo = {
        db: null
    };

    if (options) {
        for (var i in options) {
            dbInfo[i] = options[i];
        }
    }

    // Get the current context of the database;
    var dbContext = dbContexts[dbInfo.name];

    // ...or create a new context.
    if (!dbContext) {
        dbContext = createDbContext();
        // Register the new context in the global container.
        dbContexts[dbInfo.name] = dbContext;
    }

    // Register itself as a running localForage in the current context.
    dbContext.forages.push(self);

    // Replace the default `ready()` function with the specialized one.
    if (!self._initReady) {
        self._initReady = self.ready;
        self.ready = _fullyReady;
    }

    // Create an array of initialization states of the related localForages.
    var initPromises = [];

    function ignoreErrors() {
        // Don't handle errors here,
        // just makes sure related localForages aren't pending.
        return Promise$1.resolve();
    }

    for (var j = 0; j < dbContext.forages.length; j++) {
        var forage = dbContext.forages[j];
        if (forage !== self) {
            // Don't wait for itself...
            initPromises.push(forage._initReady()["catch"](ignoreErrors));
        }
    }

    // Take a snapshot of the related localForages.
    var forages = dbContext.forages.slice(0);

    // Initialize the connection process only when
    // all the related localForages aren't pending.
    return Promise$1.all(initPromises).then(function () {
        dbInfo.db = dbContext.db;
        // Get the connection or open a new one without upgrade.
        return _getOriginalConnection(dbInfo);
    }).then(function (db) {
        dbInfo.db = db;
        if (_isUpgradeNeeded(dbInfo, self._defaultConfig.version)) {
            // Reopen the database for upgrading.
            return _getUpgradedConnection(dbInfo);
        }
        return db;
    }).then(function (db) {
        dbInfo.db = dbContext.db = db;
        self._dbInfo = dbInfo;
        // Share the final connection amongst related localForages.
        for (var k = 0; k < forages.length; k++) {
            var forage = forages[k];
            if (forage !== self) {
                // Self is already up-to-date.
                forage._dbInfo.db = dbInfo.db;
                forage._dbInfo.version = dbInfo.version;
            }
        }
    });
}

function getItem(key, callback) {
    var self = this;

    key = normalizeKey(key);

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
                if (err) {
                    return reject(err);
                }

                try {
                    var store = transaction.objectStore(self._dbInfo.storeName);
                    var req = store.get(key);

                    req.onsuccess = function () {
                        var value = req.result;
                        if (value === undefined) {
                            value = null;
                        }
                        if (_isEncodedBlob(value)) {
                            value = _decodeBlob(value);
                        }
                        resolve(value);
                    };

                    req.onerror = function () {
                        reject(req.error);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

// Iterate over all items stored in database.
function iterate(iterator, callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
                if (err) {
                    return reject(err);
                }

                try {
                    var store = transaction.objectStore(self._dbInfo.storeName);
                    var req = store.openCursor();
                    var iterationNumber = 1;

                    req.onsuccess = function () {
                        var cursor = req.result;

                        if (cursor) {
                            var value = cursor.value;
                            if (_isEncodedBlob(value)) {
                                value = _decodeBlob(value);
                            }
                            var result = iterator(value, cursor.key, iterationNumber++);

                            // when the iterator callback retuns any
                            // (non-`undefined`) value, then we stop
                            // the iteration immediately
                            if (result !== void 0) {
                                resolve(result);
                            } else {
                                cursor["continue"]();
                            }
                        } else {
                            resolve();
                        }
                    };

                    req.onerror = function () {
                        reject(req.error);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);

    return promise;
}

function setItem(key, value, callback) {
    var self = this;

    key = normalizeKey(key);

    var promise = new Promise$1(function (resolve, reject) {
        var dbInfo;
        self.ready().then(function () {
            dbInfo = self._dbInfo;
            if (toString.call(value) === '[object Blob]') {
                return _checkBlobSupport(dbInfo.db).then(function (blobSupport) {
                    if (blobSupport) {
                        return value;
                    }
                    return _encodeBlob(value);
                });
            }
            return value;
        }).then(function (value) {
            createTransaction(self._dbInfo, READ_WRITE, function (err, transaction) {
                if (err) {
                    return reject(err);
                }

                try {
                    var store = transaction.objectStore(self._dbInfo.storeName);

                    // The reason we don't _save_ null is because IE 10 does
                    // not support saving the `null` type in IndexedDB. How
                    // ironic, given the bug below!
                    // See: https://github.com/mozilla/localForage/issues/161
                    if (value === null) {
                        value = undefined;
                    }

                    var req = store.put(value, key);

                    transaction.oncomplete = function () {
                        // Cast to undefined so the value passed to
                        // callback/promise is the same as what one would get out
                        // of `getItem()` later. This leads to some weirdness
                        // (setItem('foo', undefined) will return `null`), but
                        // it's not my fault localStorage is our baseline and that
                        // it's weird.
                        if (value === undefined) {
                            value = null;
                        }

                        resolve(value);
                    };
                    transaction.onabort = transaction.onerror = function () {
                        var err = req.error ? req.error : req.transaction.error;
                        reject(err);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function removeItem(key, callback) {
    var self = this;

    key = normalizeKey(key);

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            createTransaction(self._dbInfo, READ_WRITE, function (err, transaction) {
                if (err) {
                    return reject(err);
                }

                try {
                    var store = transaction.objectStore(self._dbInfo.storeName);
                    // We use a Grunt task to make this safe for IE and some
                    // versions of Android (including those used by Cordova).
                    // Normally IE won't like `.delete()` and will insist on
                    // using `['delete']()`, but we have a build step that
                    // fixes this for us now.
                    var req = store["delete"](key);
                    transaction.oncomplete = function () {
                        resolve();
                    };

                    transaction.onerror = function () {
                        reject(req.error);
                    };

                    // The request will be also be aborted if we've exceeded our storage
                    // space.
                    transaction.onabort = function () {
                        var err = req.error ? req.error : req.transaction.error;
                        reject(err);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function clear(callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            createTransaction(self._dbInfo, READ_WRITE, function (err, transaction) {
                if (err) {
                    return reject(err);
                }

                try {
                    var store = transaction.objectStore(self._dbInfo.storeName);
                    var req = store.clear();

                    transaction.oncomplete = function () {
                        resolve();
                    };

                    transaction.onabort = transaction.onerror = function () {
                        var err = req.error ? req.error : req.transaction.error;
                        reject(err);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function length(callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
                if (err) {
                    return reject(err);
                }

                try {
                    var store = transaction.objectStore(self._dbInfo.storeName);
                    var req = store.count();

                    req.onsuccess = function () {
                        resolve(req.result);
                    };

                    req.onerror = function () {
                        reject(req.error);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function key(n, callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        if (n < 0) {
            resolve(null);

            return;
        }

        self.ready().then(function () {
            createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
                if (err) {
                    return reject(err);
                }

                try {
                    var store = transaction.objectStore(self._dbInfo.storeName);
                    var advanced = false;
                    var req = store.openCursor();

                    req.onsuccess = function () {
                        var cursor = req.result;
                        if (!cursor) {
                            // this means there weren't enough keys
                            resolve(null);

                            return;
                        }

                        if (n === 0) {
                            // We have the first key, return it if that's what they
                            // wanted.
                            resolve(cursor.key);
                        } else {
                            if (!advanced) {
                                // Otherwise, ask the cursor to skip ahead n
                                // records.
                                advanced = true;
                                cursor.advance(n);
                            } else {
                                // When we get here, we've got the nth key.
                                resolve(cursor.key);
                            }
                        }
                    };

                    req.onerror = function () {
                        reject(req.error);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function keys(callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
                if (err) {
                    return reject(err);
                }

                try {
                    var store = transaction.objectStore(self._dbInfo.storeName);
                    var req = store.openCursor();
                    var keys = [];

                    req.onsuccess = function () {
                        var cursor = req.result;

                        if (!cursor) {
                            resolve(keys);
                            return;
                        }

                        keys.push(cursor.key);
                        cursor["continue"]();
                    };

                    req.onerror = function () {
                        reject(req.error);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function dropInstance(options, callback) {
    callback = getCallback.apply(this, arguments);

    var currentConfig = this.config();
    options = typeof options !== 'function' && options || {};
    if (!options.name) {
        options.name = options.name || currentConfig.name;
        options.storeName = options.storeName || currentConfig.storeName;
    }

    var self = this;
    var promise;
    if (!options.name) {
        promise = Promise$1.reject('Invalid arguments');
    } else {
        var isCurrentDb = options.name === currentConfig.name && self._dbInfo.db;

        var dbPromise = isCurrentDb ? Promise$1.resolve(self._dbInfo.db) : _getOriginalConnection(options).then(function (db) {
            var dbContext = dbContexts[options.name];
            var forages = dbContext.forages;
            dbContext.db = db;
            for (var i = 0; i < forages.length; i++) {
                forages[i]._dbInfo.db = db;
            }
            return db;
        });

        if (!options.storeName) {
            promise = dbPromise.then(function (db) {
                _deferReadiness(options);

                var dbContext = dbContexts[options.name];
                var forages = dbContext.forages;

                db.close();
                for (var i = 0; i < forages.length; i++) {
                    var forage = forages[i];
                    forage._dbInfo.db = null;
                }

                var dropDBPromise = new Promise$1(function (resolve, reject) {
                    var req = idb.deleteDatabase(options.name);

                    req.onerror = req.onblocked = function (err) {
                        var db = req.result;
                        if (db) {
                            db.close();
                        }
                        reject(err);
                    };

                    req.onsuccess = function () {
                        var db = req.result;
                        if (db) {
                            db.close();
                        }
                        resolve(db);
                    };
                });

                return dropDBPromise.then(function (db) {
                    dbContext.db = db;
                    for (var i = 0; i < forages.length; i++) {
                        var _forage = forages[i];
                        _advanceReadiness(_forage._dbInfo);
                    }
                })["catch"](function (err) {
                    (_rejectReadiness(options, err) || Promise$1.resolve())["catch"](function () {});
                    throw err;
                });
            });
        } else {
            promise = dbPromise.then(function (db) {
                if (!db.objectStoreNames.contains(options.storeName)) {
                    return;
                }

                var newVersion = db.version + 1;

                _deferReadiness(options);

                var dbContext = dbContexts[options.name];
                var forages = dbContext.forages;

                db.close();
                for (var i = 0; i < forages.length; i++) {
                    var forage = forages[i];
                    forage._dbInfo.db = null;
                    forage._dbInfo.version = newVersion;
                }

                var dropObjectPromise = new Promise$1(function (resolve, reject) {
                    var req = idb.open(options.name, newVersion);

                    req.onerror = function (err) {
                        var db = req.result;
                        db.close();
                        reject(err);
                    };

                    req.onupgradeneeded = function () {
                        var db = req.result;
                        db.deleteObjectStore(options.storeName);
                    };

                    req.onsuccess = function () {
                        var db = req.result;
                        db.close();
                        resolve(db);
                    };
                });

                return dropObjectPromise.then(function (db) {
                    dbContext.db = db;
                    for (var j = 0; j < forages.length; j++) {
                        var _forage2 = forages[j];
                        _forage2._dbInfo.db = db;
                        _advanceReadiness(_forage2._dbInfo);
                    }
                })["catch"](function (err) {
                    (_rejectReadiness(options, err) || Promise$1.resolve())["catch"](function () {});
                    throw err;
                });
            });
        }
    }

    executeCallback(promise, callback);
    return promise;
}

var asyncStorage = {
    _driver: 'asyncStorage',
    _initStorage: _initStorage,
    _support: isIndexedDBValid(),
    iterate: iterate,
    getItem: getItem,
    setItem: setItem,
    removeItem: removeItem,
    clear: clear,
    length: length,
    key: key,
    keys: keys,
    dropInstance: dropInstance
};

function isWebSQLValid() {
    return typeof openDatabase === 'function';
}

// Sadly, the best way to save binary data in WebSQL/localStorage is serializing
// it to Base64, so this is how we store it to prevent very strange errors with less
// verbose ways of binary <-> string data storage.
var BASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

var BLOB_TYPE_PREFIX = '~~local_forage_type~';
var BLOB_TYPE_PREFIX_REGEX = /^~~local_forage_type~([^~]+)~/;

var SERIALIZED_MARKER = '__lfsc__:';
var SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER.length;

// OMG the serializations!
var TYPE_ARRAYBUFFER = 'arbf';
var TYPE_BLOB = 'blob';
var TYPE_INT8ARRAY = 'si08';
var TYPE_UINT8ARRAY = 'ui08';
var TYPE_UINT8CLAMPEDARRAY = 'uic8';
var TYPE_INT16ARRAY = 'si16';
var TYPE_INT32ARRAY = 'si32';
var TYPE_UINT16ARRAY = 'ur16';
var TYPE_UINT32ARRAY = 'ui32';
var TYPE_FLOAT32ARRAY = 'fl32';
var TYPE_FLOAT64ARRAY = 'fl64';
var TYPE_SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER_LENGTH + TYPE_ARRAYBUFFER.length;

var toString$1 = Object.prototype.toString;

function stringToBuffer(serializedString) {
    // Fill the string into a ArrayBuffer.
    var bufferLength = serializedString.length * 0.75;
    var len = serializedString.length;
    var i;
    var p = 0;
    var encoded1, encoded2, encoded3, encoded4;

    if (serializedString[serializedString.length - 1] === '=') {
        bufferLength--;
        if (serializedString[serializedString.length - 2] === '=') {
            bufferLength--;
        }
    }

    var buffer = new ArrayBuffer(bufferLength);
    var bytes = new Uint8Array(buffer);

    for (i = 0; i < len; i += 4) {
        encoded1 = BASE_CHARS.indexOf(serializedString[i]);
        encoded2 = BASE_CHARS.indexOf(serializedString[i + 1]);
        encoded3 = BASE_CHARS.indexOf(serializedString[i + 2]);
        encoded4 = BASE_CHARS.indexOf(serializedString[i + 3]);

        /*jslint bitwise: true */
        bytes[p++] = encoded1 << 2 | encoded2 >> 4;
        bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
        bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
    }
    return buffer;
}

// Converts a buffer to a string to store, serialized, in the backend
// storage library.
function bufferToString(buffer) {
    // base64-arraybuffer
    var bytes = new Uint8Array(buffer);
    var base64String = '';
    var i;

    for (i = 0; i < bytes.length; i += 3) {
        /*jslint bitwise: true */
        base64String += BASE_CHARS[bytes[i] >> 2];
        base64String += BASE_CHARS[(bytes[i] & 3) << 4 | bytes[i + 1] >> 4];
        base64String += BASE_CHARS[(bytes[i + 1] & 15) << 2 | bytes[i + 2] >> 6];
        base64String += BASE_CHARS[bytes[i + 2] & 63];
    }

    if (bytes.length % 3 === 2) {
        base64String = base64String.substring(0, base64String.length - 1) + '=';
    } else if (bytes.length % 3 === 1) {
        base64String = base64String.substring(0, base64String.length - 2) + '==';
    }

    return base64String;
}

// Serialize a value, afterwards executing a callback (which usually
// instructs the `setItem()` callback/promise to be executed). This is how
// we store binary data with localStorage.
function serialize(value, callback) {
    var valueType = '';
    if (value) {
        valueType = toString$1.call(value);
    }

    // Cannot use `value instanceof ArrayBuffer` or such here, as these
    // checks fail when running the tests using casper.js...
    //
    // TODO: See why those tests fail and use a better solution.
    if (value && (valueType === '[object ArrayBuffer]' || value.buffer && toString$1.call(value.buffer) === '[object ArrayBuffer]')) {
        // Convert binary arrays to a string and prefix the string with
        // a special marker.
        var buffer;
        var marker = SERIALIZED_MARKER;

        if (value instanceof ArrayBuffer) {
            buffer = value;
            marker += TYPE_ARRAYBUFFER;
        } else {
            buffer = value.buffer;

            if (valueType === '[object Int8Array]') {
                marker += TYPE_INT8ARRAY;
            } else if (valueType === '[object Uint8Array]') {
                marker += TYPE_UINT8ARRAY;
            } else if (valueType === '[object Uint8ClampedArray]') {
                marker += TYPE_UINT8CLAMPEDARRAY;
            } else if (valueType === '[object Int16Array]') {
                marker += TYPE_INT16ARRAY;
            } else if (valueType === '[object Uint16Array]') {
                marker += TYPE_UINT16ARRAY;
            } else if (valueType === '[object Int32Array]') {
                marker += TYPE_INT32ARRAY;
            } else if (valueType === '[object Uint32Array]') {
                marker += TYPE_UINT32ARRAY;
            } else if (valueType === '[object Float32Array]') {
                marker += TYPE_FLOAT32ARRAY;
            } else if (valueType === '[object Float64Array]') {
                marker += TYPE_FLOAT64ARRAY;
            } else {
                callback(new Error('Failed to get type for BinaryArray'));
            }
        }

        callback(marker + bufferToString(buffer));
    } else if (valueType === '[object Blob]') {
        // Conver the blob to a binaryArray and then to a string.
        var fileReader = new FileReader();

        fileReader.onload = function () {
            // Backwards-compatible prefix for the blob type.
            var str = BLOB_TYPE_PREFIX + value.type + '~' + bufferToString(this.result);

            callback(SERIALIZED_MARKER + TYPE_BLOB + str);
        };

        fileReader.readAsArrayBuffer(value);
    } else {
        try {
            callback(JSON.stringify(value));
        } catch (e) {
            console.error("Couldn't convert value into a JSON string: ", value);

            callback(null, e);
        }
    }
}

// Deserialize data we've inserted into a value column/field. We place
// special markers into our strings to mark them as encoded; this isn't
// as nice as a meta field, but it's the only sane thing we can do whilst
// keeping localStorage support intact.
//
// Oftentimes this will just deserialize JSON content, but if we have a
// special marker (SERIALIZED_MARKER, defined above), we will extract
// some kind of arraybuffer/binary data/typed array out of the string.
function deserialize(value) {
    // If we haven't marked this string as being specially serialized (i.e.
    // something other than serialized JSON), we can just return it and be
    // done with it.
    if (value.substring(0, SERIALIZED_MARKER_LENGTH) !== SERIALIZED_MARKER) {
        return JSON.parse(value);
    }

    // The following code deals with deserializing some kind of Blob or
    // TypedArray. First we separate out the type of data we're dealing
    // with from the data itself.
    var serializedString = value.substring(TYPE_SERIALIZED_MARKER_LENGTH);
    var type = value.substring(SERIALIZED_MARKER_LENGTH, TYPE_SERIALIZED_MARKER_LENGTH);

    var blobType;
    // Backwards-compatible blob type serialization strategy.
    // DBs created with older versions of localForage will simply not have the blob type.
    if (type === TYPE_BLOB && BLOB_TYPE_PREFIX_REGEX.test(serializedString)) {
        var matcher = serializedString.match(BLOB_TYPE_PREFIX_REGEX);
        blobType = matcher[1];
        serializedString = serializedString.substring(matcher[0].length);
    }
    var buffer = stringToBuffer(serializedString);

    // Return the right type based on the code/type set during
    // serialization.
    switch (type) {
        case TYPE_ARRAYBUFFER:
            return buffer;
        case TYPE_BLOB:
            return createBlob([buffer], { type: blobType });
        case TYPE_INT8ARRAY:
            return new Int8Array(buffer);
        case TYPE_UINT8ARRAY:
            return new Uint8Array(buffer);
        case TYPE_UINT8CLAMPEDARRAY:
            return new Uint8ClampedArray(buffer);
        case TYPE_INT16ARRAY:
            return new Int16Array(buffer);
        case TYPE_UINT16ARRAY:
            return new Uint16Array(buffer);
        case TYPE_INT32ARRAY:
            return new Int32Array(buffer);
        case TYPE_UINT32ARRAY:
            return new Uint32Array(buffer);
        case TYPE_FLOAT32ARRAY:
            return new Float32Array(buffer);
        case TYPE_FLOAT64ARRAY:
            return new Float64Array(buffer);
        default:
            throw new Error('Unkown type: ' + type);
    }
}

var localforageSerializer = {
    serialize: serialize,
    deserialize: deserialize,
    stringToBuffer: stringToBuffer,
    bufferToString: bufferToString
};

/*
 * Includes code from:
 *
 * base64-arraybuffer
 * https://github.com/niklasvh/base64-arraybuffer
 *
 * Copyright (c) 2012 Niklas von Hertzen
 * Licensed under the MIT license.
 */

function createDbTable(t, dbInfo, callback, errorCallback) {
    t.executeSql('CREATE TABLE IF NOT EXISTS ' + dbInfo.storeName + ' ' + '(id INTEGER PRIMARY KEY, key unique, value)', [], callback, errorCallback);
}

// Open the WebSQL database (automatically creates one if one didn't
// previously exist), using any options set in the config.
function _initStorage$1(options) {
    var self = this;
    var dbInfo = {
        db: null
    };

    if (options) {
        for (var i in options) {
            dbInfo[i] = typeof options[i] !== 'string' ? options[i].toString() : options[i];
        }
    }

    var dbInfoPromise = new Promise$1(function (resolve, reject) {
        // Open the database; the openDatabase API will automatically
        // create it for us if it doesn't exist.
        try {
            dbInfo.db = openDatabase(dbInfo.name, String(dbInfo.version), dbInfo.description, dbInfo.size);
        } catch (e) {
            return reject(e);
        }

        // Create our key/value table if it doesn't exist.
        dbInfo.db.transaction(function (t) {
            createDbTable(t, dbInfo, function () {
                self._dbInfo = dbInfo;
                resolve();
            }, function (t, error) {
                reject(error);
            });
        }, reject);
    });

    dbInfo.serializer = localforageSerializer;
    return dbInfoPromise;
}

function tryExecuteSql(t, dbInfo, sqlStatement, args, callback, errorCallback) {
    t.executeSql(sqlStatement, args, callback, function (t, error) {
        if (error.code === error.SYNTAX_ERR) {
            t.executeSql('SELECT name FROM sqlite_master ' + "WHERE type='table' AND name = ?", [dbInfo.storeName], function (t, results) {
                if (!results.rows.length) {
                    // if the table is missing (was deleted)
                    // re-create it table and retry
                    createDbTable(t, dbInfo, function () {
                        t.executeSql(sqlStatement, args, callback, errorCallback);
                    }, errorCallback);
                } else {
                    errorCallback(t, error);
                }
            }, errorCallback);
        } else {
            errorCallback(t, error);
        }
    }, errorCallback);
}

function getItem$1(key, callback) {
    var self = this;

    key = normalizeKey(key);

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            dbInfo.db.transaction(function (t) {
                tryExecuteSql(t, dbInfo, 'SELECT * FROM ' + dbInfo.storeName + ' WHERE key = ? LIMIT 1', [key], function (t, results) {
                    var result = results.rows.length ? results.rows.item(0).value : null;

                    // Check to see if this is serialized content we need to
                    // unpack.
                    if (result) {
                        result = dbInfo.serializer.deserialize(result);
                    }

                    resolve(result);
                }, function (t, error) {
                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function iterate$1(iterator, callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;

            dbInfo.db.transaction(function (t) {
                tryExecuteSql(t, dbInfo, 'SELECT * FROM ' + dbInfo.storeName, [], function (t, results) {
                    var rows = results.rows;
                    var length = rows.length;

                    for (var i = 0; i < length; i++) {
                        var item = rows.item(i);
                        var result = item.value;

                        // Check to see if this is serialized content
                        // we need to unpack.
                        if (result) {
                            result = dbInfo.serializer.deserialize(result);
                        }

                        result = iterator(result, item.key, i + 1);

                        // void(0) prevents problems with redefinition
                        // of `undefined`.
                        if (result !== void 0) {
                            resolve(result);
                            return;
                        }
                    }

                    resolve();
                }, function (t, error) {
                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function _setItem(key, value, callback, retriesLeft) {
    var self = this;

    key = normalizeKey(key);

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            // The localStorage API doesn't return undefined values in an
            // "expected" way, so undefined is always cast to null in all
            // drivers. See: https://github.com/mozilla/localForage/pull/42
            if (value === undefined) {
                value = null;
            }

            // Save the original value to pass to the callback.
            var originalValue = value;

            var dbInfo = self._dbInfo;
            dbInfo.serializer.serialize(value, function (value, error) {
                if (error) {
                    reject(error);
                } else {
                    dbInfo.db.transaction(function (t) {
                        tryExecuteSql(t, dbInfo, 'INSERT OR REPLACE INTO ' + dbInfo.storeName + ' ' + '(key, value) VALUES (?, ?)', [key, value], function () {
                            resolve(originalValue);
                        }, function (t, error) {
                            reject(error);
                        });
                    }, function (sqlError) {
                        // The transaction failed; check
                        // to see if it's a quota error.
                        if (sqlError.code === sqlError.QUOTA_ERR) {
                            // We reject the callback outright for now, but
                            // it's worth trying to re-run the transaction.
                            // Even if the user accepts the prompt to use
                            // more storage on Safari, this error will
                            // be called.
                            //
                            // Try to re-run the transaction.
                            if (retriesLeft > 0) {
                                resolve(_setItem.apply(self, [key, originalValue, callback, retriesLeft - 1]));
                                return;
                            }
                            reject(sqlError);
                        }
                    });
                }
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function setItem$1(key, value, callback) {
    return _setItem.apply(this, [key, value, callback, 1]);
}

function removeItem$1(key, callback) {
    var self = this;

    key = normalizeKey(key);

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            dbInfo.db.transaction(function (t) {
                tryExecuteSql(t, dbInfo, 'DELETE FROM ' + dbInfo.storeName + ' WHERE key = ?', [key], function () {
                    resolve();
                }, function (t, error) {
                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

// Deletes every item in the table.
// TODO: Find out if this resets the AUTO_INCREMENT number.
function clear$1(callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            dbInfo.db.transaction(function (t) {
                tryExecuteSql(t, dbInfo, 'DELETE FROM ' + dbInfo.storeName, [], function () {
                    resolve();
                }, function (t, error) {
                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

// Does a simple `COUNT(key)` to get the number of items stored in
// localForage.
function length$1(callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            dbInfo.db.transaction(function (t) {
                // Ahhh, SQL makes this one soooooo easy.
                tryExecuteSql(t, dbInfo, 'SELECT COUNT(key) as c FROM ' + dbInfo.storeName, [], function (t, results) {
                    var result = results.rows.item(0).c;
                    resolve(result);
                }, function (t, error) {
                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

// Return the key located at key index X; essentially gets the key from a
// `WHERE id = ?`. This is the most efficient way I can think to implement
// this rarely-used (in my experience) part of the API, but it can seem
// inconsistent, because we do `INSERT OR REPLACE INTO` on `setItem()`, so
// the ID of each key will change every time it's updated. Perhaps a stored
// procedure for the `setItem()` SQL would solve this problem?
// TODO: Don't change ID on `setItem()`.
function key$1(n, callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            dbInfo.db.transaction(function (t) {
                tryExecuteSql(t, dbInfo, 'SELECT key FROM ' + dbInfo.storeName + ' WHERE id = ? LIMIT 1', [n + 1], function (t, results) {
                    var result = results.rows.length ? results.rows.item(0).key : null;
                    resolve(result);
                }, function (t, error) {
                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

function keys$1(callback) {
    var self = this;

    var promise = new Promise$1(function (resolve, reject) {
        self.ready().then(function () {
            var dbInfo = self._dbInfo;
            dbInfo.db.transaction(function (t) {
                tryExecuteSql(t, dbInfo, 'SELECT key FROM ' + dbInfo.storeName, [], function (t, results) {
                    var keys = [];

                    for (var i = 0; i < results.rows.length; i++) {
                        keys.push(results.rows.item(i).key);
                    }

                    resolve(keys);
                }, function (t, error) {
                    reject(error);
                });
            });
        })["catch"](reject);
    });

    executeCallback(promise, callback);
    return promise;
}

// https://www.w3.org/TR/webdatabase/#databases
// > There is no way to enumerate or delete the databases available for an origin from this API.
function getAllStoreNames(db) {
    return new Promise$1(function (resolve, reject) {
        db.transaction(function (t) {
            t.executeSql('SELECT name FROM sqlite_master ' + "WHERE type='table' AND name <> '__WebKitDatabaseInfoTable__'", [], function (t, results) {
                var storeNames = [];

                for (var i = 0; i < results.rows.length; i++) {
                    storeNames.push(results.rows.item(i).name);
                }

                resolve({
                    db: db,
                    storeNames: storeNames
                });
            }, function (t, error) {
                reject(error);
            });
        }, function (sqlError) {
            reject(sqlError);
        });
    });
}

function dropInstance$1(options, callback) {
    callback = getCallback.apply(this, arguments);

    var currentConfig = this.config();
    options = typeof options !== 'function' && options || {};
    if (!options.name) {
        options.name = options.name || currentConfig.name;
        options.storeName = options.storeName || currentConfig.storeName;
    }

    var self = this;
    var promise;
    if (!options.name) {
        promise = Promise$1.reject('Invalid arguments');
    } else {
        promise = new Promise$1(function (resolve) {
            var db;
            if (options.name === currentConfig.name) {
                // use the db reference of the current instance
                db = self._dbInfo.db;
            } else {
                db = openDatabase(options.name, '', '', 0);
            }

            if (!options.storeName) {
                // drop all database tables
                resolve(getAllStoreNames(db));
            } else {
                resolve({
                    db: db,
                    storeNames: [options.storeName]
                });
            }
        }).then(function (operationInfo) {
            return new Promise$1(function (resolve, reject) {
                operationInfo.db.transaction(function (t) {
                    function dropTable(storeName) {
                        return new Promise$1(function (resolve, reject) {
                            t.executeSql('DROP TABLE IF EXISTS ' + storeName, [], function () {
                                resolve();
                            }, function (t, error) {
                                reject(error);
                            });
                        });
                    }

                    var operations = [];
                    for (var i = 0, len = operationInfo.storeNames.length; i < len; i++) {
                        operations.push(dropTable(operationInfo.storeNames[i]));
                    }

                    Promise$1.all(operations).then(function () {
                        resolve();
                    })["catch"](function (e) {
                        reject(e);
                    });
                }, function (sqlError) {
                    reject(sqlError);
                });
            });
        });
    }

    executeCallback(promise, callback);
    return promise;
}

var webSQLStorage = {
    _driver: 'webSQLStorage',
    _initStorage: _initStorage$1,
    _support: isWebSQLValid(),
    iterate: iterate$1,
    getItem: getItem$1,
    setItem: setItem$1,
    removeItem: removeItem$1,
    clear: clear$1,
    length: length$1,
    key: key$1,
    keys: keys$1,
    dropInstance: dropInstance$1
};

function isLocalStorageValid() {
    try {
        return typeof localStorage !== 'undefined' && 'setItem' in localStorage &&
        // in IE8 typeof localStorage.setItem === 'object'
        !!localStorage.setItem;
    } catch (e) {
        return false;
    }
}

function _getKeyPrefix(options, defaultConfig) {
    var keyPrefix = options.name + '/';

    if (options.storeName !== defaultConfig.storeName) {
        keyPrefix += options.storeName + '/';
    }
    return keyPrefix;
}

// Check if localStorage throws when saving an item
function checkIfLocalStorageThrows() {
    var localStorageTestKey = '_localforage_support_test';

    try {
        localStorage.setItem(localStorageTestKey, true);
        localStorage.removeItem(localStorageTestKey);

        return false;
    } catch (e) {
        return true;
    }
}

// Check if localStorage is usable and allows to save an item
// This method checks if localStorage is usable in Safari Private Browsing
// mode, or in any other case where the available quota for localStorage
// is 0 and there wasn't any saved items yet.
function _isLocalStorageUsable() {
    return !checkIfLocalStorageThrows() || localStorage.length > 0;
}

// Config the localStorage backend, using options set in the config.
function _initStorage$2(options) {
    var self = this;
    var dbInfo = {};
    if (options) {
        for (var i in options) {
            dbInfo[i] = options[i];
        }
    }

    dbInfo.keyPrefix = _getKeyPrefix(options, self._defaultConfig);

    if (!_isLocalStorageUsable()) {
        return Promise$1.reject();
    }

    self._dbInfo = dbInfo;
    dbInfo.serializer = localforageSerializer;

    return Promise$1.resolve();
}

// Remove all keys from the datastore, effectively destroying all data in
// the app's key/value store!
function clear$2(callback) {
    var self = this;
    var promise = self.ready().then(function () {
        var keyPrefix = self._dbInfo.keyPrefix;

        for (var i = localStorage.length - 1; i >= 0; i--) {
            var key = localStorage.key(i);

            if (key.indexOf(keyPrefix) === 0) {
                localStorage.removeItem(key);
            }
        }
    });

    executeCallback(promise, callback);
    return promise;
}

// Retrieve an item from the store. Unlike the original async_storage
// library in Gaia, we don't modify return values at all. If a key's value
// is `undefined`, we pass that value to the callback function.
function getItem$2(key, callback) {
    var self = this;

    key = normalizeKey(key);

    var promise = self.ready().then(function () {
        var dbInfo = self._dbInfo;
        var result = localStorage.getItem(dbInfo.keyPrefix + key);

        // If a result was found, parse it from the serialized
        // string into a JS object. If result isn't truthy, the key
        // is likely undefined and we'll pass it straight to the
        // callback.
        if (result) {
            result = dbInfo.serializer.deserialize(result);
        }

        return result;
    });

    executeCallback(promise, callback);
    return promise;
}

// Iterate over all items in the store.
function iterate$2(iterator, callback) {
    var self = this;

    var promise = self.ready().then(function () {
        var dbInfo = self._dbInfo;
        var keyPrefix = dbInfo.keyPrefix;
        var keyPrefixLength = keyPrefix.length;
        var length = localStorage.length;

        // We use a dedicated iterator instead of the `i` variable below
        // so other keys we fetch in localStorage aren't counted in
        // the `iterationNumber` argument passed to the `iterate()`
        // callback.
        //
        // See: github.com/mozilla/localForage/pull/435#discussion_r38061530
        var iterationNumber = 1;

        for (var i = 0; i < length; i++) {
            var key = localStorage.key(i);
            if (key.indexOf(keyPrefix) !== 0) {
                continue;
            }
            var value = localStorage.getItem(key);

            // If a result was found, parse it from the serialized
            // string into a JS object. If result isn't truthy, the
            // key is likely undefined and we'll pass it straight
            // to the iterator.
            if (value) {
                value = dbInfo.serializer.deserialize(value);
            }

            value = iterator(value, key.substring(keyPrefixLength), iterationNumber++);

            if (value !== void 0) {
                return value;
            }
        }
    });

    executeCallback(promise, callback);
    return promise;
}

// Same as localStorage's key() method, except takes a callback.
function key$2(n, callback) {
    var self = this;
    var promise = self.ready().then(function () {
        var dbInfo = self._dbInfo;
        var result;
        try {
            result = localStorage.key(n);
        } catch (error) {
            result = null;
        }

        // Remove the prefix from the key, if a key is found.
        if (result) {
            result = result.substring(dbInfo.keyPrefix.length);
        }

        return result;
    });

    executeCallback(promise, callback);
    return promise;
}

function keys$2(callback) {
    var self = this;
    var promise = self.ready().then(function () {
        var dbInfo = self._dbInfo;
        var length = localStorage.length;
        var keys = [];

        for (var i = 0; i < length; i++) {
            var itemKey = localStorage.key(i);
            if (itemKey.indexOf(dbInfo.keyPrefix) === 0) {
                keys.push(itemKey.substring(dbInfo.keyPrefix.length));
            }
        }

        return keys;
    });

    executeCallback(promise, callback);
    return promise;
}

// Supply the number of keys in the datastore to the callback function.
function length$2(callback) {
    var self = this;
    var promise = self.keys().then(function (keys) {
        return keys.length;
    });

    executeCallback(promise, callback);
    return promise;
}

// Remove an item from the store, nice and simple.
function removeItem$2(key, callback) {
    var self = this;

    key = normalizeKey(key);

    var promise = self.ready().then(function () {
        var dbInfo = self._dbInfo;
        localStorage.removeItem(dbInfo.keyPrefix + key);
    });

    executeCallback(promise, callback);
    return promise;
}

// Set a key's value and run an optional callback once the value is set.
// Unlike Gaia's implementation, the callback function is passed the value,
// in case you want to operate on that value only after you're sure it
// saved, or something like that.
function setItem$2(key, value, callback) {
    var self = this;

    key = normalizeKey(key);

    var promise = self.ready().then(function () {
        // Convert undefined values to null.
        // https://github.com/mozilla/localForage/pull/42
        if (value === undefined) {
            value = null;
        }

        // Save the original value to pass to the callback.
        var originalValue = value;

        return new Promise$1(function (resolve, reject) {
            var dbInfo = self._dbInfo;
            dbInfo.serializer.serialize(value, function (value, error) {
                if (error) {
                    reject(error);
                } else {
                    try {
                        localStorage.setItem(dbInfo.keyPrefix + key, value);
                        resolve(originalValue);
                    } catch (e) {
                        // localStorage capacity exceeded.
                        // TODO: Make this a specific error/event.
                        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                            reject(e);
                        }
                        reject(e);
                    }
                }
            });
        });
    });

    executeCallback(promise, callback);
    return promise;
}

function dropInstance$2(options, callback) {
    callback = getCallback.apply(this, arguments);

    options = typeof options !== 'function' && options || {};
    if (!options.name) {
        var currentConfig = this.config();
        options.name = options.name || currentConfig.name;
        options.storeName = options.storeName || currentConfig.storeName;
    }

    var self = this;
    var promise;
    if (!options.name) {
        promise = Promise$1.reject('Invalid arguments');
    } else {
        promise = new Promise$1(function (resolve) {
            if (!options.storeName) {
                resolve(options.name + '/');
            } else {
                resolve(_getKeyPrefix(options, self._defaultConfig));
            }
        }).then(function (keyPrefix) {
            for (var i = localStorage.length - 1; i >= 0; i--) {
                var key = localStorage.key(i);

                if (key.indexOf(keyPrefix) === 0) {
                    localStorage.removeItem(key);
                }
            }
        });
    }

    executeCallback(promise, callback);
    return promise;
}

var localStorageWrapper = {
    _driver: 'localStorageWrapper',
    _initStorage: _initStorage$2,
    _support: isLocalStorageValid(),
    iterate: iterate$2,
    getItem: getItem$2,
    setItem: setItem$2,
    removeItem: removeItem$2,
    clear: clear$2,
    length: length$2,
    key: key$2,
    keys: keys$2,
    dropInstance: dropInstance$2
};

var sameValue = function sameValue(x, y) {
    return x === y || typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y);
};

var includes = function includes(array, searchElement) {
    var len = array.length;
    var i = 0;
    while (i < len) {
        if (sameValue(array[i], searchElement)) {
            return true;
        }
        i++;
    }

    return false;
};

var isArray = Array.isArray || function (arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
};

// Drivers are stored here when `defineDriver()` is called.
// They are shared across all instances of localForage.
var DefinedDrivers = {};

var DriverSupport = {};

var DefaultDrivers = {
    INDEXEDDB: asyncStorage,
    WEBSQL: webSQLStorage,
    LOCALSTORAGE: localStorageWrapper
};

var DefaultDriverOrder = [DefaultDrivers.INDEXEDDB._driver, DefaultDrivers.WEBSQL._driver, DefaultDrivers.LOCALSTORAGE._driver];

var OptionalDriverMethods = ['dropInstance'];

var LibraryMethods = ['clear', 'getItem', 'iterate', 'key', 'keys', 'length', 'removeItem', 'setItem'].concat(OptionalDriverMethods);

var DefaultConfig = {
    description: '',
    driver: DefaultDriverOrder.slice(),
    name: 'localforage',
    // Default DB size is _JUST UNDER_ 5MB, as it's the highest size
    // we can use without a prompt.
    size: 4980736,
    storeName: 'keyvaluepairs',
    version: 1.0
};

function callWhenReady(localForageInstance, libraryMethod) {
    localForageInstance[libraryMethod] = function () {
        var _args = arguments;
        return localForageInstance.ready().then(function () {
            return localForageInstance[libraryMethod].apply(localForageInstance, _args);
        });
    };
}

function extend() {
    for (var i = 1; i < arguments.length; i++) {
        var arg = arguments[i];

        if (arg) {
            for (var _key in arg) {
                if (arg.hasOwnProperty(_key)) {
                    if (isArray(arg[_key])) {
                        arguments[0][_key] = arg[_key].slice();
                    } else {
                        arguments[0][_key] = arg[_key];
                    }
                }
            }
        }
    }

    return arguments[0];
}

var LocalForage = function () {
    function LocalForage(options) {
        _classCallCheck(this, LocalForage);

        for (var driverTypeKey in DefaultDrivers) {
            if (DefaultDrivers.hasOwnProperty(driverTypeKey)) {
                var driver = DefaultDrivers[driverTypeKey];
                var driverName = driver._driver;
                this[driverTypeKey] = driverName;

                if (!DefinedDrivers[driverName]) {
                    // we don't need to wait for the promise,
                    // since the default drivers can be defined
                    // in a blocking manner
                    this.defineDriver(driver);
                }
            }
        }

        this._defaultConfig = extend({}, DefaultConfig);
        this._config = extend({}, this._defaultConfig, options);
        this._driverSet = null;
        this._initDriver = null;
        this._ready = false;
        this._dbInfo = null;

        this._wrapLibraryMethodsWithReady();
        this.setDriver(this._config.driver)["catch"](function () {});
    }

    // Set any config values for localForage; can be called anytime before
    // the first API call (e.g. `getItem`, `setItem`).
    // We loop through options so we don't overwrite existing config
    // values.


    LocalForage.prototype.config = function config(options) {
        // If the options argument is an object, we use it to set values.
        // Otherwise, we return either a specified config value or all
        // config values.
        if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
            // If localforage is ready and fully initialized, we can't set
            // any new configuration values. Instead, we return an error.
            if (this._ready) {
                return new Error("Can't call config() after localforage " + 'has been used.');
            }

            for (var i in options) {
                if (i === 'storeName') {
                    options[i] = options[i].replace(/\W/g, '_');
                }

                if (i === 'version' && typeof options[i] !== 'number') {
                    return new Error('Database version must be a number.');
                }

                this._config[i] = options[i];
            }

            // after all config options are set and
            // the driver option is used, try setting it
            if ('driver' in options && options.driver) {
                return this.setDriver(this._config.driver);
            }

            return true;
        } else if (typeof options === 'string') {
            return this._config[options];
        } else {
            return this._config;
        }
    };

    // Used to define a custom driver, shared across all instances of
    // localForage.


    LocalForage.prototype.defineDriver = function defineDriver(driverObject, callback, errorCallback) {
        var promise = new Promise$1(function (resolve, reject) {
            try {
                var driverName = driverObject._driver;
                var complianceError = new Error('Custom driver not compliant; see ' + 'https://mozilla.github.io/localForage/#definedriver');

                // A driver name should be defined and not overlap with the
                // library-defined, default drivers.
                if (!driverObject._driver) {
                    reject(complianceError);
                    return;
                }

                var driverMethods = LibraryMethods.concat('_initStorage');
                for (var i = 0, len = driverMethods.length; i < len; i++) {
                    var driverMethodName = driverMethods[i];

                    // when the property is there,
                    // it should be a method even when optional
                    var isRequired = !includes(OptionalDriverMethods, driverMethodName);
                    if ((isRequired || driverObject[driverMethodName]) && typeof driverObject[driverMethodName] !== 'function') {
                        reject(complianceError);
                        return;
                    }
                }

                var configureMissingMethods = function configureMissingMethods() {
                    var methodNotImplementedFactory = function methodNotImplementedFactory(methodName) {
                        return function () {
                            var error = new Error('Method ' + methodName + ' is not implemented by the current driver');
                            var promise = Promise$1.reject(error);
                            executeCallback(promise, arguments[arguments.length - 1]);
                            return promise;
                        };
                    };

                    for (var _i = 0, _len = OptionalDriverMethods.length; _i < _len; _i++) {
                        var optionalDriverMethod = OptionalDriverMethods[_i];
                        if (!driverObject[optionalDriverMethod]) {
                            driverObject[optionalDriverMethod] = methodNotImplementedFactory(optionalDriverMethod);
                        }
                    }
                };

                configureMissingMethods();

                var setDriverSupport = function setDriverSupport(support) {
                    if (DefinedDrivers[driverName]) {
                        console.info('Redefining LocalForage driver: ' + driverName);
                    }
                    DefinedDrivers[driverName] = driverObject;
                    DriverSupport[driverName] = support;
                    // don't use a then, so that we can define
                    // drivers that have simple _support methods
                    // in a blocking manner
                    resolve();
                };

                if ('_support' in driverObject) {
                    if (driverObject._support && typeof driverObject._support === 'function') {
                        driverObject._support().then(setDriverSupport, reject);
                    } else {
                        setDriverSupport(!!driverObject._support);
                    }
                } else {
                    setDriverSupport(true);
                }
            } catch (e) {
                reject(e);
            }
        });

        executeTwoCallbacks(promise, callback, errorCallback);
        return promise;
    };

    LocalForage.prototype.driver = function driver() {
        return this._driver || null;
    };

    LocalForage.prototype.getDriver = function getDriver(driverName, callback, errorCallback) {
        var getDriverPromise = DefinedDrivers[driverName] ? Promise$1.resolve(DefinedDrivers[driverName]) : Promise$1.reject(new Error('Driver not found.'));

        executeTwoCallbacks(getDriverPromise, callback, errorCallback);
        return getDriverPromise;
    };

    LocalForage.prototype.getSerializer = function getSerializer(callback) {
        var serializerPromise = Promise$1.resolve(localforageSerializer);
        executeTwoCallbacks(serializerPromise, callback);
        return serializerPromise;
    };

    LocalForage.prototype.ready = function ready(callback) {
        var self = this;

        var promise = self._driverSet.then(function () {
            if (self._ready === null) {
                self._ready = self._initDriver();
            }

            return self._ready;
        });

        executeTwoCallbacks(promise, callback, callback);
        return promise;
    };

    LocalForage.prototype.setDriver = function setDriver(drivers, callback, errorCallback) {
        var self = this;

        if (!isArray(drivers)) {
            drivers = [drivers];
        }

        var supportedDrivers = this._getSupportedDrivers(drivers);

        function setDriverToConfig() {
            self._config.driver = self.driver();
        }

        function extendSelfWithDriver(driver) {
            self._extend(driver);
            setDriverToConfig();

            self._ready = self._initStorage(self._config);
            return self._ready;
        }

        function initDriver(supportedDrivers) {
            return function () {
                var currentDriverIndex = 0;

                function driverPromiseLoop() {
                    while (currentDriverIndex < supportedDrivers.length) {
                        var driverName = supportedDrivers[currentDriverIndex];
                        currentDriverIndex++;

                        self._dbInfo = null;
                        self._ready = null;

                        return self.getDriver(driverName).then(extendSelfWithDriver)["catch"](driverPromiseLoop);
                    }

                    setDriverToConfig();
                    var error = new Error('No available storage method found.');
                    self._driverSet = Promise$1.reject(error);
                    return self._driverSet;
                }

                return driverPromiseLoop();
            };
        }

        // There might be a driver initialization in progress
        // so wait for it to finish in order to avoid a possible
        // race condition to set _dbInfo
        var oldDriverSetDone = this._driverSet !== null ? this._driverSet["catch"](function () {
            return Promise$1.resolve();
        }) : Promise$1.resolve();

        this._driverSet = oldDriverSetDone.then(function () {
            var driverName = supportedDrivers[0];
            self._dbInfo = null;
            self._ready = null;

            return self.getDriver(driverName).then(function (driver) {
                self._driver = driver._driver;
                setDriverToConfig();
                self._wrapLibraryMethodsWithReady();
                self._initDriver = initDriver(supportedDrivers);
            });
        })["catch"](function () {
            setDriverToConfig();
            var error = new Error('No available storage method found.');
            self._driverSet = Promise$1.reject(error);
            return self._driverSet;
        });

        executeTwoCallbacks(this._driverSet, callback, errorCallback);
        return this._driverSet;
    };

    LocalForage.prototype.supports = function supports(driverName) {
        return !!DriverSupport[driverName];
    };

    LocalForage.prototype._extend = function _extend(libraryMethodsAndProperties) {
        extend(this, libraryMethodsAndProperties);
    };

    LocalForage.prototype._getSupportedDrivers = function _getSupportedDrivers(drivers) {
        var supportedDrivers = [];
        for (var i = 0, len = drivers.length; i < len; i++) {
            var driverName = drivers[i];
            if (this.supports(driverName)) {
                supportedDrivers.push(driverName);
            }
        }
        return supportedDrivers;
    };

    LocalForage.prototype._wrapLibraryMethodsWithReady = function _wrapLibraryMethodsWithReady() {
        // Add a stub for each driver API method that delays the call to the
        // corresponding driver method until localForage is ready. These stubs
        // will be replaced by the driver methods as soon as the driver is
        // loaded, so there is no performance impact.
        for (var i = 0, len = LibraryMethods.length; i < len; i++) {
            callWhenReady(this, LibraryMethods[i]);
        }
    };

    LocalForage.prototype.createInstance = function createInstance(options) {
        return new LocalForage(options);
    };

    return LocalForage;
}();

// The actual localForage object that we expose as a module or via a
// global. It's extended by pulling in one of our other libraries.


var localforage_js = new LocalForage();

module.exports = localforage_js;

},{"3":3}]},{},[4])(4)
});

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _core = __webpack_require__(0);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Open DisplayOptions Format Parser
 * @class
 * @param {document} displayOptionsDocument XML
 */
var DisplayOptions = function () {
	function DisplayOptions(displayOptionsDocument) {
		_classCallCheck(this, DisplayOptions);

		this.interactive = "";
		this.fixedLayout = "";
		this.openToSpread = "";
		this.orientationLock = "";

		if (displayOptionsDocument) {
			this.parse(displayOptionsDocument);
		}
	}

	/**
  * Parse XML
  * @param  {document} displayOptionsDocument XML
  * @return {DisplayOptions} self
  */


	_createClass(DisplayOptions, [{
		key: "parse",
		value: function parse(displayOptionsDocument) {
			var _this = this;

			if (!displayOptionsDocument) {
				return this;
			}

			var displayOptionsNode = (0, _core.qs)(displayOptionsDocument, "display_options");
			if (!displayOptionsNode) {
				return this;
			}

			var options = (0, _core.qsa)(displayOptionsNode, "option");
			options.forEach(function (el) {
				var value = "";

				if (el.childNodes.length) {
					value = el.childNodes[0].nodeValue;
				}

				switch (el.attributes.name.value) {
					case "interactive":
						_this.interactive = value;
						break;
					case "fixed-layout":
						_this.fixedLayout = value;
						break;
					case "open-to-spread":
						_this.openToSpread = value;
						break;
					case "orientation-lock":
						_this.orientationLock = value;
						break;
				}
			});

			return this;
		}
	}, {
		key: "destroy",
		value: function destroy() {
			this.interactive = undefined;
			this.fixedLayout = undefined;
			this.openToSpread = undefined;
			this.orientationLock = undefined;
		}
	}]);

	return DisplayOptions;
}();

exports.default = DisplayOptions;
module.exports = exports["default"];

/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {(function(global) {
  /**
   * Polyfill URLSearchParams
   *
   * Inspired from : https://github.com/WebReflection/url-search-params/blob/master/src/url-search-params.js
   */

  var checkIfIteratorIsSupported = function() {
    try {
      return !!Symbol.iterator;
    } catch (error) {
      return false;
    }
  };


  var iteratorSupported = checkIfIteratorIsSupported();

  var createIterator = function(items) {
    var iterator = {
      next: function() {
        var value = items.shift();
        return { done: value === void 0, value: value };
      }
    };

    if (iteratorSupported) {
      iterator[Symbol.iterator] = function() {
        return iterator;
      };
    }

    return iterator;
  };

  /**
   * Search param name and values should be encoded according to https://url.spec.whatwg.org/#urlencoded-serializing
   * encodeURIComponent() produces the same result except encoding spaces as `%20` instead of `+`.
   */
  var serializeParam = function(value) {
    return encodeURIComponent(value).replace(/%20/g, '+');
  };

  var deserializeParam = function(value) {
    return decodeURIComponent(String(value).replace(/\+/g, ' '));
  };

  var polyfillURLSearchParams = function() {

    var URLSearchParams = function(searchString) {
      Object.defineProperty(this, '_entries', { writable: true, value: {} });
      var typeofSearchString = typeof searchString;

      if (typeofSearchString === 'undefined') {
        // do nothing
      } else if (typeofSearchString === 'string') {
        if (searchString !== '') {
          this._fromString(searchString);
        }
      } else if (searchString instanceof URLSearchParams) {
        var _this = this;
        searchString.forEach(function(value, name) {
          _this.append(name, value);
        });
      } else if ((searchString !== null) && (typeofSearchString === 'object')) {
        if (Object.prototype.toString.call(searchString) === '[object Array]') {
          for (var i = 0; i < searchString.length; i++) {
            var entry = searchString[i];
            if ((Object.prototype.toString.call(entry) === '[object Array]') || (entry.length !== 2)) {
              this.append(entry[0], entry[1]);
            } else {
              throw new TypeError('Expected [string, any] as entry at index ' + i + ' of URLSearchParams\'s input');
            }
          }
        } else {
          for (var key in searchString) {
            if (searchString.hasOwnProperty(key)) {
              this.append(key, searchString[key]);
            }
          }
        }
      } else {
        throw new TypeError('Unsupported input\'s type for URLSearchParams');
      }
    };

    var proto = URLSearchParams.prototype;

    proto.append = function(name, value) {
      if (name in this._entries) {
        this._entries[name].push(String(value));
      } else {
        this._entries[name] = [String(value)];
      }
    };

    proto.delete = function(name) {
      delete this._entries[name];
    };

    proto.get = function(name) {
      return (name in this._entries) ? this._entries[name][0] : null;
    };

    proto.getAll = function(name) {
      return (name in this._entries) ? this._entries[name].slice(0) : [];
    };

    proto.has = function(name) {
      return (name in this._entries);
    };

    proto.set = function(name, value) {
      this._entries[name] = [String(value)];
    };

    proto.forEach = function(callback, thisArg) {
      var entries;
      for (var name in this._entries) {
        if (this._entries.hasOwnProperty(name)) {
          entries = this._entries[name];
          for (var i = 0; i < entries.length; i++) {
            callback.call(thisArg, entries[i], name, this);
          }
        }
      }
    };

    proto.keys = function() {
      var items = [];
      this.forEach(function(value, name) {
        items.push(name);
      });
      return createIterator(items);
    };

    proto.values = function() {
      var items = [];
      this.forEach(function(value) {
        items.push(value);
      });
      return createIterator(items);
    };

    proto.entries = function() {
      var items = [];
      this.forEach(function(value, name) {
        items.push([name, value]);
      });
      return createIterator(items);
    };

    if (iteratorSupported) {
      proto[Symbol.iterator] = proto.entries;
    }

    proto.toString = function() {
      var searchArray = [];
      this.forEach(function(value, name) {
        searchArray.push(serializeParam(name) + '=' + serializeParam(value));
      });
      return searchArray.join('&');
    };


    global.URLSearchParams = URLSearchParams;
  };

  var checkIfURLSearchParamsSupported = function() {
    try {
      var URLSearchParams = global.URLSearchParams;

      return (new URLSearchParams('?a=1').toString() === 'a=1') && (typeof URLSearchParams.prototype.set === 'function');
    } catch (e) {
      return false;
    }
  };

  if (!checkIfURLSearchParamsSupported()) {
    polyfillURLSearchParams();
  }

  var proto = global.URLSearchParams.prototype;

  if (typeof proto.sort !== 'function') {
    proto.sort = function() {
      var _this = this;
      var items = [];
      this.forEach(function(value, name) {
        items.push([name, value]);
        if (!_this._entries) {
          _this.delete(name);
        }
      });
      items.sort(function(a, b) {
        if (a[0] < b[0]) {
          return -1;
        } else if (a[0] > b[0]) {
          return +1;
        } else {
          return 0;
        }
      });
      if (_this._entries) { // force reset because IE keeps keys index
        _this._entries = {};
      }
      for (var i = 0; i < items.length; i++) {
        this.append(items[i][0], items[i][1]);
      }
    };
  }

  if (typeof proto._fromString !== 'function') {
    Object.defineProperty(proto, '_fromString', {
      enumerable: false,
      configurable: false,
      writable: false,
      value: function(searchString) {
        if (this._entries) {
          this._entries = {};
        } else {
          var keys = [];
          this.forEach(function(value, name) {
            keys.push(name);
          });
          for (var i = 0; i < keys.length; i++) {
            this.delete(keys[i]);
          }
        }

        searchString = searchString.replace(/^\?/, '');
        var attributes = searchString.split('&');
        var attribute;
        for (var i = 0; i < attributes.length; i++) {
          attribute = attributes[i].split('=');
          this.append(
            deserializeParam(attribute[0]),
            (attribute.length > 1) ? deserializeParam(attribute[1]) : ''
          );
        }
      }
    });
  }

  // HTMLAnchorElement

})(
  (typeof global !== 'undefined') ? global
    : ((typeof window !== 'undefined') ? window
    : ((typeof self !== 'undefined') ? self : this))
);

(function(global) {
  /**
   * Polyfill URL
   *
   * Inspired from : https://github.com/arv/DOM-URL-Polyfill/blob/master/src/url.js
   */

  var checkIfURLIsSupported = function() {
    try {
      var u = new global.URL('b', 'http://a');
      u.pathname = 'c d';
      return (u.href === 'http://a/c%20d') && u.searchParams;
    } catch (e) {
      return false;
    }
  };


  var polyfillURL = function() {
    var _URL = global.URL;

    var URL = function(url, base) {
      if (typeof url !== 'string') url = String(url);

      // Only create another document if the base is different from current location.
      var doc = document, baseElement;
      if (base && (global.location === void 0 || base !== global.location.href)) {
        doc = document.implementation.createHTMLDocument('');
        baseElement = doc.createElement('base');
        baseElement.href = base;
        doc.head.appendChild(baseElement);
        try {
          if (baseElement.href.indexOf(base) !== 0) throw new Error(baseElement.href);
        } catch (err) {
          throw new Error('URL unable to set base ' + base + ' due to ' + err);
        }
      }

      var anchorElement = doc.createElement('a');
      anchorElement.href = url;
      if (baseElement) {
        doc.body.appendChild(anchorElement);
        anchorElement.href = anchorElement.href; // force href to refresh
      }

      var inputElement = doc.createElement('input');
      inputElement.type = 'url';
      inputElement.value = url;

      if (anchorElement.protocol === ':' || !/:/.test(anchorElement.href) || (!inputElement.checkValidity() && !base)) {
        throw new TypeError('Invalid URL');
      }

      Object.defineProperty(this, '_anchorElement', {
        value: anchorElement
      });


      // create a linked searchParams which reflect its changes on URL
      var searchParams = new global.URLSearchParams(this.search);
      var enableSearchUpdate = true;
      var enableSearchParamsUpdate = true;
      var _this = this;
      ['append', 'delete', 'set'].forEach(function(methodName) {
        var method = searchParams[methodName];
        searchParams[methodName] = function() {
          method.apply(searchParams, arguments);
          if (enableSearchUpdate) {
            enableSearchParamsUpdate = false;
            _this.search = searchParams.toString();
            enableSearchParamsUpdate = true;
          }
        };
      });

      Object.defineProperty(this, 'searchParams', {
        value: searchParams,
        enumerable: true
      });

      var search = void 0;
      Object.defineProperty(this, '_updateSearchParams', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function() {
          if (this.search !== search) {
            search = this.search;
            if (enableSearchParamsUpdate) {
              enableSearchUpdate = false;
              this.searchParams._fromString(this.search);
              enableSearchUpdate = true;
            }
          }
        }
      });
    };

    var proto = URL.prototype;

    var linkURLWithAnchorAttribute = function(attributeName) {
      Object.defineProperty(proto, attributeName, {
        get: function() {
          return this._anchorElement[attributeName];
        },
        set: function(value) {
          this._anchorElement[attributeName] = value;
        },
        enumerable: true
      });
    };

    ['hash', 'host', 'hostname', 'port', 'protocol']
      .forEach(function(attributeName) {
        linkURLWithAnchorAttribute(attributeName);
      });

    Object.defineProperty(proto, 'search', {
      get: function() {
        return this._anchorElement['search'];
      },
      set: function(value) {
        this._anchorElement['search'] = value;
        this._updateSearchParams();
      },
      enumerable: true
    });

    Object.defineProperties(proto, {

      'toString': {
        get: function() {
          var _this = this;
          return function() {
            return _this.href;
          };
        }
      },

      'href': {
        get: function() {
          return this._anchorElement.href.replace(/\?$/, '');
        },
        set: function(value) {
          this._anchorElement.href = value;
          this._updateSearchParams();
        },
        enumerable: true
      },

      'pathname': {
        get: function() {
          return this._anchorElement.pathname.replace(/(^\/?)/, '/');
        },
        set: function(value) {
          this._anchorElement.pathname = value;
        },
        enumerable: true
      },

      'origin': {
        get: function() {
          // get expected port from protocol
          var expectedPort = { 'http:': 80, 'https:': 443, 'ftp:': 21 }[this._anchorElement.protocol];
          // add port to origin if, expected port is different than actual port
          // and it is not empty f.e http://foo:8080
          // 8080 != 80 && 8080 != ''
          var addPortToOrigin = this._anchorElement.port != expectedPort &&
            this._anchorElement.port !== '';

          return this._anchorElement.protocol +
            '//' +
            this._anchorElement.hostname +
            (addPortToOrigin ? (':' + this._anchorElement.port) : '');
        },
        enumerable: true
      },

      'password': { // TODO
        get: function() {
          return '';
        },
        set: function(value) {
        },
        enumerable: true
      },

      'username': { // TODO
        get: function() {
          return '';
        },
        set: function(value) {
        },
        enumerable: true
      },
    });

    URL.createObjectURL = function(blob) {
      return _URL.createObjectURL.apply(_URL, arguments);
    };

    URL.revokeObjectURL = function(url) {
      return _URL.revokeObjectURL.apply(_URL, arguments);
    };

    global.URL = URL;

  };

  if (!checkIfURLIsSupported()) {
    polyfillURL();
  }

  if ((global.location !== void 0) && !('origin' in global.location)) {
    var getOrigin = function() {
      return global.location.protocol + '//' + global.location.hostname + (global.location.port ? (':' + global.location.port) : '');
    };

    try {
      Object.defineProperty(global.location, 'origin', {
        get: getOrigin,
        enumerable: true
      });
    } catch (e) {
      setInterval(function() {
        global.location.origin = getOrigin();
      }, 100);
    }
  }

})(
  (typeof global !== 'undefined') ? global
    : ((typeof window !== 'undefined') ? window
    : ((typeof self !== 'undefined') ? self : this))
);

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ })
/******/ ]);
});
//# sourceMappingURL=epub.js.map