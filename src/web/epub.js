(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("xmldom"), require("JSZip"));
	else if(typeof define === 'function' && define.amd)
		define(["xmldom", "JSZip"], factory);
	else if(typeof exports === 'object')
		exports["ePub"] = factory(require("xmldom"), require("JSZip"));
	else
		root["ePub"] = factory(root["xmldom"], root["JSZip"]);
})(window, function(__WEBPACK_EXTERNAL_MODULE__38__, __WEBPACK_EXTERNAL_MODULE__85__) {
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
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
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
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 86);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "requestAnimationFrame", function() { return requestAnimationFrame; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "uuid", function() { return uuid; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "documentHeight", function() { return documentHeight; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isElement", function() { return isElement; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isNumber", function() { return isNumber; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isFloat", function() { return isFloat; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "prefixed", function() { return prefixed; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "defaults", function() { return defaults; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "extend", function() { return extend; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "insert", function() { return insert; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "locationOf", function() { return locationOf; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "indexOfSorted", function() { return indexOfSorted; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "bounds", function() { return bounds; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "borders", function() { return borders; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "nodeBounds", function() { return nodeBounds; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "windowBounds", function() { return windowBounds; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "indexOfNode", function() { return indexOfNode; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "indexOfTextNode", function() { return indexOfTextNode; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "indexOfElementNode", function() { return indexOfElementNode; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isXml", function() { return isXml; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createBlob", function() { return createBlob; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createBlobUrl", function() { return createBlobUrl; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "revokeBlobUrl", function() { return revokeBlobUrl; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createBase64Url", function() { return createBase64Url; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "type", function() { return type; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parse", function() { return parse; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "qs", function() { return qs; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "qsa", function() { return qsa; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "qsp", function() { return qsp; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sprint", function() { return sprint; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "treeWalker", function() { return treeWalker; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "walk", function() { return walk; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "blob2base64", function() { return blob2base64; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "defer", function() { return defer; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "querySelectorByType", function() { return querySelectorByType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "findChildren", function() { return findChildren; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parents", function() { return parents; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "filterChildren", function() { return filterChildren; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getParentByTagName", function() { return getParentByTagName; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RangeObject", function() { return RangeObject; });
/* harmony import */ var core_js_modules_es_string_replace__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(24);
/* harmony import */ var core_js_modules_es_string_replace__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_replace__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_web_dom_collections_iterator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(14);
/* harmony import */ var core_js_modules_web_dom_collections_iterator__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_iterator__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var core_js_modules_web_url__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(20);
/* harmony import */ var core_js_modules_web_url__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_url__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var xmldom__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(38);
/* harmony import */ var xmldom__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(xmldom__WEBPACK_IMPORTED_MODULE_3__);




/**
 * Core Utilities and Helpers
 * @module Core
*/

/**
 * Vendor prefixed requestAnimationFrame
 * @returns {function} requestAnimationFrame
 * @memberof Core
 */

const requestAnimationFrame = typeof window != "undefined" ? window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame : false;
const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
const COMMENT_NODE = 8;
const DOCUMENT_NODE = 9;

const _URL = typeof URL != "undefined" ? URL : typeof window != "undefined" ? window.URL || window.webkitURL || window.mozURL : undefined;
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
  let f = parseFloat(n);

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
    compareFunction = function (a, b) {
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
    compareFunction = function (a, b) {
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
  let elPos;
  let doc = node.ownerDocument;

  if (node.nodeType == Node.TEXT_NODE) {
    let elRange = doc.createRange();
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
  return new Blob([content], {
    type: mime
  });
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
    Parser = xmldom__WEBPACK_IMPORTED_MODULE_3__["DOMParser"];
  } else {
    Parser = DOMParser;
  } // Remove byte order mark before parsing
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
  let node;

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
      let walked = walk(node, callback);

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

  this.promise = new Promise((resolve, reject) => {
    this.resolve = resolve;
    this.reject = reject;
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
    query = html.querySelector(`${element}[*|type="${type}"]`);
  } // Handle IE not supporting namespaced epub:type in querySelector


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
    let node = childNodes[i];

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
    let node = childNodes[i];

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
  let parent;
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

class RangeObject {
  constructor() {
    this.collapsed = false;
    this.commonAncestorContainer = undefined;
    this.endContainer = undefined;
    this.endOffset = undefined;
    this.startContainer = undefined;
    this.startOffset = undefined;
  }

  setStart(startNode, startOffset) {
    this.startContainer = startNode;
    this.startOffset = startOffset;

    if (!this.endContainer) {
      this.collapse(true);
    } else {
      this.commonAncestorContainer = this._commonAncestorContainer();
    }

    this._checkCollapsed();
  }

  setEnd(endNode, endOffset) {
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

  collapse(toStart) {
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

  selectNode(referenceNode) {
    let parent = referenceNode.parentNode;
    let index = Array.prototype.indexOf.call(parent.childNodes, referenceNode);
    this.setStart(parent, index);
    this.setEnd(parent, index + 1);
  }

  selectNodeContents(referenceNode) {
    let end = referenceNode.childNodes[referenceNode.childNodes - 1];
    let endIndex = referenceNode.nodeType === 3 ? referenceNode.textContent.length : parent.childNodes.length;
    this.setStart(referenceNode, 0);
    this.setEnd(referenceNode, endIndex);
  }

  _commonAncestorContainer(startContainer, endContainer) {
    var startParents = parents(startContainer || this.startContainer);
    var endParents = parents(endContainer || this.endContainer);
    if (startParents[0] != endParents[0]) return undefined;

    for (var i = 0; i < startParents.length; i++) {
      if (startParents[i] != endParents[i]) {
        return startParents[i - 1];
      }
    }
  }

  _checkCollapsed() {
    if (this.startContainer === this.endContainer && this.startOffset === this.endOffset) {
      this.collapsed = true;
    } else {
      this.collapsed = false;
    }
  }

  toString() {// TODO: implement walking between start and end to find text
  }

}

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return EPUBJS_VERSION; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return DOM_EVENTS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return EVENTS; });
const EPUBJS_VERSION = "0.3"; // Dom events to listen for

const DOM_EVENTS = ["keydown", "keyup", "keypressed", "mouseup", "mousedown", "click", "touchend", "touchstart", "touchmove"];
const EVENTS = {
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
    WRITING_MODE: "writingMode",
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
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _utils_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);

const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
const COMMENT_NODE = 8;
const DOCUMENT_NODE = 9;
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

class EpubCFI {
  constructor(cfiFrom, base, ignoreClass) {
    var type;
    this.str = "";
    this.base = {};
    this.spinePos = 0; // For compatibility

    this.range = false; // true || false;

    this.path = {};
    this.start = null;
    this.end = null; // Allow instantiation without the "new" keyword

    if (!(this instanceof EpubCFI)) {
      return new EpubCFI(cfiFrom, base, ignoreClass);
    }

    if (typeof base === "string") {
      this.base = this.parseComponent(base);
    } else if (typeof base === "object" && base.steps) {
      this.base = base;
    }

    type = this.checkType(cfiFrom);

    if (type === "string") {
      this.str = cfiFrom;
      return Object(_utils_core__WEBPACK_IMPORTED_MODULE_0__["extend"])(this, this.parse(cfiFrom));
    } else if (type === "range") {
      return Object(_utils_core__WEBPACK_IMPORTED_MODULE_0__["extend"])(this, this.fromRange(cfiFrom, this.base, ignoreClass));
    } else if (type === "node") {
      return Object(_utils_core__WEBPACK_IMPORTED_MODULE_0__["extend"])(this, this.fromNode(cfiFrom, this.base, ignoreClass));
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


  checkType(cfi) {
    if (this.isCfiString(cfi)) {
      return "string"; // Is a range object
    } else if (cfi && typeof cfi === "object" && (Object(_utils_core__WEBPACK_IMPORTED_MODULE_0__["type"])(cfi) === "Range" || typeof cfi.startContainer != "undefined")) {
      return "range";
    } else if (cfi && typeof cfi === "object" && typeof cfi.nodeType != "undefined") {
      // || typeof cfi === "function"
      return "node";
    } else if (cfi && typeof cfi === "object" && cfi instanceof EpubCFI) {
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


  parse(cfiStr) {
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
      return {
        spinePos: -1
      };
    }

    if (cfiStr.indexOf("epubcfi(") === 0 && cfiStr[cfiStr.length - 1] === ")") {
      // Remove intial epubcfi( and ending )
      cfiStr = cfiStr.slice(8, cfiStr.length - 1);
    }

    baseComponent = this.getChapterComponent(cfiStr); // Make sure this is a valid cfi or return

    if (!baseComponent) {
      return {
        spinePos: -1
      };
    }

    cfi.base = this.parseComponent(baseComponent);
    pathComponent = this.getPathComponent(cfiStr);
    cfi.path = this.parseComponent(pathComponent);
    range = this.getRange(cfiStr);

    if (range) {
      cfi.range = true;
      cfi.start = this.parseComponent(range[0]);
      cfi.end = this.parseComponent(range[1]);
    } // Get spine node position
    // cfi.spineSegment = cfi.base.steps[1];
    // Chapter segment is always the second step


    cfi.spinePos = cfi.base.steps[1].index;
    return cfi;
  }

  parseComponent(componentStr) {
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

  parseStep(stepStr) {
    var type, num, index, has_brackets, id;
    has_brackets = stepStr.match(/\[(.*)\]/);

    if (has_brackets && has_brackets[1]) {
      id = has_brackets[1];
    } //-- Check if step is a text node or element


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

  parseTerminal(termialStr) {
    var characterOffset, textLocationAssertion;
    var assertion = termialStr.match(/\[(.*)\]/);

    if (assertion && assertion[1]) {
      characterOffset = parseInt(termialStr.split("[")[0]);
      textLocationAssertion = assertion[1];
    } else {
      characterOffset = parseInt(termialStr);
    }

    if (!Object(_utils_core__WEBPACK_IMPORTED_MODULE_0__["isNumber"])(characterOffset)) {
      characterOffset = null;
    }

    return {
      "offset": characterOffset,
      "assertion": textLocationAssertion
    };
  }

  getChapterComponent(cfiStr) {
    var indirection = cfiStr.split("!");
    return indirection[0];
  }

  getPathComponent(cfiStr) {
    var indirection = cfiStr.split("!");

    if (indirection[1]) {
      let ranges = indirection[1].split(",");
      return ranges[0];
    }
  }

  getRange(cfiStr) {
    var ranges = cfiStr.split(",");

    if (ranges.length === 3) {
      return [ranges[1], ranges[2]];
    }

    return false;
  }

  getCharecterOffsetComponent(cfiStr) {
    var splitStr = cfiStr.split(":");
    return splitStr[1] || "";
  }

  joinSteps(steps) {
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

  segmentString(segment) {
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


  toString() {
    var cfiString = "epubcfi(";
    cfiString += this.segmentString(this.base);
    cfiString += "!";
    cfiString += this.segmentString(this.path); // Add Range, if present

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


  compare(cfiOne, cfiTwo) {
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
    } // Compare Spine Positions


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
    } // Compare Each Step in the First item


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
      } // Otherwise continue checking

    } // All steps in First equal to Second and First is Less Specific


    if (stepsA.length < stepsB.length) {
      return -1;
    } // Compare the charecter offset of the text node


    if (terminalA.offset > terminalB.offset) {
      return 1;
    }

    if (terminalA.offset < terminalB.offset) {
      return -1;
    } // CFI's are equal


    return 0;
  }

  step(node) {
    var nodeType = node.nodeType === TEXT_NODE ? "text" : "element";
    return {
      "id": node.id,
      "tagName": node.tagName,
      "type": nodeType,
      "index": this.position(node)
    };
  }

  filteredStep(node, ignoreClass) {
    var filteredNode = this.filter(node, ignoreClass);
    var nodeType; // Node filtered, so ignore

    if (!filteredNode) {
      return;
    } // Otherwise add the filter node in


    nodeType = filteredNode.nodeType === TEXT_NODE ? "text" : "element";
    return {
      "id": filteredNode.id,
      "tagName": filteredNode.tagName,
      "type": nodeType,
      "index": this.filteredPosition(filteredNode, ignoreClass)
    };
  }

  pathTo(node, offset, ignoreClass) {
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
      segment.terminal.offset = offset; // Make sure we are getting to a textNode if there is an offset

      if (segment.steps[segment.steps.length - 1].type != "text") {
        segment.steps.push({
          "type": "text",
          "index": 0
        });
      }
    }

    return segment;
  }

  equalStep(stepA, stepB) {
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


  fromRange(range, base, ignoreClass) {
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
    } else if (typeof base === "object") {
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

      cfi.end = this.pathTo(end, endOffset, ignoreClass); // Create a new empty path

      cfi.path = {
        steps: [],
        terminal: null
      }; // Push steps that are shared between start and end to the common path

      var len = cfi.start.steps.length;
      var i;

      for (i = 0; i < len; i++) {
        if (this.equalStep(cfi.start.steps[i], cfi.end.steps[i])) {
          if (i === len - 1) {
            // Last step is equal, check terminals
            if (cfi.start.terminal === cfi.end.terminal) {
              // CFI's are equal
              cfi.path.steps.push(cfi.start.steps[i]); // Not a range

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
      cfi.end.steps = cfi.end.steps.slice(cfi.path.steps.length); // TODO: Add Sanity check to make sure that the end if greater than the start
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


  fromNode(anchor, base, ignoreClass) {
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
    } else if (typeof base === "object") {
      cfi.base = base;
    }

    cfi.path = this.pathTo(anchor, null, ignoreClass);
    return cfi;
  }

  filter(anchor, ignoreClass) {
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
      nextSibling = parent.nextSibling; // If the sibling is a text node, join the nodes

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

  patchOffset(anchor, offset, ignoreClass) {
    if (anchor.nodeType != TEXT_NODE) {
      throw new Error("Anchor must be a text node");
    }

    var curr = anchor;
    var totalOffset = offset; // If the parent is a ignored node, get offset from it's start

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

  normalizedMap(children, nodeType, ignoreClass) {
    var output = {};
    var prevIndex = -1;
    var i,
        len = children.length;
    var currNodeType;
    var prevNodeType;

    for (i = 0; i < len; i++) {
      currNodeType = children[i].nodeType; // Check if needs ignoring

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

  position(anchor) {
    var children, index;

    if (anchor.nodeType === ELEMENT_NODE) {
      children = anchor.parentNode.children;

      if (!children) {
        children = Object(_utils_core__WEBPACK_IMPORTED_MODULE_0__["findChildren"])(anchor.parentNode);
      }

      index = Array.prototype.indexOf.call(children, anchor);
    } else {
      children = this.textNodes(anchor.parentNode);
      index = children.indexOf(anchor);
    }

    return index;
  }

  filteredPosition(anchor, ignoreClass) {
    var children, index, map;

    if (anchor.nodeType === ELEMENT_NODE) {
      children = anchor.parentNode.children;
      map = this.normalizedMap(children, ELEMENT_NODE, ignoreClass);
    } else {
      children = anchor.parentNode.childNodes; // Inside an ignored node

      if (anchor.parentNode.classList.contains(ignoreClass)) {
        anchor = anchor.parentNode;
        children = anchor.parentNode.childNodes;
      }

      map = this.normalizedMap(children, TEXT_NODE, ignoreClass);
    }

    index = Array.prototype.indexOf.call(children, anchor);
    return map[index];
  }

  stepsToXpath(steps) {
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


  stepsToQuerySelector(steps) {
    var query = ["html"];
    steps.forEach(function (step) {
      var position = step.index + 1;

      if (step.id) {
        query.push("#" + step.id);
      } else if (step.type === "text") {// unsupported in querySelector
        // query.push("text()[" + position + "]");
      } else {
        query.push("*:nth-child(" + position + ")");
      }
    });
    return query.join(">");
  }

  textNodes(container, ignoreClass) {
    return Array.prototype.slice.call(container.childNodes).filter(function (node) {
      if (node.nodeType === TEXT_NODE) {
        return true;
      } else if (ignoreClass && node.classList.contains(ignoreClass)) {
        return true;
      }

      return false;
    });
  }

  walkToNode(steps, _doc, ignoreClass) {
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
          children = container.children || Object(_utils_core__WEBPACK_IMPORTED_MODULE_0__["findChildren"])(container);
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

  findNode(steps, _doc, ignoreClass) {
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

  fixMiss(steps, offset, _doc, ignoreClass) {
    var container = this.findNode(steps.slice(0, -1), _doc, ignoreClass);
    var children = container.childNodes;
    var map = this.normalizedMap(children, TEXT_NODE, ignoreClass);
    var child;
    var len;
    var lastStepIndex = steps[steps.length - 1].index;

    for (let childIndex in map) {
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


  toRange(_doc, ignoreClass) {
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
      range = new _utils_core__WEBPACK_IMPORTED_MODULE_0__["RangeObject"]();
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
      console.log("No startContainer found for", this.toString()); // No start found

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
    } // doc.defaultView.getSelection().addRange(range);


    return range;
  }
  /**
   * Check if a string is wrapped with "epubcfi()"
   * @param {string} str
   * @returns {boolean}
   */


  isCfiString(str) {
    if (typeof str === "string" && str.indexOf("epubcfi(") === 0 && str[str.length - 1] === ")") {
      return true;
    }

    return false;
  }

  generateChapterComponent(_spineNodeIndex, _pos, id) {
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


  collapse(toStart) {
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

}

/* harmony default export */ __webpack_exports__["a"] = (EpubCFI);

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var d        = __webpack_require__(108)
  , callable = __webpack_require__(122)

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
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var core_js_modules_web_dom_collections_iterator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(14);
/* harmony import */ var core_js_modules_web_dom_collections_iterator__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_iterator__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_web_url__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(20);
/* harmony import */ var core_js_modules_web_url__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_url__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var path_webpack__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(9);
/* harmony import */ var path_webpack__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(path_webpack__WEBPACK_IMPORTED_MODULE_2__);



/**
 * Creates a Path object for parsing and manipulation of a path strings
 *
 * Uses a polyfill for Nodejs path: https://nodejs.org/api/path.html
 * @param	{string} pathString	a url string (relative or absolute)
 * @class
 */

class Path {
  constructor(pathString) {
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


  parse(what) {
    return path_webpack__WEBPACK_IMPORTED_MODULE_2___default.a.parse(what);
  }
  /**
   * @param	{string} what
   * @returns {boolean}
   */


  isAbsolute(what) {
    return path_webpack__WEBPACK_IMPORTED_MODULE_2___default.a.isAbsolute(what || this.path);
  }
  /**
   * Check if path ends with a directory
   * @param	{string} what
   * @returns {boolean}
   */


  isDirectory(what) {
    return what.charAt(what.length - 1) === "/";
  }
  /**
   * Resolve a path against the directory of the Path
   *
   * https://nodejs.org/api/path.html#path_path_resolve_paths
   * @param	{string} what
   * @returns {string} resolved
   */


  resolve(what) {
    return path_webpack__WEBPACK_IMPORTED_MODULE_2___default.a.resolve(this.directory, what);
  }
  /**
   * Resolve a path relative to the directory of the Path
   *
   * https://nodejs.org/api/path.html#path_path_relative_from_to
   * @param	{string} what
   * @returns {string} relative
   */


  relative(what) {
    var isAbsolute = what && what.indexOf("://") > -1;

    if (isAbsolute) {
      return what;
    }

    return path_webpack__WEBPACK_IMPORTED_MODULE_2___default.a.relative(this.directory, what);
  }

  splitPath(filename) {
    return this.splitPathRe.exec(filename).slice(1);
  }
  /**
   * Return the path string
   * @returns {string} path
   */


  toString() {
    return this.path;
  }

}

/* harmony default export */ __webpack_exports__["a"] = (Path);

/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var core_js_modules_web_dom_collections_iterator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(14);
/* harmony import */ var core_js_modules_web_dom_collections_iterator__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_iterator__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_web_url__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(20);
/* harmony import */ var core_js_modules_web_url__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_url__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _path__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4);
/* harmony import */ var path_webpack__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(9);
/* harmony import */ var path_webpack__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(path_webpack__WEBPACK_IMPORTED_MODULE_3__);




/**
 * creates a Url object for parsing and manipulation of a url string
 * @param	{string} urlString	a url string (relative or absolute)
 * @param	{string} [baseString] optional base for the url,
 * default to window.location.href
 */

class Url {
  constructor(urlString, baseString) {
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
    } // URL Polyfill doesn't throw an error if base is empty


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
        this.Url = undefined; // resolve the pathname from the base

        if (this.base) {
          basePath = new _path__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"](this.base);
          pathname = basePath.resolve(pathname);
        }
      }
    }

    this.Path = new _path__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"](pathname);
    this.directory = this.Path.directory;
    this.filename = this.Path.filename;
    this.extension = this.Path.extension;
  }
  /**
   * @returns {Path}
   */


  path() {
    return this.Path;
  }
  /**
   * Resolves a relative path to a absolute url
   * @param {string} what
   * @returns {string} url
   */


  resolve(what) {
    var isAbsolute = what.indexOf("://") > -1;
    var fullpath;

    if (isAbsolute) {
      return what;
    }

    fullpath = path_webpack__WEBPACK_IMPORTED_MODULE_3___default.a.resolve(this.directory, what);
    return this.origin + fullpath;
  }
  /**
   * Resolve a path relative to the url
   * @param {string} what
   * @returns {string} path
   */


  relative(what) {
    return path_webpack__WEBPACK_IMPORTED_MODULE_3___default.a.relative(what, this.directory);
  }
  /**
   * @returns {string}
   */


  toString() {
    return this.href;
  }

}

/* harmony default export */ __webpack_exports__["a"] = (Url);

/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var core_js_modules_web_dom_collections_iterator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(14);
/* harmony import */ var core_js_modules_web_dom_collections_iterator__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_iterator__WEBPACK_IMPORTED_MODULE_0__);


/**
 * Hooks allow for injecting functions that must all complete in order before finishing
 * They will execute in parallel but all must finish before continuing
 * Functions may return a promise if they are asycn.
 * @param {any} context scope of this
 * @example this.content = new EPUBJS.Hook(this);
 */
class Hook {
  constructor(context) {
    this.context = context || this;
    this.hooks = [];
  }
  /**
   * Adds a function to be run before a hook completes
   * @example this.content.register(function(){...});
   */


  register() {
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


  deregister(func) {
    let hook;

    for (let i = 0; i < this.hooks.length; i++) {
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


  trigger() {
    var args = arguments;
    var context = this.context;
    var promises = [];
    this.hooks.forEach(function (task) {
      var executing = task.apply(context, args);

      if (executing && typeof executing["then"] === "function") {
        // Task is a function that returns a promise
        promises.push(executing);
      } // Otherwise Task resolves immediately, continue

    });
    return Promise.all(promises);
  } // Adds a function to be run before a hook completes


  list() {
    return this.hooks;
  }

  clear() {
    return this.hooks = [];
  }

}

/* harmony default export */ __webpack_exports__["a"] = (Hook);

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var check = function (it) {
  return it && it.Math == Math && it;
};

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
module.exports =
  // eslint-disable-next-line no-undef
  check(typeof globalThis == 'object' && globalThis) ||
  check(typeof window == 'object' && window) ||
  check(typeof self == 'object' && self) ||
  check(typeof global == 'object' && global) ||
  // eslint-disable-next-line no-new-func
  Function('return this')();

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(30)))

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(7);
var shared = __webpack_require__(66);
var has = __webpack_require__(10);
var uid = __webpack_require__(67);
var NATIVE_SYMBOL = __webpack_require__(70);
var USE_SYMBOL_AS_UID = __webpack_require__(99);

var WellKnownSymbolsStore = shared('wks');
var Symbol = global.Symbol;
var createWellKnownSymbol = USE_SYMBOL_AS_UID ? Symbol : Symbol && Symbol.withoutSetter || uid;

module.exports = function (name) {
  if (!has(WellKnownSymbolsStore, name)) {
    if (NATIVE_SYMBOL && has(Symbol, name)) WellKnownSymbolsStore[name] = Symbol[name];
    else WellKnownSymbolsStore[name] = createWellKnownSymbol('Symbol.' + name);
  } return WellKnownSymbolsStore[name];
};


/***/ }),
/* 9 */
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
/* 10 */
/***/ (function(module, exports) {

var hasOwnProperty = {}.hasOwnProperty;

module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};


/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return replaceBase; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return replaceCanonical; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return replaceMeta; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return replaceLinks; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return substitute; });
/* harmony import */ var core_js_modules_es_string_replace__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(24);
/* harmony import */ var core_js_modules_es_string_replace__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_replace__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(0);
/* harmony import */ var _url__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5);
/* harmony import */ var _path__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(4);




function replaceBase(doc, section) {
  var base;
  var head;
  var url = section.url;
  var absolute = url.indexOf("://") > -1;

  if (!doc) {
    return;
  }

  head = Object(_core__WEBPACK_IMPORTED_MODULE_1__["qs"])(doc, "head");
  base = Object(_core__WEBPACK_IMPORTED_MODULE_1__["qs"])(head, "base");

  if (!base) {
    base = doc.createElement("base");
    head.insertBefore(base, head.firstChild);
  } // Fix for Safari crashing if the url doesn't have an origin


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

  head = Object(_core__WEBPACK_IMPORTED_MODULE_1__["qs"])(doc, "head");
  link = Object(_core__WEBPACK_IMPORTED_MODULE_1__["qs"])(head, "link[rel='canonical']");

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

  head = Object(_core__WEBPACK_IMPORTED_MODULE_1__["qs"])(doc, "head");
  meta = Object(_core__WEBPACK_IMPORTED_MODULE_1__["qs"])(head, "link[property='dc.identifier']");

  if (meta) {
    meta.setAttribute("content", id);
  } else {
    meta = doc.createElement("meta");
    meta.setAttribute("name", "dc.identifier");
    meta.setAttribute("content", id);
    head.appendChild(meta);
  }
} // TODO: move me to Contents

function replaceLinks(contents, fn) {
  var links = contents.querySelectorAll("a[href]");

  if (!links.length) {
    return;
  }

  var base = Object(_core__WEBPACK_IMPORTED_MODULE_1__["qs"])(contents.ownerDocument, "base");
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
        linkUrl = new _url__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"](href, location);
      } catch (error) {// NOOP
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
/* 12 */
/***/ (function(module, exports) {

module.exports = function (exec) {
  try {
    return !!exec();
  } catch (error) {
    return true;
  }
};


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(17);

module.exports = function (it) {
  if (!isObject(it)) {
    throw TypeError(String(it) + ' is not an object');
  } return it;
};


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(7);
var DOMIterables = __webpack_require__(102);
var ArrayIteratorMethods = __webpack_require__(71);
var createNonEnumerableProperty = __webpack_require__(15);
var wellKnownSymbol = __webpack_require__(8);

var ITERATOR = wellKnownSymbol('iterator');
var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var ArrayValues = ArrayIteratorMethods.values;

for (var COLLECTION_NAME in DOMIterables) {
  var Collection = global[COLLECTION_NAME];
  var CollectionPrototype = Collection && Collection.prototype;
  if (CollectionPrototype) {
    // some Chrome versions have non-configurable methods on DOMTokenList
    if (CollectionPrototype[ITERATOR] !== ArrayValues) try {
      createNonEnumerableProperty(CollectionPrototype, ITERATOR, ArrayValues);
    } catch (error) {
      CollectionPrototype[ITERATOR] = ArrayValues;
    }
    if (!CollectionPrototype[TO_STRING_TAG]) {
      createNonEnumerableProperty(CollectionPrototype, TO_STRING_TAG, COLLECTION_NAME);
    }
    if (DOMIterables[COLLECTION_NAME]) for (var METHOD_NAME in ArrayIteratorMethods) {
      // some Chrome versions have non-configurable methods on DOMTokenList
      if (CollectionPrototype[METHOD_NAME] !== ArrayIteratorMethods[METHOD_NAME]) try {
        createNonEnumerableProperty(CollectionPrototype, METHOD_NAME, ArrayIteratorMethods[METHOD_NAME]);
      } catch (error) {
        CollectionPrototype[METHOD_NAME] = ArrayIteratorMethods[METHOD_NAME];
      }
    }
  }
}


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

var DESCRIPTORS = __webpack_require__(16);
var definePropertyModule = __webpack_require__(18);
var createPropertyDescriptor = __webpack_require__(25);

module.exports = DESCRIPTORS ? function (object, key, value) {
  return definePropertyModule.f(object, key, createPropertyDescriptor(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

var fails = __webpack_require__(12);

// Thank's IE8 for his funny defineProperty
module.exports = !fails(function () {
  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] != 7;
});


/***/ }),
/* 17 */
/***/ (function(module, exports) {

module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

var DESCRIPTORS = __webpack_require__(16);
var IE8_DOM_DEFINE = __webpack_require__(62);
var anObject = __webpack_require__(13);
var toPrimitive = __webpack_require__(41);

var nativeDefineProperty = Object.defineProperty;

// `Object.defineProperty` method
// https://tc39.github.io/ecma262/#sec-object.defineproperty
exports.f = DESCRIPTORS ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return nativeDefineProperty(O, P, Attributes);
  } catch (error) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(7);
var createNonEnumerableProperty = __webpack_require__(15);
var has = __webpack_require__(10);
var setGlobal = __webpack_require__(42);
var inspectSource = __webpack_require__(64);
var InternalStateModule = __webpack_require__(26);

var getInternalState = InternalStateModule.get;
var enforceInternalState = InternalStateModule.enforce;
var TEMPLATE = String(String).split('String');

(module.exports = function (O, key, value, options) {
  var unsafe = options ? !!options.unsafe : false;
  var simple = options ? !!options.enumerable : false;
  var noTargetGet = options ? !!options.noTargetGet : false;
  if (typeof value == 'function') {
    if (typeof key == 'string' && !has(value, 'name')) createNonEnumerableProperty(value, 'name', key);
    enforceInternalState(value).source = TEMPLATE.join(typeof key == 'string' ? key : '');
  }
  if (O === global) {
    if (simple) O[key] = value;
    else setGlobal(key, value);
    return;
  } else if (!unsafe) {
    delete O[key];
  } else if (!noTargetGet && O[key]) {
    simple = true;
  }
  if (simple) O[key] = value;
  else createNonEnumerableProperty(O, key, value);
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, 'toString', function toString() {
  return typeof this == 'function' && getInternalState(this).source || inspectSource(this);
});


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`
__webpack_require__(123);
var $ = __webpack_require__(31);
var DESCRIPTORS = __webpack_require__(16);
var USE_NATIVE_URL = __webpack_require__(78);
var global = __webpack_require__(7);
var defineProperties = __webpack_require__(72);
var redefine = __webpack_require__(19);
var anInstance = __webpack_require__(79);
var has = __webpack_require__(10);
var assign = __webpack_require__(124);
var arrayFrom = __webpack_require__(125);
var codeAt = __webpack_require__(49).codeAt;
var toASCII = __webpack_require__(131);
var setToStringTag = __webpack_require__(37);
var URLSearchParamsModule = __webpack_require__(132);
var InternalStateModule = __webpack_require__(26);

var NativeURL = global.URL;
var URLSearchParams = URLSearchParamsModule.URLSearchParams;
var getInternalSearchParamsState = URLSearchParamsModule.getState;
var setInternalState = InternalStateModule.set;
var getInternalURLState = InternalStateModule.getterFor('URL');
var floor = Math.floor;
var pow = Math.pow;

var INVALID_AUTHORITY = 'Invalid authority';
var INVALID_SCHEME = 'Invalid scheme';
var INVALID_HOST = 'Invalid host';
var INVALID_PORT = 'Invalid port';

var ALPHA = /[A-Za-z]/;
var ALPHANUMERIC = /[\d+-.A-Za-z]/;
var DIGIT = /\d/;
var HEX_START = /^(0x|0X)/;
var OCT = /^[0-7]+$/;
var DEC = /^\d+$/;
var HEX = /^[\dA-Fa-f]+$/;
// eslint-disable-next-line no-control-regex
var FORBIDDEN_HOST_CODE_POINT = /[\u0000\u0009\u000A\u000D #%/:?@[\\]]/;
// eslint-disable-next-line no-control-regex
var FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT = /[\u0000\u0009\u000A\u000D #/:?@[\\]]/;
// eslint-disable-next-line no-control-regex
var LEADING_AND_TRAILING_C0_CONTROL_OR_SPACE = /^[\u0000-\u001F ]+|[\u0000-\u001F ]+$/g;
// eslint-disable-next-line no-control-regex
var TAB_AND_NEW_LINE = /[\u0009\u000A\u000D]/g;
var EOF;

var parseHost = function (url, input) {
  var result, codePoints, index;
  if (input.charAt(0) == '[') {
    if (input.charAt(input.length - 1) != ']') return INVALID_HOST;
    result = parseIPv6(input.slice(1, -1));
    if (!result) return INVALID_HOST;
    url.host = result;
  // opaque host
  } else if (!isSpecial(url)) {
    if (FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT.test(input)) return INVALID_HOST;
    result = '';
    codePoints = arrayFrom(input);
    for (index = 0; index < codePoints.length; index++) {
      result += percentEncode(codePoints[index], C0ControlPercentEncodeSet);
    }
    url.host = result;
  } else {
    input = toASCII(input);
    if (FORBIDDEN_HOST_CODE_POINT.test(input)) return INVALID_HOST;
    result = parseIPv4(input);
    if (result === null) return INVALID_HOST;
    url.host = result;
  }
};

var parseIPv4 = function (input) {
  var parts = input.split('.');
  var partsLength, numbers, index, part, radix, number, ipv4;
  if (parts.length && parts[parts.length - 1] == '') {
    parts.pop();
  }
  partsLength = parts.length;
  if (partsLength > 4) return input;
  numbers = [];
  for (index = 0; index < partsLength; index++) {
    part = parts[index];
    if (part == '') return input;
    radix = 10;
    if (part.length > 1 && part.charAt(0) == '0') {
      radix = HEX_START.test(part) ? 16 : 8;
      part = part.slice(radix == 8 ? 1 : 2);
    }
    if (part === '') {
      number = 0;
    } else {
      if (!(radix == 10 ? DEC : radix == 8 ? OCT : HEX).test(part)) return input;
      number = parseInt(part, radix);
    }
    numbers.push(number);
  }
  for (index = 0; index < partsLength; index++) {
    number = numbers[index];
    if (index == partsLength - 1) {
      if (number >= pow(256, 5 - partsLength)) return null;
    } else if (number > 255) return null;
  }
  ipv4 = numbers.pop();
  for (index = 0; index < numbers.length; index++) {
    ipv4 += numbers[index] * pow(256, 3 - index);
  }
  return ipv4;
};

// eslint-disable-next-line max-statements
var parseIPv6 = function (input) {
  var address = [0, 0, 0, 0, 0, 0, 0, 0];
  var pieceIndex = 0;
  var compress = null;
  var pointer = 0;
  var value, length, numbersSeen, ipv4Piece, number, swaps, swap;

  var char = function () {
    return input.charAt(pointer);
  };

  if (char() == ':') {
    if (input.charAt(1) != ':') return;
    pointer += 2;
    pieceIndex++;
    compress = pieceIndex;
  }
  while (char()) {
    if (pieceIndex == 8) return;
    if (char() == ':') {
      if (compress !== null) return;
      pointer++;
      pieceIndex++;
      compress = pieceIndex;
      continue;
    }
    value = length = 0;
    while (length < 4 && HEX.test(char())) {
      value = value * 16 + parseInt(char(), 16);
      pointer++;
      length++;
    }
    if (char() == '.') {
      if (length == 0) return;
      pointer -= length;
      if (pieceIndex > 6) return;
      numbersSeen = 0;
      while (char()) {
        ipv4Piece = null;
        if (numbersSeen > 0) {
          if (char() == '.' && numbersSeen < 4) pointer++;
          else return;
        }
        if (!DIGIT.test(char())) return;
        while (DIGIT.test(char())) {
          number = parseInt(char(), 10);
          if (ipv4Piece === null) ipv4Piece = number;
          else if (ipv4Piece == 0) return;
          else ipv4Piece = ipv4Piece * 10 + number;
          if (ipv4Piece > 255) return;
          pointer++;
        }
        address[pieceIndex] = address[pieceIndex] * 256 + ipv4Piece;
        numbersSeen++;
        if (numbersSeen == 2 || numbersSeen == 4) pieceIndex++;
      }
      if (numbersSeen != 4) return;
      break;
    } else if (char() == ':') {
      pointer++;
      if (!char()) return;
    } else if (char()) return;
    address[pieceIndex++] = value;
  }
  if (compress !== null) {
    swaps = pieceIndex - compress;
    pieceIndex = 7;
    while (pieceIndex != 0 && swaps > 0) {
      swap = address[pieceIndex];
      address[pieceIndex--] = address[compress + swaps - 1];
      address[compress + --swaps] = swap;
    }
  } else if (pieceIndex != 8) return;
  return address;
};

var findLongestZeroSequence = function (ipv6) {
  var maxIndex = null;
  var maxLength = 1;
  var currStart = null;
  var currLength = 0;
  var index = 0;
  for (; index < 8; index++) {
    if (ipv6[index] !== 0) {
      if (currLength > maxLength) {
        maxIndex = currStart;
        maxLength = currLength;
      }
      currStart = null;
      currLength = 0;
    } else {
      if (currStart === null) currStart = index;
      ++currLength;
    }
  }
  if (currLength > maxLength) {
    maxIndex = currStart;
    maxLength = currLength;
  }
  return maxIndex;
};

var serializeHost = function (host) {
  var result, index, compress, ignore0;
  // ipv4
  if (typeof host == 'number') {
    result = [];
    for (index = 0; index < 4; index++) {
      result.unshift(host % 256);
      host = floor(host / 256);
    } return result.join('.');
  // ipv6
  } else if (typeof host == 'object') {
    result = '';
    compress = findLongestZeroSequence(host);
    for (index = 0; index < 8; index++) {
      if (ignore0 && host[index] === 0) continue;
      if (ignore0) ignore0 = false;
      if (compress === index) {
        result += index ? ':' : '::';
        ignore0 = true;
      } else {
        result += host[index].toString(16);
        if (index < 7) result += ':';
      }
    }
    return '[' + result + ']';
  } return host;
};

var C0ControlPercentEncodeSet = {};
var fragmentPercentEncodeSet = assign({}, C0ControlPercentEncodeSet, {
  ' ': 1, '"': 1, '<': 1, '>': 1, '`': 1
});
var pathPercentEncodeSet = assign({}, fragmentPercentEncodeSet, {
  '#': 1, '?': 1, '{': 1, '}': 1
});
var userinfoPercentEncodeSet = assign({}, pathPercentEncodeSet, {
  '/': 1, ':': 1, ';': 1, '=': 1, '@': 1, '[': 1, '\\': 1, ']': 1, '^': 1, '|': 1
});

var percentEncode = function (char, set) {
  var code = codeAt(char, 0);
  return code > 0x20 && code < 0x7F && !has(set, char) ? char : encodeURIComponent(char);
};

var specialSchemes = {
  ftp: 21,
  file: null,
  http: 80,
  https: 443,
  ws: 80,
  wss: 443
};

var isSpecial = function (url) {
  return has(specialSchemes, url.scheme);
};

var includesCredentials = function (url) {
  return url.username != '' || url.password != '';
};

var cannotHaveUsernamePasswordPort = function (url) {
  return !url.host || url.cannotBeABaseURL || url.scheme == 'file';
};

var isWindowsDriveLetter = function (string, normalized) {
  var second;
  return string.length == 2 && ALPHA.test(string.charAt(0))
    && ((second = string.charAt(1)) == ':' || (!normalized && second == '|'));
};

var startsWithWindowsDriveLetter = function (string) {
  var third;
  return string.length > 1 && isWindowsDriveLetter(string.slice(0, 2)) && (
    string.length == 2 ||
    ((third = string.charAt(2)) === '/' || third === '\\' || third === '?' || third === '#')
  );
};

var shortenURLsPath = function (url) {
  var path = url.path;
  var pathSize = path.length;
  if (pathSize && (url.scheme != 'file' || pathSize != 1 || !isWindowsDriveLetter(path[0], true))) {
    path.pop();
  }
};

var isSingleDot = function (segment) {
  return segment === '.' || segment.toLowerCase() === '%2e';
};

var isDoubleDot = function (segment) {
  segment = segment.toLowerCase();
  return segment === '..' || segment === '%2e.' || segment === '.%2e' || segment === '%2e%2e';
};

// States:
var SCHEME_START = {};
var SCHEME = {};
var NO_SCHEME = {};
var SPECIAL_RELATIVE_OR_AUTHORITY = {};
var PATH_OR_AUTHORITY = {};
var RELATIVE = {};
var RELATIVE_SLASH = {};
var SPECIAL_AUTHORITY_SLASHES = {};
var SPECIAL_AUTHORITY_IGNORE_SLASHES = {};
var AUTHORITY = {};
var HOST = {};
var HOSTNAME = {};
var PORT = {};
var FILE = {};
var FILE_SLASH = {};
var FILE_HOST = {};
var PATH_START = {};
var PATH = {};
var CANNOT_BE_A_BASE_URL_PATH = {};
var QUERY = {};
var FRAGMENT = {};

// eslint-disable-next-line max-statements
var parseURL = function (url, input, stateOverride, base) {
  var state = stateOverride || SCHEME_START;
  var pointer = 0;
  var buffer = '';
  var seenAt = false;
  var seenBracket = false;
  var seenPasswordToken = false;
  var codePoints, char, bufferCodePoints, failure;

  if (!stateOverride) {
    url.scheme = '';
    url.username = '';
    url.password = '';
    url.host = null;
    url.port = null;
    url.path = [];
    url.query = null;
    url.fragment = null;
    url.cannotBeABaseURL = false;
    input = input.replace(LEADING_AND_TRAILING_C0_CONTROL_OR_SPACE, '');
  }

  input = input.replace(TAB_AND_NEW_LINE, '');

  codePoints = arrayFrom(input);

  while (pointer <= codePoints.length) {
    char = codePoints[pointer];
    switch (state) {
      case SCHEME_START:
        if (char && ALPHA.test(char)) {
          buffer += char.toLowerCase();
          state = SCHEME;
        } else if (!stateOverride) {
          state = NO_SCHEME;
          continue;
        } else return INVALID_SCHEME;
        break;

      case SCHEME:
        if (char && (ALPHANUMERIC.test(char) || char == '+' || char == '-' || char == '.')) {
          buffer += char.toLowerCase();
        } else if (char == ':') {
          if (stateOverride && (
            (isSpecial(url) != has(specialSchemes, buffer)) ||
            (buffer == 'file' && (includesCredentials(url) || url.port !== null)) ||
            (url.scheme == 'file' && !url.host)
          )) return;
          url.scheme = buffer;
          if (stateOverride) {
            if (isSpecial(url) && specialSchemes[url.scheme] == url.port) url.port = null;
            return;
          }
          buffer = '';
          if (url.scheme == 'file') {
            state = FILE;
          } else if (isSpecial(url) && base && base.scheme == url.scheme) {
            state = SPECIAL_RELATIVE_OR_AUTHORITY;
          } else if (isSpecial(url)) {
            state = SPECIAL_AUTHORITY_SLASHES;
          } else if (codePoints[pointer + 1] == '/') {
            state = PATH_OR_AUTHORITY;
            pointer++;
          } else {
            url.cannotBeABaseURL = true;
            url.path.push('');
            state = CANNOT_BE_A_BASE_URL_PATH;
          }
        } else if (!stateOverride) {
          buffer = '';
          state = NO_SCHEME;
          pointer = 0;
          continue;
        } else return INVALID_SCHEME;
        break;

      case NO_SCHEME:
        if (!base || (base.cannotBeABaseURL && char != '#')) return INVALID_SCHEME;
        if (base.cannotBeABaseURL && char == '#') {
          url.scheme = base.scheme;
          url.path = base.path.slice();
          url.query = base.query;
          url.fragment = '';
          url.cannotBeABaseURL = true;
          state = FRAGMENT;
          break;
        }
        state = base.scheme == 'file' ? FILE : RELATIVE;
        continue;

      case SPECIAL_RELATIVE_OR_AUTHORITY:
        if (char == '/' && codePoints[pointer + 1] == '/') {
          state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
          pointer++;
        } else {
          state = RELATIVE;
          continue;
        } break;

      case PATH_OR_AUTHORITY:
        if (char == '/') {
          state = AUTHORITY;
          break;
        } else {
          state = PATH;
          continue;
        }

      case RELATIVE:
        url.scheme = base.scheme;
        if (char == EOF) {
          url.username = base.username;
          url.password = base.password;
          url.host = base.host;
          url.port = base.port;
          url.path = base.path.slice();
          url.query = base.query;
        } else if (char == '/' || (char == '\\' && isSpecial(url))) {
          state = RELATIVE_SLASH;
        } else if (char == '?') {
          url.username = base.username;
          url.password = base.password;
          url.host = base.host;
          url.port = base.port;
          url.path = base.path.slice();
          url.query = '';
          state = QUERY;
        } else if (char == '#') {
          url.username = base.username;
          url.password = base.password;
          url.host = base.host;
          url.port = base.port;
          url.path = base.path.slice();
          url.query = base.query;
          url.fragment = '';
          state = FRAGMENT;
        } else {
          url.username = base.username;
          url.password = base.password;
          url.host = base.host;
          url.port = base.port;
          url.path = base.path.slice();
          url.path.pop();
          state = PATH;
          continue;
        } break;

      case RELATIVE_SLASH:
        if (isSpecial(url) && (char == '/' || char == '\\')) {
          state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
        } else if (char == '/') {
          state = AUTHORITY;
        } else {
          url.username = base.username;
          url.password = base.password;
          url.host = base.host;
          url.port = base.port;
          state = PATH;
          continue;
        } break;

      case SPECIAL_AUTHORITY_SLASHES:
        state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
        if (char != '/' || buffer.charAt(pointer + 1) != '/') continue;
        pointer++;
        break;

      case SPECIAL_AUTHORITY_IGNORE_SLASHES:
        if (char != '/' && char != '\\') {
          state = AUTHORITY;
          continue;
        } break;

      case AUTHORITY:
        if (char == '@') {
          if (seenAt) buffer = '%40' + buffer;
          seenAt = true;
          bufferCodePoints = arrayFrom(buffer);
          for (var i = 0; i < bufferCodePoints.length; i++) {
            var codePoint = bufferCodePoints[i];
            if (codePoint == ':' && !seenPasswordToken) {
              seenPasswordToken = true;
              continue;
            }
            var encodedCodePoints = percentEncode(codePoint, userinfoPercentEncodeSet);
            if (seenPasswordToken) url.password += encodedCodePoints;
            else url.username += encodedCodePoints;
          }
          buffer = '';
        } else if (
          char == EOF || char == '/' || char == '?' || char == '#' ||
          (char == '\\' && isSpecial(url))
        ) {
          if (seenAt && buffer == '') return INVALID_AUTHORITY;
          pointer -= arrayFrom(buffer).length + 1;
          buffer = '';
          state = HOST;
        } else buffer += char;
        break;

      case HOST:
      case HOSTNAME:
        if (stateOverride && url.scheme == 'file') {
          state = FILE_HOST;
          continue;
        } else if (char == ':' && !seenBracket) {
          if (buffer == '') return INVALID_HOST;
          failure = parseHost(url, buffer);
          if (failure) return failure;
          buffer = '';
          state = PORT;
          if (stateOverride == HOSTNAME) return;
        } else if (
          char == EOF || char == '/' || char == '?' || char == '#' ||
          (char == '\\' && isSpecial(url))
        ) {
          if (isSpecial(url) && buffer == '') return INVALID_HOST;
          if (stateOverride && buffer == '' && (includesCredentials(url) || url.port !== null)) return;
          failure = parseHost(url, buffer);
          if (failure) return failure;
          buffer = '';
          state = PATH_START;
          if (stateOverride) return;
          continue;
        } else {
          if (char == '[') seenBracket = true;
          else if (char == ']') seenBracket = false;
          buffer += char;
        } break;

      case PORT:
        if (DIGIT.test(char)) {
          buffer += char;
        } else if (
          char == EOF || char == '/' || char == '?' || char == '#' ||
          (char == '\\' && isSpecial(url)) ||
          stateOverride
        ) {
          if (buffer != '') {
            var port = parseInt(buffer, 10);
            if (port > 0xFFFF) return INVALID_PORT;
            url.port = (isSpecial(url) && port === specialSchemes[url.scheme]) ? null : port;
            buffer = '';
          }
          if (stateOverride) return;
          state = PATH_START;
          continue;
        } else return INVALID_PORT;
        break;

      case FILE:
        url.scheme = 'file';
        if (char == '/' || char == '\\') state = FILE_SLASH;
        else if (base && base.scheme == 'file') {
          if (char == EOF) {
            url.host = base.host;
            url.path = base.path.slice();
            url.query = base.query;
          } else if (char == '?') {
            url.host = base.host;
            url.path = base.path.slice();
            url.query = '';
            state = QUERY;
          } else if (char == '#') {
            url.host = base.host;
            url.path = base.path.slice();
            url.query = base.query;
            url.fragment = '';
            state = FRAGMENT;
          } else {
            if (!startsWithWindowsDriveLetter(codePoints.slice(pointer).join(''))) {
              url.host = base.host;
              url.path = base.path.slice();
              shortenURLsPath(url);
            }
            state = PATH;
            continue;
          }
        } else {
          state = PATH;
          continue;
        } break;

      case FILE_SLASH:
        if (char == '/' || char == '\\') {
          state = FILE_HOST;
          break;
        }
        if (base && base.scheme == 'file' && !startsWithWindowsDriveLetter(codePoints.slice(pointer).join(''))) {
          if (isWindowsDriveLetter(base.path[0], true)) url.path.push(base.path[0]);
          else url.host = base.host;
        }
        state = PATH;
        continue;

      case FILE_HOST:
        if (char == EOF || char == '/' || char == '\\' || char == '?' || char == '#') {
          if (!stateOverride && isWindowsDriveLetter(buffer)) {
            state = PATH;
          } else if (buffer == '') {
            url.host = '';
            if (stateOverride) return;
            state = PATH_START;
          } else {
            failure = parseHost(url, buffer);
            if (failure) return failure;
            if (url.host == 'localhost') url.host = '';
            if (stateOverride) return;
            buffer = '';
            state = PATH_START;
          } continue;
        } else buffer += char;
        break;

      case PATH_START:
        if (isSpecial(url)) {
          state = PATH;
          if (char != '/' && char != '\\') continue;
        } else if (!stateOverride && char == '?') {
          url.query = '';
          state = QUERY;
        } else if (!stateOverride && char == '#') {
          url.fragment = '';
          state = FRAGMENT;
        } else if (char != EOF) {
          state = PATH;
          if (char != '/') continue;
        } break;

      case PATH:
        if (
          char == EOF || char == '/' ||
          (char == '\\' && isSpecial(url)) ||
          (!stateOverride && (char == '?' || char == '#'))
        ) {
          if (isDoubleDot(buffer)) {
            shortenURLsPath(url);
            if (char != '/' && !(char == '\\' && isSpecial(url))) {
              url.path.push('');
            }
          } else if (isSingleDot(buffer)) {
            if (char != '/' && !(char == '\\' && isSpecial(url))) {
              url.path.push('');
            }
          } else {
            if (url.scheme == 'file' && !url.path.length && isWindowsDriveLetter(buffer)) {
              if (url.host) url.host = '';
              buffer = buffer.charAt(0) + ':'; // normalize windows drive letter
            }
            url.path.push(buffer);
          }
          buffer = '';
          if (url.scheme == 'file' && (char == EOF || char == '?' || char == '#')) {
            while (url.path.length > 1 && url.path[0] === '') {
              url.path.shift();
            }
          }
          if (char == '?') {
            url.query = '';
            state = QUERY;
          } else if (char == '#') {
            url.fragment = '';
            state = FRAGMENT;
          }
        } else {
          buffer += percentEncode(char, pathPercentEncodeSet);
        } break;

      case CANNOT_BE_A_BASE_URL_PATH:
        if (char == '?') {
          url.query = '';
          state = QUERY;
        } else if (char == '#') {
          url.fragment = '';
          state = FRAGMENT;
        } else if (char != EOF) {
          url.path[0] += percentEncode(char, C0ControlPercentEncodeSet);
        } break;

      case QUERY:
        if (!stateOverride && char == '#') {
          url.fragment = '';
          state = FRAGMENT;
        } else if (char != EOF) {
          if (char == "'" && isSpecial(url)) url.query += '%27';
          else if (char == '#') url.query += '%23';
          else url.query += percentEncode(char, C0ControlPercentEncodeSet);
        } break;

      case FRAGMENT:
        if (char != EOF) url.fragment += percentEncode(char, fragmentPercentEncodeSet);
        break;
    }

    pointer++;
  }
};

// `URL` constructor
// https://url.spec.whatwg.org/#url-class
var URLConstructor = function URL(url /* , base */) {
  var that = anInstance(this, URLConstructor, 'URL');
  var base = arguments.length > 1 ? arguments[1] : undefined;
  var urlString = String(url);
  var state = setInternalState(that, { type: 'URL' });
  var baseState, failure;
  if (base !== undefined) {
    if (base instanceof URLConstructor) baseState = getInternalURLState(base);
    else {
      failure = parseURL(baseState = {}, String(base));
      if (failure) throw TypeError(failure);
    }
  }
  failure = parseURL(state, urlString, null, baseState);
  if (failure) throw TypeError(failure);
  var searchParams = state.searchParams = new URLSearchParams();
  var searchParamsState = getInternalSearchParamsState(searchParams);
  searchParamsState.updateSearchParams(state.query);
  searchParamsState.updateURL = function () {
    state.query = String(searchParams) || null;
  };
  if (!DESCRIPTORS) {
    that.href = serializeURL.call(that);
    that.origin = getOrigin.call(that);
    that.protocol = getProtocol.call(that);
    that.username = getUsername.call(that);
    that.password = getPassword.call(that);
    that.host = getHost.call(that);
    that.hostname = getHostname.call(that);
    that.port = getPort.call(that);
    that.pathname = getPathname.call(that);
    that.search = getSearch.call(that);
    that.searchParams = getSearchParams.call(that);
    that.hash = getHash.call(that);
  }
};

var URLPrototype = URLConstructor.prototype;

var serializeURL = function () {
  var url = getInternalURLState(this);
  var scheme = url.scheme;
  var username = url.username;
  var password = url.password;
  var host = url.host;
  var port = url.port;
  var path = url.path;
  var query = url.query;
  var fragment = url.fragment;
  var output = scheme + ':';
  if (host !== null) {
    output += '//';
    if (includesCredentials(url)) {
      output += username + (password ? ':' + password : '') + '@';
    }
    output += serializeHost(host);
    if (port !== null) output += ':' + port;
  } else if (scheme == 'file') output += '//';
  output += url.cannotBeABaseURL ? path[0] : path.length ? '/' + path.join('/') : '';
  if (query !== null) output += '?' + query;
  if (fragment !== null) output += '#' + fragment;
  return output;
};

var getOrigin = function () {
  var url = getInternalURLState(this);
  var scheme = url.scheme;
  var port = url.port;
  if (scheme == 'blob') try {
    return new URL(scheme.path[0]).origin;
  } catch (error) {
    return 'null';
  }
  if (scheme == 'file' || !isSpecial(url)) return 'null';
  return scheme + '://' + serializeHost(url.host) + (port !== null ? ':' + port : '');
};

var getProtocol = function () {
  return getInternalURLState(this).scheme + ':';
};

var getUsername = function () {
  return getInternalURLState(this).username;
};

var getPassword = function () {
  return getInternalURLState(this).password;
};

var getHost = function () {
  var url = getInternalURLState(this);
  var host = url.host;
  var port = url.port;
  return host === null ? ''
    : port === null ? serializeHost(host)
    : serializeHost(host) + ':' + port;
};

var getHostname = function () {
  var host = getInternalURLState(this).host;
  return host === null ? '' : serializeHost(host);
};

var getPort = function () {
  var port = getInternalURLState(this).port;
  return port === null ? '' : String(port);
};

var getPathname = function () {
  var url = getInternalURLState(this);
  var path = url.path;
  return url.cannotBeABaseURL ? path[0] : path.length ? '/' + path.join('/') : '';
};

var getSearch = function () {
  var query = getInternalURLState(this).query;
  return query ? '?' + query : '';
};

var getSearchParams = function () {
  return getInternalURLState(this).searchParams;
};

var getHash = function () {
  var fragment = getInternalURLState(this).fragment;
  return fragment ? '#' + fragment : '';
};

var accessorDescriptor = function (getter, setter) {
  return { get: getter, set: setter, configurable: true, enumerable: true };
};

if (DESCRIPTORS) {
  defineProperties(URLPrototype, {
    // `URL.prototype.href` accessors pair
    // https://url.spec.whatwg.org/#dom-url-href
    href: accessorDescriptor(serializeURL, function (href) {
      var url = getInternalURLState(this);
      var urlString = String(href);
      var failure = parseURL(url, urlString);
      if (failure) throw TypeError(failure);
      getInternalSearchParamsState(url.searchParams).updateSearchParams(url.query);
    }),
    // `URL.prototype.origin` getter
    // https://url.spec.whatwg.org/#dom-url-origin
    origin: accessorDescriptor(getOrigin),
    // `URL.prototype.protocol` accessors pair
    // https://url.spec.whatwg.org/#dom-url-protocol
    protocol: accessorDescriptor(getProtocol, function (protocol) {
      var url = getInternalURLState(this);
      parseURL(url, String(protocol) + ':', SCHEME_START);
    }),
    // `URL.prototype.username` accessors pair
    // https://url.spec.whatwg.org/#dom-url-username
    username: accessorDescriptor(getUsername, function (username) {
      var url = getInternalURLState(this);
      var codePoints = arrayFrom(String(username));
      if (cannotHaveUsernamePasswordPort(url)) return;
      url.username = '';
      for (var i = 0; i < codePoints.length; i++) {
        url.username += percentEncode(codePoints[i], userinfoPercentEncodeSet);
      }
    }),
    // `URL.prototype.password` accessors pair
    // https://url.spec.whatwg.org/#dom-url-password
    password: accessorDescriptor(getPassword, function (password) {
      var url = getInternalURLState(this);
      var codePoints = arrayFrom(String(password));
      if (cannotHaveUsernamePasswordPort(url)) return;
      url.password = '';
      for (var i = 0; i < codePoints.length; i++) {
        url.password += percentEncode(codePoints[i], userinfoPercentEncodeSet);
      }
    }),
    // `URL.prototype.host` accessors pair
    // https://url.spec.whatwg.org/#dom-url-host
    host: accessorDescriptor(getHost, function (host) {
      var url = getInternalURLState(this);
      if (url.cannotBeABaseURL) return;
      parseURL(url, String(host), HOST);
    }),
    // `URL.prototype.hostname` accessors pair
    // https://url.spec.whatwg.org/#dom-url-hostname
    hostname: accessorDescriptor(getHostname, function (hostname) {
      var url = getInternalURLState(this);
      if (url.cannotBeABaseURL) return;
      parseURL(url, String(hostname), HOSTNAME);
    }),
    // `URL.prototype.port` accessors pair
    // https://url.spec.whatwg.org/#dom-url-port
    port: accessorDescriptor(getPort, function (port) {
      var url = getInternalURLState(this);
      if (cannotHaveUsernamePasswordPort(url)) return;
      port = String(port);
      if (port == '') url.port = null;
      else parseURL(url, port, PORT);
    }),
    // `URL.prototype.pathname` accessors pair
    // https://url.spec.whatwg.org/#dom-url-pathname
    pathname: accessorDescriptor(getPathname, function (pathname) {
      var url = getInternalURLState(this);
      if (url.cannotBeABaseURL) return;
      url.path = [];
      parseURL(url, pathname + '', PATH_START);
    }),
    // `URL.prototype.search` accessors pair
    // https://url.spec.whatwg.org/#dom-url-search
    search: accessorDescriptor(getSearch, function (search) {
      var url = getInternalURLState(this);
      search = String(search);
      if (search == '') {
        url.query = null;
      } else {
        if ('?' == search.charAt(0)) search = search.slice(1);
        url.query = '';
        parseURL(url, search, QUERY);
      }
      getInternalSearchParamsState(url.searchParams).updateSearchParams(url.query);
    }),
    // `URL.prototype.searchParams` getter
    // https://url.spec.whatwg.org/#dom-url-searchparams
    searchParams: accessorDescriptor(getSearchParams),
    // `URL.prototype.hash` accessors pair
    // https://url.spec.whatwg.org/#dom-url-hash
    hash: accessorDescriptor(getHash, function (hash) {
      var url = getInternalURLState(this);
      hash = String(hash);
      if (hash == '') {
        url.fragment = null;
        return;
      }
      if ('#' == hash.charAt(0)) hash = hash.slice(1);
      url.fragment = '';
      parseURL(url, hash, FRAGMENT);
    })
  });
}

// `URL.prototype.toJSON` method
// https://url.spec.whatwg.org/#dom-url-tojson
redefine(URLPrototype, 'toJSON', function toJSON() {
  return serializeURL.call(this);
}, { enumerable: true });

// `URL.prototype.toString` method
// https://url.spec.whatwg.org/#URL-stringification-behavior
redefine(URLPrototype, 'toString', function toString() {
  return serializeURL.call(this);
}, { enumerable: true });

if (NativeURL) {
  var nativeCreateObjectURL = NativeURL.createObjectURL;
  var nativeRevokeObjectURL = NativeURL.revokeObjectURL;
  // `URL.createObjectURL` method
  // https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
  // eslint-disable-next-line no-unused-vars
  if (nativeCreateObjectURL) redefine(URLConstructor, 'createObjectURL', function createObjectURL(blob) {
    return nativeCreateObjectURL.apply(NativeURL, arguments);
  });
  // `URL.revokeObjectURL` method
  // https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL
  // eslint-disable-next-line no-unused-vars
  if (nativeRevokeObjectURL) redefine(URLConstructor, 'revokeObjectURL', function revokeObjectURL(url) {
    return nativeRevokeObjectURL.apply(NativeURL, arguments);
  });
}

setToStringTag(URLConstructor, 'URL');

$({ global: true, forced: !USE_NATIVE_URL, sham: !DESCRIPTORS }, {
  URL: URLConstructor
});


/***/ }),
/* 21 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export Task */
/* harmony import */ var _core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);

/**
 * Queue for handling tasks one at a time
 * @class
 * @param {scope} context what this will resolve to in the tasks
 */

class Queue {
  constructor(context) {
    this._q = [];
    this.context = context;
    this.tick = _core__WEBPACK_IMPORTED_MODULE_0__["requestAnimationFrame"];
    this.running = false;
    this.paused = false;
  }
  /**
   * Add an item to the queue
   * @return {Promise}
   */


  enqueue() {
    var deferred, promise;
    var queued;
    var task = [].shift.call(arguments);
    var args = arguments; // Handle single args without context
    // if(args && !Array.isArray(args)) {
    //   args = [args];
    // }

    if (!task) {
      throw new Error("No Task Provided");
    }

    if (typeof task === "function") {
      deferred = new _core__WEBPACK_IMPORTED_MODULE_0__["defer"]();
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

    this._q.push(queued); // Wait to start queue flush


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


  dequeue() {
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
      inwait = new _core__WEBPACK_IMPORTED_MODULE_0__["defer"]();
      inwait.deferred.resolve();
      return inwait.promise;
    }
  } // Run All Immediately


  dump() {
    while (this._q.length) {
      this.dequeue();
    }
  }
  /**
   * Run all tasks sequentially, at convince
   * @return {Promise}
   */


  run() {
    if (!this.running) {
      this.running = true;
      this.defered = new _core__WEBPACK_IMPORTED_MODULE_0__["defer"]();
    }

    this.tick.call(window, () => {
      if (this._q.length) {
        this.dequeue().then(function () {
          this.run();
        }.bind(this));
      } else {
        this.defered.resolve();
        this.running = undefined;
      }
    }); // Unpause

    if (this.paused == true) {
      this.paused = false;
    }

    return this.defered.promise;
  }
  /**
   * Flush all, as quickly as possible
   * @return {Promise}
   */


  flush() {
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


  clear() {
    this._q = [];
  }
  /**
   * Get the number of tasks in the queue
   * @return {number} tasks
   */


  length() {
    return this._q.length;
  }
  /**
   * Pause a running queue
   */


  pause() {
    this.paused = true;
  }
  /**
   * End the queue
   */


  stop() {
    this._q = [];
    this.running = false;
    this.paused = true;
  }

}
/**
 * Create a new task from a callback
 * @class
 * @private
 * @param {function} task
 * @param {array} args
 * @param {scope} context
 * @return {function} task
 */


class Task {
  constructor(task, args, context) {
    return function () {
      var toApply = arguments || [];
      return new Promise((resolve, reject) => {
        var callback = function (value, err) {
          if (!value && err) {
            reject(err);
          } else {
            resolve(value);
          }
        }; // Add the callback to the arguments list


        toApply.push(callback); // Apply all arguments to the functions

        task.apply(context || this, toApply);
      });
    };
  }

}

/* harmony default export */ __webpack_exports__["a"] = (Queue);


/***/ }),
/* 22 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

// EXTERNAL MODULE: ./node_modules/event-emitter/index.js
var event_emitter = __webpack_require__(3);
var event_emitter_default = /*#__PURE__*/__webpack_require__.n(event_emitter);

// EXTERNAL MODULE: ./src/utils/core.js
var core = __webpack_require__(0);

// CONCATENATED MODULE: ./src/utils/scrolltype.js
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
// EXTERNAL MODULE: ./src/mapping.js
var mapping = __webpack_require__(23);

// EXTERNAL MODULE: ./src/utils/queue.js
var queue = __webpack_require__(21);

// EXTERNAL MODULE: ./node_modules/lodash/throttle.js
var throttle = __webpack_require__(84);
var throttle_default = /*#__PURE__*/__webpack_require__.n(throttle);

// CONCATENATED MODULE: ./src/managers/helpers/stage.js



class stage_Stage {
  constructor(_options) {
    this.settings = _options || {};
    this.id = "epubjs-container-" + Object(core["uuid"])();
    this.container = this.create(this.settings);

    if (this.settings.hidden) {
      this.wrapper = this.wrap(this.container);
    }
  }
  /*
  * Creates an element to render to.
  * Resizes to passed width and height or to the elements size
  */


  create(options) {
    let height = options.height; // !== false ? options.height : "100%";

    let width = options.width; // !== false ? options.width : "100%";

    let overflow = options.overflow || false;
    let axis = options.axis || "vertical";
    let direction = options.direction;
    Object(core["extend"])(this.settings, options);

    if (options.height && Object(core["isNumber"])(options.height)) {
      height = options.height + "px";
    }

    if (options.width && Object(core["isNumber"])(options.width)) {
      width = options.width + "px";
    } // Create new container element


    let container = document.createElement("div");
    container.id = this.id;
    container.classList.add("epub-container"); // Style Element
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

  wrap(container) {
    var wrapper = document.createElement("div");
    wrapper.style.visibility = "hidden";
    wrapper.style.overflow = "hidden";
    wrapper.style.width = "0";
    wrapper.style.height = "0";
    wrapper.appendChild(container);
    return wrapper;
  }

  getElement(_element) {
    var element;

    if (Object(core["isElement"])(_element)) {
      element = _element;
    } else if (typeof _element === "string") {
      element = document.getElementById(_element);
    }

    if (!element) {
      throw new Error("Not an Element");
    }

    return element;
  }

  attachTo(what) {
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

  getContainer() {
    return this.container;
  }

  onResize(func) {
    // Only listen to window for resize event if width and height are not fixed.
    // This applies if it is set to a percent or auto.
    if (!Object(core["isNumber"])(this.settings.width) || !Object(core["isNumber"])(this.settings.height)) {
      this.resizeFunc = throttle_default()(func, 50);
      window.addEventListener("resize", this.resizeFunc, false);
    }
  }

  onOrientationChange(func) {
    this.orientationChangeFunc = func;
    window.addEventListener("orientationchange", this.orientationChangeFunc, false);
  }

  size(width, height) {
    var bounds;

    let _width = width || this.settings.width;

    let _height = height || this.settings.height; // If width or height are set to false, inherit them from containing element


    if (width === null) {
      bounds = this.element.getBoundingClientRect();

      if (bounds.width) {
        width = Math.floor(bounds.width);
        this.container.style.width = width + "px";
      }
    } else {
      if (Object(core["isNumber"])(width)) {
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
      if (Object(core["isNumber"])(height)) {
        this.container.style.height = height + "px";
      } else {
        this.container.style.height = height;
      }
    }

    if (!Object(core["isNumber"])(width)) {
      width = this.container.clientWidth;
    }

    if (!Object(core["isNumber"])(height)) {
      height = this.container.clientHeight;
    }

    this.containerStyles = window.getComputedStyle(this.container);
    this.containerPadding = {
      left: parseFloat(this.containerStyles["padding-left"]) || 0,
      right: parseFloat(this.containerStyles["padding-right"]) || 0,
      top: parseFloat(this.containerStyles["padding-top"]) || 0,
      bottom: parseFloat(this.containerStyles["padding-bottom"]) || 0
    }; // Bounds not set, get them from window

    let _windowBounds = Object(core["windowBounds"])();

    let bodyStyles = window.getComputedStyle(document.body);
    let bodyPadding = {
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

  bounds() {
    let box;

    if (this.container.style.overflow !== "visible") {
      box = this.container && this.container.getBoundingClientRect();
    }

    if (!box || !box.width || !box.height) {
      return Object(core["windowBounds"])();
    } else {
      return box;
    }
  }

  getSheet() {
    var style = document.createElement("style"); // WebKit hack --> https://davidwalsh.name/add-rules-stylesheets

    style.appendChild(document.createTextNode(""));
    document.head.appendChild(style);
    return style.sheet;
  }

  addStyleRules(selector, rulesArray) {
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

  axis(axis) {
    if (axis === "horizontal") {
      this.container.style.display = "flex";
      this.container.style.flexDirection = "row";
      this.container.style.flexWrap = "nowrap";
    } else {
      this.container.style.display = "block";
    }

    this.settings.axis = axis;
  } // orientation(orientation) {
  // 	if (orientation === "landscape") {
  //
  // 	} else {
  //
  // 	}
  //
  // 	this.orientation = orientation;
  // }


  direction(dir) {
    if (this.container) {
      this.container.dir = dir;
      this.container.style["direction"] = dir;
    }

    if (this.settings.fullsize) {
      document.body.style["direction"] = dir;
    }

    this.settings.dir = dir;
  }

  overflow(overflow) {
    if (this.container) {
      if (overflow === "scroll" && this.settings.axis === "vertical") {
        this.container.style["overflow-y"] = overflow;
        this.container.style["overflow-x"] = "hidden";
      } else if (overflow === "scroll" && this.settings.axis === "horizontal") {
        this.container.style["overflow-y"] = "hidden";
        this.container.style["overflow-x"] = overflow;
      } else {
        this.container.style["overflow"] = overflow;
      }
    }

    this.settings.overflow = overflow;
  }

  destroy() {
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

}

/* harmony default export */ var stage = (stage_Stage);
// CONCATENATED MODULE: ./src/managers/helpers/views.js
class Views {
  constructor(container) {
    this.container = container;
    this._views = [];
    this.length = 0;
    this.hidden = false;
  }

  all() {
    return this._views;
  }

  first() {
    return this._views[0];
  }

  last() {
    return this._views[this._views.length - 1];
  }

  indexOf(view) {
    return this._views.indexOf(view);
  }

  slice() {
    return this._views.slice.apply(this._views, arguments);
  }

  get(i) {
    return this._views[i];
  }

  append(view) {
    this._views.push(view);

    if (this.container) {
      this.container.appendChild(view.element);
    }

    this.length++;
    return view;
  }

  prepend(view) {
    this._views.unshift(view);

    if (this.container) {
      this.container.insertBefore(view.element, this.container.firstChild);
    }

    this.length++;
    return view;
  }

  insert(view, index) {
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

  remove(view) {
    var index = this._views.indexOf(view);

    if (index > -1) {
      this._views.splice(index, 1);
    }

    this.destroy(view);
    this.length--;
  }

  destroy(view) {
    if (view.displayed) {
      view.destroy();
    }

    if (this.container) {
      this.container.removeChild(view.element);
    }

    view = null;
  } // Iterators


  forEach() {
    return this._views.forEach.apply(this._views, arguments);
  }

  clear() {
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

  find(section) {
    var view;
    var len = this.length;

    for (var i = 0; i < len; i++) {
      view = this._views[i];

      if (view.displayed && view.section.index == section.index) {
        return view;
      }
    }
  }

  displayed() {
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

  show() {
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

  hide() {
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

}

/* harmony default export */ var views = (Views);
// EXTERNAL MODULE: ./src/utils/constants.js
var constants = __webpack_require__(1);

// CONCATENATED MODULE: ./src/managers/default/index.js









class default_DefaultViewManager {
  constructor(options) {
    this.name = "default";
    this.optsSettings = options.settings;
    this.View = options.view;
    this.request = options.request;
    this.renditionQueue = options.queue;
    this.q = new queue["a" /* default */](this);
    this.settings = Object(core["extend"])(this.settings || {}, {
      infinite: true,
      hidden: false,
      width: undefined,
      height: undefined,
      axis: undefined,
      writingMode: undefined,
      flow: "scrolled",
      ignoreClass: "",
      fullsize: undefined
    });
    Object(core["extend"])(this.settings, options.settings || {});
    this.viewSettings = {
      ignoreClass: this.settings.ignoreClass,
      axis: this.settings.axis,
      flow: this.settings.flow,
      layout: this.layout,
      method: this.settings.method,
      // srcdoc, blobUrl, write
      width: 0,
      height: 0,
      forceEvenPages: true
    };
    this.rendered = false;
  }

  render(element, size) {
    let tag = element.tagName;

    if (typeof this.settings.fullsize === "undefined" && tag && (tag.toLowerCase() == "body" || tag.toLowerCase() == "html")) {
      this.settings.fullsize = true;
    }

    if (this.settings.fullsize) {
      this.settings.overflow = "visible";
      this.overflow = this.settings.overflow;
    }

    this.settings.size = size;
    this.settings.rtlScrollType = scrollType(); // Save the stage

    this.stage = new stage({
      width: size.width,
      height: size.height,
      overflow: this.overflow,
      hidden: this.settings.hidden,
      axis: this.settings.axis,
      fullsize: this.settings.fullsize,
      direction: this.settings.direction
    });
    this.stage.attachTo(element); // Get this stage container div

    this.container = this.stage.getContainer(); // Views array methods

    this.views = new views(this.container); // Calculate Stage Size

    this._bounds = this.bounds();
    this._stageSize = this.stage.size(); // Set the dimensions for views

    this.viewSettings.width = this._stageSize.width;
    this.viewSettings.height = this._stageSize.height; // Function to handle a resize event.
    // Will only attach if width and height are both fixed.

    this.stage.onResize(this.onResized.bind(this));
    this.stage.onOrientationChange(this.onOrientationChange.bind(this)); // Add Event Listeners

    this.addEventListeners(); // Add Layout method
    // this.applyLayoutMethod();

    if (this.layout) {
      this.updateLayout();
    }

    this.rendered = true;
  }

  addEventListeners() {
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

  removeEventListeners() {
    var scroller;

    if (!this.settings.fullsize) {
      scroller = this.container;
    } else {
      scroller = window;
    }

    scroller.removeEventListener("scroll", this._onScroll);
    this._onScroll = undefined;
  }

  destroy() {
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

  onOrientationChange(e) {
    let {
      orientation
    } = window;

    if (this.optsSettings.resizeOnOrientationChange) {
      this.resize();
    } // Per ampproject:
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

      this.emit(constants["c" /* EVENTS */].MANAGERS.ORIENTATION_CHANGE, orientation);
    }.bind(this), 500);
  }

  onResized(e) {
    this.resize();
  }

  resize(width, height, epubcfi) {
    let stageSize = this.stage.size(width, height); // For Safari, wait for orientation to catch up
    // if the window is a square

    this.winBounds = Object(core["windowBounds"])();

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
    this._bounds = this.bounds(); // Clear current views

    this.clear(); // Update for new views

    this.viewSettings.width = this._stageSize.width;
    this.viewSettings.height = this._stageSize.height;
    this.updateLayout();
    this.emit(constants["c" /* EVENTS */].MANAGERS.RESIZED, {
      width: this._stageSize.width,
      height: this._stageSize.height
    }, epubcfi);
  }

  createView(section, forceRight) {
    return new this.View(section, Object(core["extend"])(this.viewSettings, {
      forceRight
    }));
  }

  handleNextPrePaginated(forceRight, section, action) {
    let next;

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

  display(section, target) {
    var displaying = new core["defer"]();
    var displayed = displaying.promise; // Check if moving to target is needed

    if (target === section.href || Object(core["isNumber"])(target)) {
      target = undefined;
    } // Check to make sure the section we want isn't already shown


    var visible = this.views.find(section); // View is already shown, just move to correct location in view

    if (visible && section && this.layout.name !== "pre-paginated") {
      let offset = visible.offset();

      if (this.settings.direction === "ltr") {
        this.scrollTo(offset.left, offset.top, true);
      } else {
        let width = visible.width();
        this.scrollTo(offset.left + width, offset.top, true);
      }

      if (target) {
        let offset = visible.locationOf(target);
        this.moveTo(offset);
      }

      displaying.resolve();
      return displayed;
    } // Hide all current views


    this.clear();
    let forceRight = false;

    if (this.layout.name === "pre-paginated" && this.layout.divisor === 2 && section.properties.includes("page-spread-right")) {
      forceRight = true;
    }

    this.add(section, forceRight).then(function (view) {
      // Move to correct place within the section, if needed
      if (target) {
        let offset = view.locationOf(target);
        this.moveTo(offset);
      }
    }.bind(this), err => {
      displaying.reject(err);
    }).then(function () {
      return this.handleNextPrePaginated(forceRight, section, this.add);
    }.bind(this)).then(function () {
      this.views.show();
      displaying.resolve();
    }.bind(this)); // .then(function(){
    // 	return this.hooks.display.trigger(view);
    // }.bind(this))
    // .then(function(){
    // 	this.views.show();
    // }.bind(this));

    return displayed;
  }

  afterDisplayed(view) {
    this.emit(constants["c" /* EVENTS */].MANAGERS.ADDED, view);
  }

  afterResized(view) {
    this.emit(constants["c" /* EVENTS */].MANAGERS.RESIZE, view.section);
  }

  moveTo(offset) {
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

  add(section, forceRight) {
    var view = this.createView(section, forceRight);
    this.views.append(view); // view.on(EVENTS.VIEWS.SHOWN, this.afterDisplayed.bind(this));

    view.onDisplayed = this.afterDisplayed.bind(this);
    view.onResize = this.afterResized.bind(this);
    view.on(constants["c" /* EVENTS */].VIEWS.AXIS, axis => {
      this.updateAxis(axis);
    });
    view.on(constants["c" /* EVENTS */].VIEWS.WRITING_MODE, mode => {
      this.updateWritingMode(mode);
    });
    return view.display(this.request);
  }

  append(section, forceRight) {
    var view = this.createView(section, forceRight);
    this.views.append(view);
    view.onDisplayed = this.afterDisplayed.bind(this);
    view.onResize = this.afterResized.bind(this);
    view.on(constants["c" /* EVENTS */].VIEWS.AXIS, axis => {
      this.updateAxis(axis);
    });
    view.on(constants["c" /* EVENTS */].VIEWS.WRITING_MODE, mode => {
      this.updateWritingMode(mode);
    });
    return view.display(this.request);
  }

  prepend(section, forceRight) {
    var view = this.createView(section, forceRight);
    view.on(constants["c" /* EVENTS */].VIEWS.RESIZED, bounds => {
      this.counter(bounds);
    });
    this.views.prepend(view);
    view.onDisplayed = this.afterDisplayed.bind(this);
    view.onResize = this.afterResized.bind(this);
    view.on(constants["c" /* EVENTS */].VIEWS.AXIS, axis => {
      this.updateAxis(axis);
    });
    view.on(constants["c" /* EVENTS */].VIEWS.WRITING_MODE, mode => {
      this.updateWritingMode(mode);
    });
    return view.display(this.request);
  }

  counter(bounds) {
    if (this.settings.axis === "vertical") {
      this.scrollBy(0, bounds.heightDelta, true);
    } else {
      this.scrollBy(bounds.widthDelta, 0, true);
    }
  } // resizeView(view) {
  //
  // 	if(this.settings.globalLayoutProperties.layout === "pre-paginated") {
  // 		view.lock("both", this.bounds.width, this.bounds.height);
  // 	} else {
  // 		view.lock("width", this.bounds.width, this.bounds.height);
  // 	}
  //
  // };


  next() {
    var next;
    var left;
    let dir = this.settings.direction;
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
      let top = this.container.scrollTop + this.container.offsetHeight;

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
      let forceRight = false;

      if (this.layout.name === "pre-paginated" && this.layout.divisor === 2 && next.properties.includes("page-spread-right")) {
        forceRight = true;
      }

      return this.append(next, forceRight).then(function () {
        return this.handleNextPrePaginated(forceRight, next, this.append);
      }.bind(this), err => {
        return err;
      }).then(function () {
        // Reset position to start for scrolled-doc vertical-rl in default mode
        if (!this.isPaginated && this.settings.axis === "horizontal" && this.settings.direction === "rtl" && this.settings.rtlScrollType === "default") {
          this.scrollTo(this.container.scrollWidth, 0, true);
        }

        this.views.show();
      }.bind(this));
    }
  }

  prev() {
    var prev;
    var left;
    let dir = this.settings.direction;
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
      let top = this.container.scrollTop;

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
      let forceRight = false;

      if (this.layout.name === "pre-paginated" && this.layout.divisor === 2 && typeof prev.prev() !== "object") {
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
      }.bind(this), err => {
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

  current() {
    var visible = this.visible();

    if (visible.length) {
      // Current is the last visible view
      return visible[visible.length - 1];
    }

    return null;
  }

  clear() {
    // this.q.clear();
    if (this.views) {
      this.views.hide();
      this.scrollTo(0, 0, true);
      this.views.clear();
    }
  }

  currentLocation() {
    if (this.isPaginated && this.settings.axis === "horizontal") {
      this.location = this.paginatedLocation();
    } else {
      this.location = this.scrolledLocation();
    }

    return this.location;
  }

  scrolledLocation() {
    let visible = this.visible();
    let container = this.container.getBoundingClientRect();
    let pageHeight = container.height < window.innerHeight ? container.height : window.innerHeight;
    let pageWidth = container.width < window.innerWidth ? container.width : window.innerWidth;
    let vertical = this.settings.axis === "vertical";
    let rtl = this.settings.direction === "rtl";
    let offset = 0;
    let used = 0;

    if (this.settings.fullsize) {
      offset = vertical ? window.scrollY : window.scrollX;
    }

    let sections = visible.map(view => {
      let {
        index,
        href
      } = view.section;
      let position = view.position();
      let width = view.width();
      let height = view.height();
      let startPos;
      let endPos;
      let stopPos;
      let totalPages;

      if (vertical) {
        startPos = offset + container.top - position.top + used;
        endPos = startPos + pageHeight - used;
        totalPages = this.layout.count(height, pageHeight).pages;
        stopPos = pageHeight;
      } else {
        startPos = offset + container.left - position.left + used;
        endPos = startPos + pageWidth - used;
        totalPages = this.layout.count(width, pageWidth).pages;
        stopPos = pageWidth;
      }

      let currPage = Math.ceil(startPos / stopPos);
      let pages = [];
      let endPage = Math.ceil(endPos / stopPos); // Reverse page counts for horizontal rtl

      if (this.settings.direction === "rtl" && !vertical) {
        let tempStartPage = currPage;
        currPage = totalPages - endPage;
        endPage = totalPages - tempStartPage;
      }

      pages = [];

      for (var i = currPage; i <= endPage; i++) {
        let pg = i + 1;
        pages.push(pg);
      }

      let mapping = this.mapping.page(view.contents, view.section.cfiBase, startPos, endPos);
      return {
        index,
        href,
        pages,
        totalPages,
        mapping
      };
    });
    return sections;
  }

  paginatedLocation() {
    let visible = this.visible();
    let container = this.container.getBoundingClientRect();
    let left = 0;
    let used = 0;

    if (this.settings.fullsize) {
      left = window.scrollX;
    }

    let sections = visible.map(view => {
      let {
        index,
        href
      } = view.section;
      let offset;
      let position = view.position();
      let width = view.width(); // Find mapping

      let start;
      let end;
      let pageWidth;

      if (this.settings.direction === "rtl") {
        offset = container.right - left;
        pageWidth = Math.min(Math.abs(offset - position.left), this.layout.width) - used;
        end = position.width - (position.right - offset) - used;
        start = end - pageWidth;
      } else {
        offset = container.left + left;
        pageWidth = Math.min(position.right - offset, this.layout.width) - used;
        start = offset - position.left + used;
        end = start + pageWidth;
      }

      used += pageWidth;
      let mapping = this.mapping.page(view.contents, view.section.cfiBase, start, end);
      let totalPages = this.layout.count(width).pages;
      let startPage = Math.floor(start / this.layout.pageWidth);
      let pages = [];
      let endPage = Math.floor(end / this.layout.pageWidth); // start page should not be negative

      if (startPage < 0) {
        startPage = 0;
        endPage = endPage + 1;
      } // Reverse page counts for rtl


      if (this.settings.direction === "rtl") {
        let tempStartPage = startPage;
        startPage = totalPages - endPage;
        endPage = totalPages - tempStartPage;
      }

      for (var i = startPage + 1; i <= endPage; i++) {
        let pg = i;
        pages.push(pg);
      }

      return {
        index,
        href,
        pages,
        totalPages,
        mapping
      };
    });
    return sections;
  }

  isVisible(view, offsetPrev, offsetNext, _container) {
    var position = view.position();

    var container = _container || this.bounds();

    if (this.settings.axis === "horizontal" && position.right > container.left - offsetPrev && position.left < container.right + offsetNext) {
      return true;
    } else if (this.settings.axis === "vertical" && position.bottom > container.top - offsetPrev && position.top < container.bottom + offsetNext) {
      return true;
    }

    return false;
  }

  visible() {
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

  scrollBy(x, y, silent) {
    let dir = this.settings.direction === "rtl" ? -1 : 1;

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

  scrollTo(x, y, silent) {
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

  onScroll() {
    let scrollTop;
    let scrollLeft;

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
      this.emit(constants["c" /* EVENTS */].MANAGERS.SCROLL, {
        top: scrollTop,
        left: scrollLeft
      });
      clearTimeout(this.afterScrolled);
      this.afterScrolled = setTimeout(function () {
        this.emit(constants["c" /* EVENTS */].MANAGERS.SCROLLED, {
          top: this.scrollTop,
          left: this.scrollLeft
        });
      }.bind(this), 20);
    } else {
      this.ignore = false;
    }
  }

  bounds() {
    var bounds;
    bounds = this.stage.bounds();
    return bounds;
  }

  applyLayout(layout) {
    this.layout = layout;
    this.updateLayout();

    if (this.views && this.views.length > 0 && this.layout.name === "pre-paginated") {
      this.display(this.views.first().section);
    } // this.manager.layout(this.layout.format);

  }

  updateLayout() {
    if (!this.stage) {
      return;
    }

    this._stageSize = this.stage.size();

    if (!this.isPaginated) {
      this.layout.calculate(this._stageSize.width, this._stageSize.height);
    } else {
      this.layout.calculate(this._stageSize.width, this._stageSize.height, this.settings.gap); // Set the look ahead offset for what is visible

      this.settings.offset = this.layout.delta / this.layout.divisor; // this.stage.addStyleRules("iframe", [{"margin-right" : this.layout.gap + "px"}]);
    } // Set the dimensions for views


    this.viewSettings.width = this.layout.width;
    this.viewSettings.height = this.layout.height;
    this.setLayout(this.layout);
  }

  setLayout(layout) {
    this.viewSettings.layout = layout;
    this.mapping = new mapping["a" /* default */](layout.props, this.settings.direction, this.settings.axis);

    if (this.views) {
      this.views.forEach(function (view) {
        if (view) {
          view.setLayout(layout);
        }
      });
    }
  }

  updateWritingMode(mode) {
    this.writingMode = mode;
  }

  updateAxis(axis, forceUpdate) {
    if (!forceUpdate && axis === this.settings.axis) {
      return;
    }

    this.settings.axis = axis;
    this.stage && this.stage.axis(axis);
    this.viewSettings.axis = axis;

    if (this.mapping) {
      this.mapping = new mapping["a" /* default */](this.layout.props, this.settings.direction, this.settings.axis);
    }

    if (this.layout) {
      if (axis === "vertical") {
        this.layout.spread("none");
      } else {
        this.layout.spread(this.layout.settings.spread);
      }
    }
  }

  updateFlow(flow, defaultScrolledOverflow = "auto") {
    let isPaginated = flow === "paginated" || flow === "auto";
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

  getContents() {
    var contents = [];

    if (!this.views) {
      return contents;
    }

    this.views.forEach(function (view) {
      const viewContents = view && view.contents;

      if (viewContents) {
        contents.push(viewContents);
      }
    });
    return contents;
  }

  direction(dir = "ltr") {
    this.settings.direction = dir;
    this.stage && this.stage.direction(dir);
    this.viewSettings.direction = dir;
    this.updateLayout();
  }

  isRendered() {
    return this.rendered;
  }

} //-- Enable binding events to Manager


event_emitter_default()(default_DefaultViewManager.prototype);
/* harmony default export */ var managers_default = __webpack_exports__["a"] = (default_DefaultViewManager);

/***/ }),
/* 23 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _epubcfi__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
/* harmony import */ var _utils_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(0);


/**
 * Map text locations to CFI ranges
 * @class
 * @param {Layout} layout Layout to apply
 * @param {string} [direction="ltr"] Text direction
 * @param {string} [axis="horizontal"] vertical or horizontal axis
 * @param {boolean} [dev] toggle developer highlighting
 */

class Mapping {
  constructor(layout, direction, axis, dev = false) {
    this.layout = layout;
    this.horizontal = axis === "horizontal" ? true : false;
    this.direction = direction || "ltr";
    this._dev = dev;
  }
  /**
   * Find CFI pairs for entire section at once
   */


  section(view) {
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


  page(contents, cfiBase, start, end) {
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
      let doc = contents.document;
      let startRange = new _epubcfi__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"](result.start).toRange(doc);
      let endRange = new _epubcfi__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"](result.end).toRange(doc);
      let selection = doc.defaultView.getSelection();
      let r = doc.createRange();
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


  walk(root, func) {
    // IE11 has strange issue, if root is text node IE throws exception on
    // calling treeWalker.nextNode(), saying
    // Unexpected call to method or property access instead of returing null value
    if (root && root.nodeType === Node.TEXT_NODE) {
      return;
    } // safeFilter is required so that it can work in IE as filter is a function for IE
    // and for other browser filter is an object.


    var filter = {
      acceptNode: function (node) {
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

  findRanges(view) {
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


  findStart(root, start, end) {
    var stack = [root];
    var $el;
    var found;
    var $prev = root;

    while (stack.length) {
      $el = stack.shift();
      found = this.walk($el, node => {
        var left, right, top, bottom;
        var elPos;
        var elRange;
        elPos = Object(_utils_core__WEBPACK_IMPORTED_MODULE_1__["nodeBounds"])(node);

        if (this.horizontal && this.direction === "ltr") {
          left = this.horizontal ? elPos.left : elPos.top;
          right = this.horizontal ? elPos.right : elPos.bottom;

          if (left >= start && left <= end) {
            return node;
          } else if (right > start) {
            return node;
          } else {
            $prev = node;
            stack.push(node);
          }
        } else if (this.horizontal && this.direction === "rtl") {
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
    } // Return last element


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


  findEnd(root, start, end) {
    var stack = [root];
    var $el;
    var $prev = root;
    var found;

    while (stack.length) {
      $el = stack.shift();
      found = this.walk($el, node => {
        var left, right, top, bottom;
        var elPos;
        var elRange;
        elPos = Object(_utils_core__WEBPACK_IMPORTED_MODULE_1__["nodeBounds"])(node);

        if (this.horizontal && this.direction === "ltr") {
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
        } else if (this.horizontal && this.direction === "rtl") {
          left = Math.round(this.horizontal ? elPos.left : elPos.top);
          right = Math.round(this.horizontal ? elPos.right : elPos.bottom);

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
    } // end of chapter


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


  findTextStartRange(node, start, end) {
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
      } // prev = range;

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


  findTextEndRange(node, start, end) {
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
    } // Ends before limit


    return ranges[ranges.length - 1];
  }
  /**
   * Split up a text node into ranges for each word
   * @private
   * @param {Node} root root node
   * @param {string} [_splitter] what to split on
   * @return {Range[]}
   */


  splitTextNodeIntoRanges(node, _splitter) {
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


  rangePairToCfiPair(cfiBase, rangePair) {
    var startRange = rangePair.start;
    var endRange = rangePair.end;
    startRange.collapse(true);
    endRange.collapse(false);
    let startCfi = new _epubcfi__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"](startRange, cfiBase).toString();
    let endCfi = new _epubcfi__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"](endRange, cfiBase).toString();
    return {
      start: startCfi,
      end: endCfi
    };
  }

  rangeListToCfiList(cfiBase, columns) {
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


  axis(axis) {
    if (axis) {
      this.horizontal = axis === "horizontal" ? true : false;
    }

    return this.horizontal;
  }

}

/* harmony default export */ __webpack_exports__["a"] = (Mapping);

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var fixRegExpWellKnownSymbolLogic = __webpack_require__(87);
var anObject = __webpack_require__(13);
var toObject = __webpack_require__(36);
var toLength = __webpack_require__(46);
var toInteger = __webpack_require__(35);
var requireObjectCoercible = __webpack_require__(33);
var advanceStringIndex = __webpack_require__(100);
var regExpExec = __webpack_require__(101);

var max = Math.max;
var min = Math.min;
var floor = Math.floor;
var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d\d?|<[^>]*>)/g;
var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d\d?)/g;

var maybeToString = function (it) {
  return it === undefined ? it : String(it);
};

// @@replace logic
fixRegExpWellKnownSymbolLogic('replace', 2, function (REPLACE, nativeReplace, maybeCallNative, reason) {
  var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = reason.REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE;
  var REPLACE_KEEPS_$0 = reason.REPLACE_KEEPS_$0;
  var UNSAFE_SUBSTITUTE = REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE ? '$' : '$0';

  return [
    // `String.prototype.replace` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.replace
    function replace(searchValue, replaceValue) {
      var O = requireObjectCoercible(this);
      var replacer = searchValue == undefined ? undefined : searchValue[REPLACE];
      return replacer !== undefined
        ? replacer.call(searchValue, O, replaceValue)
        : nativeReplace.call(String(O), searchValue, replaceValue);
    },
    // `RegExp.prototype[@@replace]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@replace
    function (regexp, replaceValue) {
      if (
        (!REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE && REPLACE_KEEPS_$0) ||
        (typeof replaceValue === 'string' && replaceValue.indexOf(UNSAFE_SUBSTITUTE) === -1)
      ) {
        var res = maybeCallNative(nativeReplace, regexp, this, replaceValue);
        if (res.done) return res.value;
      }

      var rx = anObject(regexp);
      var S = String(this);

      var functionalReplace = typeof replaceValue === 'function';
      if (!functionalReplace) replaceValue = String(replaceValue);

      var global = rx.global;
      if (global) {
        var fullUnicode = rx.unicode;
        rx.lastIndex = 0;
      }
      var results = [];
      while (true) {
        var result = regExpExec(rx, S);
        if (result === null) break;

        results.push(result);
        if (!global) break;

        var matchStr = String(result[0]);
        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
      }

      var accumulatedResult = '';
      var nextSourcePosition = 0;
      for (var i = 0; i < results.length; i++) {
        result = results[i];

        var matched = String(result[0]);
        var position = max(min(toInteger(result.index), S.length), 0);
        var captures = [];
        // NOTE: This is equivalent to
        //   captures = result.slice(1).map(maybeToString)
        // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
        // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
        // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.
        for (var j = 1; j < result.length; j++) captures.push(maybeToString(result[j]));
        var namedCaptures = result.groups;
        if (functionalReplace) {
          var replacerArgs = [matched].concat(captures, position, S);
          if (namedCaptures !== undefined) replacerArgs.push(namedCaptures);
          var replacement = String(replaceValue.apply(undefined, replacerArgs));
        } else {
          replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
        }
        if (position >= nextSourcePosition) {
          accumulatedResult += S.slice(nextSourcePosition, position) + replacement;
          nextSourcePosition = position + matched.length;
        }
      }
      return accumulatedResult + S.slice(nextSourcePosition);
    }
  ];

  // https://tc39.github.io/ecma262/#sec-getsubstitution
  function getSubstitution(matched, str, position, captures, namedCaptures, replacement) {
    var tailPos = position + matched.length;
    var m = captures.length;
    var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
    if (namedCaptures !== undefined) {
      namedCaptures = toObject(namedCaptures);
      symbols = SUBSTITUTION_SYMBOLS;
    }
    return nativeReplace.call(replacement, symbols, function (match, ch) {
      var capture;
      switch (ch.charAt(0)) {
        case '$': return '$';
        case '&': return matched;
        case '`': return str.slice(0, position);
        case "'": return str.slice(tailPos);
        case '<':
          capture = namedCaptures[ch.slice(1, -1)];
          break;
        default: // \d\d?
          var n = +ch;
          if (n === 0) return match;
          if (n > m) {
            var f = floor(n / 10);
            if (f === 0) return match;
            if (f <= m) return captures[f - 1] === undefined ? ch.charAt(1) : captures[f - 1] + ch.charAt(1);
            return match;
          }
          capture = captures[n - 1];
      }
      return capture === undefined ? '' : capture;
    });
  }
});


/***/ }),
/* 25 */
/***/ (function(module, exports) {

module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

var NATIVE_WEAK_MAP = __webpack_require__(89);
var global = __webpack_require__(7);
var isObject = __webpack_require__(17);
var createNonEnumerableProperty = __webpack_require__(15);
var objectHas = __webpack_require__(10);
var sharedKey = __webpack_require__(43);
var hiddenKeys = __webpack_require__(44);

var WeakMap = global.WeakMap;
var set, get, has;

var enforce = function (it) {
  return has(it) ? get(it) : set(it, {});
};

var getterFor = function (TYPE) {
  return function (it) {
    var state;
    if (!isObject(it) || (state = get(it)).type !== TYPE) {
      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
    } return state;
  };
};

if (NATIVE_WEAK_MAP) {
  var store = new WeakMap();
  var wmget = store.get;
  var wmhas = store.has;
  var wmset = store.set;
  set = function (it, metadata) {
    wmset.call(store, it, metadata);
    return metadata;
  };
  get = function (it) {
    return wmget.call(store, it) || {};
  };
  has = function (it) {
    return wmhas.call(store, it);
  };
} else {
  var STATE = sharedKey('state');
  hiddenKeys[STATE] = true;
  set = function (it, metadata) {
    createNonEnumerableProperty(it, STATE, metadata);
    return metadata;
  };
  get = function (it) {
    return objectHas(it, STATE) ? it[STATE] : {};
  };
  has = function (it) {
    return objectHas(it, STATE);
  };
}

module.exports = {
  set: set,
  get: get,
  has: has,
  enforce: enforce,
  getterFor: getterFor
};


/***/ }),
/* 27 */
/***/ (function(module, exports) {

module.exports = {};


/***/ }),
/* 28 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var event_emitter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var event_emitter__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(event_emitter__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(0);
/* harmony import */ var _epubcfi__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2);
/* harmony import */ var _mapping__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(23);
/* harmony import */ var _utils_replacements__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(11);
/* harmony import */ var _utils_constants__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(1);






const hasNavigator = typeof navigator !== "undefined";
const isChrome = hasNavigator && /Chrome/.test(navigator.userAgent);
const isWebkit = hasNavigator && !isChrome && /AppleWebKit/.test(navigator.userAgent);
const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
/**
	* Handles DOM manipulation, queries and events for View contents
	* @class
	* @param {document} doc Document
	* @param {element} content Parent Element (typically Body)
	* @param {string} cfiBase Section component of CFIs
	* @param {number} sectionIndex Index in Spine of Conntent's Section
	*/

class Contents {
  constructor(doc, content, cfiBase, sectionIndex) {
    // Blank Cfi for Parsing
    this.epubcfi = new _epubcfi__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"]();
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
    this.epubReadingSystem("epub.js", _utils_constants__WEBPACK_IMPORTED_MODULE_5__[/* EPUBJS_VERSION */ "b"]);
    this.called = 0;
    this.active = true;
    this.listeners();
  }
  /**
  	* Get DOM events that are listened for and passed along
  	*/


  static get listenedEvents() {
    return _utils_constants__WEBPACK_IMPORTED_MODULE_5__[/* DOM_EVENTS */ "a"];
  }
  /**
  	* Get or Set width
  	* @param {number} [w]
  	* @returns {number} width
  	*/


  width(w) {
    // var frame = this.documentElement;
    var frame = this.content;

    if (w && Object(_utils_core__WEBPACK_IMPORTED_MODULE_1__["isNumber"])(w)) {
      w = w + "px";
    }

    if (w) {
      frame.style.width = w; // this.content.style.width = w;
    }

    return parseInt(this.window.getComputedStyle(frame)["width"]);
  }
  /**
  	* Get or Set height
  	* @param {number} [h]
  	* @returns {number} height
  	*/


  height(h) {
    // var frame = this.documentElement;
    var frame = this.content;

    if (h && Object(_utils_core__WEBPACK_IMPORTED_MODULE_1__["isNumber"])(h)) {
      h = h + "px";
    }

    if (h) {
      frame.style.height = h; // this.content.style.height = h;
    }

    return parseInt(this.window.getComputedStyle(frame)["height"]);
  }
  /**
  	* Get or Set width of the contents
  	* @param {number} [w]
  	* @returns {number} width
  	*/


  contentWidth(w) {
    var content = this.content || this.document.body;

    if (w && Object(_utils_core__WEBPACK_IMPORTED_MODULE_1__["isNumber"])(w)) {
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


  contentHeight(h) {
    var content = this.content || this.document.body;

    if (h && Object(_utils_core__WEBPACK_IMPORTED_MODULE_1__["isNumber"])(h)) {
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


  textWidth() {
    let rect;
    let width;
    let range = this.document.createRange();
    let content = this.content || this.document.body;
    let border = Object(_utils_core__WEBPACK_IMPORTED_MODULE_1__["borders"])(content); // Select the contents of frame

    range.selectNodeContents(content); // get the width of the text content

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


  textHeight() {
    let rect;
    let height;
    let range = this.document.createRange();
    let content = this.content || this.document.body;
    range.selectNodeContents(content);
    rect = range.getBoundingClientRect();
    height = rect.bottom;
    return Math.round(height);
  }
  /**
  	* Get documentElement scrollWidth
  	* @returns {number} width
  	*/


  scrollWidth() {
    var width = this.documentElement.scrollWidth;
    return width;
  }
  /**
  	* Get documentElement scrollHeight
  	* @returns {number} height
  	*/


  scrollHeight() {
    var height = this.documentElement.scrollHeight;
    return height;
  }
  /**
  	* Set overflow css style of the contents
  	* @param {string} [overflow]
  	*/


  overflow(overflow) {
    if (overflow) {
      this.documentElement.style.overflow = overflow;
    }

    return this.window.getComputedStyle(this.documentElement)["overflow"];
  }
  /**
  	* Set overflowX css style of the documentElement
  	* @param {string} [overflow]
  	*/


  overflowX(overflow) {
    if (overflow) {
      this.documentElement.style.overflowX = overflow;
    }

    return this.window.getComputedStyle(this.documentElement)["overflowX"];
  }
  /**
  	* Set overflowY css style of the documentElement
  	* @param {string} [overflow]
  	*/


  overflowY(overflow) {
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


  css(property, value, priority) {
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


  viewport(options) {
    var _width, _height, _scale, _minimum, _maximum, _scalable; // var width, height, scale, minimum, maximum, scalable;


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
      let content = $viewport.getAttribute("content");

      let _width = content.match(/width\s*=\s*([^,]*)/);

      let _height = content.match(/height\s*=\s*([^,]*)/);

      let _scale = content.match(/initial-scale\s*=\s*([^,]*)/);

      let _minimum = content.match(/minimum-scale\s*=\s*([^,]*)/);

      let _maximum = content.match(/maximum-scale\s*=\s*([^,]*)/);

      let _scalable = content.match(/user-scalable\s*=\s*([^,]*)/);

      if (_width && _width.length && typeof _width[1] !== "undefined") {
        parsed.width = _width[1];
      }

      if (_height && _height.length && typeof _height[1] !== "undefined") {
        parsed.height = _height[1];
      }

      if (_scale && _scale.length && typeof _scale[1] !== "undefined") {
        parsed.scale = _scale[1];
      }

      if (_minimum && _minimum.length && typeof _minimum[1] !== "undefined") {
        parsed.minimum = _minimum[1];
      }

      if (_maximum && _maximum.length && typeof _maximum[1] !== "undefined") {
        parsed.maximum = _maximum[1];
      }

      if (_scalable && _scalable.length && typeof _scalable[1] !== "undefined") {
        parsed.scalable = _scalable[1];
      }
    }

    settings = Object(_utils_core__WEBPACK_IMPORTED_MODULE_1__["defaults"])(options || {}, parsed);

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


  expand() {
    this.emit(_utils_constants__WEBPACK_IMPORTED_MODULE_5__[/* EVENTS */ "c"].CONTENTS.EXPAND);
  }
  /**
   * Add DOM listeners
   * @private
   */


  listeners() {
    this.imageLoadListeners();
    this.mediaQueryListeners(); // this.fontLoadListeners();

    this.addEventListeners();
    this.addSelectionListeners(); // this.transitionListeners();

    if (typeof ResizeObserver === "undefined") {
      this.resizeListeners();
      this.visibilityListeners();
    } else {
      this.resizeObservers();
    } // this.mutationObservers();


    this.linksHandler();
  }
  /**
   * Remove DOM listeners
   * @private
   */


  removeListeners() {
    this.removeEventListeners();
    this.removeSelectionListeners();

    if (this.observer) {
      this.observer.disconnect();
    }

    clearTimeout(this.expanding);
  }
  /**
   * Check if size of contents has changed and
   * emit 'resize' event if it has.
   * @private
   */


  resizeCheck() {
    let width = this.textWidth();
    let height = this.textHeight();

    if (width != this._size.width || height != this._size.height) {
      this._size = {
        width: width,
        height: height
      };
      this.onResize && this.onResize(this._size);
      this.emit(_utils_constants__WEBPACK_IMPORTED_MODULE_5__[/* EVENTS */ "c"].CONTENTS.RESIZE, this._size);
    }
  }
  /**
   * Poll for resize detection
   * @private
   */


  resizeListeners() {
    var width, height; // Test size again

    clearTimeout(this.expanding);
    requestAnimationFrame(this.resizeCheck.bind(this));
    this.expanding = setTimeout(this.resizeListeners.bind(this), 350);
  }
  /**
   * Listen for visibility of tab to change
   * @private
   */


  visibilityListeners() {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && this.active === false) {
        this.active = true;
        this.resizeListeners();
      } else {
        this.active = false;
        clearTimeout(this.expanding);
      }
    });
  }
  /**
   * Use css transitions to detect resize
   * @private
   */


  transitionListeners() {
    let body = this.content;
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


  mediaQueryListeners() {
    var sheets = this.document.styleSheets;

    var mediaChangeHandler = function (m) {
      if (m.matches && !this._expanding) {
        setTimeout(this.expand.bind(this), 1);
      }
    }.bind(this);

    for (var i = 0; i < sheets.length; i += 1) {
      var rules; // Firefox errors if we access cssRules cross-domain

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
          mql.addListener(mediaChangeHandler); //mql.onchange = mediaChangeHandler;
        }
      }
    }
  }
  /**
   * Use ResizeObserver to listen for changes in the DOM and check for resize
   * @private
   */


  resizeObservers() {
    // create an observer instance
    this.observer = new ResizeObserver(e => {
      requestAnimationFrame(this.resizeCheck.bind(this));
    }); // pass in the target node

    this.observer.observe(this.document.documentElement);
  }
  /**
   * Use MutationObserver to listen for changes in the DOM and check for resize
   * @private
   */


  mutationObservers() {
    // create an observer instance
    this.observer = new MutationObserver(mutations => {
      this.resizeCheck();
    }); // configuration of the observer:

    let config = {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true
    }; // pass in the target node, as well as the observer options

    this.observer.observe(this.document, config);
  }
  /**
   * Test if images are loaded or add listener for when they load
   * @private
   */


  imageLoadListeners() {
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


  fontLoadListeners() {
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


  root() {
    if (!this.document) return null;
    return this.document.documentElement;
  }
  /**
   * Get the location offset of a EpubCFI or an #id
   * @param {string | EpubCFI} target
   * @param {string} [ignoreClass] for the cfi
   * @returns { {left: Number, top: Number }
   */


  locationOf(target, ignoreClass) {
    var position;
    var targetPos = {
      "left": 0,
      "top": 0
    };
    if (!this.document) return targetPos;

    if (this.epubcfi.isCfiString(target)) {
      let range = new _epubcfi__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"](target).toRange(this.document, ignoreClass);

      if (range) {
        try {
          if (!range.endContainer || range.startContainer == range.endContainer && range.startOffset == range.endOffset) {
            // If the end for the range is not set, it results in collapsed becoming
            // true. This in turn leads to inconsistent behaviour when calling
            // getBoundingRect. Wrong bounds lead to the wrong page being displayed.
            // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/15684911/
            let pos = range.startContainer.textContent.indexOf(" ", range.startOffset);

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
            let container = range.startContainer;
            let newRange = new Range();

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
      let id = target.substring(target.indexOf("#") + 1);
      let el = this.document.getElementById(id);

      if (el) {
        if (isWebkit) {
          // Webkit reports incorrect bounding rects in Columns
          let newRange = new Range();
          newRange.selectNode(el);
          position = newRange.getBoundingClientRect();
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


  addStylesheet(src) {
    return new Promise(function (resolve, reject) {
      var $stylesheet;
      var ready = false;

      if (!this.document) {
        resolve(false);
        return;
      } // Check if link already exists


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
          ready = true; // Let apply

          setTimeout(() => {
            resolve(true);
          }, 1);
        }
      };

      this.document.head.appendChild($stylesheet);
    }.bind(this));
  }

  _getStylesheetNode(key) {
    var styleEl;
    key = "epubjs-inserted-css-" + (key || '');
    if (!this.document) return false; // Check if link already exists

    styleEl = this.document.getElementById(key);

    if (!styleEl) {
      styleEl = this.document.createElement("style");
      styleEl.id = key; // Append style element to head

      this.document.head.appendChild(styleEl);
    }

    return styleEl;
  }
  /**
   * Append stylesheet css
   * @param {string} serializedCss
   * @param {string} key If the key is the same, the CSS will be replaced instead of inserted
   */


  addStylesheetCss(serializedCss, key) {
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


  addStylesheetRules(rules, key) {
    var styleSheet;
    if (!this.document || !rules || rules.length === 0) return; // Grab style sheet

    styleSheet = this._getStylesheetNode(key).sheet;

    if (Object.prototype.toString.call(rules) === "[object Array]") {
      for (var i = 0, rl = rules.length; i < rl; i++) {
        var j = 1,
            rule = rules[i],
            selector = rules[i][0],
            propStr = ""; // If the second argument of a rule is an array of arrays, correct our variables.

        if (Object.prototype.toString.call(rule[1][0]) === "[object Array]") {
          rule = rule[1];
          j = 0;
        }

        for (var pl = rule.length; j < pl; j++) {
          var prop = rule[j];
          propStr += prop[0] + ":" + prop[1] + (prop[2] ? " !important" : "") + ";\n";
        } // Insert CSS Rule


        styleSheet.insertRule(selector + "{" + propStr + "}", styleSheet.cssRules.length);
      }
    } else {
      const selectors = Object.keys(rules);
      selectors.forEach(selector => {
        const definition = rules[selector];

        if (Array.isArray(definition)) {
          definition.forEach(item => {
            const _rules = Object.keys(item);

            const result = _rules.map(rule => {
              return `${rule}:${item[rule]}`;
            }).join(';');

            styleSheet.insertRule(`${selector}{${result}}`, styleSheet.cssRules.length);
          });
        } else {
          const _rules = Object.keys(definition);

          const result = _rules.map(rule => {
            return `${rule}:${definition[rule]}`;
          }).join(';');

          styleSheet.insertRule(`${selector}{${result}}`, styleSheet.cssRules.length);
        }
      });
    }
  }
  /**
   * Append a script tag to the document head
   * @param {string} src url
   * @returns {Promise} loaded
   */


  addScript(src) {
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


  addClass(className) {
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


  removeClass(className) {
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


  addEventListeners() {
    if (!this.document) {
      return;
    }

    this._triggerEvent = this.triggerEvent.bind(this);
    _utils_constants__WEBPACK_IMPORTED_MODULE_5__[/* DOM_EVENTS */ "a"].forEach(function (eventName) {
      this.document.addEventListener(eventName, this._triggerEvent, {
        passive: true
      });
    }, this);
  }
  /**
   * Remove DOM event listeners
   * @private
   */


  removeEventListeners() {
    if (!this.document) {
      return;
    }

    _utils_constants__WEBPACK_IMPORTED_MODULE_5__[/* DOM_EVENTS */ "a"].forEach(function (eventName) {
      this.document.removeEventListener(eventName, this._triggerEvent, {
        passive: true
      });
    }, this);
    this._triggerEvent = undefined;
  }
  /**
   * Emit passed browser events
   * @private
   */


  triggerEvent(e) {
    this.emit(e.type, e);
  }
  /**
   * Add listener for text selection
   * @private
   */


  addSelectionListeners() {
    if (!this.document) {
      return;
    }

    this._onSelectionChange = this.onSelectionChange.bind(this);
    this.document.addEventListener("selectionchange", this._onSelectionChange, {
      passive: true
    });
  }
  /**
   * Remove listener for text selection
   * @private
   */


  removeSelectionListeners() {
    if (!this.document) {
      return;
    }

    this.document.removeEventListener("selectionchange", this._onSelectionChange, {
      passive: true
    });
    this._onSelectionChange = undefined;
  }
  /**
   * Handle getting text on selection
   * @private
   */


  onSelectionChange(e) {
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


  triggerSelectedEvent(selection) {
    var range, cfirange;

    if (selection && selection.rangeCount > 0) {
      range = selection.getRangeAt(0);

      if (!range.collapsed) {
        // cfirange = this.section.cfiFromRange(range);
        cfirange = new _epubcfi__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"](range, this.cfiBase).toString();
        this.emit(_utils_constants__WEBPACK_IMPORTED_MODULE_5__[/* EVENTS */ "c"].CONTENTS.SELECTED, cfirange);
        this.emit(_utils_constants__WEBPACK_IMPORTED_MODULE_5__[/* EVENTS */ "c"].CONTENTS.SELECTED_RANGE, range);
      }
    }
  }
  /**
   * Get a Dom Range from EpubCFI
   * @param {EpubCFI} _cfi
   * @param {string} [ignoreClass]
   * @returns {Range} range
   */


  range(_cfi, ignoreClass) {
    var cfi = new _epubcfi__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"](_cfi);
    return cfi.toRange(this.document, ignoreClass);
  }
  /**
   * Get an EpubCFI from a Dom Range
   * @param {Range} range
   * @param {string} [ignoreClass]
   * @returns {EpubCFI} cfi
   */


  cfiFromRange(range, ignoreClass) {
    return new _epubcfi__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"](range, this.cfiBase, ignoreClass).toString();
  }
  /**
   * Get an EpubCFI from a Dom node
   * @param {node} node
   * @param {string} [ignoreClass]
   * @returns {EpubCFI} cfi
   */


  cfiFromNode(node, ignoreClass) {
    return new _epubcfi__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"](node, this.cfiBase, ignoreClass).toString();
  } // TODO: find where this is used - remove?


  map(layout) {
    var map = new _mapping__WEBPACK_IMPORTED_MODULE_3__[/* default */ "a"](layout);
    return map.section();
  }
  /**
   * Size the contents to a given width and height
   * @param {number} [width]
   * @param {number} [height]
   */


  size(width, height) {
    var viewport = {
      scale: 1.0,
      scalable: "no"
    };
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


  columns(width, height, columnWidth, gap, dir) {
    let COLUMN_AXIS = Object(_utils_core__WEBPACK_IMPORTED_MODULE_1__["prefixed"])("column-axis");
    let COLUMN_GAP = Object(_utils_core__WEBPACK_IMPORTED_MODULE_1__["prefixed"])("column-gap");
    let COLUMN_WIDTH = Object(_utils_core__WEBPACK_IMPORTED_MODULE_1__["prefixed"])("column-width");
    let COLUMN_FILL = Object(_utils_core__WEBPACK_IMPORTED_MODULE_1__["prefixed"])("column-fill");
    let writingMode = this.writingMode();
    let axis = writingMode.indexOf("vertical") === 0 ? "vertical" : "horizontal";
    this.layoutStyle("paginated");

    if (dir === "rtl" && axis === "horizontal") {
      this.direction(dir);
    }

    this.width(width);
    this.height(height); // Deal with Mobile trying to scale to viewport

    this.viewport({
      width: width,
      height: height,
      scale: 1.0,
      scalable: "no"
    }); // TODO: inline-block needs more testing
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
    this.css(COLUMN_WIDTH, columnWidth + "px"); // Fix glyph clipping in WebKit
    // https://github.com/futurepress/epub.js/issues/983

    this.css("-webkit-line-box-contain", "block glyphs replaced");
  }
  /**
   * Scale contents from center
   * @param {number} scale
   * @param {number} offsetX
   * @param {number} offsetY
   */


  scaler(scale, offsetX, offsetY) {
    var scaleStr = "scale(" + scale + ")";
    var translateStr = ""; // this.css("position", "absolute"));

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


  fit(width, height, section) {
    var viewport = this.viewport();
    var viewportWidth = parseInt(viewport.width);
    var viewportHeight = parseInt(viewport.height);
    var widthScale = width / viewportWidth;
    var heightScale = height / viewportHeight;
    var scale = widthScale < heightScale ? widthScale : heightScale; // the translate does not work as intended, elements can end up unaligned
    // var offsetY = (height - (viewportHeight * scale)) / 2;
    // var offsetX = 0;
    // if (this.sectionIndex % 2 === 1) {
    // 	offsetX = width - (viewportWidth * scale);
    // }

    this.layoutStyle("paginated"); // scale needs width and height to be set

    this.width(viewportWidth);
    this.height(viewportHeight);
    this.overflow("hidden"); // Scale to the correct size

    this.scaler(scale, 0, 0); // this.scaler(scale, offsetX > 0 ? offsetX : 0, offsetY);
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


  direction(dir) {
    if (this.documentElement) {
      this.documentElement.style["direction"] = dir;
    }
  }

  mapPage(cfiBase, layout, start, end, dev) {
    var mapping = new _mapping__WEBPACK_IMPORTED_MODULE_3__[/* default */ "a"](layout, dev);
    return mapping.page(this, cfiBase, start, end);
  }
  /**
   * Emit event when link in content is clicked
   * @private
   */


  linksHandler() {
    Object(_utils_replacements__WEBPACK_IMPORTED_MODULE_4__[/* replaceLinks */ "c"])(this.content, href => {
      this.emit(_utils_constants__WEBPACK_IMPORTED_MODULE_5__[/* EVENTS */ "c"].CONTENTS.LINK_CLICKED, href);
    });
  }
  /**
   * Set the writingMode of the text
   * @param {string} [mode="horizontal-tb"] "horizontal-tb" | "vertical-rl" | "vertical-lr"
   */


  writingMode(mode) {
    let WRITING_MODE = Object(_utils_core__WEBPACK_IMPORTED_MODULE_1__["prefixed"])("writing-mode");

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


  layoutStyle(style) {
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


  epubReadingSystem(name, version) {
    navigator.epubReadingSystem = {
      name: name,
      version: version,
      layoutStyle: this.layoutStyle(),
      hasFeature: function (feature) {
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

  destroy() {
    // this.document.removeEventListener('transitionend', this._resizeCheck);
    this.removeListeners();
  }

}

event_emitter__WEBPACK_IMPORTED_MODULE_0___default()(Contents.prototype);
/* harmony default export */ __webpack_exports__["a"] = (Contents);

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Underline = exports.Highlight = exports.Mark = exports.Pane = undefined;

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _svg = __webpack_require__(135);

var _svg2 = _interopRequireDefault(_svg);

var _events = __webpack_require__(136);

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
/* 30 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(7);
var getOwnPropertyDescriptor = __webpack_require__(59).f;
var createNonEnumerableProperty = __webpack_require__(15);
var redefine = __webpack_require__(19);
var setGlobal = __webpack_require__(42);
var copyConstructorProperties = __webpack_require__(90);
var isForced = __webpack_require__(96);

/*
  options.target      - name of the target object
  options.global      - target is the global object
  options.stat        - export as static methods of target
  options.proto       - export as prototype methods of target
  options.real        - real prototype method for the `pure` version
  options.forced      - export even if the native feature is available
  options.bind        - bind methods to the target, required for the `pure` version
  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
  options.sham        - add a flag to not completely full polyfills
  options.enumerable  - export as enumerable property
  options.noTargetGet - prevent calling a getter on target
*/
module.exports = function (options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
  if (GLOBAL) {
    target = global;
  } else if (STATIC) {
    target = global[TARGET] || setGlobal(TARGET, {});
  } else {
    target = (global[TARGET] || {}).prototype;
  }
  if (target) for (key in source) {
    sourceProperty = source[key];
    if (options.noTargetGet) {
      descriptor = getOwnPropertyDescriptor(target, key);
      targetProperty = descriptor && descriptor.value;
    } else targetProperty = target[key];
    FORCED = isForced(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
    // contained in target
    if (!FORCED && targetProperty !== undefined) {
      if (typeof sourceProperty === typeof targetProperty) continue;
      copyConstructorProperties(sourceProperty, targetProperty);
    }
    // add a flag to not completely full polyfills
    if (options.sham || (targetProperty && targetProperty.sham)) {
      createNonEnumerableProperty(sourceProperty, 'sham', true);
    }
    // extend global
    redefine(target, key, sourceProperty, options);
  }
};


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

// toObject with fallback for non-array-like ES3 strings
var IndexedObject = __webpack_require__(61);
var requireObjectCoercible = __webpack_require__(33);

module.exports = function (it) {
  return IndexedObject(requireObjectCoercible(it));
};


/***/ }),
/* 33 */
/***/ (function(module, exports) {

// `RequireObjectCoercible` abstract operation
// https://tc39.github.io/ecma262/#sec-requireobjectcoercible
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on " + it);
  return it;
};


/***/ }),
/* 34 */
/***/ (function(module, exports) {

module.exports = false;


/***/ }),
/* 35 */
/***/ (function(module, exports) {

var ceil = Math.ceil;
var floor = Math.floor;

// `ToInteger` abstract operation
// https://tc39.github.io/ecma262/#sec-tointeger
module.exports = function (argument) {
  return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
};


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

var requireObjectCoercible = __webpack_require__(33);

// `ToObject` abstract operation
// https://tc39.github.io/ecma262/#sec-toobject
module.exports = function (argument) {
  return Object(requireObjectCoercible(argument));
};


/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

var defineProperty = __webpack_require__(18).f;
var has = __webpack_require__(10);
var wellKnownSymbol = __webpack_require__(8);

var TO_STRING_TAG = wellKnownSymbol('toStringTag');

module.exports = function (it, TAG, STATIC) {
  if (it && !has(it = STATIC ? it : it.prototype, TO_STRING_TAG)) {
    defineProperty(it, TO_STRING_TAG, { configurable: true, value: TAG });
  }
};


/***/ }),
/* 38 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__38__;

/***/ }),
/* 39 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

// EXTERNAL MODULE: ./node_modules/event-emitter/index.js
var event_emitter = __webpack_require__(3);
var event_emitter_default = /*#__PURE__*/__webpack_require__.n(event_emitter);

// EXTERNAL MODULE: ./src/utils/core.js
var core = __webpack_require__(0);

// EXTERNAL MODULE: ./src/utils/hook.js
var hook = __webpack_require__(6);

// EXTERNAL MODULE: ./src/epubcfi.js
var src_epubcfi = __webpack_require__(2);

// EXTERNAL MODULE: ./src/utils/queue.js
var queue = __webpack_require__(21);

// EXTERNAL MODULE: ./src/utils/constants.js
var constants = __webpack_require__(1);

// CONCATENATED MODULE: ./src/layout.js



/**
 * Figures out the CSS values to apply for a layout
 * @class
 * @param {object} settings
 * @param {string} [settings.layout='reflowable']
 * @param {string} [settings.spread]
 * @param {number} [settings.minSpreadWidth=800]
 * @param {boolean} [settings.evenSpreads=false]
 */

class layout_Layout {
  constructor(settings) {
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


  flow(flow) {
    if (typeof flow != "undefined") {
      if (flow === "scrolled" || flow === "scrolled-continuous" || flow === "scrolled-doc") {
        this._flow = "scrolled";
      } else {
        this._flow = "paginated";
      } // this.props.flow = this._flow;


      this.update({
        flow: this._flow
      });
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


  spread(spread, min) {
    if (spread) {
      this._spread = spread === "none" ? false : true; // this.props.spread = this._spread;

      this.update({
        spread: this._spread
      });
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


  calculate(_width, _height, _gap) {
    var divisor = 1;
    var gap = _gap || 0; //-- Check the width and create even width columns
    // var fullWidth = Math.floor(_width);

    var width = _width;
    var height = _height;
    var section = Math.floor(width / 12);
    var columnWidth;
    var spreadWidth;
    var pageWidth;
    var delta;

    if (this._spread && width >= this._minSpreadWidth) {
      divisor = 2;
    } else {
      divisor = 1;
    }

    if (this.name === "reflowable" && this._flow === "paginated" && !(_gap >= 0)) {
      gap = section % 2 === 0 ? section : section - 1;
    }

    if (this.name === "pre-paginated") {
      gap = 0;
    } //-- Double Page


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
    this.divisor = divisor; // this.props.width = width;
    // this.props.height = _height;
    // this.props.spreadWidth = spreadWidth;
    // this.props.pageWidth = pageWidth;
    // this.props.delta = delta;
    //
    // this.props.columnWidth = colWidth;
    // this.props.gap = gap;
    // this.props.divisor = divisor;

    this.update({
      width,
      height,
      spreadWidth,
      pageWidth,
      delta,
      columnWidth,
      gap,
      divisor
    });
  }
  /**
   * Apply Css to a Document
   * @param  {Contents} contents
   * @return {Promise}
   */


  format(contents, section, axis) {
    var formating;

    if (this.name === "pre-paginated") {
      formating = contents.fit(this.columnWidth, this.height, section);
    } else if (this._flow === "paginated") {
      formating = contents.columns(this.width, this.height, this.columnWidth, this.gap, this.settings.direction);
    } else if (axis && axis === "horizontal") {
      formating = contents.size(null, this.height);
    } else {
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


  count(totalLength, pageLength) {
    let spreads, pages;

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
      spreads,
      pages
    };
  }
  /**
   * Update props that have changed
   * @private
   * @param  {object} props
   */


  update(props) {
    // Remove props that haven't changed
    Object.keys(props).forEach(propName => {
      if (this.props[propName] === props[propName]) {
        delete props[propName];
      }
    });

    if (Object.keys(props).length > 0) {
      let newProps = Object(core["extend"])(this.props, props);
      this.emit(constants["c" /* EVENTS */].LAYOUT.UPDATED, newProps, props);
    }
  }

}

event_emitter_default()(layout_Layout.prototype);
/* harmony default export */ var layout = (layout_Layout);
// EXTERNAL MODULE: ./src/utils/url.js
var utils_url = __webpack_require__(5);

// CONCATENATED MODULE: ./src/themes.js

/**
 * Themes to apply to displayed content
 * @class
 * @param {Rendition} rendition
 */

class themes_Themes {
  constructor(rendition) {
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


  register() {
    if (arguments.length === 0) {
      return;
    }

    if (arguments.length === 1 && typeof arguments[0] === "object") {
      return this.registerThemes(arguments[0]);
    }

    if (arguments.length === 1 && typeof arguments[0] === "string") {
      return this.default(arguments[0]);
    }

    if (arguments.length === 2 && typeof arguments[1] === "string") {
      return this.registerUrl(arguments[0], arguments[1]);
    }

    if (arguments.length === 2 && typeof arguments[1] === "object") {
      return this.registerRules(arguments[0], arguments[1]);
    }
  }
  /**
   * Add a default theme to be used by a rendition
   * @param {object | string} theme
   * @example themes.register("http://example.com/default.css")
   * @example themes.register({ "body": { "color": "purple"}})
   */


  default(theme) {
    if (!theme) {
      return;
    }

    if (typeof theme === "string") {
      return this.registerUrl("default", theme);
    }

    if (typeof theme === "object") {
      return this.registerRules("default", theme);
    }
  }
  /**
   * Register themes object
   * @param {object} themes
   */


  registerThemes(themes) {
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


  registerCss(name, css) {
    this._themes[name] = {
      "serialized": css
    };

    if (this._injected[name] || name == 'default') {
      this.update(name);
    }
  }
  /**
   * Register a url
   * @param {string} name
   * @param {string} input
   */


  registerUrl(name, input) {
    var url = new utils_url["a" /* default */](input);
    this._themes[name] = {
      "url": url.toString()
    };

    if (this._injected[name] || name == 'default') {
      this.update(name);
    }
  }
  /**
   * Register rule
   * @param {string} name
   * @param {object} rules
   */


  registerRules(name, rules) {
    this._themes[name] = {
      "rules": rules
    }; // TODO: serialize css rules

    if (this._injected[name] || name == 'default') {
      this.update(name);
    }
  }
  /**
   * Select a theme
   * @param {string} name
   */


  select(name) {
    var prev = this._current;
    var contents;
    this._current = name;
    this.update(name);
    contents = this.rendition.getContents();
    contents.forEach(content => {
      content.removeClass(prev);
      content.addClass(name);
    });
  }
  /**
   * Update a theme
   * @param {string} name
   */


  update(name) {
    var contents = this.rendition.getContents();
    contents.forEach(content => {
      this.add(name, content);
    });
  }
  /**
   * Inject all themes into contents
   * @param {Contents} contents
   */


  inject(contents) {
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


  add(name, contents) {
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


  override(name, value, priority) {
    var contents = this.rendition.getContents();
    this._overrides[name] = {
      value: value,
      priority: priority === true
    };
    contents.forEach(content => {
      content.css(name, this._overrides[name].value, this._overrides[name].priority);
    });
  }

  removeOverride(name) {
    var contents = this.rendition.getContents();
    delete this._overrides[name];
    contents.forEach(content => {
      content.css(name);
    });
  }
  /**
   * Add all overrides
   * @param {Content} content
   */


  overrides(contents) {
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


  fontSize(size) {
    this.override("font-size", size);
  }
  /**
   * Adjust the font-family of a rendition
   * @param {string} f
   */


  font(f) {
    this.override("font-family", f, true);
  }

  destroy() {
    this.rendition = undefined;
    this._themes = undefined;
    this._overrides = undefined;
    this._current = undefined;
    this._injected = undefined;
  }

}

/* harmony default export */ var themes = (themes_Themes);
// EXTERNAL MODULE: ./src/contents.js
var src_contents = __webpack_require__(28);

// CONCATENATED MODULE: ./src/annotations.js



/**
	* Handles managing adding & removing Annotations
	* @param {Rendition} rendition
	* @class
	*/

class annotations_Annotations {
  constructor(rendition) {
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


  add(type, cfiRange, data, cb, className, styles) {
    let hash = encodeURI(cfiRange + type);
    let cfi = new src_epubcfi["a" /* default */](cfiRange);
    let sectionIndex = cfi.spinePos;
    let annotation = new annotations_Annotation({
      type,
      cfiRange,
      data,
      sectionIndex,
      cb,
      className,
      styles
    });
    this._annotations[hash] = annotation;

    if (sectionIndex in this._annotationsBySectionIndex) {
      this._annotationsBySectionIndex[sectionIndex].push(hash);
    } else {
      this._annotationsBySectionIndex[sectionIndex] = [hash];
    }

    let views = this.rendition.views();
    views.forEach(view => {
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


  remove(cfiRange, type) {
    let hash = encodeURI(cfiRange + type);

    if (hash in this._annotations) {
      let annotation = this._annotations[hash];

      if (type && annotation.type !== type) {
        return;
      }

      let views = this.rendition.views();
      views.forEach(view => {
        this._removeFromAnnotationBySectionIndex(annotation.sectionIndex, hash);

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


  _removeFromAnnotationBySectionIndex(sectionIndex, hash) {
    this._annotationsBySectionIndex[sectionIndex] = this._annotationsAt(sectionIndex).filter(h => h !== hash);
  }
  /**
   * Get annotations by Section Index
   * @private
   */


  _annotationsAt(index) {
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


  highlight(cfiRange, data, cb, className, styles) {
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


  underline(cfiRange, data, cb, className, styles) {
    return this.add("underline", cfiRange, data, cb, className, styles);
  }
  /**
   * Add a mark to the store
   * @param {EpubCFI} cfiRange EpubCFI range to attach annotation to
   * @param {object} data Data to assign to annotation
   * @param {function} cb Callback after annotation is clicked
   */


  mark(cfiRange, data, cb) {
    return this.add("mark", cfiRange, data, cb);
  }
  /**
   * iterate over annotations in the store
   */


  each() {
    return this._annotations.forEach.apply(this._annotations, arguments);
  }
  /**
   * Hook for injecting annotation into a view
   * @param {View} view
   * @private
   */


  inject(view) {
    let sectionIndex = view.index;

    if (sectionIndex in this._annotationsBySectionIndex) {
      let annotations = this._annotationsBySectionIndex[sectionIndex];
      annotations.forEach(hash => {
        let annotation = this._annotations[hash];
        annotation.attach(view);
      });
    }
  }
  /**
   * Hook for removing annotation from a view
   * @param {View} view
   * @private
   */


  clear(view) {
    let sectionIndex = view.index;

    if (sectionIndex in this._annotationsBySectionIndex) {
      let annotations = this._annotationsBySectionIndex[sectionIndex];
      annotations.forEach(hash => {
        let annotation = this._annotations[hash];
        annotation.detach(view);
      });
    }
  }
  /**
   * [Not Implemented] Show annotations
   * @TODO: needs implementation in View
   */


  show() {}
  /**
   * [Not Implemented] Hide annotations
   * @TODO: needs implementation in View
   */


  hide() {}

}
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


class annotations_Annotation {
  constructor({
    type,
    cfiRange,
    data,
    sectionIndex,
    cb,
    className,
    styles
  }) {
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


  update(data) {
    this.data = data;
  }
  /**
   * Add to a view
   * @param {View} view
   */


  attach(view) {
    let {
      cfiRange,
      data,
      type,
      mark,
      cb,
      className,
      styles
    } = this;
    let result;

    if (type === "highlight") {
      result = view.highlight(cfiRange, data, cb, className, styles);
    } else if (type === "underline") {
      result = view.underline(cfiRange, data, cb, className, styles);
    } else if (type === "mark") {
      result = view.mark(cfiRange, data, cb);
    }

    this.mark = result;
    this.emit(constants["c" /* EVENTS */].ANNOTATION.ATTACH, result);
    return result;
  }
  /**
   * Remove from a view
   * @param {View} view
   */


  detach(view) {
    let {
      cfiRange,
      type
    } = this;
    let result;

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
    this.emit(constants["c" /* EVENTS */].ANNOTATION.DETACH, result);
    return result;
  }
  /**
   * [Not Implemented] Get text of an annotation
   * @TODO: needs implementation in contents
   */


  text() {}

}

event_emitter_default()(annotations_Annotation.prototype);
/* harmony default export */ var annotations = (annotations_Annotations);
// EXTERNAL MODULE: ./src/managers/views/iframe.js
var iframe = __webpack_require__(54);

// EXTERNAL MODULE: ./src/managers/default/index.js + 3 modules
var managers_default = __webpack_require__(22);

// EXTERNAL MODULE: ./src/managers/continuous/index.js + 1 modules
var continuous = __webpack_require__(56);

// CONCATENATED MODULE: ./src/rendition.js





 // import Mapping from "./mapping";




 // Default Views

 // Default View Managers



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

class rendition_Rendition {
  constructor(book, options) {
    this.settings = Object(core["extend"])(this.settings || {}, {
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
    Object(core["extend"])(this.settings, options);

    if (typeof this.settings.manager === "object") {
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
    this.hooks.display = new hook["a" /* default */](this);
    this.hooks.serialize = new hook["a" /* default */](this);
    this.hooks.content = new hook["a" /* default */](this);
    this.hooks.unloaded = new hook["a" /* default */](this);
    this.hooks.layout = new hook["a" /* default */](this);
    this.hooks.render = new hook["a" /* default */](this);
    this.hooks.show = new hook["a" /* default */](this);
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


    this.themes = new themes(this);
    /**
     * @member {Annotations} annotations
     * @memberof Rendition
     */

    this.annotations = new annotations(this);
    this.epubcfi = new src_epubcfi["a" /* default */]();
    this.q = new queue["a" /* default */](this);
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

    this.location = undefined; // Hold queue until book is opened

    this.q.enqueue(this.book.opened);
    this.starting = new core["defer"]();
    /**
     * @member {promise} started returns after the rendition has started
     * @memberof Rendition
     */

    this.started = this.starting.promise; // Block the queue until rendering is started

    this.q.enqueue(this.start);
  }
  /**
   * Set the manager function
   * @param {function} manager
   */


  setManager(manager) {
    this.manager = manager;
  }
  /**
   * Require the manager from passed string, or as a class function
   * @param  {string|object} manager [description]
   * @return {method}
   */


  requireManager(manager) {
    var viewManager; // If manager is a string, try to load from imported managers

    if (typeof manager === "string" && manager === "default") {
      viewManager = managers_default["a" /* default */];
    } else if (typeof manager === "string" && manager === "continuous") {
      viewManager = continuous["a" /* default */];
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


  requireView(view) {
    var View; // If view is a string, try to load from imported views,

    if (typeof view == "string" && view === "iframe") {
      View = iframe["a" /* default */];
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


  start() {
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

    this.direction(this.book.package.metadata.direction || this.settings.defaultDirection); // Parse metadata to get layout props

    this.settings.globalLayoutProperties = this.determineLayoutProperties(this.book.package.metadata);
    this.flow(this.settings.globalLayoutProperties.flow);
    this.layout(this.settings.globalLayoutProperties); // Listen for displayed views

    this.manager.on(constants["c" /* EVENTS */].MANAGERS.ADDED, this.afterDisplayed.bind(this));
    this.manager.on(constants["c" /* EVENTS */].MANAGERS.REMOVED, this.afterRemoved.bind(this)); // Listen for resizing

    this.manager.on(constants["c" /* EVENTS */].MANAGERS.RESIZED, this.onResized.bind(this)); // Listen for rotation

    this.manager.on(constants["c" /* EVENTS */].MANAGERS.ORIENTATION_CHANGE, this.onOrientationChange.bind(this)); // Listen for scroll changes

    this.manager.on(constants["c" /* EVENTS */].MANAGERS.SCROLLED, this.reportLocation.bind(this));
    /**
     * Emit that rendering has started
     * @event started
     * @memberof Rendition
     */

    this.emit(constants["c" /* EVENTS */].RENDITION.STARTED); // Start processing queue

    this.starting.resolve();
  }
  /**
   * Call to attach the container to an element in the dom
   * Container must be attached before rendering can begin
   * @param  {element} element to attach to
   * @return {Promise}
   */


  attachTo(element) {
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

      this.emit(constants["c" /* EVENTS */].RENDITION.ATTACHED);
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


  display(target) {
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


  _display(target) {
    if (!this.book) {
      return;
    }

    var isCfiString = this.epubcfi.isCfiString(target);
    var displaying = new core["defer"]();
    var displayed = displaying.promise;
    var section;
    var moveTo;
    this.displaying = displaying; // Check if this is a book percentage

    if (this.book.locations.length() && Object(core["isFloat"])(target)) {
      target = this.book.locations.cfiFromPercentage(parseFloat(target));
    }

    section = this.book.spine.get(target);

    if (!section) {
      displaying.reject(new Error("No Section Found"));
      return displayed;
    }

    this.manager.display(section, target).then(() => {
      displaying.resolve(section);
      this.displaying = undefined;
      /**
       * Emit that a section has been displayed
       * @event displayed
       * @param {Section} section
       * @memberof Rendition
       */

      this.emit(constants["c" /* EVENTS */].RENDITION.DISPLAYED, section);
      this.reportLocation();
    }, err => {
      /**
       * Emit that has been an error displaying
       * @event displayError
       * @param {Section} section
       * @memberof Rendition
       */
      this.emit(constants["c" /* EVENTS */].RENDITION.DISPLAY_ERROR, err);
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


  afterDisplayed(view) {
    view.on(constants["c" /* EVENTS */].VIEWS.MARK_CLICKED, (cfiRange, data) => this.triggerMarkEvent(cfiRange, data, view.contents));
    this.hooks.render.trigger(view, this).then(() => {
      if (view.contents) {
        this.hooks.content.trigger(view.contents, this).then(() => {
          /**
           * Emit that a section has been rendered
           * @event rendered
           * @param {Section} section
           * @param {View} view
           * @memberof Rendition
           */
          this.emit(constants["c" /* EVENTS */].RENDITION.RENDERED, view.section, view);
        });
      } else {
        this.emit(constants["c" /* EVENTS */].RENDITION.RENDERED, view.section, view);
      }
    });
  }
  /**
   * Report what has been removed
   * @private
   * @param  {*} view
   */


  afterRemoved(view) {
    this.hooks.unloaded.trigger(view, this).then(() => {
      /**
       * Emit that a section has been removed
       * @event removed
       * @param {Section} section
       * @param {View} view
       * @memberof Rendition
       */
      this.emit(constants["c" /* EVENTS */].RENDITION.REMOVED, view.section, view);
    });
  }
  /**
   * Report resize events and display the last seen location
   * @private
   */


  onResized(size, epubcfi) {
    /**
     * Emit that the rendition has been resized
     * @event resized
     * @param {number} width
     * @param {height} height
     * @param {string} epubcfi (optional)
     * @memberof Rendition
     */
    this.emit(constants["c" /* EVENTS */].RENDITION.RESIZED, {
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


  onOrientationChange(orientation) {
    /**
     * Emit that the rendition has been rotated
     * @event orientationchange
     * @param {string} orientation
     * @memberof Rendition
     */
    this.emit(constants["c" /* EVENTS */].RENDITION.ORIENTATION_CHANGE, orientation);
  }
  /**
   * Move the Rendition to a specific offset
   * Usually you would be better off calling display()
   * @param {object} offset
   */


  moveTo(offset) {
    this.manager.moveTo(offset);
  }
  /**
   * Trigger a resize of the views
   * @param {number} [width]
   * @param {number} [height]
   * @param {string} [epubcfi] (optional)
   */


  resize(width, height, epubcfi) {
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


  clear() {
    this.manager.clear();
  }
  /**
   * Go to the next "page" in the rendition
   * @return {Promise}
   */


  next() {
    return this.q.enqueue(this.manager.next.bind(this.manager)).then(this.reportLocation.bind(this));
  }
  /**
   * Go to the previous "page" in the rendition
   * @return {Promise}
   */


  prev() {
    return this.q.enqueue(this.manager.prev.bind(this.manager)).then(this.reportLocation.bind(this));
  } //-- http://www.idpf.org/epub/301/spec/epub-publications.html#meta-properties-rendering

  /**
   * Determine the Layout properties from metadata and settings
   * @private
   * @param  {object} metadata
   * @return {object} properties
   */


  determineLayoutProperties(metadata) {
    var properties;
    var layout = this.settings.layout || metadata.layout || "reflowable";
    var spread = this.settings.spread || metadata.spread || "auto";
    var orientation = this.settings.orientation || metadata.orientation || "auto";
    var flow = this.settings.flow || metadata.flow || "auto";
    var viewport = metadata.viewport || "";
    var minSpreadWidth = this.settings.minSpreadWidth || metadata.minSpreadWidth || 800;
    var direction = this.settings.direction || metadata.direction || "ltr";

    if ((this.settings.width === 0 || this.settings.width > 0) && (this.settings.height === 0 || this.settings.height > 0)) {// viewport = "width="+this.settings.width+", height="+this.settings.height+"";
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


  flow(flow) {
    var _flow = flow;

    if (flow === "scrolled" || flow === "scrolled-doc" || flow === "scrolled-continuous") {
      _flow = "scrolled";
    }

    if (flow === "auto" || flow === "paginated") {
      _flow = "paginated";
    }

    this.settings.flow = flow;

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


  layout(settings) {
    if (settings) {
      this._layout = new layout(settings);

      this._layout.spread(settings.spread, this.settings.minSpreadWidth); // this.mapping = new Mapping(this._layout.props);


      this._layout.on(constants["c" /* EVENTS */].LAYOUT.UPDATED, (props, changed) => {
        this.emit(constants["c" /* EVENTS */].RENDITION.LAYOUT, props, changed);
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


  spread(spread, min) {
    this.settings.spread = spread;

    if (min) {
      this.settings.minSpreadWidth = min;
    }

    if (this._layout) {
      this._layout.spread(spread, min);
    }

    if (this.manager && this.manager.isRendered()) {
      this.manager.updateLayout();
    }
  }
  /**
   * Adjust the direction of the rendition
   * @param  {string} dir
   */


  direction(dir) {
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


  reportLocation() {
    return this.q.enqueue(function reportedLocation() {
      requestAnimationFrame(function reportedLocationAfterRAF() {
        var location = this.manager.currentLocation();

        if (location && location.then && typeof location.then === "function") {
          location.then(function (result) {
            let located = this.located(result);

            if (!located || !located.start || !located.end) {
              return;
            }

            this.location = located;
            this.emit(constants["c" /* EVENTS */].RENDITION.LOCATION_CHANGED, {
              index: this.location.start.index,
              href: this.location.start.href,
              start: this.location.start.cfi,
              end: this.location.end.cfi,
              percentage: this.location.start.percentage
            });
            this.emit(constants["c" /* EVENTS */].RENDITION.RELOCATED, this.location);
          }.bind(this));
        } else if (location) {
          let located = this.located(location);

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

          this.emit(constants["c" /* EVENTS */].RENDITION.LOCATION_CHANGED, {
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

          this.emit(constants["c" /* EVENTS */].RENDITION.RELOCATED, this.location);
        }
      }.bind(this));
    }.bind(this));
  }
  /**
   * Get the Current Location object
   * @return {displayedLocation | promise} location (may be a promise)
   */


  currentLocation() {
    var location = this.manager.currentLocation();

    if (location && location.then && typeof location.then === "function") {
      location.then(function (result) {
        let located = this.located(result);
        return located;
      }.bind(this));
    } else if (location) {
      let located = this.located(location);
      return located;
    }
  }
  /**
   * Creates a Rendition#locationRange from location
   * passed by the Manager
   * @returns {displayedLocation}
   * @private
   */


  located(location) {
    if (!location.length) {
      return {};
    }

    let start = location[0];
    let end = location[location.length - 1];
    let located = {
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
    let locationStart = this.book.locations.locationFromCfi(start.mapping.start);
    let locationEnd = this.book.locations.locationFromCfi(end.mapping.end);

    if (locationStart != null) {
      located.start.location = locationStart;
      located.start.percentage = this.book.locations.percentageFromLocation(locationStart);
    }

    if (locationEnd != null) {
      located.end.location = locationEnd;
      located.end.percentage = this.book.locations.percentageFromLocation(locationEnd);
    }

    let pageStart = this.book.pageList.pageFromCfi(start.mapping.start);
    let pageEnd = this.book.pageList.pageFromCfi(end.mapping.end);

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


  destroy() {
    // Clear the queue
    // this.q.clear();
    // this.q = undefined;
    this.manager && this.manager.destroy();
    this.book = undefined; // this.views = null;
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


  passEvents(contents) {
    constants["a" /* DOM_EVENTS */].forEach(e => {
      contents.on(e, ev => this.triggerViewEvent(ev, contents));
    });
    contents.on(constants["c" /* EVENTS */].CONTENTS.SELECTED, e => this.triggerSelectedEvent(e, contents));
  }
  /**
   * Emit events passed by a view
   * @private
   * @param  {event} e
   */


  triggerViewEvent(e, contents) {
    this.emit(e.type, e, contents);
  }
  /**
   * Emit a selection event's CFI Range passed from a a view
   * @private
   * @param  {EpubCFI} cfirange
   */


  triggerSelectedEvent(cfirange, contents) {
    /**
     * Emit that a text selection has occured
     * @event selected
     * @param {EpubCFI} cfirange
     * @param {Contents} contents
     * @memberof Rendition
     */
    this.emit(constants["c" /* EVENTS */].RENDITION.SELECTED, cfirange, contents);
  }
  /**
   * Emit a markClicked event with the cfiRange and data from a mark
   * @private
   * @param  {EpubCFI} cfirange
   */


  triggerMarkEvent(cfiRange, data, contents) {
    /**
     * Emit that a mark was clicked
     * @event markClicked
     * @param {EpubCFI} cfirange
     * @param {object} data
     * @param {Contents} contents
     * @memberof Rendition
     */
    this.emit(constants["c" /* EVENTS */].RENDITION.MARK_CLICKED, cfiRange, data, contents);
  }
  /**
   * Get a Range from a Visible CFI
   * @param  {string} cfi EpubCfi String
   * @param  {string} ignoreClass
   * @return {range}
   */


  getRange(cfi, ignoreClass) {
    var _cfi = new src_epubcfi["a" /* default */](cfi);

    var found = this.manager.visible().filter(function (view) {
      if (_cfi.spinePos === view.index) return true;
    }); // Should only every return 1 item

    if (found.length) {
      return found[0].contents.range(_cfi, ignoreClass);
    }
  }
  /**
   * Hook to adjust images to fit in columns
   * @param  {Contents} contents
   * @private
   */


  adjustImages(contents) {
    if (this._layout.name === "pre-paginated") {
      return new Promise(function (resolve) {
        resolve();
      });
    }

    let computed = contents.window.getComputedStyle(contents.content, null);
    let height = (contents.content.offsetHeight - (parseFloat(computed.paddingTop) + parseFloat(computed.paddingBottom))) * .95;
    let horizontalPadding = parseFloat(computed.paddingLeft) + parseFloat(computed.paddingRight);
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


  getContents() {
    return this.manager ? this.manager.getContents() : [];
  }
  /**
   * Get the views member from the manager
   * @returns {Views}
   */


  views() {
    let views = this.manager ? this.manager.views : undefined;
    return views || [];
  }
  /**
   * Hook to handle link clicks in rendered content
   * @param  {Contents} contents
   * @private
   */


  handleLinks(contents) {
    if (contents) {
      contents.on(constants["c" /* EVENTS */].CONTENTS.LINK_CLICKED, href => {
        let relative = this.book.path.relative(href);
        this.display(relative);
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


  injectStylesheet(doc, section) {
    let style = doc.createElement("link");
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


  injectScript(doc, section) {
    let script = doc.createElement("script");
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


  injectIdentifier(doc, section) {
    let ident = this.book.packaging.metadata.identifier;
    let meta = doc.createElement("meta");
    meta.setAttribute("name", "dc.relation.ispartof");

    if (ident) {
      meta.setAttribute("content", ident);
    }

    doc.getElementsByTagName("head")[0].appendChild(meta);
  }

} //-- Enable binding events to Renderer


event_emitter_default()(rendition_Rendition.prototype);
/* harmony default export */ var rendition = __webpack_exports__["a"] = (rendition_Rendition);

/***/ }),
/* 40 */
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};


/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(17);

// `ToPrimitive` abstract operation
// https://tc39.github.io/ecma262/#sec-toprimitive
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (input, PREFERRED_STRING) {
  if (!isObject(input)) return input;
  var fn, val;
  if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
  if (typeof (fn = input.valueOf) == 'function' && !isObject(val = fn.call(input))) return val;
  if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
  throw TypeError("Can't convert object to primitive value");
};


/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(7);
var createNonEnumerableProperty = __webpack_require__(15);

module.exports = function (key, value) {
  try {
    createNonEnumerableProperty(global, key, value);
  } catch (error) {
    global[key] = value;
  } return value;
};


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

var shared = __webpack_require__(66);
var uid = __webpack_require__(67);

var keys = shared('keys');

module.exports = function (key) {
  return keys[key] || (keys[key] = uid(key));
};


/***/ }),
/* 44 */
/***/ (function(module, exports) {

module.exports = {};


/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

var path = __webpack_require__(92);
var global = __webpack_require__(7);

var aFunction = function (variable) {
  return typeof variable == 'function' ? variable : undefined;
};

module.exports = function (namespace, method) {
  return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(global[namespace])
    : path[namespace] && path[namespace][method] || global[namespace] && global[namespace][method];
};


/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(35);

var min = Math.min;

// `ToLength` abstract operation
// https://tc39.github.io/ecma262/#sec-tolength
module.exports = function (argument) {
  return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
};


/***/ }),
/* 47 */
/***/ (function(module, exports) {

// IE8- don't enum bug keys
module.exports = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];


/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var regexpFlags = __webpack_require__(97);
var stickyHelpers = __webpack_require__(98);

var nativeExec = RegExp.prototype.exec;
// This always refers to the native implementation, because the
// String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
// which loads this file before patching the method.
var nativeReplace = String.prototype.replace;

var patchedExec = nativeExec;

var UPDATES_LAST_INDEX_WRONG = (function () {
  var re1 = /a/;
  var re2 = /b*/g;
  nativeExec.call(re1, 'a');
  nativeExec.call(re2, 'a');
  return re1.lastIndex !== 0 || re2.lastIndex !== 0;
})();

var UNSUPPORTED_Y = stickyHelpers.UNSUPPORTED_Y || stickyHelpers.BROKEN_CARET;

// nonparticipating capturing group, copied from es5-shim's String#split patch.
var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y;

if (PATCH) {
  patchedExec = function exec(str) {
    var re = this;
    var lastIndex, reCopy, match, i;
    var sticky = UNSUPPORTED_Y && re.sticky;
    var flags = regexpFlags.call(re);
    var source = re.source;
    var charsAdded = 0;
    var strCopy = str;

    if (sticky) {
      flags = flags.replace('y', '');
      if (flags.indexOf('g') === -1) {
        flags += 'g';
      }

      strCopy = String(str).slice(re.lastIndex);
      // Support anchored sticky behavior.
      if (re.lastIndex > 0 && (!re.multiline || re.multiline && str[re.lastIndex - 1] !== '\n')) {
        source = '(?: ' + source + ')';
        strCopy = ' ' + strCopy;
        charsAdded++;
      }
      // ^(? + rx + ) is needed, in combination with some str slicing, to
      // simulate the 'y' flag.
      reCopy = new RegExp('^(?:' + source + ')', flags);
    }

    if (NPCG_INCLUDED) {
      reCopy = new RegExp('^' + source + '$(?!\\s)', flags);
    }
    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;

    match = nativeExec.call(sticky ? reCopy : re, strCopy);

    if (sticky) {
      if (match) {
        match.input = match.input.slice(charsAdded);
        match[0] = match[0].slice(charsAdded);
        match.index = re.lastIndex;
        re.lastIndex += match[0].length;
      } else re.lastIndex = 0;
    } else if (UPDATES_LAST_INDEX_WRONG && match) {
      re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
    }
    if (NPCG_INCLUDED && match && match.length > 1) {
      // Fix browsers whose `exec` methods don't consistently return `undefined`
      // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
      nativeReplace.call(match[0], reCopy, function () {
        for (i = 1; i < arguments.length - 2; i++) {
          if (arguments[i] === undefined) match[i] = undefined;
        }
      });
    }

    return match;
  };
}

module.exports = patchedExec;


/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(35);
var requireObjectCoercible = __webpack_require__(33);

// `String.prototype.{ codePointAt, at }` methods implementation
var createMethod = function (CONVERT_TO_STRING) {
  return function ($this, pos) {
    var S = String(requireObjectCoercible($this));
    var position = toInteger(pos);
    var size = S.length;
    var first, second;
    if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
    first = S.charCodeAt(position);
    return first < 0xD800 || first > 0xDBFF || position + 1 === size
      || (second = S.charCodeAt(position + 1)) < 0xDC00 || second > 0xDFFF
        ? CONVERT_TO_STRING ? S.charAt(position) : first
        : CONVERT_TO_STRING ? S.slice(position, position + 2) : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
  };
};

module.exports = {
  // `String.prototype.codePointAt` method
  // https://tc39.github.io/ecma262/#sec-string.prototype.codepointat
  codeAt: createMethod(false),
  // `String.prototype.at` method
  // https://github.com/mathiasbynens/String.prototype.at
  charAt: createMethod(true)
};


/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(13);
var defineProperties = __webpack_require__(72);
var enumBugKeys = __webpack_require__(47);
var hiddenKeys = __webpack_require__(44);
var html = __webpack_require__(104);
var documentCreateElement = __webpack_require__(63);
var sharedKey = __webpack_require__(43);

var GT = '>';
var LT = '<';
var PROTOTYPE = 'prototype';
var SCRIPT = 'script';
var IE_PROTO = sharedKey('IE_PROTO');

var EmptyConstructor = function () { /* empty */ };

var scriptTag = function (content) {
  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
};

// Create object with fake `null` prototype: use ActiveX Object with cleared prototype
var NullProtoObjectViaActiveX = function (activeXDocument) {
  activeXDocument.write(scriptTag(''));
  activeXDocument.close();
  var temp = activeXDocument.parentWindow.Object;
  activeXDocument = null; // avoid memory leak
  return temp;
};

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var NullProtoObjectViaIFrame = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = documentCreateElement('iframe');
  var JS = 'java' + SCRIPT + ':';
  var iframeDocument;
  iframe.style.display = 'none';
  html.appendChild(iframe);
  // https://github.com/zloirock/core-js/issues/475
  iframe.src = String(JS);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(scriptTag('document.F=Object'));
  iframeDocument.close();
  return iframeDocument.F;
};

// Check for document.domain and active x support
// No need to use active x approach when document.domain is not set
// see https://github.com/es-shims/es5-shim/issues/150
// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
// avoid IE GC bug
var activeXDocument;
var NullProtoObject = function () {
  try {
    /* global ActiveXObject */
    activeXDocument = document.domain && new ActiveXObject('htmlfile');
  } catch (error) { /* ignore */ }
  NullProtoObject = activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame();
  var length = enumBugKeys.length;
  while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];
  return NullProtoObject();
};

hiddenKeys[IE_PROTO] = true;

// `Object.create` method
// https://tc39.github.io/ecma262/#sec-object.create
module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    EmptyConstructor[PROTOTYPE] = anObject(O);
    result = new EmptyConstructor();
    EmptyConstructor[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = NullProtoObject();
  return Properties === undefined ? result : defineProperties(result, Properties);
};


/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _undefined = __webpack_require__(115)(); // Support ES3 engines

module.exports = function (val) {
 return (val !== _undefined) && (val !== null);
};


/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

var classof = __webpack_require__(81);
var Iterators = __webpack_require__(27);
var wellKnownSymbol = __webpack_require__(8);

var ITERATOR = wellKnownSymbol('iterator');

module.exports = function (it) {
  if (it != undefined) return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};


/***/ }),
/* 53 */
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
/* 54 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var event_emitter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var event_emitter__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(event_emitter__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(0);
/* harmony import */ var _epubcfi__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2);
/* harmony import */ var _contents__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(28);
/* harmony import */ var _utils_constants__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(1);
/* harmony import */ var marks_pane__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(29);
/* harmony import */ var marks_pane__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(marks_pane__WEBPACK_IMPORTED_MODULE_5__);







class IframeView {
  constructor(section, options) {
    this.settings = Object(_utils_core__WEBPACK_IMPORTED_MODULE_1__["extend"])({
      ignoreClass: "",
      axis: undefined,
      //options.layout && options.layout.props.flow === "scrolled" ? "vertical" : "horizontal",
      direction: undefined,
      width: 0,
      height: 0,
      layout: undefined,
      globalLayoutProperties: {},
      method: undefined,
      forceRight: false
    }, options || {});
    this.id = "epubjs-view-" + Object(_utils_core__WEBPACK_IMPORTED_MODULE_1__["uuid"])();
    this.section = section;
    this.index = section.index;
    this.element = this.container(this.settings.axis);
    this.added = false;
    this.displayed = false;
    this.rendered = false; // this.width  = this.settings.width;
    // this.height = this.settings.height;

    this.fixedWidth = 0;
    this.fixedHeight = 0; // Blank Cfi for Parsing

    this.epubcfi = new _epubcfi__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"]();
    this.layout = this.settings.layout; // Dom events to listen for
    // this.listenedEvents = ["keydown", "keyup", "keypressed", "mouseup", "mousedown", "click", "touchend", "touchstart"];

    this.pane = undefined;
    this.highlights = {};
    this.underlines = {};
    this.marks = {};
  }

  container(axis) {
    var element = document.createElement("div");
    element.classList.add("epub-view"); // this.element.style.minHeight = "100px";

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

  create() {
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
    this.iframe.seamless = "seamless"; // Back up if seamless isn't supported

    this.iframe.style.border = "none";
    this.iframe.setAttribute("enable-annotation", "true");
    this.resizing = true; // this.iframe.style.display = "none";

    this.element.style.visibility = "hidden";
    this.iframe.style.visibility = "hidden";
    this.iframe.style.width = "0";
    this.iframe.style.height = "0";
    this._width = 0;
    this._height = 0;
    this.element.setAttribute("ref", this.index);
    this.added = true;
    this.elementBounds = Object(_utils_core__WEBPACK_IMPORTED_MODULE_1__["bounds"])(this.element); // if(width || height){
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

  render(request, show) {
    // view.onLayout = this.layout.format.bind(this.layout);
    this.create(); // Fit to size of the container, apply padding

    this.size();

    if (!this.sectionRender) {
      this.sectionRender = this.section.render(request);
    } // Render Chain


    return this.sectionRender.then(function (contents) {
      return this.load(contents);
    }.bind(this)).then(function () {
      // find and report the writingMode axis
      let writingMode = this.contents.writingMode(); // Set the axis based on the flow and writing mode

      let axis;

      if (this.settings.flow === "scrolled") {
        axis = writingMode.indexOf("vertical") === 0 ? "horizontal" : "vertical";
      } else {
        axis = writingMode.indexOf("vertical") === 0 ? "vertical" : "horizontal";
      }

      if (writingMode.indexOf("vertical") === 0 && this.settings.flow === "paginated") {
        this.layout.delta = this.layout.height;
      }

      this.setAxis(axis);
      this.emit(_utils_constants__WEBPACK_IMPORTED_MODULE_4__[/* EVENTS */ "c"].VIEWS.AXIS, axis);
      this.setWritingMode(writingMode);
      this.emit(_utils_constants__WEBPACK_IMPORTED_MODULE_4__[/* EVENTS */ "c"].VIEWS.WRITING_MODE, writingMode); // apply the layout function to the contents

      this.layout.format(this.contents, this.section, this.axis); // Listen for events that require an expansion of the iframe

      this.addListeners();
      return new Promise((resolve, reject) => {
        // Expand the iframe to the full size of the content
        this.expand();

        if (this.settings.forceRight) {
          this.element.style.marginLeft = this.width() + "px";
        }

        resolve();
      });
    }.bind(this), function (e) {
      this.emit(_utils_constants__WEBPACK_IMPORTED_MODULE_4__[/* EVENTS */ "c"].VIEWS.LOAD_ERROR, e);
      return new Promise((resolve, reject) => {
        reject(e);
      });
    }.bind(this)).then(function () {
      this.emit(_utils_constants__WEBPACK_IMPORTED_MODULE_4__[/* EVENTS */ "c"].VIEWS.RENDERED, this.section);
    }.bind(this));
  }

  reset() {
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
  } // Determine locks base on settings


  size(_width, _height) {
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
  } // Lock an axis to element dimensions, taking borders into account


  lock(what, width, height) {
    var elBorders = Object(_utils_core__WEBPACK_IMPORTED_MODULE_1__["borders"])(this.element);
    var iframeBorders;

    if (this.iframe) {
      iframeBorders = Object(_utils_core__WEBPACK_IMPORTED_MODULE_1__["borders"])(this.iframe);
    } else {
      iframeBorders = {
        width: 0,
        height: 0
      };
    }

    if (what == "width" && Object(_utils_core__WEBPACK_IMPORTED_MODULE_1__["isNumber"])(width)) {
      this.lockedWidth = width - elBorders.width - iframeBorders.width; // this.resize(this.lockedWidth, width); //  width keeps ratio correct
    }

    if (what == "height" && Object(_utils_core__WEBPACK_IMPORTED_MODULE_1__["isNumber"])(height)) {
      this.lockedHeight = height - elBorders.height - iframeBorders.height; // this.resize(width, this.lockedHeight);
    }

    if (what === "both" && Object(_utils_core__WEBPACK_IMPORTED_MODULE_1__["isNumber"])(width) && Object(_utils_core__WEBPACK_IMPORTED_MODULE_1__["isNumber"])(height)) {
      this.lockedWidth = width - elBorders.width - iframeBorders.width;
      this.lockedHeight = height - elBorders.height - iframeBorders.height; // this.resize(this.lockedWidth, this.lockedHeight);
    }

    if (this.displayed && this.iframe) {
      // this.contents.layout();
      this.expand();
    }
  } // Resize a single axis based on content dimensions


  expand(force) {
    var width = this.lockedWidth;
    var height = this.lockedHeight;
    var columns;
    var textWidth, textHeight;
    if (!this.iframe || this._expanding) return;
    this._expanding = true;

    if (this.layout.name === "pre-paginated") {
      width = this.layout.columnWidth;
      height = this.layout.height;
    } // Expand Horizontally
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

          if (this.settings.flow === "paginated" && height % this.layout.height > 0) {
            height = Math.ceil(height / this.layout.height) * this.layout.height;
          }
        } // Only Resize if dimensions have changed or
    // if Frame is still hidden, so needs reframing


    if (this._needsReframe || width != this._width || height != this._height) {
      this.reframe(width, height);
    }

    this._expanding = false;
  }

  reframe(width, height) {
    var size;

    if (Object(_utils_core__WEBPACK_IMPORTED_MODULE_1__["isNumber"])(width)) {
      this.element.style.width = width + "px";
      this.iframe.style.width = width + "px";
      this._width = width;
    }

    if (Object(_utils_core__WEBPACK_IMPORTED_MODULE_1__["isNumber"])(height)) {
      this.element.style.height = height + "px";
      this.iframe.style.height = height + "px";
      this._height = height;
    }

    let widthDelta = this.prevBounds ? width - this.prevBounds.width : width;
    let heightDelta = this.prevBounds ? height - this.prevBounds.height : height;
    size = {
      width: width,
      height: height,
      widthDelta: widthDelta,
      heightDelta: heightDelta
    };
    this.pane && this.pane.render();
    requestAnimationFrame(() => {
      let mark;

      for (let m in this.marks) {
        if (this.marks.hasOwnProperty(m)) {
          mark = this.marks[m];
          this.placeMark(mark.element, mark.range);
        }
      }
    });
    this.onResize(this, size);
    this.emit(_utils_constants__WEBPACK_IMPORTED_MODULE_4__[/* EVENTS */ "c"].VIEWS.RESIZED, size);
    this.prevBounds = size;
    this.elementBounds = Object(_utils_core__WEBPACK_IMPORTED_MODULE_1__["bounds"])(this.element);
  }

  load(contents) {
    var loading = new _utils_core__WEBPACK_IMPORTED_MODULE_1__["defer"]();
    var loaded = loading.promise;

    if (!this.iframe) {
      loading.reject(new Error("No Iframe Available"));
      return loaded;
    }

    this.iframe.onload = function (event) {
      this.onLoad(event, loading);
    }.bind(this);

    if (this.settings.method === "blobUrl") {
      this.blobUrl = Object(_utils_core__WEBPACK_IMPORTED_MODULE_1__["createBlobUrl"])(contents, "application/xhtml+xml");
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

      this.iframe.contentDocument.open(); // For Cordova windows platform

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

  onLoad(event, promise) {
    this.window = this.iframe.contentWindow;
    this.document = this.iframe.contentDocument;
    this.contents = new _contents__WEBPACK_IMPORTED_MODULE_3__[/* default */ "a"](this.document, this.document.body, this.section.cfiBase, this.section.index);
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

    this.contents.on(_utils_constants__WEBPACK_IMPORTED_MODULE_4__[/* EVENTS */ "c"].CONTENTS.EXPAND, () => {
      if (this.displayed && this.iframe) {
        this.expand();

        if (this.contents) {
          this.layout.format(this.contents);
        }
      }
    });
    this.contents.on(_utils_constants__WEBPACK_IMPORTED_MODULE_4__[/* EVENTS */ "c"].CONTENTS.RESIZE, e => {
      if (this.displayed && this.iframe) {
        this.expand();

        if (this.contents) {
          this.layout.format(this.contents);
        }
      }
    });
    promise.resolve(this.contents);
  }

  setLayout(layout) {
    this.layout = layout;

    if (this.contents) {
      this.layout.format(this.contents);
      this.expand();
    }
  }

  setAxis(axis) {
    this.settings.axis = axis;

    if (axis == "horizontal") {
      this.element.style.flex = "none";
    } else {
      this.element.style.flex = "initial";
    }

    this.size();
  }

  setWritingMode(mode) {
    // this.element.style.writingMode = writingMode;
    this.writingMode = mode;
  }

  addListeners() {//TODO: Add content listeners for expanding
  }

  removeListeners(layoutFunc) {//TODO: remove content listeners for expanding
  }

  display(request) {
    var displayed = new _utils_core__WEBPACK_IMPORTED_MODULE_1__["defer"]();

    if (!this.displayed) {
      this.render(request).then(function () {
        this.emit(_utils_constants__WEBPACK_IMPORTED_MODULE_4__[/* EVENTS */ "c"].VIEWS.DISPLAYED, this);
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

  show() {
    this.element.style.visibility = "visible";

    if (this.iframe) {
      this.iframe.style.visibility = "visible"; // Remind Safari to redraw the iframe

      this.iframe.style.transform = "translateZ(0)";
      this.iframe.offsetWidth;
      this.iframe.style.transform = null;
    }

    this.emit(_utils_constants__WEBPACK_IMPORTED_MODULE_4__[/* EVENTS */ "c"].VIEWS.SHOWN, this);
  }

  hide() {
    // this.iframe.style.display = "none";
    this.element.style.visibility = "hidden";
    this.iframe.style.visibility = "hidden";
    this.stopExpanding = true;
    this.emit(_utils_constants__WEBPACK_IMPORTED_MODULE_4__[/* EVENTS */ "c"].VIEWS.HIDDEN, this);
  }

  offset() {
    return {
      top: this.element.offsetTop,
      left: this.element.offsetLeft
    };
  }

  width() {
    return this._width;
  }

  height() {
    return this._height;
  }

  position() {
    return this.element.getBoundingClientRect();
  }

  locationOf(target) {
    var parentPos = this.iframe.getBoundingClientRect();
    var targetPos = this.contents.locationOf(target, this.settings.ignoreClass);
    return {
      "left": targetPos.left,
      "top": targetPos.top
    };
  }

  onDisplayed(view) {// Stub, override with a custom functions
  }

  onResize(view, e) {// Stub, override with a custom functions
  }

  bounds(force) {
    if (force || !this.elementBounds) {
      this.elementBounds = Object(_utils_core__WEBPACK_IMPORTED_MODULE_1__["bounds"])(this.element);
    }

    return this.elementBounds;
  }

  highlight(cfiRange, data = {}, cb, className = "epubjs-hl", styles = {}) {
    if (!this.contents) {
      return;
    }

    const attributes = Object.assign({
      "fill": "yellow",
      "fill-opacity": "0.3",
      "mix-blend-mode": "multiply"
    }, styles);
    let range = this.contents.range(cfiRange);

    let emitter = () => {
      this.emit(_utils_constants__WEBPACK_IMPORTED_MODULE_4__[/* EVENTS */ "c"].VIEWS.MARK_CLICKED, cfiRange, data);
    };

    data["epubcfi"] = cfiRange;

    if (!this.pane) {
      this.pane = new marks_pane__WEBPACK_IMPORTED_MODULE_5__["Pane"](this.iframe, this.element);
    }

    let m = new marks_pane__WEBPACK_IMPORTED_MODULE_5__["Highlight"](range, className, data, attributes);
    let h = this.pane.addMark(m);
    this.highlights[cfiRange] = {
      "mark": h,
      "element": h.element,
      "listeners": [emitter, cb]
    };
    h.element.setAttribute("ref", className);
    h.element.addEventListener("click", emitter);
    h.element.addEventListener("touchstart", emitter);

    if (cb) {
      h.element.addEventListener("click", cb);
      h.element.addEventListener("touchstart", cb);
    }

    return h;
  }

  underline(cfiRange, data = {}, cb, className = "epubjs-ul", styles = {}) {
    if (!this.contents) {
      return;
    }

    const attributes = Object.assign({
      "stroke": "black",
      "stroke-opacity": "0.3",
      "mix-blend-mode": "multiply"
    }, styles);
    let range = this.contents.range(cfiRange);

    let emitter = () => {
      this.emit(_utils_constants__WEBPACK_IMPORTED_MODULE_4__[/* EVENTS */ "c"].VIEWS.MARK_CLICKED, cfiRange, data);
    };

    data["epubcfi"] = cfiRange;

    if (!this.pane) {
      this.pane = new marks_pane__WEBPACK_IMPORTED_MODULE_5__["Pane"](this.iframe, this.element);
    }

    let m = new marks_pane__WEBPACK_IMPORTED_MODULE_5__["Underline"](range, className, data, attributes);
    let h = this.pane.addMark(m);
    this.underlines[cfiRange] = {
      "mark": h,
      "element": h.element,
      "listeners": [emitter, cb]
    };
    h.element.setAttribute("ref", className);
    h.element.addEventListener("click", emitter);
    h.element.addEventListener("touchstart", emitter);

    if (cb) {
      h.element.addEventListener("click", cb);
      h.element.addEventListener("touchstart", cb);
    }

    return h;
  }

  mark(cfiRange, data = {}, cb) {
    if (!this.contents) {
      return;
    }

    if (cfiRange in this.marks) {
      let item = this.marks[cfiRange];
      return item;
    }

    let range = this.contents.range(cfiRange);

    if (!range) {
      return;
    }

    let container = range.commonAncestorContainer;
    let parent = container.nodeType === 1 ? container : container.parentNode;

    let emitter = e => {
      this.emit(_utils_constants__WEBPACK_IMPORTED_MODULE_4__[/* EVENTS */ "c"].VIEWS.MARK_CLICKED, cfiRange, data);
    };

    if (range.collapsed && container.nodeType === 1) {
      range = new Range();
      range.selectNodeContents(container);
    } else if (range.collapsed) {
      // Webkit doesn't like collapsed ranges
      range = new Range();
      range.selectNodeContents(parent);
    }

    let mark = this.document.createElement("a");
    mark.setAttribute("ref", "epubjs-mk");
    mark.style.position = "absolute";
    mark.dataset["epubcfi"] = cfiRange;

    if (data) {
      Object.keys(data).forEach(key => {
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
    this.marks[cfiRange] = {
      "element": mark,
      "range": range,
      "listeners": [emitter, cb]
    };
    return parent;
  }

  placeMark(element, range) {
    let top, right, left;

    if (this.layout.name === "pre-paginated" || this.settings.axis !== "horizontal") {
      let pos = range.getBoundingClientRect();
      top = pos.top;
      right = pos.right;
    } else {
      // Element might break columns, so find the left most element
      let rects = range.getClientRects();
      let rect;

      for (var i = 0; i != rects.length; i++) {
        rect = rects[i];

        if (!left || rect.left < left) {
          left = rect.left; // right = rect.right;

          right = Math.ceil(left / this.layout.props.pageWidth) * this.layout.props.pageWidth - this.layout.gap / 2;
          top = rect.top;
        }
      }
    }

    element.style.top = `${top}px`;
    element.style.left = `${right}px`;
  }

  unhighlight(cfiRange) {
    let item;

    if (cfiRange in this.highlights) {
      item = this.highlights[cfiRange];
      this.pane.removeMark(item.mark);
      item.listeners.forEach(l => {
        if (l) {
          item.element.removeEventListener("click", l);
          item.element.removeEventListener("touchstart", l);
        }

        ;
      });
      delete this.highlights[cfiRange];
    }
  }

  ununderline(cfiRange) {
    let item;

    if (cfiRange in this.underlines) {
      item = this.underlines[cfiRange];
      this.pane.removeMark(item.mark);
      item.listeners.forEach(l => {
        if (l) {
          item.element.removeEventListener("click", l);
          item.element.removeEventListener("touchstart", l);
        }

        ;
      });
      delete this.underlines[cfiRange];
    }
  }

  unmark(cfiRange) {
    let item;

    if (cfiRange in this.marks) {
      item = this.marks[cfiRange];
      this.element.removeChild(item.element);
      item.listeners.forEach(l => {
        if (l) {
          item.element.removeEventListener("click", l);
          item.element.removeEventListener("touchstart", l);
        }

        ;
      });
      delete this.marks[cfiRange];
    }
  }

  destroy() {
    for (let cfiRange in this.highlights) {
      this.unhighlight(cfiRange);
    }

    for (let cfiRange in this.underlines) {
      this.ununderline(cfiRange);
    }

    for (let cfiRange in this.marks) {
      this.unmark(cfiRange);
    }

    if (this.blobUrl) {
      Object(_utils_core__WEBPACK_IMPORTED_MODULE_1__["revokeBlobUrl"])(this.blobUrl);
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
    } // this.element.style.height = "0px";
    // this.element.style.width = "0px";

  }

}

event_emitter__WEBPACK_IMPORTED_MODULE_0___default()(IframeView.prototype);
/* harmony default export */ __webpack_exports__["a"] = (IframeView);

/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(53),
    now = __webpack_require__(137),
    toNumber = __webpack_require__(139);

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
/* 56 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

// EXTERNAL MODULE: ./node_modules/core-js/modules/web.dom-collections.iterator.js
var web_dom_collections_iterator = __webpack_require__(14);

// EXTERNAL MODULE: ./src/utils/core.js
var core = __webpack_require__(0);

// EXTERNAL MODULE: ./src/managers/default/index.js + 3 modules
var managers_default = __webpack_require__(22);

// EXTERNAL MODULE: ./src/utils/constants.js
var constants = __webpack_require__(1);

// EXTERNAL MODULE: ./node_modules/event-emitter/index.js
var event_emitter = __webpack_require__(3);
var event_emitter_default = /*#__PURE__*/__webpack_require__.n(event_emitter);

// CONCATENATED MODULE: ./src/managers/helpers/snap.js


 // easing equations from https://github.com/danro/easing-js/blob/master/easing.js

const PI_D2 = Math.PI / 2;
const EASING_EQUATIONS = {
  easeOutSine: function (pos) {
    return Math.sin(pos * PI_D2);
  },
  easeInOutSine: function (pos) {
    return -0.5 * (Math.cos(Math.PI * pos) - 1);
  },
  easeInOutQuint: function (pos) {
    if ((pos /= 0.5) < 1) {
      return 0.5 * Math.pow(pos, 5);
    }

    return 0.5 * (Math.pow(pos - 2, 5) + 2);
  },
  easeInCubic: function (pos) {
    return Math.pow(pos, 3);
  }
};

class snap_Snap {
  constructor(manager, options) {
    this.settings = Object(core["extend"])({
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

  setup(manager) {
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
    } // this.overflow = this.manager.overflow;
    // set lookahead offset to page width


    this.manager.settings.offset = this.layout.width;
    this.manager.settings.afterScrolledTimeout = this.settings.duration * 2;
    this.isVertical = this.manager.settings.axis === "vertical"; // disable snapping if not paginated or axis in not horizontal

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

  supportsTouch() {
    if ('ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch) {
      return true;
    }

    return false;
  }

  disableScroll() {
    this.element.style.overflow = "hidden";
  }

  enableScroll() {
    this.element.style.overflow = "";
  }

  addListeners() {
    this._onResize = this.onResize.bind(this);
    window.addEventListener('resize', this._onResize);
    this._onScroll = this.onScroll.bind(this);
    this.scroller.addEventListener('scroll', this._onScroll);
    this._onTouchStart = this.onTouchStart.bind(this);
    this.scroller.addEventListener('touchstart', this._onTouchStart, {
      passive: true
    });
    this.on('touchstart', this._onTouchStart);
    this._onTouchMove = this.onTouchMove.bind(this);
    this.scroller.addEventListener('touchmove', this._onTouchMove, {
      passive: true
    });
    this.on('touchmove', this._onTouchMove);
    this._onTouchEnd = this.onTouchEnd.bind(this);
    this.scroller.addEventListener('touchend', this._onTouchEnd, {
      passive: true
    });
    this.on('touchend', this._onTouchEnd);
    this._afterDisplayed = this.afterDisplayed.bind(this);
    this.manager.on(constants["c" /* EVENTS */].MANAGERS.ADDED, this._afterDisplayed);
  }

  removeListeners() {
    window.removeEventListener('resize', this._onResize);
    this._onResize = undefined;
    this.scroller.removeEventListener('scroll', this._onScroll);
    this._onScroll = undefined;
    this.scroller.removeEventListener('touchstart', this._onTouchStart, {
      passive: true
    });
    this.off('touchstart', this._onTouchStart);
    this._onTouchStart = undefined;
    this.scroller.removeEventListener('touchmove', this._onTouchMove, {
      passive: true
    });
    this.off('touchmove', this._onTouchMove);
    this._onTouchMove = undefined;
    this.scroller.removeEventListener('touchend', this._onTouchEnd, {
      passive: true
    });
    this.off('touchend', this._onTouchEnd);
    this._onTouchEnd = undefined;
    this.manager.off(constants["c" /* EVENTS */].MANAGERS.ADDED, this._afterDisplayed);
    this._afterDisplayed = undefined;
  }

  afterDisplayed(view) {
    let contents = view.contents;
    ["touchstart", "touchmove", "touchend"].forEach(e => {
      contents.on(e, ev => this.triggerViewEvent(ev, contents));
    });
  }

  triggerViewEvent(e, contents) {
    this.emit(e.type, e, contents);
  }

  onScroll(e) {
    this.scrollLeft = this.fullsize ? window.scrollX : this.scroller.scrollLeft;
    this.scrollTop = this.fullsize ? window.scrollY : this.scroller.scrollTop;
  }

  onResize(e) {
    this.resizeCanceler = true;
  }

  onTouchStart(e) {
    let {
      screenX,
      screenY
    } = e.touches[0];

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

  onTouchMove(e) {
    let {
      screenX,
      screenY
    } = e.touches[0];
    let deltaY = Math.abs(screenY - this.endTouchY);
    this.touchCanceler = true;

    if (!this.fullsize && deltaY < 10) {
      this.element.scrollLeft -= screenX - this.endTouchX;
    }

    this.endTouchX = screenX;
    this.endTouchY = screenY;
    this.endTime = this.now();
  }

  onTouchEnd(e) {
    if (this.fullsize) {
      this.disableScroll();
    }

    this.touchCanceler = false;
    let swipped = this.wasSwiped();

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

  wasSwiped() {
    let snapWidth = this.layout.pageWidth * this.layout.divisor;
    let distance = this.endTouchX - this.startTouchX;
    let absolute = Math.abs(distance);
    let time = this.endTime - this.startTime;
    let velocity = distance / time;
    let minVelocity = this.settings.minVelocity;

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

  needsSnap() {
    let left = this.scrollLeft;
    let snapWidth = this.layout.pageWidth * this.layout.divisor;
    return left % snapWidth !== 0;
  }

  snap(howMany = 0) {
    let left = this.scrollLeft;
    let snapWidth = this.layout.pageWidth * this.layout.divisor;
    let snapTo = Math.round(left / snapWidth) * snapWidth;

    if (howMany) {
      snapTo += howMany * snapWidth;
    }

    return this.smoothScrollTo(snapTo);
  }

  smoothScrollTo(destination) {
    const deferred = new core["defer"]();
    const start = this.scrollLeft;
    const startTime = this.now();
    const duration = this.settings.duration;
    const easing = this.settings.easing;
    this.snapping = true; // add animation loop

    function tick() {
      const now = this.now();
      const time = Math.min(1, (now - startTime) / duration);
      const timeFunction = easing(time);

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

  scrollTo(left = 0, top = 0) {
    if (this.fullsize) {
      window.scroll(left, top);
    } else {
      this.scroller.scrollLeft = left;
      this.scroller.scrollTop = top;
    }
  }

  now() {
    return 'now' in window.performance ? performance.now() : new Date().getTime();
  }

  destroy() {
    if (!this.scroller) {
      return;
    }

    if (this.fullsize) {
      this.enableScroll();
    }

    this.removeListeners();
    this.scroller = undefined;
  }

}

event_emitter_default()(snap_Snap.prototype);
/* harmony default export */ var snap = (snap_Snap);
// EXTERNAL MODULE: ./node_modules/lodash/debounce.js
var debounce = __webpack_require__(55);
var debounce_default = /*#__PURE__*/__webpack_require__.n(debounce);

// CONCATENATED MODULE: ./src/managers/continuous/index.js







class continuous_ContinuousViewManager extends managers_default["a" /* default */] {
  constructor(options) {
    super(options);
    this.name = "continuous";
    this.settings = Object(core["extend"])(this.settings || {}, {
      infinite: true,
      overflow: undefined,
      axis: undefined,
      writingMode: undefined,
      flow: "scrolled",
      offset: 500,
      offsetDelta: 250,
      width: undefined,
      height: undefined,
      snap: false,
      afterScrolledTimeout: 10
    });
    Object(core["extend"])(this.settings, options.settings || {}); // Gap can be 0, but defaults doesn't handle that

    if (options.settings.gap != "undefined" && options.settings.gap === 0) {
      this.settings.gap = options.settings.gap;
    }

    this.viewSettings = {
      ignoreClass: this.settings.ignoreClass,
      axis: this.settings.axis,
      flow: this.settings.flow,
      layout: this.layout,
      width: 0,
      height: 0,
      forceEvenPages: false
    };
    this.scrollTop = 0;
    this.scrollLeft = 0;
  }

  display(section, target) {
    return managers_default["a" /* default */].prototype.display.call(this, section, target).then(function () {
      return this.fill();
    }.bind(this));
  }

  fill(_full) {
    var full = _full || new core["defer"]();
    this.q.enqueue(() => {
      return this.check();
    }).then(result => {
      if (result) {
        this.fill(full);
      } else {
        full.resolve();
      }
    });
    return full.promise;
  }

  moveTo(offset) {
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

  afterResized(view) {
    this.emit(constants["c" /* EVENTS */].MANAGERS.RESIZE, view.section);
  } // Remove Previous Listeners if present


  removeShownListeners(view) {
    // view.off("shown", this.afterDisplayed);
    // view.off("shown", this.afterDisplayedAbove);
    view.onDisplayed = function () {};
  }

  add(section) {
    var view = this.createView(section);
    this.views.append(view);
    view.on(constants["c" /* EVENTS */].VIEWS.RESIZED, bounds => {
      view.expanded = true;
    });
    view.on(constants["c" /* EVENTS */].VIEWS.AXIS, axis => {
      this.updateAxis(axis);
    });
    view.on(constants["c" /* EVENTS */].VIEWS.WRITING_MODE, mode => {
      this.updateWritingMode(mode);
    }); // view.on(EVENTS.VIEWS.SHOWN, this.afterDisplayed.bind(this));

    view.onDisplayed = this.afterDisplayed.bind(this);
    view.onResize = this.afterResized.bind(this);
    return view.display(this.request);
  }

  append(section) {
    var view = this.createView(section);
    view.on(constants["c" /* EVENTS */].VIEWS.RESIZED, bounds => {
      view.expanded = true;
    });
    view.on(constants["c" /* EVENTS */].VIEWS.AXIS, axis => {
      this.updateAxis(axis);
    });
    view.on(constants["c" /* EVENTS */].VIEWS.WRITING_MODE, mode => {
      this.updateWritingMode(mode);
    });
    this.views.append(view);
    view.onDisplayed = this.afterDisplayed.bind(this);
    return view;
  }

  prepend(section) {
    var view = this.createView(section);
    view.on(constants["c" /* EVENTS */].VIEWS.RESIZED, bounds => {
      this.counter(bounds);
      view.expanded = true;
    });
    view.on(constants["c" /* EVENTS */].VIEWS.AXIS, axis => {
      this.updateAxis(axis);
    });
    view.on(constants["c" /* EVENTS */].VIEWS.WRITING_MODE, mode => {
      this.updateWritingMode(mode);
    });
    this.views.prepend(view);
    view.onDisplayed = this.afterDisplayed.bind(this);
    return view;
  }

  counter(bounds) {
    if (this.settings.axis === "vertical") {
      this.scrollBy(0, bounds.heightDelta, true);
    } else {
      this.scrollBy(bounds.widthDelta, 0, true);
    }
  }

  update(_offset) {
    var container = this.bounds();
    var views = this.views.all();
    var viewsLength = views.length;
    var visible = [];
    var offset = typeof _offset != "undefined" ? _offset : this.settings.offset || 0;
    var isVisible;
    var view;
    var updating = new core["defer"]();
    var promises = [];

    for (var i = 0; i < viewsLength; i++) {
      view = views[i];
      isVisible = this.isVisible(view, offset, offset, container);

      if (isVisible === true) {
        // console.log("visible " + view.index, view.displayed);
        if (!view.displayed) {
          let displayed = view.display(this.request).then(function (view) {
            view.show();
          }, err => {
            view.hide();
          });
          promises.push(displayed);
        } else {
          view.show();
        }

        visible.push(view);
      } else {
        this.q.enqueue(view.destroy.bind(view)); // console.log("hidden " + view.index, view.displayed);

        clearTimeout(this.trimTimeout);
        this.trimTimeout = setTimeout(function () {
          this.q.enqueue(this.trim.bind(this));
        }.bind(this), 250);
      }
    }

    if (promises.length) {
      return Promise.all(promises).catch(err => {
        updating.reject(err);
      });
    } else {
      updating.resolve();
      return updating.promise;
    }
  }

  check(_offsetLeft, _offsetTop) {
    var checking = new core["defer"]();
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

    let offset = horizontal ? this.scrollLeft : this.scrollTop;
    let visibleLength = horizontal ? Math.floor(bounds.width) : bounds.height;
    let contentLength = horizontal ? this.container.scrollWidth : this.container.scrollHeight;
    let writingMode = this.writingMode && this.writingMode.indexOf("vertical") === 0 ? "vertical" : "horizontal";
    let rtlScrollType = this.settings.rtlScrollType;
    let rtl = this.settings.direction === "rtl";

    if (!this.settings.fullsize) {
      // Scroll offset starts at width of element
      if (rtl && rtlScrollType === "default" && writingMode === "horizontal") {
        offset = contentLength - visibleLength - offset;
      } // Scroll offset starts at 0 and goes negative


      if (rtl && rtlScrollType === "negative" && writingMode === "horizontal") {
        offset = offset * -1;
      }
    } else {
      // Scroll offset starts at 0 and goes negative
      if (horizontal && rtl && rtlScrollType === "negative" || !horizontal && rtl && rtlScrollType === "default") {
        offset = offset * -1;
      }
    }

    let prepend = () => {
      let first = this.views.first();
      let prev = first && first.section.prev();

      if (prev) {
        newViews.push(this.prepend(prev));
      }
    };

    let append = () => {
      let last = this.views.last();
      let next = last && last.section.next();

      if (next) {
        newViews.push(this.append(next));
      }
    };

    let end = offset + visibleLength + delta;
    let start = offset - delta;

    if (end >= contentLength) {
      append();
    }

    if (start < 0) {
      prepend();
    }

    let promises = newViews.map(view => {
      return view.display(this.request);
    });

    if (newViews.length) {
      return Promise.all(promises).then(() => {
        return this.check();
      }).then(() => {
        // Check to see if anything new is on screen after rendering
        return this.update(delta);
      }, err => {
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

  trim() {
    var task = new core["defer"]();
    var displayed = this.views.displayed();
    var first = displayed[0];
    var last = displayed[displayed.length - 1];
    var firstIndex = this.views.indexOf(first);
    var lastIndex = this.views.indexOf(last);
    var above = this.views.slice(0, firstIndex);
    var below = this.views.slice(lastIndex + 1); // Erase all but last above

    for (var i = 0; i < above.length - 1; i++) {
      this.erase(above[i], above);
    } // Erase all except first below


    for (var j = 1; j < below.length; j++) {
      this.erase(below[j]);
    }

    task.resolve();
    return task.promise;
  }

  erase(view, above) {
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
          if (!this.settings.fullsize) {
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

  addEventListeners(stage) {
    window.addEventListener("unload", function (e) {
      this.ignore = true; // this.scrollTo(0,0);

      this.destroy();
    }.bind(this));
    this.addScrollListeners();

    if (this.isPaginated && this.settings.snap) {
      this.snapper = new snap(this, this.settings.snap && typeof this.settings.snap === "object" && this.settings.snap);
    }
  }

  addScrollListeners() {
    var scroller;
    this.tick = core["requestAnimationFrame"];
    let dir = this.settings.direction === "rtl" && this.settings.rtlScrollType === "default" ? -1 : 1;
    this.scrollDeltaVert = 0;
    this.scrollDeltaHorz = 0;

    if (!this.settings.fullsize) {
      scroller = this.container;
      this.scrollTop = this.container.scrollTop;
      this.scrollLeft = this.container.scrollLeft;
    } else {
      scroller = window;
      this.scrollTop = window.scrollY * dir;
      this.scrollLeft = window.scrollX * dir;
    }

    this._onScroll = this.onScroll.bind(this);
    scroller.addEventListener("scroll", this._onScroll);
    this._scrolled = debounce_default()(this.scrolled.bind(this), 30); // this.tick.call(window, this.onScroll.bind(this));

    this.didScroll = false;
  }

  removeEventListeners() {
    var scroller;

    if (!this.settings.fullsize) {
      scroller = this.container;
    } else {
      scroller = window;
    }

    scroller.removeEventListener("scroll", this._onScroll);
    this._onScroll = undefined;
  }

  onScroll() {
    let scrollTop;
    let scrollLeft;
    let dir = this.settings.direction === "rtl" && this.settings.rtlScrollType === "default" ? -1 : 1;

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

  scrolled() {
    this.q.enqueue(function () {
      return this.check();
    }.bind(this));
    this.emit(constants["c" /* EVENTS */].MANAGERS.SCROLL, {
      top: this.scrollTop,
      left: this.scrollLeft
    });
    clearTimeout(this.afterScrolled);
    this.afterScrolled = setTimeout(function () {
      // Don't report scroll if we are about the snap
      if (this.snapper && this.snapper.supportsTouch && this.snapper.needsSnap()) {
        return;
      }

      this.emit(constants["c" /* EVENTS */].MANAGERS.SCROLLED, {
        top: this.scrollTop,
        left: this.scrollLeft
      });
    }.bind(this), this.settings.afterScrolledTimeout);
  }

  next() {
    let delta = this.layout.props.name === "pre-paginated" && this.layout.props.spread ? this.layout.props.delta * 2 : this.layout.props.delta;
    if (!this.views.length) return;

    if (this.isPaginated && this.settings.axis === "horizontal") {
      this.scrollBy(delta, 0, true);
    } else {
      this.scrollBy(0, this.layout.height, true);
    }

    this.q.enqueue(function () {
      return this.check();
    }.bind(this));
  }

  prev() {
    let delta = this.layout.props.name === "pre-paginated" && this.layout.props.spread ? this.layout.props.delta * 2 : this.layout.props.delta;
    if (!this.views.length) return;

    if (this.isPaginated && this.settings.axis === "horizontal") {
      this.scrollBy(-delta, 0, true);
    } else {
      this.scrollBy(0, -this.layout.height, true);
    }

    this.q.enqueue(function () {
      return this.check();
    }.bind(this));
  }

  updateFlow(flow) {
    if (this.rendered && this.snapper) {
      this.snapper.destroy();
      this.snapper = undefined;
    }

    super.updateFlow(flow, "scroll");

    if (this.rendered && this.isPaginated && this.settings.snap) {
      this.snapper = new snap(this, this.settings.snap && typeof this.settings.snap === "object" && this.settings.snap);
    }
  }

  destroy() {
    super.destroy();

    if (this.snapper) {
      this.snapper.destroy();
    }
  }

}

/* harmony default export */ var continuous = __webpack_exports__["a"] = (continuous_ContinuousViewManager);

/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var require;var require;/*!
    localForage -- Offline Storage, Improved
    Version 1.7.3
    https://localforage.github.io/localForage
    (c) 2013-2017 Mozilla, Apache License 2.0
*/
(function(f){if(true){module.exports=f()}else { var g; }})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return require(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw (f.code="MODULE_NOT_FOUND", f)}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
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

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(30)))

/***/ }),
/* 58 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.string.replace.js
var es_string_replace = __webpack_require__(24);

// EXTERNAL MODULE: ./node_modules/core-js/modules/web.dom-collections.iterator.js
var web_dom_collections_iterator = __webpack_require__(14);

// EXTERNAL MODULE: ./node_modules/event-emitter/index.js
var event_emitter = __webpack_require__(3);
var event_emitter_default = /*#__PURE__*/__webpack_require__.n(event_emitter);

// EXTERNAL MODULE: ./src/utils/core.js
var core = __webpack_require__(0);

// EXTERNAL MODULE: ./src/utils/url.js
var utils_url = __webpack_require__(5);

// EXTERNAL MODULE: ./src/utils/path.js
var utils_path = __webpack_require__(4);

// EXTERNAL MODULE: ./src/epubcfi.js
var epubcfi = __webpack_require__(2);

// EXTERNAL MODULE: ./src/utils/hook.js
var hook = __webpack_require__(6);

// EXTERNAL MODULE: ./src/utils/replacements.js
var replacements = __webpack_require__(11);

// EXTERNAL MODULE: ./node_modules/core-js/modules/web.url.js
var web_url = __webpack_require__(20);

// CONCATENATED MODULE: ./src/utils/request.js





function request_request(url, type, withCredentials, headers) {
  var supportsURL = typeof window != "undefined" ? window.URL : false; // TODO: fallback for url if window isn't defined

  var BLOB_RESPONSE = supportsURL ? "blob" : "arraybuffer";
  var deferred = new core["defer"]();
  var xhr = new XMLHttpRequest(); //-- Check from PDF.js:
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
  } // If type isn"t set, determine it from the file extension


  if (!type) {
    type = new utils_path["a" /* default */](url).extension;
  }

  if (type == "blob") {
    xhr.responseType = BLOB_RESPONSE;
  }

  if (Object(core["isXml"])(type)) {
    // xhr.responseType = "document";
    xhr.overrideMimeType("text/xml"); // for OPF parsing
  }

  if (type == "xhtml") {// xhr.responseType = "document";
  }

  if (type == "html" || type == "htm") {// xhr.responseType = "document";
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
        } else if (Object(core["isXml"])(type)) {
          // xhr.overrideMimeType("text/xml"); // for OPF parsing
          // If this.responseXML wasn't set, try to parse using a DOMParser from text
          r = Object(core["parse"])(this.response, "text/xml");
        } else if (type == "xhtml") {
          r = Object(core["parse"])(this.response, "application/xhtml+xml");
        } else if (type == "html" || type == "htm") {
          r = Object(core["parse"])(this.response, "text/html");
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

/* harmony default export */ var utils_request = (request_request);
// EXTERNAL MODULE: external "xmldom"
var external_xmldom_ = __webpack_require__(38);

// CONCATENATED MODULE: ./src/section.js








/**
 * Represents a Section of the Book
 *
 * In most books this is equivelent to a Chapter
 * @param {object} item  The spine item representing the section
 * @param {object} hooks hooks for serialize and content
 */

class section_Section {
  constructor(item, hooks) {
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
      this.hooks.serialize = new hook["a" /* default */](this);
      this.hooks.content = new hook["a" /* default */](this);
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


  load(_request) {
    var request = _request || this.request || utils_request;
    var loading = new core["defer"]();
    var loaded = loading.promise;

    if (this.contents) {
      loading.resolve(this.contents);
    } else {
      request(this.url).then(function (xml) {
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


  base() {
    return Object(replacements["a" /* replaceBase */])(this.document, this);
  }
  /**
   * Render the contents of a section
   * @param  {method} [_request] a request method to use for loading
   * @return {string} output a serialized XML Document
   */


  render(_request) {
    var rendering = new core["defer"]();
    var rendered = rendering.promise;
    this.output; // TODO: better way to return this from hooks?

    this.load(_request).then(function (contents) {
      var userAgent = typeof navigator !== 'undefined' && navigator.userAgent || '';
      var isIE = userAgent.indexOf('Trident') >= 0;
      var Serializer;

      if (typeof XMLSerializer === "undefined" || isIE) {
        Serializer = external_xmldom_["XMLDOMParser"];
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


  find(_query) {
    var section = this;
    var matches = [];

    var query = _query.toLowerCase();

    var find = function (node) {
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
          cfi = section.cfiFromRange(range); // Generate the excerpt

          if (node.textContent.length < limit) {
            excerpt = node.textContent;
          } else {
            excerpt = node.textContent.substring(pos - limit / 2, pos + limit / 2);
            excerpt = "..." + excerpt + "...";
          } // Add the CFI to the matches list


          matches.push({
            cfi: cfi,
            excerpt: excerpt
          });
        }

        last = pos;
      }
    };

    Object(core["sprint"])(section.document, function (node) {
      find(node);
    });
    return matches;
  }

  /**
   * Search a string in multiple sequential Element of the section. If the document.createTreeWalker api is missed(eg: IE8), use `find` as a fallback.
   * @param  {string} _query The query string to search
   * @param  {int} maxSeqEle The maximum number of Element that are combined for search, defualt value is 5.
   * @return {object[]} A list of matches, with form {cfi, excerpt}
   */
  search(_query, maxSeqEle = 5) {
    if (typeof document.createTreeWalker == "undefined") {
      return this.find(_query);
    }

    let matches = [];
    const excerptLimit = 150;
    const section = this;

    const query = _query.toLowerCase();

    const search = function (nodeList) {
      const textWithCase = nodeList.reduce((acc, current) => {
        return acc + current.textContent;
      }, "");
      const text = textWithCase.toLowerCase();
      const pos = text.indexOf(query);

      if (pos != -1) {
        const startNodeIndex = 0,
              endPos = pos + query.length;
        let endNodeIndex = 0,
            l = 0;

        if (pos < nodeList[startNodeIndex].length) {
          let cfi;

          while (endNodeIndex < nodeList.length - 1) {
            l += nodeList[endNodeIndex].length;

            if (endPos <= l) {
              break;
            }

            endNodeIndex += 1;
          }

          let startNode = nodeList[startNodeIndex],
              endNode = nodeList[endNodeIndex];
          let range = section.document.createRange();
          range.setStart(startNode, pos);
          let beforeEndLengthCount = nodeList.slice(0, endNodeIndex).reduce((acc, current) => {
            return acc + current.textContent.length;
          }, 0);
          range.setEnd(endNode, beforeEndLengthCount > endPos ? endPos : endPos - beforeEndLengthCount);
          cfi = section.cfiFromRange(range);
          let excerpt = nodeList.slice(0, endNodeIndex + 1).reduce((acc, current) => {
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

    const treeWalker = document.createTreeWalker(section.document, NodeFilter.SHOW_TEXT, null, false);
    let node,
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


  reconcileLayoutSettings(globalLayout) {
    //-- Get the global defaults
    var settings = {
      layout: globalLayout.layout,
      spread: globalLayout.spread,
      orientation: globalLayout.orientation
    }; //-- Get the chapter's display type

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


  cfiFromRange(_range) {
    return new epubcfi["a" /* default */](_range, this.cfiBase).toString();
  }
  /**
   * Get a CFI from an Element in the Section
   * @param  {element} el
   * @return {string} cfi an EpubCFI string
   */


  cfiFromElement(el) {
    return new epubcfi["a" /* default */](el, this.cfiBase).toString();
  }
  /**
   * Unload the section document
   */


  unload() {
    this.document = undefined;
    this.contents = undefined;
    this.output = undefined;
  }

  destroy() {
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

}

/* harmony default export */ var src_section = (section_Section);
// CONCATENATED MODULE: ./src/spine.js




/**
 * A collection of Spine Items
 */

class spine_Spine {
  constructor() {
    this.spineItems = [];
    this.spineByHref = {};
    this.spineById = {};
    this.hooks = {};
    this.hooks.serialize = new hook["a" /* default */]();
    this.hooks.content = new hook["a" /* default */](); // Register replacements

    this.hooks.content.register(replacements["a" /* replaceBase */]);
    this.hooks.content.register(replacements["b" /* replaceCanonical */]);
    this.hooks.content.register(replacements["d" /* replaceMeta */]);
    this.epubcfi = new epubcfi["a" /* default */]();
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


  unpack(_package, resolver, canonical) {
    this.items = _package.spine;
    this.manifest = _package.manifest;
    this.spineNodeIndex = _package.spineNodeIndex;
    this.baseUrl = _package.baseUrl || _package.basePath || "";
    this.length = this.items.length;
    this.items.forEach((item, index) => {
      var manifestItem = this.manifest[item.idref];
      var spineItem;
      item.index = index;
      item.cfiBase = this.epubcfi.generateChapterComponent(this.spineNodeIndex, item.index, item.idref);

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
          let prevIndex = item.index;

          while (prevIndex > 0) {
            let prev = this.get(prevIndex - 1);

            if (prev && prev.linear) {
              return prev;
            }

            prevIndex -= 1;
          }

          return;
        }.bind(this);

        item.next = function () {
          let nextIndex = item.index;

          while (nextIndex < this.spineItems.length - 1) {
            let next = this.get(nextIndex + 1);

            if (next && next.linear) {
              return next;
            }

            nextIndex += 1;
          }

          return;
        }.bind(this);
      } else {
        item.prev = function () {
          return;
        };

        item.next = function () {
          return;
        };
      }

      spineItem = new src_section(item, this.hooks);
      this.append(spineItem);
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


  get(target) {
    var index = 0;

    if (typeof target === "undefined") {
      while (index < this.spineItems.length) {
        let next = this.spineItems[index];

        if (next && next.linear) {
          break;
        }

        index += 1;
      }
    } else if (this.epubcfi.isCfiString(target)) {
      let cfi = new epubcfi["a" /* default */](target);
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


  append(section) {
    var index = this.spineItems.length;
    section.index = index;
    this.spineItems.push(section); // Encode and Decode href lookups
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


  prepend(section) {
    // var index = this.spineItems.unshift(section);
    this.spineByHref[section.href] = 0;
    this.spineById[section.idref] = 0; // Re-index

    this.spineItems.forEach(function (item, index) {
      item.index = index;
    });
    return 0;
  } // insert(section, index) {
  //
  // };

  /**
   * Remove a Section from the Spine
   * @private
   * @param  {Section} section
   */


  remove(section) {
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


  each() {
    return this.spineItems.forEach.apply(this.spineItems, arguments);
  }
  /**
   * Find the first Section in the Spine
   * @return {Section} first section
   */


  first() {
    let index = 0;

    do {
      let next = this.get(index);

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


  last() {
    let index = this.spineItems.length - 1;

    do {
      let prev = this.get(index);

      if (prev && prev.linear) {
        return prev;
      }

      index -= 1;
    } while (index >= 0);
  }

  destroy() {
    this.each(section => section.destroy());
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

}

/* harmony default export */ var src_spine = (spine_Spine);
// EXTERNAL MODULE: ./src/utils/queue.js
var queue = __webpack_require__(21);

// EXTERNAL MODULE: ./src/utils/constants.js
var constants = __webpack_require__(1);

// CONCATENATED MODULE: ./src/locations.js






/**
 * Find Locations for a Book
 * @param {Spine} spine
 * @param {request} request
 * @param {number} [pause=100]
 */

class locations_Locations {
  constructor(spine, request, pause) {
    this.spine = spine;
    this.request = request;
    this.pause = pause || 100;
    this.q = new queue["a" /* default */](this);
    this.epubcfi = new epubcfi["a" /* default */]();
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


  generate(chars) {
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

      return this._locations; // console.log(this.percentage(this.book.rendition.location.start), this.percentage(this.book.rendition.location.end));
    }.bind(this));
  }

  createRange() {
    return {
      startContainer: undefined,
      startOffset: undefined,
      endContainer: undefined,
      endOffset: undefined
    };
  }

  process(section) {
    return section.load(this.request).then(function (contents) {
      var completed = new core["defer"]();
      var locations = this.parse(contents, section.cfiBase);
      this._locations = this._locations.concat(locations);
      section.unload();
      this.processingTimeout = setTimeout(() => completed.resolve(locations), this.pause);
      return completed.promise;
    }.bind(this));
  }

  parse(contents, cfiBase, chars) {
    var locations = [];
    var range;
    var doc = contents.ownerDocument;
    var body = Object(core["qs"])(doc, "body");
    var counter = 0;
    var prev;

    var _break = chars || this.break;

    var parser = function (node) {
      var len = node.length;
      var dist;
      var pos = 0;

      if (node.textContent.trim().length === 0) {
        return false; // continue
      } // Start range


      if (counter == 0) {
        range = this.createRange();
        range.startContainer = node;
        range.startOffset = 0;
      }

      dist = _break - counter; // Node is smaller than a break,
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
        } // pos += dist;
        // Gone over


        if (pos + dist >= len) {
          // Continue counter for next node
          counter += len - pos; // break

          pos = len; // At End
        } else {
          // Advance pos
          pos += dist; // End the previous range

          range.endContainer = node;
          range.endOffset = pos; // cfi = section.cfiFromRange(range);

          let cfi = new epubcfi["a" /* default */](range, cfiBase).toString();
          locations.push(cfi);
          counter = 0;
        }
      }

      prev = node;
    };

    Object(core["sprint"])(body, parser.bind(this)); // Close remaining

    if (range && range.startContainer && prev) {
      range.endContainer = prev;
      range.endOffset = prev.length;
      let cfi = new epubcfi["a" /* default */](range, cfiBase).toString();
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


  generateFromWords(startCfi, wordCount, count) {
    var start = startCfi ? new epubcfi["a" /* default */](startCfi) : undefined;
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

  processWords(section, wordCount, startCfi, count) {
    if (count && this._locationsWords.length >= count) {
      return Promise.resolve();
    }

    return section.load(this.request).then(function (contents) {
      var completed = new core["defer"]();
      var locations = this.parseWords(contents, section, wordCount, startCfi);
      var remainingCount = count - this._locationsWords.length;
      this._locationsWords = this._locationsWords.concat(locations.length >= count ? locations.slice(0, remainingCount) : locations);
      section.unload();
      this.processingTimeout = setTimeout(() => completed.resolve(locations), this.pause);
      return completed.promise;
    }.bind(this));
  } //http://stackoverflow.com/questions/18679576/counting-words-in-string


  countWords(s) {
    s = s.replace(/(^\s*)|(\s*$)/gi, ""); //exclude  start and end white-space

    s = s.replace(/[ ]{2,}/gi, " "); //2 or more space to 1

    s = s.replace(/\n /, "\n"); // exclude newline with a start spacing

    return s.split(" ").length;
  }

  parseWords(contents, section, wordCount, startCfi) {
    var cfiBase = section.cfiBase;
    var locations = [];
    var doc = contents.ownerDocument;
    var body = Object(core["qs"])(doc, "body");
    var prev;
    var _break = wordCount;
    var foundStartNode = startCfi ? startCfi.spinePos !== section.index : true;
    var startNode;

    if (startCfi && section.index === startCfi.spinePos) {
      startNode = startCfi.findNode(startCfi.range ? startCfi.path.steps.concat(startCfi.start.steps) : startCfi.path.steps, contents.ownerDocument);
    }

    var parser = function (node) {
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

      dist = _break - this._wordCounter; // Node is smaller than a break,
      // skip over it

      if (dist > len) {
        this._wordCounter += len;
        pos = len;
      }

      while (pos < len) {
        dist = _break - this._wordCounter; // Gone over

        if (pos + dist >= len) {
          // Continue counter for next node
          this._wordCounter += len - pos; // break

          pos = len; // At End
        } else {
          // Advance pos
          pos += dist;
          let cfi = new epubcfi["a" /* default */](node, cfiBase);
          locations.push({
            cfi: cfi.toString(),
            wordCount: this._wordCounter
          });
          this._wordCounter = 0;
        }
      }

      prev = node;
    };

    Object(core["sprint"])(body, parser.bind(this));
    return locations;
  }
  /**
   * Get a location from an EpubCFI
   * @param {EpubCFI} cfi
   * @return {number}
   */


  locationFromCfi(cfi) {
    let loc;

    if (epubcfi["a" /* default */].prototype.isCfiString(cfi)) {
      cfi = new epubcfi["a" /* default */](cfi);
    } // Check if the location has not been set yet


    if (this._locations.length === 0) {
      return -1;
    }

    loc = Object(core["locationOf"])(cfi, this._locations, this.epubcfi.compare);

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


  percentageFromCfi(cfi) {
    if (this._locations.length === 0) {
      return null;
    } // Find closest cfi


    var loc = this.locationFromCfi(cfi); // Get percentage in total

    return this.percentageFromLocation(loc);
  }
  /**
   * Get a percentage position from a location index
   * @param {number} location
   * @return {number}
   */


  percentageFromLocation(loc) {
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


  cfiFromLocation(loc) {
    var cfi = -1; // check that pg is an int

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


  cfiFromPercentage(percentage) {
    let loc;

    if (percentage > 1) {
      console.warn("Normalize cfiFromPercentage value to between 0 - 1");
    } // Make sure 1 goes to very end


    if (percentage >= 1) {
      let cfi = new epubcfi["a" /* default */](this._locations[this.total]);
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


  load(locations) {
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


  save() {
    return JSON.stringify(this._locations);
  }

  getCurrent() {
    return this._current;
  }

  setCurrent(curr) {
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

    this.emit(constants["c" /* EVENTS */].LOCATIONS.CHANGED, {
      percentage: this.percentageFromLocation(loc)
    });
  }
  /**
   * Get the current location
   */


  get currentLocation() {
    return this._current;
  }
  /**
   * Set the current location
   */


  set currentLocation(curr) {
    this.setCurrent(curr);
  }
  /**
   * Locations length
   */


  length() {
    return this._locations.length;
  }

  destroy() {
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

}

event_emitter_default()(locations_Locations.prototype);
/* harmony default export */ var src_locations = (locations_Locations);
// EXTERNAL MODULE: ./node_modules/path-webpack/path.js
var path_webpack_path = __webpack_require__(9);
var path_default = /*#__PURE__*/__webpack_require__.n(path_webpack_path);

// CONCATENATED MODULE: ./src/container.js


/**
 * Handles Parsing and Accessing an Epub Container
 * @class
 * @param {document} [containerDocument] xml document
 */

class container_Container {
  constructor(containerDocument) {
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


  parse(containerDocument) {
    //-- <rootfile full-path="OPS/package.opf" media-type="application/oebps-package+xml"/>
    var rootfile;

    if (!containerDocument) {
      throw new Error("Container File Not Found");
    }

    rootfile = Object(core["qs"])(containerDocument, "rootfile");

    if (!rootfile) {
      throw new Error("No RootFile Found");
    }

    this.packagePath = rootfile.getAttribute("full-path");
    this.directory = path_default.a.dirname(this.packagePath);
    this.encoding = containerDocument.xmlEncoding;
  }

  destroy() {
    this.packagePath = undefined;
    this.directory = undefined;
    this.encoding = undefined;
  }

}

/* harmony default export */ var container = (container_Container);
// CONCATENATED MODULE: ./src/packaging.js

/**
 * Open Packaging Format Parser
 * @class
 * @param {document} packageDocument OPF XML
 */

class packaging_Packaging {
  constructor(packageDocument) {
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


  parse(packageDocument) {
    var metadataNode, manifestNode, spineNode;

    if (!packageDocument) {
      throw new Error("Package File Not Found");
    }

    metadataNode = Object(core["qs"])(packageDocument, "metadata");

    if (!metadataNode) {
      throw new Error("No Metadata Found");
    }

    manifestNode = Object(core["qs"])(packageDocument, "manifest");

    if (!manifestNode) {
      throw new Error("No Manifest Found");
    }

    spineNode = Object(core["qs"])(packageDocument, "spine");

    if (!spineNode) {
      throw new Error("No Spine Found");
    }

    this.manifest = this.parseManifest(manifestNode);
    this.navPath = this.findNavPath(manifestNode);
    this.ncxPath = this.findNcxPath(manifestNode, spineNode);
    this.coverPath = this.findCoverPath(packageDocument);
    this.spineNodeIndex = Object(core["indexOfElementNode"])(spineNode);
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


  parseMetadata(xml) {
    var metadata = {};
    metadata.title = this.getElementText(xml, "title");
    metadata.creator = this.getElementText(xml, "creator");
    metadata.description = this.getElementText(xml, "description");
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
    metadata.spread = this.getPropertyText(xml, "rendition:spread"); // metadata.page_prog_dir = packageXml.querySelector("spine").getAttribute("page-progression-direction");

    return metadata;
  }
  /**
   * Parse Manifest
   * @private
   * @param  {node} manifestXml
   * @return {object} manifest
   */


  parseManifest(manifestXml) {
    var manifest = {}; //-- Turn items into an array
    // var selected = manifestXml.querySelectorAll("item");

    var selected = Object(core["qsa"])(manifestXml, "item");
    var items = Array.prototype.slice.call(selected); //-- Create an object with the id as key

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


  parseSpine(spineXml, manifest) {
    var spine = [];
    var selected = Object(core["qsa"])(spineXml, "itemref");
    var items = Array.prototype.slice.call(selected); // var epubcfi = new EpubCFI();
    //-- Add to array to mantain ordering and cross reference with manifest

    items.forEach(function (item, index) {
      var idref = item.getAttribute("idref"); // var cfiBase = epubcfi.generateChapterComponent(spineNodeIndex, index, Id);

      var props = item.getAttribute("properties") || "";
      var propArray = props.length ? props.split(" ") : []; // var manifestProps = manifest[Id].properties;
      // var manifestPropArray = manifestProps.length ? manifestProps.split(" ") : [];

      var itemref = {
        "idref": idref,
        "linear": item.getAttribute("linear") || "yes",
        "properties": propArray,
        // "href" : manifest[Id].href,
        // "url" :  manifest[Id].url,
        "index": index // "cfiBase" : cfiBase

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


  findUniqueIdentifier(packageXml) {
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


  findNavPath(manifestNode) {
    // Find item with property "nav"
    // Should catch nav irregardless of order
    // var node = manifestNode.querySelector("item[properties$='nav'], item[properties^='nav '], item[properties*=' nav ']");
    var node = Object(core["qsp"])(manifestNode, "item", {
      "properties": "nav"
    });
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


  findNcxPath(manifestNode, spineNode) {
    // var node = manifestNode.querySelector("item[media-type='application/x-dtbncx+xml']");
    var node = Object(core["qsp"])(manifestNode, "item", {
      "media-type": "application/x-dtbncx+xml"
    });
    var tocId; // If we can't find the toc by media-type then try to look for id of the item in the spine attributes as
    // according to http://www.idpf.org/epub/20/spec/OPF_2.0.1_draft.htm#Section2.4.1.2,
    // "The item that describes the NCX must be referenced by the spine toc attribute."

    if (!node) {
      tocId = spineNode.getAttribute("toc");

      if (tocId) {
        // node = manifestNode.querySelector("item[id='" + tocId + "']");
        node = manifestNode.querySelector(`#${tocId}`);
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


  findCoverPath(packageXml) {
    var pkg = Object(core["qs"])(packageXml, "package");
    var epubVersion = pkg.getAttribute("version"); // Try parsing cover with epub 3.
    // var node = packageXml.querySelector("item[properties='cover-image']");

    var node = Object(core["qsp"])(packageXml, "item", {
      "properties": "cover-image"
    });
    if (node) return node.getAttribute("href"); // Fallback to epub 2.

    var metaCover = Object(core["qsp"])(packageXml, "meta", {
      "name": "cover"
    });

    if (metaCover) {
      var coverId = metaCover.getAttribute("content"); // var cover = packageXml.querySelector("item[id='" + coverId + "']");

      var cover = packageXml.getElementById(coverId);
      return cover ? cover.getAttribute("href") : "";
    } else {
      return false;
    }
  }
  /**
   * Get text of a namespaced element
   * @private
   * @param  {node} xml
   * @param  {string} tag
   * @return {string} text
   */


  getElementText(xml, tag) {
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


  getPropertyText(xml, property) {
    var el = Object(core["qsp"])(xml, "meta", {
      "property": property
    });

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


  load(json) {
    this.metadata = json.metadata;
    let spine = json.readingOrder || json.spine;
    this.spine = spine.map((item, index) => {
      item.index = index;
      item.linear = item.linear || "yes";
      return item;
    });
    json.resources.forEach((item, index) => {
      this.manifest[index] = item;

      if (item.rel && item.rel[0] === "cover") {
        this.coverPath = item.href;
      }
    });
    this.spineNodeIndex = 0;
    this.toc = json.toc.map((item, index) => {
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

  destroy() {
    this.manifest = undefined;
    this.navPath = undefined;
    this.ncxPath = undefined;
    this.coverPath = undefined;
    this.spineNodeIndex = undefined;
    this.spine = undefined;
    this.metadata = undefined;
  }

}

/* harmony default export */ var src_packaging = (packaging_Packaging);
// CONCATENATED MODULE: ./src/navigation.js

/**
 * Navigation Parser
 * @param {document} xml navigation html / xhtml / ncx
 */

class navigation_Navigation {
  constructor(xml) {
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


  parse(xml) {
    let isXml = xml.nodeType;
    let html;
    let ncx;

    if (isXml) {
      html = Object(core["qs"])(xml, "html");
      ncx = Object(core["qs"])(xml, "ncx");
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


  unpack(toc) {
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


  get(target) {
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


  getByIndex(target, index, navItems) {
    if (navItems.length === 0) {
      return;
    }

    const item = navItems[index];

    if (item && (target === item.id || target === item.href)) {
      return item;
    } else {
      let result;

      for (let i = 0; i < navItems.length; ++i) {
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


  landmark(type) {
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


  parseNav(navHtml) {
    var navElement = Object(core["querySelectorByType"])(navHtml, "nav", "toc");
    var navItems = navElement ? Object(core["qsa"])(navElement, "li") : [];
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


  navItem(item) {
    let id = item.getAttribute("id") || undefined;
    let content = Object(core["filterChildren"])(item, "a", true);

    if (!content) {
      return;
    }

    let src = content.getAttribute("href") || "";

    if (!id) {
      id = src;
    }

    let text = content.textContent || "";
    let subitems = [];
    let parentItem = Object(core["getParentByTagName"])(item, "li");
    let parent;

    if (parentItem) {
      parent = parentItem.getAttribute("id");

      if (!parent) {
        const parentContent = Object(core["filterChildren"])(parentItem, "a", true);
        parent = parentContent && parentContent.getAttribute("href");
      }
    }

    while (!parent && parentItem) {
      parentItem = Object(core["getParentByTagName"])(parentItem, "li");

      if (parentItem) {
        parent = parentItem.getAttribute("id");

        if (!parent) {
          const parentContent = Object(core["filterChildren"])(parentItem, "a", true);
          parent = parentContent && parentContent.getAttribute("href");
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


  parseLandmarks(navHtml) {
    var navElement = Object(core["querySelectorByType"])(navHtml, "nav", "landmarks");
    var navItems = navElement ? Object(core["qsa"])(navElement, "li") : [];
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


  landmarkItem(item) {
    let content = Object(core["filterChildren"])(item, "a", true);

    if (!content) {
      return;
    }

    let type = content.getAttributeNS("http://www.idpf.org/2007/ops", "type") || undefined;
    let href = content.getAttribute("href") || "";
    let text = content.textContent || "";
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


  parseNcx(tocXml) {
    var navPoints = Object(core["qsa"])(tocXml, "navPoint");
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


  ncxItem(item) {
    var id = item.getAttribute("id") || false,
        content = Object(core["qs"])(item, "content"),
        src = content.getAttribute("src"),
        navLabel = Object(core["qs"])(item, "navLabel"),
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


  load(json) {
    return json.map(item => {
      item.label = item.title;
      item.subitems = item.children ? this.load(item.children) : [];
      return item;
    });
  }
  /**
   * forEach pass through
   * @param  {Function} fn function to run on each item
   * @return {method} forEach loop
   */


  forEach(fn) {
    return this.toc.forEach(fn);
  }

}

/* harmony default export */ var navigation = (navigation_Navigation);
// CONCATENATED MODULE: ./libs/mime/mime.js
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

var mime_mimeTypes = function () {
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
  return filename && mime_mimeTypes[filename.split(".").pop().toLowerCase()] || defaultValue;
}

;
/* harmony default export */ var mime = ({
  lookup
});
// CONCATENATED MODULE: ./src/resources.js







/**
 * Handle Package Resources
 * @class
 * @param {Manifest} manifest
 * @param {object} [options]
 * @param {string} [options.replacements="base64"]
 * @param {Archive} [options.archive]
 * @param {method} [options.resolver]
 */

class resources_Resources {
  constructor(manifest, options) {
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


  process(manifest) {
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


  split() {
    // HTML
    this.html = this.resources.filter(function (item) {
      if (item.type === "application/xhtml+xml" || item.type === "text/html") {
        return true;
      }
    }); // Exclude HTML

    this.assets = this.resources.filter(function (item) {
      if (item.type !== "application/xhtml+xml" && item.type !== "text/html") {
        return true;
      }
    }); // Only CSS

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


  splitUrls() {
    // All Assets Urls
    this.urls = this.assets.map(function (item) {
      return item.href;
    }.bind(this)); // Css Urls

    this.cssUrls = this.css.map(function (item) {
      return item.href;
    });
  }
  /**
   * Create a url to a resource
   * @param {string} url
   * @return {Promise<string>} Promise resolves with url string
   */


  createUrl(url) {
    var parsedUrl = new utils_url["a" /* default */](url);
    var mimeType = mime.lookup(parsedUrl.filename);

    if (this.settings.archive) {
      return this.settings.archive.createUrl(url, {
        "base64": this.settings.replacements === "base64"
      });
    } else {
      if (this.settings.replacements === "base64") {
        return this.settings.request(url, 'blob').then(blob => {
          return Object(core["blob2base64"])(blob);
        }).then(blob => {
          return Object(core["createBase64Url"])(blob, mimeType);
        });
      } else {
        return this.settings.request(url, 'blob').then(blob => {
          return Object(core["createBlobUrl"])(blob, mimeType);
        });
      }
    }
  }
  /**
   * Create blob urls for all the assets
   * @return {Promise}         returns replacement urls
   */


  replacements() {
    if (this.settings.replacements === "none") {
      return new Promise(function (resolve) {
        resolve(this.urls);
      }.bind(this));
    }

    var replacements = this.urls.map(url => {
      var absolute = this.settings.resolver(url);
      return this.createUrl(absolute).catch(err => {
        console.error(err);
        return null;
      });
    });
    return Promise.all(replacements).then(replacementUrls => {
      this.replacementUrls = replacementUrls.filter(url => {
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


  replaceCss(archive, resolver) {
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


  createCssFile(href) {
    var newUrl;

    if (path_default.a.isAbsolute(href)) {
      return new Promise(function (resolve) {
        resolve();
      });
    }

    var absolute = this.settings.resolver(href); // Get the text of the css file from the archive

    var textResponse;

    if (this.settings.archive) {
      textResponse = this.settings.archive.getText(absolute);
    } else {
      textResponse = this.settings.request(absolute, "text");
    } // Get asset links relative to css file


    var relUrls = this.urls.map(assetHref => {
      var resolved = this.settings.resolver(assetHref);
      var relative = new utils_path["a" /* default */](absolute).relative(resolved);
      return relative;
    });

    if (!textResponse) {
      // file not found, don't replace
      return new Promise(function (resolve) {
        resolve();
      });
    }

    return textResponse.then(text => {
      // Replacements in the css text
      text = Object(replacements["e" /* substitute */])(text, relUrls, this.replacementUrls); // Get the new url

      if (this.settings.replacements === "base64") {
        newUrl = Object(core["createBase64Url"])(text, "text/css");
      } else {
        newUrl = Object(core["createBlobUrl"])(text, "text/css");
      }

      return newUrl;
    }, err => {
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


  relativeTo(absolute, resolver) {
    resolver = resolver || this.settings.resolver; // Get Urls relative to current sections

    return this.urls.map(function (href) {
      var resolved = resolver(href);
      var relative = new utils_path["a" /* default */](absolute).relative(resolved);
      return relative;
    }.bind(this));
  }
  /**
   * Get a URL for a resource
   * @param  {string} path
   * @return {string} url
   */


  get(path) {
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


  substitute(content, url) {
    var relUrls;

    if (url) {
      relUrls = this.relativeTo(url);
    } else {
      relUrls = this.urls;
    }

    return Object(replacements["e" /* substitute */])(content, relUrls, this.replacementUrls);
  }

  destroy() {
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

}

/* harmony default export */ var resources = (resources_Resources);
// CONCATENATED MODULE: ./src/pagelist.js


/**
 * Page List Parser
 * @param {document} [xml]
 */

class pagelist_PageList {
  constructor(xml) {
    this.pages = [];
    this.locations = [];
    this.epubcfi = new epubcfi["a" /* default */]();
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


  parse(xml) {
    var html = Object(core["qs"])(xml, "html");
    var ncx = Object(core["qs"])(xml, "ncx");

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


  parseNav(navHtml) {
    var navElement = Object(core["querySelectorByType"])(navHtml, "nav", "page-list");
    var navItems = navElement ? Object(core["qsa"])(navElement, "li") : [];
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

  parseNcx(navXml) {
    var list = [];
    var i = 0;
    var item;
    var pageList;
    var pageTargets;
    var length = 0;
    pageList = Object(core["qs"])(navXml, "pageList");
    if (!pageList) return list;
    pageTargets = Object(core["qsa"])(pageList, "pageTarget");
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

  ncxItem(item) {
    var navLabel = Object(core["qs"])(item, "navLabel");
    var navLabelText = Object(core["qs"])(navLabel, "text");
    var pageText = navLabelText.textContent;
    var content = Object(core["qs"])(item, "content");
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


  item(item) {
    var content = Object(core["qs"])(item, "a"),
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


  process(pageList) {
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


  pageFromCfi(cfi) {
    var pg = -1; // Check if the pageList has not been set yet

    if (this.locations.length === 0) {
      return -1;
    } // TODO: check if CFI is valid?
    // check if the cfi is in the location list
    // var index = this.locations.indexOf(cfi);


    var index = Object(core["indexOfSorted"])(cfi, this.locations, this.epubcfi.compare);

    if (index != -1) {
      pg = this.pages[index];
    } else {
      // Otherwise add it to the list of locations
      // Insert it in the correct position in the locations page
      //index = EPUBJS.core.insert(cfi, this.locations, this.epubcfi.compare);
      index = Object(core["locationOf"])(cfi, this.locations, this.epubcfi.compare); // Get the page at the location just before the new one, or return the first

      pg = index - 1 >= 0 ? this.pages[index - 1] : this.pages[0];

      if (pg !== undefined) {// Add the new page in so that the locations and page array match up
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


  cfiFromPage(pg) {
    var cfi = -1; // check that pg is an int

    if (typeof pg != "number") {
      pg = parseInt(pg);
    } // check if the cfi is in the page list
    // Pages could be unsorted.


    var index = this.pages.indexOf(pg);

    if (index != -1) {
      cfi = this.locations[index];
    } // TODO: handle pages not in the list


    return cfi;
  }
  /**
   * Get a Page from Book percentage
   * @param  {number} percent
   * @return {number} page
   */


  pageFromPercentage(percent) {
    var pg = Math.round(this.totalPages * percent);
    return pg;
  }
  /**
   * Returns a value between 0 - 1 corresponding to the location of a page
   * @param  {number} pg the page
   * @return {number} percentage
   */


  percentageFromPage(pg) {
    var percentage = (pg - this.firstPage) / this.totalPages;
    return Math.round(percentage * 1000) / 1000;
  }
  /**
   * Returns a value between 0 - 1 corresponding to the location of a cfi
   * @param  {string} cfi EpubCFI String
   * @return {number} percentage
   */


  percentageFromCfi(cfi) {
    var pg = this.pageFromCfi(cfi);
    var percentage = this.percentageFromPage(pg);
    return percentage;
  }
  /**
   * Destroy
   */


  destroy() {
    this.pages = undefined;
    this.locations = undefined;
    this.epubcfi = undefined;
    this.pageList = undefined;
    this.toc = undefined;
    this.ncx = undefined;
  }

}

/* harmony default export */ var pagelist = (pagelist_PageList);
// EXTERNAL MODULE: ./src/rendition.js + 3 modules
var rendition = __webpack_require__(39);

// EXTERNAL MODULE: external "JSZip"
var external_JSZip_ = __webpack_require__(85);
var external_JSZip_default = /*#__PURE__*/__webpack_require__.n(external_JSZip_);

// CONCATENATED MODULE: ./src/archive.js







/**
 * Handles Unzipping a requesting files from an Epub Archive
 * @class
 */

class archive_Archive {
  constructor() {
    this.zip = undefined;
    this.urlCache = {};
    this.checkRequirements();
  }
  /**
   * Checks to see if JSZip exists in global namspace,
   * Requires JSZip if it isn't there
   * @private
   */


  checkRequirements() {
    try {
      this.zip = new external_JSZip_default.a();
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


  open(input, isBase64) {
    return this.zip.loadAsync(input, {
      "base64": isBase64
    });
  }
  /**
   * Load and Open an archive
   * @param  {string} zipUrl
   * @param  {boolean} [isBase64] tells JSZip if the input data is base64 encoded
   * @return {Promise} zipfile
   */


  openUrl(zipUrl, isBase64) {
    return utils_request(zipUrl, "binary").then(function (data) {
      return this.zip.loadAsync(data, {
        "base64": isBase64
      });
    }.bind(this));
  }
  /**
   * Request a url from the archive
   * @param  {string} url  a url to request from the archive
   * @param  {string} [type] specify the type of the returned result
   * @return {Promise<Blob | string | JSON | Document | XMLDocument>}
   */


  request(url, type) {
    var deferred = new core["defer"]();
    var response;
    var path = new utils_path["a" /* default */](url); // If type isn't set, determine it from the file extension

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
        let result = this.handleResponse(r, type);
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


  handleResponse(response, type) {
    var r;

    if (type == "json") {
      r = JSON.parse(response);
    } else if (Object(core["isXml"])(type)) {
      r = Object(core["parse"])(response, "text/xml");
    } else if (type == "xhtml") {
      r = Object(core["parse"])(response, "application/xhtml+xml");
    } else if (type == "html" || type == "htm") {
      r = Object(core["parse"])(response, "text/html");
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


  getBlob(url, mimeType) {
    var decodededUrl = window.decodeURIComponent(url.substr(1)); // Remove first slash

    var entry = this.zip.file(decodededUrl);

    if (entry) {
      mimeType = mimeType || mime.lookup(entry.name);
      return entry.async("uint8array").then(function (uint8array) {
        return new Blob([uint8array], {
          type: mimeType
        });
      });
    }
  }
  /**
   * Get Text from Archive by Url
   * @param  {string} url
   * @param  {string} [encoding]
   * @return {string}
   */


  getText(url, encoding) {
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


  getBase64(url, mimeType) {
    var decodededUrl = window.decodeURIComponent(url.substr(1)); // Remove first slash

    var entry = this.zip.file(decodededUrl);

    if (entry) {
      mimeType = mimeType || mime.lookup(entry.name);
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


  createUrl(url, options) {
    var deferred = new core["defer"]();

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


  revokeUrl(url) {
    var _URL = window.URL || window.webkitURL || window.mozURL;

    var fromCache = this.urlCache[url];
    if (fromCache) _URL.revokeObjectURL(fromCache);
  }

  destroy() {
    var _URL = window.URL || window.webkitURL || window.mozURL;

    for (let fromCache in this.urlCache) {
      _URL.revokeObjectURL(fromCache);
    }

    this.zip = undefined;
    this.urlCache = {};
  }

}

/* harmony default export */ var archive = (archive_Archive);
// EXTERNAL MODULE: ./node_modules/localforage/dist/localforage.js
var localforage = __webpack_require__(57);
var localforage_default = /*#__PURE__*/__webpack_require__.n(localforage);

// CONCATENATED MODULE: ./src/store.js








/**
 * Handles saving and requesting files from local storage
 * @class
 * @param {string} name This should be the name of the application for modals
 * @param {function} [requester]
 * @param {function} [resolver]
 */

class store_Store {
  constructor(name, requester, resolver) {
    this.urlCache = {};
    this.storage = undefined;
    this.name = name;
    this.requester = requester || utils_request;
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


  checkRequirements() {
    try {
      let store;

      if (typeof localforage_default.a === "undefined") {
        store = localforage_default.a;
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


  addListeners() {
    this._status = this.status.bind(this);
    window.addEventListener('online', this._status);
    window.addEventListener('offline', this._status);
  }
  /**
   * Remove online and offline event listeners
   * @private
   */


  removeListeners() {
    window.removeEventListener('online', this._status);
    window.removeEventListener('offline', this._status);
    this._status = undefined;
  }
  /**
   * Update the online / offline status
   * @private
   */


  status(event) {
    let online = navigator.onLine;
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


  add(resources, force) {
    let mapped = resources.resources.map(item => {
      let {
        href
      } = item;
      let url = this.resolver(href);
      let encodedUrl = window.encodeURIComponent(url);
      return this.storage.getItem(encodedUrl).then(item => {
        if (!item || force) {
          return this.requester(url, "binary").then(data => {
            return this.storage.setItem(encodedUrl, data);
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


  put(url, withCredentials, headers) {
    let encodedUrl = window.encodeURIComponent(url);
    return this.storage.getItem(encodedUrl).then(result => {
      if (!result) {
        return this.requester(url, "binary", withCredentials, headers).then(data => {
          return this.storage.setItem(encodedUrl, data);
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


  request(url, type, withCredentials, headers) {
    if (this.online) {
      // From network
      return this.requester(url, type, withCredentials, headers).then(data => {
        // save to store if not present
        this.put(url);
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


  retrieve(url, type) {
    var deferred = new core["defer"]();
    var response;
    var path = new utils_path["a" /* default */](url); // If type isn't set, determine it from the file extension

    if (!type) {
      type = path.extension;
    }

    if (type == "blob") {
      response = this.getBlob(url);
    } else {
      response = this.getText(url);
    }

    return response.then(r => {
      var deferred = new core["defer"]();
      var result;

      if (r) {
        result = this.handleResponse(r, type);
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


  handleResponse(response, type) {
    var r;

    if (type == "json") {
      r = JSON.parse(response);
    } else if (Object(core["isXml"])(type)) {
      r = Object(core["parse"])(response, "text/xml");
    } else if (type == "xhtml") {
      r = Object(core["parse"])(response, "application/xhtml+xml");
    } else if (type == "html" || type == "htm") {
      r = Object(core["parse"])(response, "text/html");
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


  getBlob(url, mimeType) {
    let encodedUrl = window.encodeURIComponent(url);
    return this.storage.getItem(encodedUrl).then(function (uint8array) {
      if (!uint8array) return;
      mimeType = mimeType || mime.lookup(url);
      return new Blob([uint8array], {
        type: mimeType
      });
    });
  }
  /**
   * Get Text from Storage by Url
   * @param  {string} url
   * @param  {string} [mimeType]
   * @return {string}
   */


  getText(url, mimeType) {
    let encodedUrl = window.encodeURIComponent(url);
    mimeType = mimeType || mime.lookup(url);
    return this.storage.getItem(encodedUrl).then(function (uint8array) {
      var deferred = new core["defer"]();
      var reader = new FileReader();
      var blob;
      if (!uint8array) return;
      blob = new Blob([uint8array], {
        type: mimeType
      });
      reader.addEventListener("loadend", () => {
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


  getBase64(url, mimeType) {
    let encodedUrl = window.encodeURIComponent(url);
    mimeType = mimeType || mime.lookup(url);
    return this.storage.getItem(encodedUrl).then(uint8array => {
      var deferred = new core["defer"]();
      var reader = new FileReader();
      var blob;
      if (!uint8array) return;
      blob = new Blob([uint8array], {
        type: mimeType
      });
      reader.addEventListener("loadend", () => {
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


  createUrl(url, options) {
    var deferred = new core["defer"]();

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


  revokeUrl(url) {
    var _URL = window.URL || window.webkitURL || window.mozURL;

    var fromCache = this.urlCache[url];
    if (fromCache) _URL.revokeObjectURL(fromCache);
  }

  destroy() {
    var _URL = window.URL || window.webkitURL || window.mozURL;

    for (let fromCache in this.urlCache) {
      _URL.revokeObjectURL(fromCache);
    }

    this.urlCache = {};
    this.removeListeners();
  }

}

event_emitter_default()(store_Store.prototype);
/* harmony default export */ var src_store = (store_Store);
// CONCATENATED MODULE: ./src/displayoptions.js

/**
 * Open DisplayOptions Format Parser
 * @class
 * @param {document} displayOptionsDocument XML
 */

class displayoptions_DisplayOptions {
  constructor(displayOptionsDocument) {
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


  parse(displayOptionsDocument) {
    if (!displayOptionsDocument) {
      return this;
    }

    const displayOptionsNode = Object(core["qs"])(displayOptionsDocument, "display_options");

    if (!displayOptionsNode) {
      return this;
    }

    const options = Object(core["qsa"])(displayOptionsNode, "option");
    options.forEach(el => {
      let value = "";

      if (el.childNodes.length) {
        value = el.childNodes[0].nodeValue;
      }

      switch (el.attributes.name.value) {
        case "interactive":
          this.interactive = value;
          break;

        case "fixed-layout":
          this.fixedLayout = value;
          break;

        case "open-to-spread":
          this.openToSpread = value;
          break;

        case "orientation-lock":
          this.orientationLock = value;
          break;
      }
    });
    return this;
  }

  destroy() {
    this.interactive = undefined;
    this.fixedLayout = undefined;
    this.openToSpread = undefined;
    this.orientationLock = undefined;
  }

}

/* harmony default export */ var displayoptions = (displayoptions_DisplayOptions);
// CONCATENATED MODULE: ./src/book.js




















const CONTAINER_PATH = "META-INF/container.xml";
const IBOOKS_DISPLAY_OPTIONS_PATH = "META-INF/com.apple.ibooks.display-options.xml";
const INPUT_TYPE = {
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

class book_Book {
  constructor(url, options) {
    // Allow passing just options to the Book
    if (typeof options === "undefined" && typeof url !== "string" && url instanceof Blob === false && url instanceof ArrayBuffer === false) {
      options = url;
      url = undefined;
    }

    this.settings = Object(core["extend"])(this.settings || {}, {
      requestMethod: undefined,
      requestCredentials: undefined,
      requestHeaders: undefined,
      encoding: undefined,
      replacements: undefined,
      canonical: undefined,
      openAs: undefined,
      store: undefined
    });
    Object(core["extend"])(this.settings, options); // Promises

    this.opening = new core["defer"]();
    /**
     * @member {promise} opened returns after the book is loaded
     * @memberof Book
     */

    this.opened = this.opening.promise;
    this.isOpen = false;
    this.loading = {
      manifest: new core["defer"](),
      spine: new core["defer"](),
      metadata: new core["defer"](),
      cover: new core["defer"](),
      navigation: new core["defer"](),
      pageList: new core["defer"](),
      resources: new core["defer"](),
      displayOptions: new core["defer"]()
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

    this.ready = Promise.all([this.loaded.manifest, this.loaded.spine, this.loaded.metadata, this.loaded.cover, this.loaded.navigation, this.loaded.resources, this.loaded.displayOptions]); // Queue for methods used before opening

    this.isRendered = false; // this._q = queue(this);

    /**
     * @member {method} request
     * @memberof Book
     * @private
     */

    this.request = this.settings.requestMethod || utils_request;
    /**
     * @member {Spine} spine
     * @memberof Book
     */

    this.spine = new src_spine();
    /**
     * @member {Locations} locations
     * @memberof Book
     */

    this.locations = new src_locations(this.spine, this.load.bind(this));
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

    this.displayOptions = undefined; // this.toc = undefined;

    if (this.settings.store) {
      this.store(this.settings.store);
    }

    if (url) {
      this.open(url, this.settings.openAs).catch(error => {
        var err = new Error("Cannot load book at " + url);
        this.emit(constants["c" /* EVENTS */].BOOK.OPEN_FAILED, err);
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


  open(input, what) {
    var opening;
    var type = what || this.determineType(input);

    if (type === INPUT_TYPE.BINARY) {
      this.archived = true;
      this.url = new utils_url["a" /* default */]("/", "");
      opening = this.openEpub(input);
    } else if (type === INPUT_TYPE.BASE64) {
      this.archived = true;
      this.url = new utils_url["a" /* default */]("/", "");
      opening = this.openEpub(input, type);
    } else if (type === INPUT_TYPE.EPUB) {
      this.archived = true;
      this.url = new utils_url["a" /* default */]("/", "");
      opening = this.request(input, "binary", this.settings.requestCredentials, this.settings.requestHeaders).then(this.openEpub.bind(this));
    } else if (type == INPUT_TYPE.OPF) {
      this.url = new utils_url["a" /* default */](input);
      opening = this.openPackaging(this.url.Path.toString());
    } else if (type == INPUT_TYPE.MANIFEST) {
      this.url = new utils_url["a" /* default */](input);
      opening = this.openManifest(this.url.Path.toString());
    } else {
      this.url = new utils_url["a" /* default */](input);
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


  openEpub(data, encoding) {
    return this.unarchive(data, encoding || this.settings.encoding).then(() => {
      return this.openContainer(CONTAINER_PATH);
    }).then(packagePath => {
      return this.openPackaging(packagePath);
    });
  }
  /**
   * Open the epub container
   * @private
   * @param  {string} url
   * @return {string} packagePath
   */


  openContainer(url) {
    return this.load(url).then(xml => {
      this.container = new container(xml);
      return this.resolve(this.container.packagePath);
    });
  }
  /**
   * Open the Open Packaging Format Xml
   * @private
   * @param  {string} url
   * @return {Promise}
   */


  openPackaging(url) {
    this.path = new utils_path["a" /* default */](url);
    return this.load(url).then(xml => {
      this.packaging = new src_packaging(xml);
      return this.unpack(this.packaging);
    });
  }
  /**
   * Open the manifest JSON
   * @private
   * @param  {string} url
   * @return {Promise}
   */


  openManifest(url) {
    this.path = new utils_path["a" /* default */](url);
    return this.load(url).then(json => {
      this.packaging = new src_packaging();
      this.packaging.load(json);
      return this.unpack(this.packaging);
    });
  }
  /**
   * Load a resource from the Book
   * @param  {string} path path to the resource to load
   * @return {Promise}     returns a promise with the requested resource
   */


  load(path) {
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


  resolve(path, absolute) {
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


  canonical(path) {
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


  determineType(input) {
    var url;
    var path;
    var extension;

    if (this.settings.encoding === "base64") {
      return INPUT_TYPE.BASE64;
    }

    if (typeof input != "string") {
      return INPUT_TYPE.BINARY;
    }

    url = new utils_url["a" /* default */](input);
    path = url.path();
    extension = path.extension; // If there's a search string, remove it before determining type

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


  unpack(packaging) {
    this.package = packaging; //TODO: deprecated this

    if (this.packaging.metadata.layout === "") {
      // rendition:layout not set - check display options if book is pre-paginated
      this.load(this.url.resolve(IBOOKS_DISPLAY_OPTIONS_PATH)).then(xml => {
        this.displayOptions = new displayoptions(xml);
        this.loading.displayOptions.resolve(this.displayOptions);
      }).catch(err => {
        this.displayOptions = new displayoptions();
        this.loading.displayOptions.resolve(this.displayOptions);
      });
    } else {
      this.displayOptions = new displayoptions();
      this.loading.displayOptions.resolve(this.displayOptions);
    }

    this.spine.unpack(this.packaging, this.resolve.bind(this), this.canonical.bind(this));
    this.resources = new resources(this.packaging.manifest, {
      archive: this.archive,
      resolver: this.resolve.bind(this),
      request: this.request.bind(this),
      replacements: this.settings.replacements || (this.archived ? "blobUrl" : "base64")
    });
    this.loadNavigation(this.packaging).then(() => {
      // this.toc = this.navigation.toc;
      this.loading.navigation.resolve(this.navigation);
    });

    if (this.packaging.coverPath) {
      this.cover = this.resolve(this.packaging.coverPath);
    } // Resolve promises


    this.loading.manifest.resolve(this.packaging.manifest);
    this.loading.metadata.resolve(this.packaging.metadata);
    this.loading.spine.resolve(this.spine);
    this.loading.cover.resolve(this.cover);
    this.loading.resources.resolve(this.resources);
    this.loading.pageList.resolve(this.pageList);
    this.isOpen = true;

    if (this.archived || this.settings.replacements && this.settings.replacements != "none") {
      this.replacements().then(() => {
        this.loaded.displayOptions.then(() => {
          this.opening.resolve(this);
        });
      }).catch(err => {
        console.error(err);
      });
    } else {
      // Resolve book opened promise
      this.loaded.displayOptions.then(() => {
        this.opening.resolve(this);
      });
    }
  }
  /**
   * Load Navigation and PageList from package
   * @private
   * @param {Packaging} packaging
   */


  loadNavigation(packaging) {
    let navPath = packaging.navPath || packaging.ncxPath;
    let toc = packaging.toc; // From json manifest

    if (toc) {
      return new Promise((resolve, reject) => {
        this.navigation = new navigation(toc);

        if (packaging.pageList) {
          this.pageList = new pagelist(packaging.pageList); // TODO: handle page lists from Manifest
        }

        resolve(this.navigation);
      });
    }

    if (!navPath) {
      return new Promise((resolve, reject) => {
        this.navigation = new navigation();
        this.pageList = new pagelist();
        resolve(this.navigation);
      });
    }

    return this.load(navPath, "xml").then(xml => {
      this.navigation = new navigation(xml);
      this.pageList = new pagelist(xml);
      return this.navigation;
    });
  }
  /**
   * Gets a Section of the Book from the Spine
   * Alias for `book.spine.get`
   * @param {string} target
   * @return {Section}
   */


  section(target) {
    return this.spine.get(target);
  }
  /**
   * Sugar to render a book to an element
   * @param  {element | string} element element or string to add a rendition to
   * @param  {object} [options]
   * @return {Rendition}
   */


  renderTo(element, options) {
    this.rendition = new rendition["a" /* default */](this, options);
    this.rendition.attachTo(element);
    return this.rendition;
  }
  /**
   * Set if request should use withCredentials
   * @param {boolean} credentials
   */


  setRequestCredentials(credentials) {
    this.settings.requestCredentials = credentials;
  }
  /**
   * Set headers request should use
   * @param {object} headers
   */


  setRequestHeaders(headers) {
    this.settings.requestHeaders = headers;
  }
  /**
   * Unarchive a zipped epub
   * @private
   * @param  {binary} input epub data
   * @param  {string} [encoding]
   * @return {Archive}
   */


  unarchive(input, encoding) {
    this.archive = new archive();
    return this.archive.open(input, encoding);
  }
  /**
   * Store the epubs contents
   * @private
   * @param  {binary} input epub data
   * @param  {string} [encoding]
   * @return {Store}
   */


  store(name) {
    // Use "blobUrl" or "base64" for replacements
    let replacementsSetting = this.settings.replacements && this.settings.replacements !== "none"; // Save original url

    let originalUrl = this.url; // Save original request method

    let requester = this.settings.requestMethod || utils_request.bind(this); // Create new Store

    this.storage = new src_store(name, requester, this.resolve.bind(this)); // Replace request method to go through store

    this.request = this.storage.request.bind(this.storage);
    this.opened.then(() => {
      if (this.archived) {
        this.storage.requester = this.archive.request.bind(this.archive);
      } // Substitute hook


      let substituteResources = (output, section) => {
        section.output = this.resources.substitute(output, section.url);
      }; // Set to use replacements


      this.resources.settings.replacements = replacementsSetting || "blobUrl"; // Create replacement urls

      this.resources.replacements().then(() => {
        return this.resources.replaceCss();
      });
      this.storage.on("offline", () => {
        // Remove url to use relative resolving for hrefs
        this.url = new utils_url["a" /* default */]("/", ""); // Add hook to replace resources in contents

        this.spine.hooks.serialize.register(substituteResources);
      });
      this.storage.on("online", () => {
        // Restore original url
        this.url = originalUrl; // Remove hook

        this.spine.hooks.serialize.deregister(substituteResources);
      });
    });
    return this.storage;
  }
  /**
   * Get the cover url
   * @return {Promise<?string>} coverUrl
   */


  coverUrl() {
    return this.loaded.cover.then(() => {
      if (!this.cover) {
        return null;
      }

      if (this.archived) {
        return this.archive.createUrl(this.cover);
      } else {
        return this.cover;
      }
    });
  }
  /**
   * Load replacement urls
   * @private
   * @return {Promise} completed loading urls
   */


  replacements() {
    this.spine.hooks.serialize.register((output, section) => {
      section.output = this.resources.substitute(output, section.url);
    });
    return this.resources.replacements().then(() => {
      return this.resources.replaceCss();
    });
  }
  /**
   * Find a DOM Range for a given CFI Range
   * @param  {EpubCFI} cfiRange a epub cfi range
   * @return {Range}
   */


  getRange(cfiRange) {
    var cfi = new epubcfi["a" /* default */](cfiRange);
    var item = this.spine.get(cfi.spinePos);

    var _request = this.load.bind(this);

    if (!item) {
      return new Promise((resolve, reject) => {
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


  key(identifier) {
    var ident = identifier || this.packaging.metadata.identifier || this.url.filename;
    return `epubjs:${constants["b" /* EPUBJS_VERSION */]}:${ident}`;
  }
  /**
   * Destroy the Book and all associated objects
   */


  destroy() {
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

} //-- Enable binding events to book


event_emitter_default()(book_Book.prototype);
/* harmony default export */ var book = __webpack_exports__["a"] = (book_Book);

/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

var DESCRIPTORS = __webpack_require__(16);
var propertyIsEnumerableModule = __webpack_require__(60);
var createPropertyDescriptor = __webpack_require__(25);
var toIndexedObject = __webpack_require__(32);
var toPrimitive = __webpack_require__(41);
var has = __webpack_require__(10);
var IE8_DOM_DEFINE = __webpack_require__(62);

var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor
exports.f = DESCRIPTORS ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
  O = toIndexedObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return nativeGetOwnPropertyDescriptor(O, P);
  } catch (error) { /* empty */ }
  if (has(O, P)) return createPropertyDescriptor(!propertyIsEnumerableModule.f.call(O, P), O[P]);
};


/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// Nashorn ~ JDK8 bug
var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({ 1: 2 }, 1);

// `Object.prototype.propertyIsEnumerable` method implementation
// https://tc39.github.io/ecma262/#sec-object.prototype.propertyisenumerable
exports.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
  var descriptor = getOwnPropertyDescriptor(this, V);
  return !!descriptor && descriptor.enumerable;
} : nativePropertyIsEnumerable;


/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

var fails = __webpack_require__(12);
var classof = __webpack_require__(40);

var split = ''.split;

// fallback for non-array-like ES3 and non-enumerable old V8 strings
module.exports = fails(function () {
  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
  // eslint-disable-next-line no-prototype-builtins
  return !Object('z').propertyIsEnumerable(0);
}) ? function (it) {
  return classof(it) == 'String' ? split.call(it, '') : Object(it);
} : Object;


/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

var DESCRIPTORS = __webpack_require__(16);
var fails = __webpack_require__(12);
var createElement = __webpack_require__(63);

// Thank's IE8 for his funny defineProperty
module.exports = !DESCRIPTORS && !fails(function () {
  return Object.defineProperty(createElement('div'), 'a', {
    get: function () { return 7; }
  }).a != 7;
});


/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(7);
var isObject = __webpack_require__(17);

var document = global.document;
// typeof document.createElement is 'object' in old IE
var EXISTS = isObject(document) && isObject(document.createElement);

module.exports = function (it) {
  return EXISTS ? document.createElement(it) : {};
};


/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

var store = __webpack_require__(65);

var functionToString = Function.toString;

// this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper
if (typeof store.inspectSource != 'function') {
  store.inspectSource = function (it) {
    return functionToString.call(it);
  };
}

module.exports = store.inspectSource;


/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(7);
var setGlobal = __webpack_require__(42);

var SHARED = '__core-js_shared__';
var store = global[SHARED] || setGlobal(SHARED, {});

module.exports = store;


/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

var IS_PURE = __webpack_require__(34);
var store = __webpack_require__(65);

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: '3.6.5',
  mode: IS_PURE ? 'pure' : 'global',
  copyright: '© 2020 Denis Pushkarev (zloirock.ru)'
});


/***/ }),
/* 67 */
/***/ (function(module, exports) {

var id = 0;
var postfix = Math.random();

module.exports = function (key) {
  return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
};


/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

var has = __webpack_require__(10);
var toIndexedObject = __webpack_require__(32);
var indexOf = __webpack_require__(94).indexOf;
var hiddenKeys = __webpack_require__(44);

module.exports = function (object, names) {
  var O = toIndexedObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~indexOf(result, key) || result.push(key);
  }
  return result;
};


/***/ }),
/* 69 */
/***/ (function(module, exports) {

exports.f = Object.getOwnPropertySymbols;


/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

var fails = __webpack_require__(12);

module.exports = !!Object.getOwnPropertySymbols && !fails(function () {
  // Chrome 38 Symbol has incorrect toString conversion
  // eslint-disable-next-line no-undef
  return !String(Symbol());
});


/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var toIndexedObject = __webpack_require__(32);
var addToUnscopables = __webpack_require__(103);
var Iterators = __webpack_require__(27);
var InternalStateModule = __webpack_require__(26);
var defineIterator = __webpack_require__(74);

var ARRAY_ITERATOR = 'Array Iterator';
var setInternalState = InternalStateModule.set;
var getInternalState = InternalStateModule.getterFor(ARRAY_ITERATOR);

// `Array.prototype.entries` method
// https://tc39.github.io/ecma262/#sec-array.prototype.entries
// `Array.prototype.keys` method
// https://tc39.github.io/ecma262/#sec-array.prototype.keys
// `Array.prototype.values` method
// https://tc39.github.io/ecma262/#sec-array.prototype.values
// `Array.prototype[@@iterator]` method
// https://tc39.github.io/ecma262/#sec-array.prototype-@@iterator
// `CreateArrayIterator` internal method
// https://tc39.github.io/ecma262/#sec-createarrayiterator
module.exports = defineIterator(Array, 'Array', function (iterated, kind) {
  setInternalState(this, {
    type: ARRAY_ITERATOR,
    target: toIndexedObject(iterated), // target
    index: 0,                          // next index
    kind: kind                         // kind
  });
// `%ArrayIteratorPrototype%.next` method
// https://tc39.github.io/ecma262/#sec-%arrayiteratorprototype%.next
}, function () {
  var state = getInternalState(this);
  var target = state.target;
  var kind = state.kind;
  var index = state.index++;
  if (!target || index >= target.length) {
    state.target = undefined;
    return { value: undefined, done: true };
  }
  if (kind == 'keys') return { value: index, done: false };
  if (kind == 'values') return { value: target[index], done: false };
  return { value: [index, target[index]], done: false };
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values%
// https://tc39.github.io/ecma262/#sec-createunmappedargumentsobject
// https://tc39.github.io/ecma262/#sec-createmappedargumentsobject
Iterators.Arguments = Iterators.Array;

// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');


/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

var DESCRIPTORS = __webpack_require__(16);
var definePropertyModule = __webpack_require__(18);
var anObject = __webpack_require__(13);
var objectKeys = __webpack_require__(73);

// `Object.defineProperties` method
// https://tc39.github.io/ecma262/#sec-object.defineproperties
module.exports = DESCRIPTORS ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = objectKeys(Properties);
  var length = keys.length;
  var index = 0;
  var key;
  while (length > index) definePropertyModule.f(O, key = keys[index++], Properties[key]);
  return O;
};


/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

var internalObjectKeys = __webpack_require__(68);
var enumBugKeys = __webpack_require__(47);

// `Object.keys` method
// https://tc39.github.io/ecma262/#sec-object.keys
module.exports = Object.keys || function keys(O) {
  return internalObjectKeys(O, enumBugKeys);
};


/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $ = __webpack_require__(31);
var createIteratorConstructor = __webpack_require__(75);
var getPrototypeOf = __webpack_require__(77);
var setPrototypeOf = __webpack_require__(106);
var setToStringTag = __webpack_require__(37);
var createNonEnumerableProperty = __webpack_require__(15);
var redefine = __webpack_require__(19);
var wellKnownSymbol = __webpack_require__(8);
var IS_PURE = __webpack_require__(34);
var Iterators = __webpack_require__(27);
var IteratorsCore = __webpack_require__(76);

var IteratorPrototype = IteratorsCore.IteratorPrototype;
var BUGGY_SAFARI_ITERATORS = IteratorsCore.BUGGY_SAFARI_ITERATORS;
var ITERATOR = wellKnownSymbol('iterator');
var KEYS = 'keys';
var VALUES = 'values';
var ENTRIES = 'entries';

var returnThis = function () { return this; };

module.exports = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
  createIteratorConstructor(IteratorConstructor, NAME, next);

  var getIterationMethod = function (KIND) {
    if (KIND === DEFAULT && defaultIterator) return defaultIterator;
    if (!BUGGY_SAFARI_ITERATORS && KIND in IterablePrototype) return IterablePrototype[KIND];
    switch (KIND) {
      case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
      case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
      case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
    } return function () { return new IteratorConstructor(this); };
  };

  var TO_STRING_TAG = NAME + ' Iterator';
  var INCORRECT_VALUES_NAME = false;
  var IterablePrototype = Iterable.prototype;
  var nativeIterator = IterablePrototype[ITERATOR]
    || IterablePrototype['@@iterator']
    || DEFAULT && IterablePrototype[DEFAULT];
  var defaultIterator = !BUGGY_SAFARI_ITERATORS && nativeIterator || getIterationMethod(DEFAULT);
  var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
  var CurrentIteratorPrototype, methods, KEY;

  // fix native
  if (anyNativeIterator) {
    CurrentIteratorPrototype = getPrototypeOf(anyNativeIterator.call(new Iterable()));
    if (IteratorPrototype !== Object.prototype && CurrentIteratorPrototype.next) {
      if (!IS_PURE && getPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype) {
        if (setPrototypeOf) {
          setPrototypeOf(CurrentIteratorPrototype, IteratorPrototype);
        } else if (typeof CurrentIteratorPrototype[ITERATOR] != 'function') {
          createNonEnumerableProperty(CurrentIteratorPrototype, ITERATOR, returnThis);
        }
      }
      // Set @@toStringTag to native iterators
      setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true, true);
      if (IS_PURE) Iterators[TO_STRING_TAG] = returnThis;
    }
  }

  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
    INCORRECT_VALUES_NAME = true;
    defaultIterator = function values() { return nativeIterator.call(this); };
  }

  // define iterator
  if ((!IS_PURE || FORCED) && IterablePrototype[ITERATOR] !== defaultIterator) {
    createNonEnumerableProperty(IterablePrototype, ITERATOR, defaultIterator);
  }
  Iterators[NAME] = defaultIterator;

  // export additional methods
  if (DEFAULT) {
    methods = {
      values: getIterationMethod(VALUES),
      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
      entries: getIterationMethod(ENTRIES)
    };
    if (FORCED) for (KEY in methods) {
      if (BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
        redefine(IterablePrototype, KEY, methods[KEY]);
      }
    } else $({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME }, methods);
  }

  return methods;
};


/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var IteratorPrototype = __webpack_require__(76).IteratorPrototype;
var create = __webpack_require__(50);
var createPropertyDescriptor = __webpack_require__(25);
var setToStringTag = __webpack_require__(37);
var Iterators = __webpack_require__(27);

var returnThis = function () { return this; };

module.exports = function (IteratorConstructor, NAME, next) {
  var TO_STRING_TAG = NAME + ' Iterator';
  IteratorConstructor.prototype = create(IteratorPrototype, { next: createPropertyDescriptor(1, next) });
  setToStringTag(IteratorConstructor, TO_STRING_TAG, false, true);
  Iterators[TO_STRING_TAG] = returnThis;
  return IteratorConstructor;
};


/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var getPrototypeOf = __webpack_require__(77);
var createNonEnumerableProperty = __webpack_require__(15);
var has = __webpack_require__(10);
var wellKnownSymbol = __webpack_require__(8);
var IS_PURE = __webpack_require__(34);

var ITERATOR = wellKnownSymbol('iterator');
var BUGGY_SAFARI_ITERATORS = false;

var returnThis = function () { return this; };

// `%IteratorPrototype%` object
// https://tc39.github.io/ecma262/#sec-%iteratorprototype%-object
var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;

if ([].keys) {
  arrayIterator = [].keys();
  // Safari 8 has buggy iterators w/o `next`
  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;
  else {
    PrototypeOfArrayIteratorPrototype = getPrototypeOf(getPrototypeOf(arrayIterator));
    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
  }
}

if (IteratorPrototype == undefined) IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
if (!IS_PURE && !has(IteratorPrototype, ITERATOR)) {
  createNonEnumerableProperty(IteratorPrototype, ITERATOR, returnThis);
}

module.exports = {
  IteratorPrototype: IteratorPrototype,
  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS
};


/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

var has = __webpack_require__(10);
var toObject = __webpack_require__(36);
var sharedKey = __webpack_require__(43);
var CORRECT_PROTOTYPE_GETTER = __webpack_require__(105);

var IE_PROTO = sharedKey('IE_PROTO');
var ObjectPrototype = Object.prototype;

// `Object.getPrototypeOf` method
// https://tc39.github.io/ecma262/#sec-object.getprototypeof
module.exports = CORRECT_PROTOTYPE_GETTER ? Object.getPrototypeOf : function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectPrototype : null;
};


/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

var fails = __webpack_require__(12);
var wellKnownSymbol = __webpack_require__(8);
var IS_PURE = __webpack_require__(34);

var ITERATOR = wellKnownSymbol('iterator');

module.exports = !fails(function () {
  var url = new URL('b?a=1&b=2&c=3', 'http://a');
  var searchParams = url.searchParams;
  var result = '';
  url.pathname = 'c%20d';
  searchParams.forEach(function (value, key) {
    searchParams['delete']('b');
    result += key + value;
  });
  return (IS_PURE && !url.toJSON)
    || !searchParams.sort
    || url.href !== 'http://a/c%20d?a=1&c=3'
    || searchParams.get('c') !== '3'
    || String(new URLSearchParams('?a=1')) !== 'a=1'
    || !searchParams[ITERATOR]
    // throws in Edge
    || new URL('https://a@b').username !== 'a'
    || new URLSearchParams(new URLSearchParams('a=b')).get('a') !== 'b'
    // not punycoded in Edge
    || new URL('http://тест').host !== 'xn--e1aybc'
    // not escaped in Chrome 62-
    || new URL('http://a#б').hash !== '#%D0%B1'
    // fails in Chrome 66-
    || result !== 'a1c3'
    // throws in Safari
    || new URL('http://x', undefined).host !== 'x';
});


/***/ }),
/* 79 */
/***/ (function(module, exports) {

module.exports = function (it, Constructor, name) {
  if (!(it instanceof Constructor)) {
    throw TypeError('Incorrect ' + (name ? name + ' ' : '') + 'invocation');
  } return it;
};


/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

var aFunction = __webpack_require__(126);

// optional / simple context binding
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 0: return function () {
      return fn.call(that);
    };
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};


/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

var TO_STRING_TAG_SUPPORT = __webpack_require__(130);
var classofRaw = __webpack_require__(40);
var wellKnownSymbol = __webpack_require__(8);

var TO_STRING_TAG = wellKnownSymbol('toStringTag');
// ES3 wrong here
var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (error) { /* empty */ }
};

// getting tag from ES6+ `Object.prototype.toString`
module.exports = TO_STRING_TAG_SUPPORT ? classofRaw : function (it) {
  var O, tag, result;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (tag = tryGet(O = Object(it), TO_STRING_TAG)) == 'string' ? tag
    // builtinTag case
    : CORRECT_ARGUMENTS ? classofRaw(O)
    // ES3 arguments fallback
    : (result = classofRaw(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : result;
};


/***/ }),
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

var freeGlobal = __webpack_require__(138);

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

module.exports = root;


/***/ }),
/* 83 */
/***/ (function(module, exports, __webpack_require__) {

var root = __webpack_require__(82);

/** Built-in value references. */
var Symbol = root.Symbol;

module.exports = Symbol;


/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

var debounce = __webpack_require__(55),
    isObject = __webpack_require__(53);

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
/* 85 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__85__;

/***/ }),
/* 86 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(global) {/* harmony import */ var _book__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(58);
/* harmony import */ var _rendition__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(39);
/* harmony import */ var _epubcfi__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2);
/* harmony import */ var _contents__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(28);
/* harmony import */ var _utils_core__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(0);
/* harmony import */ var _utils_constants__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(1);
/* harmony import */ var _managers_views_iframe__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(54);
/* harmony import */ var _managers_default__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(22);
/* harmony import */ var _managers_continuous__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(56);









/**
 * Creates a new Book
 * @param {string|ArrayBuffer} url URL, Path or ArrayBuffer
 * @param {object} options to pass to the book
 * @returns {Book} a new Book object
 * @example ePub("/path/to/book.epub", {})
 */

function ePub(url, options) {
  return new _book__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"](url, options);
}

ePub.VERSION = _utils_constants__WEBPACK_IMPORTED_MODULE_5__[/* EPUBJS_VERSION */ "b"];

if (typeof global !== "undefined") {
  global.EPUBJS_VERSION = _utils_constants__WEBPACK_IMPORTED_MODULE_5__[/* EPUBJS_VERSION */ "b"];
}

ePub.Book = _book__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"];
ePub.Rendition = _rendition__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"];
ePub.Contents = _contents__WEBPACK_IMPORTED_MODULE_3__[/* default */ "a"];
ePub.CFI = _epubcfi__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"];
ePub.utils = _utils_core__WEBPACK_IMPORTED_MODULE_4__;
/* harmony default export */ __webpack_exports__["default"] = (ePub);
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(30)))

/***/ }),
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// TODO: Remove from `core-js@4` since it's moved to entry points
__webpack_require__(88);
var redefine = __webpack_require__(19);
var fails = __webpack_require__(12);
var wellKnownSymbol = __webpack_require__(8);
var regexpExec = __webpack_require__(48);
var createNonEnumerableProperty = __webpack_require__(15);

var SPECIES = wellKnownSymbol('species');

var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
  // #replace needs built-in support for named groups.
  // #match works fine because it just return the exec results, even if it has
  // a "grops" property.
  var re = /./;
  re.exec = function () {
    var result = [];
    result.groups = { a: '7' };
    return result;
  };
  return ''.replace(re, '$<a>') !== '7';
});

// IE <= 11 replaces $0 with the whole match, as if it was $&
// https://stackoverflow.com/questions/6024666/getting-ie-to-replace-a-regex-with-the-literal-string-0
var REPLACE_KEEPS_$0 = (function () {
  return 'a'.replace(/./, '$0') === '$0';
})();

var REPLACE = wellKnownSymbol('replace');
// Safari <= 13.0.3(?) substitutes nth capture where n>m with an empty string
var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = (function () {
  if (/./[REPLACE]) {
    return /./[REPLACE]('a', '$0') === '';
  }
  return false;
})();

// Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
// Weex JS has frozen built-in prototypes, so use try / catch wrapper
var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails(function () {
  var re = /(?:)/;
  var originalExec = re.exec;
  re.exec = function () { return originalExec.apply(this, arguments); };
  var result = 'ab'.split(re);
  return result.length !== 2 || result[0] !== 'a' || result[1] !== 'b';
});

module.exports = function (KEY, length, exec, sham) {
  var SYMBOL = wellKnownSymbol(KEY);

  var DELEGATES_TO_SYMBOL = !fails(function () {
    // String methods call symbol-named RegEp methods
    var O = {};
    O[SYMBOL] = function () { return 7; };
    return ''[KEY](O) != 7;
  });

  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails(function () {
    // Symbol-named RegExp methods call .exec
    var execCalled = false;
    var re = /a/;

    if (KEY === 'split') {
      // We can't use real regex here since it causes deoptimization
      // and serious performance degradation in V8
      // https://github.com/zloirock/core-js/issues/306
      re = {};
      // RegExp[@@split] doesn't call the regex's exec method, but first creates
      // a new one. We need to return the patched regex when creating the new one.
      re.constructor = {};
      re.constructor[SPECIES] = function () { return re; };
      re.flags = '';
      re[SYMBOL] = /./[SYMBOL];
    }

    re.exec = function () { execCalled = true; return null; };

    re[SYMBOL]('');
    return !execCalled;
  });

  if (
    !DELEGATES_TO_SYMBOL ||
    !DELEGATES_TO_EXEC ||
    (KEY === 'replace' && !(
      REPLACE_SUPPORTS_NAMED_GROUPS &&
      REPLACE_KEEPS_$0 &&
      !REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE
    )) ||
    (KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC)
  ) {
    var nativeRegExpMethod = /./[SYMBOL];
    var methods = exec(SYMBOL, ''[KEY], function (nativeMethod, regexp, str, arg2, forceStringMethod) {
      if (regexp.exec === regexpExec) {
        if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
          // The native String method already delegates to @@method (this
          // polyfilled function), leasing to infinite recursion.
          // We avoid it by directly calling the native @@method method.
          return { done: true, value: nativeRegExpMethod.call(regexp, str, arg2) };
        }
        return { done: true, value: nativeMethod.call(str, regexp, arg2) };
      }
      return { done: false };
    }, {
      REPLACE_KEEPS_$0: REPLACE_KEEPS_$0,
      REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE: REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE
    });
    var stringMethod = methods[0];
    var regexMethod = methods[1];

    redefine(String.prototype, KEY, stringMethod);
    redefine(RegExp.prototype, SYMBOL, length == 2
      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
      ? function (string, arg) { return regexMethod.call(string, this, arg); }
      // 21.2.5.6 RegExp.prototype[@@match](string)
      // 21.2.5.9 RegExp.prototype[@@search](string)
      : function (string) { return regexMethod.call(string, this); }
    );
  }

  if (sham) createNonEnumerableProperty(RegExp.prototype[SYMBOL], 'sham', true);
};


/***/ }),
/* 88 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $ = __webpack_require__(31);
var exec = __webpack_require__(48);

$({ target: 'RegExp', proto: true, forced: /./.exec !== exec }, {
  exec: exec
});


/***/ }),
/* 89 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(7);
var inspectSource = __webpack_require__(64);

var WeakMap = global.WeakMap;

module.exports = typeof WeakMap === 'function' && /native code/.test(inspectSource(WeakMap));


/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

var has = __webpack_require__(10);
var ownKeys = __webpack_require__(91);
var getOwnPropertyDescriptorModule = __webpack_require__(59);
var definePropertyModule = __webpack_require__(18);

module.exports = function (target, source) {
  var keys = ownKeys(source);
  var defineProperty = definePropertyModule.f;
  var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!has(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
  }
};


/***/ }),
/* 91 */
/***/ (function(module, exports, __webpack_require__) {

var getBuiltIn = __webpack_require__(45);
var getOwnPropertyNamesModule = __webpack_require__(93);
var getOwnPropertySymbolsModule = __webpack_require__(69);
var anObject = __webpack_require__(13);

// all object keys, includes non-enumerable and symbols
module.exports = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
  var keys = getOwnPropertyNamesModule.f(anObject(it));
  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
  return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
};


/***/ }),
/* 92 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(7);

module.exports = global;


/***/ }),
/* 93 */
/***/ (function(module, exports, __webpack_require__) {

var internalObjectKeys = __webpack_require__(68);
var enumBugKeys = __webpack_require__(47);

var hiddenKeys = enumBugKeys.concat('length', 'prototype');

// `Object.getOwnPropertyNames` method
// https://tc39.github.io/ecma262/#sec-object.getownpropertynames
exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return internalObjectKeys(O, hiddenKeys);
};


/***/ }),
/* 94 */
/***/ (function(module, exports, __webpack_require__) {

var toIndexedObject = __webpack_require__(32);
var toLength = __webpack_require__(46);
var toAbsoluteIndex = __webpack_require__(95);

// `Array.prototype.{ indexOf, includes }` methods implementation
var createMethod = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIndexedObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) {
      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

module.exports = {
  // `Array.prototype.includes` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.includes
  includes: createMethod(true),
  // `Array.prototype.indexOf` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
  indexOf: createMethod(false)
};


/***/ }),
/* 95 */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(35);

var max = Math.max;
var min = Math.min;

// Helper for a popular repeating case of the spec:
// Let integer be ? ToInteger(index).
// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
module.exports = function (index, length) {
  var integer = toInteger(index);
  return integer < 0 ? max(integer + length, 0) : min(integer, length);
};


/***/ }),
/* 96 */
/***/ (function(module, exports, __webpack_require__) {

var fails = __webpack_require__(12);

var replacement = /#|\.prototype\./;

var isForced = function (feature, detection) {
  var value = data[normalize(feature)];
  return value == POLYFILL ? true
    : value == NATIVE ? false
    : typeof detection == 'function' ? fails(detection)
    : !!detection;
};

var normalize = isForced.normalize = function (string) {
  return String(string).replace(replacement, '.').toLowerCase();
};

var data = isForced.data = {};
var NATIVE = isForced.NATIVE = 'N';
var POLYFILL = isForced.POLYFILL = 'P';

module.exports = isForced;


/***/ }),
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var anObject = __webpack_require__(13);

// `RegExp.prototype.flags` getter implementation
// https://tc39.github.io/ecma262/#sec-get-regexp.prototype.flags
module.exports = function () {
  var that = anObject(this);
  var result = '';
  if (that.global) result += 'g';
  if (that.ignoreCase) result += 'i';
  if (that.multiline) result += 'm';
  if (that.dotAll) result += 's';
  if (that.unicode) result += 'u';
  if (that.sticky) result += 'y';
  return result;
};


/***/ }),
/* 98 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var fails = __webpack_require__(12);

// babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError,
// so we use an intermediate function.
function RE(s, f) {
  return RegExp(s, f);
}

exports.UNSUPPORTED_Y = fails(function () {
  // babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError
  var re = RE('a', 'y');
  re.lastIndex = 2;
  return re.exec('abcd') != null;
});

exports.BROKEN_CARET = fails(function () {
  // https://bugzilla.mozilla.org/show_bug.cgi?id=773687
  var re = RE('^r', 'gy');
  re.lastIndex = 2;
  return re.exec('str') != null;
});


/***/ }),
/* 99 */
/***/ (function(module, exports, __webpack_require__) {

var NATIVE_SYMBOL = __webpack_require__(70);

module.exports = NATIVE_SYMBOL
  // eslint-disable-next-line no-undef
  && !Symbol.sham
  // eslint-disable-next-line no-undef
  && typeof Symbol.iterator == 'symbol';


/***/ }),
/* 100 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var charAt = __webpack_require__(49).charAt;

// `AdvanceStringIndex` abstract operation
// https://tc39.github.io/ecma262/#sec-advancestringindex
module.exports = function (S, index, unicode) {
  return index + (unicode ? charAt(S, index).length : 1);
};


/***/ }),
/* 101 */
/***/ (function(module, exports, __webpack_require__) {

var classof = __webpack_require__(40);
var regexpExec = __webpack_require__(48);

// `RegExpExec` abstract operation
// https://tc39.github.io/ecma262/#sec-regexpexec
module.exports = function (R, S) {
  var exec = R.exec;
  if (typeof exec === 'function') {
    var result = exec.call(R, S);
    if (typeof result !== 'object') {
      throw TypeError('RegExp exec method returned something other than an Object or null');
    }
    return result;
  }

  if (classof(R) !== 'RegExp') {
    throw TypeError('RegExp#exec called on incompatible receiver');
  }

  return regexpExec.call(R, S);
};



/***/ }),
/* 102 */
/***/ (function(module, exports) {

// iterable DOM collections
// flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
module.exports = {
  CSSRuleList: 0,
  CSSStyleDeclaration: 0,
  CSSValueList: 0,
  ClientRectList: 0,
  DOMRectList: 0,
  DOMStringList: 0,
  DOMTokenList: 1,
  DataTransferItemList: 0,
  FileList: 0,
  HTMLAllCollection: 0,
  HTMLCollection: 0,
  HTMLFormElement: 0,
  HTMLSelectElement: 0,
  MediaList: 0,
  MimeTypeArray: 0,
  NamedNodeMap: 0,
  NodeList: 1,
  PaintRequestList: 0,
  Plugin: 0,
  PluginArray: 0,
  SVGLengthList: 0,
  SVGNumberList: 0,
  SVGPathSegList: 0,
  SVGPointList: 0,
  SVGStringList: 0,
  SVGTransformList: 0,
  SourceBufferList: 0,
  StyleSheetList: 0,
  TextTrackCueList: 0,
  TextTrackList: 0,
  TouchList: 0
};


/***/ }),
/* 103 */
/***/ (function(module, exports, __webpack_require__) {

var wellKnownSymbol = __webpack_require__(8);
var create = __webpack_require__(50);
var definePropertyModule = __webpack_require__(18);

var UNSCOPABLES = wellKnownSymbol('unscopables');
var ArrayPrototype = Array.prototype;

// Array.prototype[@@unscopables]
// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
if (ArrayPrototype[UNSCOPABLES] == undefined) {
  definePropertyModule.f(ArrayPrototype, UNSCOPABLES, {
    configurable: true,
    value: create(null)
  });
}

// add a key to Array.prototype[@@unscopables]
module.exports = function (key) {
  ArrayPrototype[UNSCOPABLES][key] = true;
};


/***/ }),
/* 104 */
/***/ (function(module, exports, __webpack_require__) {

var getBuiltIn = __webpack_require__(45);

module.exports = getBuiltIn('document', 'documentElement');


/***/ }),
/* 105 */
/***/ (function(module, exports, __webpack_require__) {

var fails = __webpack_require__(12);

module.exports = !fails(function () {
  function F() { /* empty */ }
  F.prototype.constructor = null;
  return Object.getPrototypeOf(new F()) !== F.prototype;
});


/***/ }),
/* 106 */
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(13);
var aPossiblePrototype = __webpack_require__(107);

// `Object.setPrototypeOf` method
// https://tc39.github.io/ecma262/#sec-object.setprototypeof
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
module.exports = Object.setPrototypeOf || ('__proto__' in {} ? function () {
  var CORRECT_SETTER = false;
  var test = {};
  var setter;
  try {
    setter = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set;
    setter.call(test, []);
    CORRECT_SETTER = test instanceof Array;
  } catch (error) { /* empty */ }
  return function setPrototypeOf(O, proto) {
    anObject(O);
    aPossiblePrototype(proto);
    if (CORRECT_SETTER) setter.call(O, proto);
    else O.__proto__ = proto;
    return O;
  };
}() : undefined);


/***/ }),
/* 107 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(17);

module.exports = function (it) {
  if (!isObject(it) && it !== null) {
    throw TypeError("Can't set " + String(it) + ' as a prototype');
  } return it;
};


/***/ }),
/* 108 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var assign        = __webpack_require__(109)
  , normalizeOpts = __webpack_require__(117)
  , isCallable    = __webpack_require__(118)
  , contains      = __webpack_require__(119)

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
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(110)()
	? Object.assign
	: __webpack_require__(111);


/***/ }),
/* 110 */
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
/* 111 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var keys  = __webpack_require__(112)
  , value = __webpack_require__(116)
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
/* 112 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(113)()
	? Object.keys
	: __webpack_require__(114);


/***/ }),
/* 113 */
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
/* 114 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isValue = __webpack_require__(51);

var keys = Object.keys;

module.exports = function (object) {
	return keys(isValue(object) ? Object(object) : object);
};


/***/ }),
/* 115 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// eslint-disable-next-line no-empty-function
module.exports = function () {};


/***/ }),
/* 116 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isValue = __webpack_require__(51);

module.exports = function (value) {
	if (!isValue(value)) throw new TypeError("Cannot use null or undefined");
	return value;
};


/***/ }),
/* 117 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isValue = __webpack_require__(51);

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
/* 118 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Deprecated



module.exports = function (obj) {
 return typeof obj === "function";
};


/***/ }),
/* 119 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(120)()
	? String.prototype.contains
	: __webpack_require__(121);


/***/ }),
/* 120 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var str = "razdwatrzy";

module.exports = function () {
	if (typeof str.contains !== "function") return false;
	return (str.contains("dwa") === true) && (str.contains("foo") === false);
};


/***/ }),
/* 121 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var indexOf = String.prototype.indexOf;

module.exports = function (searchString/*, position*/) {
	return indexOf.call(this, searchString, arguments[1]) > -1;
};


/***/ }),
/* 122 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (fn) {
	if (typeof fn !== "function") throw new TypeError(fn + " is not a function");
	return fn;
};


/***/ }),
/* 123 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var charAt = __webpack_require__(49).charAt;
var InternalStateModule = __webpack_require__(26);
var defineIterator = __webpack_require__(74);

var STRING_ITERATOR = 'String Iterator';
var setInternalState = InternalStateModule.set;
var getInternalState = InternalStateModule.getterFor(STRING_ITERATOR);

// `String.prototype[@@iterator]` method
// https://tc39.github.io/ecma262/#sec-string.prototype-@@iterator
defineIterator(String, 'String', function (iterated) {
  setInternalState(this, {
    type: STRING_ITERATOR,
    string: String(iterated),
    index: 0
  });
// `%StringIteratorPrototype%.next` method
// https://tc39.github.io/ecma262/#sec-%stringiteratorprototype%.next
}, function next() {
  var state = getInternalState(this);
  var string = state.string;
  var index = state.index;
  var point;
  if (index >= string.length) return { value: undefined, done: true };
  point = charAt(string, index);
  state.index += point.length;
  return { value: point, done: false };
});


/***/ }),
/* 124 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var DESCRIPTORS = __webpack_require__(16);
var fails = __webpack_require__(12);
var objectKeys = __webpack_require__(73);
var getOwnPropertySymbolsModule = __webpack_require__(69);
var propertyIsEnumerableModule = __webpack_require__(60);
var toObject = __webpack_require__(36);
var IndexedObject = __webpack_require__(61);

var nativeAssign = Object.assign;
var defineProperty = Object.defineProperty;

// `Object.assign` method
// https://tc39.github.io/ecma262/#sec-object.assign
module.exports = !nativeAssign || fails(function () {
  // should have correct order of operations (Edge bug)
  if (DESCRIPTORS && nativeAssign({ b: 1 }, nativeAssign(defineProperty({}, 'a', {
    enumerable: true,
    get: function () {
      defineProperty(this, 'b', {
        value: 3,
        enumerable: false
      });
    }
  }), { b: 2 })).b !== 1) return true;
  // should work with symbols and should have deterministic property order (V8 bug)
  var A = {};
  var B = {};
  // eslint-disable-next-line no-undef
  var symbol = Symbol();
  var alphabet = 'abcdefghijklmnopqrst';
  A[symbol] = 7;
  alphabet.split('').forEach(function (chr) { B[chr] = chr; });
  return nativeAssign({}, A)[symbol] != 7 || objectKeys(nativeAssign({}, B)).join('') != alphabet;
}) ? function assign(target, source) { // eslint-disable-line no-unused-vars
  var T = toObject(target);
  var argumentsLength = arguments.length;
  var index = 1;
  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
  var propertyIsEnumerable = propertyIsEnumerableModule.f;
  while (argumentsLength > index) {
    var S = IndexedObject(arguments[index++]);
    var keys = getOwnPropertySymbols ? objectKeys(S).concat(getOwnPropertySymbols(S)) : objectKeys(S);
    var length = keys.length;
    var j = 0;
    var key;
    while (length > j) {
      key = keys[j++];
      if (!DESCRIPTORS || propertyIsEnumerable.call(S, key)) T[key] = S[key];
    }
  } return T;
} : nativeAssign;


/***/ }),
/* 125 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var bind = __webpack_require__(80);
var toObject = __webpack_require__(36);
var callWithSafeIterationClosing = __webpack_require__(127);
var isArrayIteratorMethod = __webpack_require__(128);
var toLength = __webpack_require__(46);
var createProperty = __webpack_require__(129);
var getIteratorMethod = __webpack_require__(52);

// `Array.from` method implementation
// https://tc39.github.io/ecma262/#sec-array.from
module.exports = function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
  var O = toObject(arrayLike);
  var C = typeof this == 'function' ? this : Array;
  var argumentsLength = arguments.length;
  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
  var mapping = mapfn !== undefined;
  var iteratorMethod = getIteratorMethod(O);
  var index = 0;
  var length, result, step, iterator, next, value;
  if (mapping) mapfn = bind(mapfn, argumentsLength > 2 ? arguments[2] : undefined, 2);
  // if the target is not iterable or it's an array with the default iterator - use a simple case
  if (iteratorMethod != undefined && !(C == Array && isArrayIteratorMethod(iteratorMethod))) {
    iterator = iteratorMethod.call(O);
    next = iterator.next;
    result = new C();
    for (;!(step = next.call(iterator)).done; index++) {
      value = mapping ? callWithSafeIterationClosing(iterator, mapfn, [step.value, index], true) : step.value;
      createProperty(result, index, value);
    }
  } else {
    length = toLength(O.length);
    result = new C(length);
    for (;length > index; index++) {
      value = mapping ? mapfn(O[index], index) : O[index];
      createProperty(result, index, value);
    }
  }
  result.length = index;
  return result;
};


/***/ }),
/* 126 */
/***/ (function(module, exports) {

module.exports = function (it) {
  if (typeof it != 'function') {
    throw TypeError(String(it) + ' is not a function');
  } return it;
};


/***/ }),
/* 127 */
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(13);

// call something on iterator step with safe closing on error
module.exports = function (iterator, fn, value, ENTRIES) {
  try {
    return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch (error) {
    var returnMethod = iterator['return'];
    if (returnMethod !== undefined) anObject(returnMethod.call(iterator));
    throw error;
  }
};


/***/ }),
/* 128 */
/***/ (function(module, exports, __webpack_require__) {

var wellKnownSymbol = __webpack_require__(8);
var Iterators = __webpack_require__(27);

var ITERATOR = wellKnownSymbol('iterator');
var ArrayPrototype = Array.prototype;

// check on default Array iterator
module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayPrototype[ITERATOR] === it);
};


/***/ }),
/* 129 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var toPrimitive = __webpack_require__(41);
var definePropertyModule = __webpack_require__(18);
var createPropertyDescriptor = __webpack_require__(25);

module.exports = function (object, key, value) {
  var propertyKey = toPrimitive(key);
  if (propertyKey in object) definePropertyModule.f(object, propertyKey, createPropertyDescriptor(0, value));
  else object[propertyKey] = value;
};


/***/ }),
/* 130 */
/***/ (function(module, exports, __webpack_require__) {

var wellKnownSymbol = __webpack_require__(8);

var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var test = {};

test[TO_STRING_TAG] = 'z';

module.exports = String(test) === '[object z]';


/***/ }),
/* 131 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// based on https://github.com/bestiejs/punycode.js/blob/master/punycode.js
var maxInt = 2147483647; // aka. 0x7FFFFFFF or 2^31-1
var base = 36;
var tMin = 1;
var tMax = 26;
var skew = 38;
var damp = 700;
var initialBias = 72;
var initialN = 128; // 0x80
var delimiter = '-'; // '\x2D'
var regexNonASCII = /[^\0-\u007E]/; // non-ASCII chars
var regexSeparators = /[.\u3002\uFF0E\uFF61]/g; // RFC 3490 separators
var OVERFLOW_ERROR = 'Overflow: input needs wider integers to process';
var baseMinusTMin = base - tMin;
var floor = Math.floor;
var stringFromCharCode = String.fromCharCode;

/**
 * Creates an array containing the numeric code points of each Unicode
 * character in the string. While JavaScript uses UCS-2 internally,
 * this function will convert a pair of surrogate halves (each of which
 * UCS-2 exposes as separate characters) into a single code point,
 * matching UTF-16.
 */
var ucs2decode = function (string) {
  var output = [];
  var counter = 0;
  var length = string.length;
  while (counter < length) {
    var value = string.charCodeAt(counter++);
    if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
      // It's a high surrogate, and there is a next character.
      var extra = string.charCodeAt(counter++);
      if ((extra & 0xFC00) == 0xDC00) { // Low surrogate.
        output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
      } else {
        // It's an unmatched surrogate; only append this code unit, in case the
        // next code unit is the high surrogate of a surrogate pair.
        output.push(value);
        counter--;
      }
    } else {
      output.push(value);
    }
  }
  return output;
};

/**
 * Converts a digit/integer into a basic code point.
 */
var digitToBasic = function (digit) {
  //  0..25 map to ASCII a..z or A..Z
  // 26..35 map to ASCII 0..9
  return digit + 22 + 75 * (digit < 26);
};

/**
 * Bias adaptation function as per section 3.4 of RFC 3492.
 * https://tools.ietf.org/html/rfc3492#section-3.4
 */
var adapt = function (delta, numPoints, firstTime) {
  var k = 0;
  delta = firstTime ? floor(delta / damp) : delta >> 1;
  delta += floor(delta / numPoints);
  for (; delta > baseMinusTMin * tMax >> 1; k += base) {
    delta = floor(delta / baseMinusTMin);
  }
  return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
};

/**
 * Converts a string of Unicode symbols (e.g. a domain name label) to a
 * Punycode string of ASCII-only symbols.
 */
// eslint-disable-next-line  max-statements
var encode = function (input) {
  var output = [];

  // Convert the input in UCS-2 to an array of Unicode code points.
  input = ucs2decode(input);

  // Cache the length.
  var inputLength = input.length;

  // Initialize the state.
  var n = initialN;
  var delta = 0;
  var bias = initialBias;
  var i, currentValue;

  // Handle the basic code points.
  for (i = 0; i < input.length; i++) {
    currentValue = input[i];
    if (currentValue < 0x80) {
      output.push(stringFromCharCode(currentValue));
    }
  }

  var basicLength = output.length; // number of basic code points.
  var handledCPCount = basicLength; // number of code points that have been handled;

  // Finish the basic string with a delimiter unless it's empty.
  if (basicLength) {
    output.push(delimiter);
  }

  // Main encoding loop:
  while (handledCPCount < inputLength) {
    // All non-basic code points < n have been handled already. Find the next larger one:
    var m = maxInt;
    for (i = 0; i < input.length; i++) {
      currentValue = input[i];
      if (currentValue >= n && currentValue < m) {
        m = currentValue;
      }
    }

    // Increase `delta` enough to advance the decoder's <n,i> state to <m,0>, but guard against overflow.
    var handledCPCountPlusOne = handledCPCount + 1;
    if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
      throw RangeError(OVERFLOW_ERROR);
    }

    delta += (m - n) * handledCPCountPlusOne;
    n = m;

    for (i = 0; i < input.length; i++) {
      currentValue = input[i];
      if (currentValue < n && ++delta > maxInt) {
        throw RangeError(OVERFLOW_ERROR);
      }
      if (currentValue == n) {
        // Represent delta as a generalized variable-length integer.
        var q = delta;
        for (var k = base; /* no condition */; k += base) {
          var t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
          if (q < t) break;
          var qMinusT = q - t;
          var baseMinusT = base - t;
          output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT)));
          q = floor(qMinusT / baseMinusT);
        }

        output.push(stringFromCharCode(digitToBasic(q)));
        bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
        delta = 0;
        ++handledCPCount;
      }
    }

    ++delta;
    ++n;
  }
  return output.join('');
};

module.exports = function (input) {
  var encoded = [];
  var labels = input.toLowerCase().replace(regexSeparators, '\u002E').split('.');
  var i, label;
  for (i = 0; i < labels.length; i++) {
    label = labels[i];
    encoded.push(regexNonASCII.test(label) ? 'xn--' + encode(label) : label);
  }
  return encoded.join('.');
};


/***/ }),
/* 132 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`
__webpack_require__(71);
var $ = __webpack_require__(31);
var getBuiltIn = __webpack_require__(45);
var USE_NATIVE_URL = __webpack_require__(78);
var redefine = __webpack_require__(19);
var redefineAll = __webpack_require__(133);
var setToStringTag = __webpack_require__(37);
var createIteratorConstructor = __webpack_require__(75);
var InternalStateModule = __webpack_require__(26);
var anInstance = __webpack_require__(79);
var hasOwn = __webpack_require__(10);
var bind = __webpack_require__(80);
var classof = __webpack_require__(81);
var anObject = __webpack_require__(13);
var isObject = __webpack_require__(17);
var create = __webpack_require__(50);
var createPropertyDescriptor = __webpack_require__(25);
var getIterator = __webpack_require__(134);
var getIteratorMethod = __webpack_require__(52);
var wellKnownSymbol = __webpack_require__(8);

var $fetch = getBuiltIn('fetch');
var Headers = getBuiltIn('Headers');
var ITERATOR = wellKnownSymbol('iterator');
var URL_SEARCH_PARAMS = 'URLSearchParams';
var URL_SEARCH_PARAMS_ITERATOR = URL_SEARCH_PARAMS + 'Iterator';
var setInternalState = InternalStateModule.set;
var getInternalParamsState = InternalStateModule.getterFor(URL_SEARCH_PARAMS);
var getInternalIteratorState = InternalStateModule.getterFor(URL_SEARCH_PARAMS_ITERATOR);

var plus = /\+/g;
var sequences = Array(4);

var percentSequence = function (bytes) {
  return sequences[bytes - 1] || (sequences[bytes - 1] = RegExp('((?:%[\\da-f]{2}){' + bytes + '})', 'gi'));
};

var percentDecode = function (sequence) {
  try {
    return decodeURIComponent(sequence);
  } catch (error) {
    return sequence;
  }
};

var deserialize = function (it) {
  var result = it.replace(plus, ' ');
  var bytes = 4;
  try {
    return decodeURIComponent(result);
  } catch (error) {
    while (bytes) {
      result = result.replace(percentSequence(bytes--), percentDecode);
    }
    return result;
  }
};

var find = /[!'()~]|%20/g;

var replace = {
  '!': '%21',
  "'": '%27',
  '(': '%28',
  ')': '%29',
  '~': '%7E',
  '%20': '+'
};

var replacer = function (match) {
  return replace[match];
};

var serialize = function (it) {
  return encodeURIComponent(it).replace(find, replacer);
};

var parseSearchParams = function (result, query) {
  if (query) {
    var attributes = query.split('&');
    var index = 0;
    var attribute, entry;
    while (index < attributes.length) {
      attribute = attributes[index++];
      if (attribute.length) {
        entry = attribute.split('=');
        result.push({
          key: deserialize(entry.shift()),
          value: deserialize(entry.join('='))
        });
      }
    }
  }
};

var updateSearchParams = function (query) {
  this.entries.length = 0;
  parseSearchParams(this.entries, query);
};

var validateArgumentsLength = function (passed, required) {
  if (passed < required) throw TypeError('Not enough arguments');
};

var URLSearchParamsIterator = createIteratorConstructor(function Iterator(params, kind) {
  setInternalState(this, {
    type: URL_SEARCH_PARAMS_ITERATOR,
    iterator: getIterator(getInternalParamsState(params).entries),
    kind: kind
  });
}, 'Iterator', function next() {
  var state = getInternalIteratorState(this);
  var kind = state.kind;
  var step = state.iterator.next();
  var entry = step.value;
  if (!step.done) {
    step.value = kind === 'keys' ? entry.key : kind === 'values' ? entry.value : [entry.key, entry.value];
  } return step;
});

// `URLSearchParams` constructor
// https://url.spec.whatwg.org/#interface-urlsearchparams
var URLSearchParamsConstructor = function URLSearchParams(/* init */) {
  anInstance(this, URLSearchParamsConstructor, URL_SEARCH_PARAMS);
  var init = arguments.length > 0 ? arguments[0] : undefined;
  var that = this;
  var entries = [];
  var iteratorMethod, iterator, next, step, entryIterator, entryNext, first, second, key;

  setInternalState(that, {
    type: URL_SEARCH_PARAMS,
    entries: entries,
    updateURL: function () { /* empty */ },
    updateSearchParams: updateSearchParams
  });

  if (init !== undefined) {
    if (isObject(init)) {
      iteratorMethod = getIteratorMethod(init);
      if (typeof iteratorMethod === 'function') {
        iterator = iteratorMethod.call(init);
        next = iterator.next;
        while (!(step = next.call(iterator)).done) {
          entryIterator = getIterator(anObject(step.value));
          entryNext = entryIterator.next;
          if (
            (first = entryNext.call(entryIterator)).done ||
            (second = entryNext.call(entryIterator)).done ||
            !entryNext.call(entryIterator).done
          ) throw TypeError('Expected sequence with length 2');
          entries.push({ key: first.value + '', value: second.value + '' });
        }
      } else for (key in init) if (hasOwn(init, key)) entries.push({ key: key, value: init[key] + '' });
    } else {
      parseSearchParams(entries, typeof init === 'string' ? init.charAt(0) === '?' ? init.slice(1) : init : init + '');
    }
  }
};

var URLSearchParamsPrototype = URLSearchParamsConstructor.prototype;

redefineAll(URLSearchParamsPrototype, {
  // `URLSearchParams.prototype.appent` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-append
  append: function append(name, value) {
    validateArgumentsLength(arguments.length, 2);
    var state = getInternalParamsState(this);
    state.entries.push({ key: name + '', value: value + '' });
    state.updateURL();
  },
  // `URLSearchParams.prototype.delete` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-delete
  'delete': function (name) {
    validateArgumentsLength(arguments.length, 1);
    var state = getInternalParamsState(this);
    var entries = state.entries;
    var key = name + '';
    var index = 0;
    while (index < entries.length) {
      if (entries[index].key === key) entries.splice(index, 1);
      else index++;
    }
    state.updateURL();
  },
  // `URLSearchParams.prototype.get` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-get
  get: function get(name) {
    validateArgumentsLength(arguments.length, 1);
    var entries = getInternalParamsState(this).entries;
    var key = name + '';
    var index = 0;
    for (; index < entries.length; index++) {
      if (entries[index].key === key) return entries[index].value;
    }
    return null;
  },
  // `URLSearchParams.prototype.getAll` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-getall
  getAll: function getAll(name) {
    validateArgumentsLength(arguments.length, 1);
    var entries = getInternalParamsState(this).entries;
    var key = name + '';
    var result = [];
    var index = 0;
    for (; index < entries.length; index++) {
      if (entries[index].key === key) result.push(entries[index].value);
    }
    return result;
  },
  // `URLSearchParams.prototype.has` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-has
  has: function has(name) {
    validateArgumentsLength(arguments.length, 1);
    var entries = getInternalParamsState(this).entries;
    var key = name + '';
    var index = 0;
    while (index < entries.length) {
      if (entries[index++].key === key) return true;
    }
    return false;
  },
  // `URLSearchParams.prototype.set` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-set
  set: function set(name, value) {
    validateArgumentsLength(arguments.length, 1);
    var state = getInternalParamsState(this);
    var entries = state.entries;
    var found = false;
    var key = name + '';
    var val = value + '';
    var index = 0;
    var entry;
    for (; index < entries.length; index++) {
      entry = entries[index];
      if (entry.key === key) {
        if (found) entries.splice(index--, 1);
        else {
          found = true;
          entry.value = val;
        }
      }
    }
    if (!found) entries.push({ key: key, value: val });
    state.updateURL();
  },
  // `URLSearchParams.prototype.sort` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-sort
  sort: function sort() {
    var state = getInternalParamsState(this);
    var entries = state.entries;
    // Array#sort is not stable in some engines
    var slice = entries.slice();
    var entry, entriesIndex, sliceIndex;
    entries.length = 0;
    for (sliceIndex = 0; sliceIndex < slice.length; sliceIndex++) {
      entry = slice[sliceIndex];
      for (entriesIndex = 0; entriesIndex < sliceIndex; entriesIndex++) {
        if (entries[entriesIndex].key > entry.key) {
          entries.splice(entriesIndex, 0, entry);
          break;
        }
      }
      if (entriesIndex === sliceIndex) entries.push(entry);
    }
    state.updateURL();
  },
  // `URLSearchParams.prototype.forEach` method
  forEach: function forEach(callback /* , thisArg */) {
    var entries = getInternalParamsState(this).entries;
    var boundFunction = bind(callback, arguments.length > 1 ? arguments[1] : undefined, 3);
    var index = 0;
    var entry;
    while (index < entries.length) {
      entry = entries[index++];
      boundFunction(entry.value, entry.key, this);
    }
  },
  // `URLSearchParams.prototype.keys` method
  keys: function keys() {
    return new URLSearchParamsIterator(this, 'keys');
  },
  // `URLSearchParams.prototype.values` method
  values: function values() {
    return new URLSearchParamsIterator(this, 'values');
  },
  // `URLSearchParams.prototype.entries` method
  entries: function entries() {
    return new URLSearchParamsIterator(this, 'entries');
  }
}, { enumerable: true });

// `URLSearchParams.prototype[@@iterator]` method
redefine(URLSearchParamsPrototype, ITERATOR, URLSearchParamsPrototype.entries);

// `URLSearchParams.prototype.toString` method
// https://url.spec.whatwg.org/#urlsearchparams-stringification-behavior
redefine(URLSearchParamsPrototype, 'toString', function toString() {
  var entries = getInternalParamsState(this).entries;
  var result = [];
  var index = 0;
  var entry;
  while (index < entries.length) {
    entry = entries[index++];
    result.push(serialize(entry.key) + '=' + serialize(entry.value));
  } return result.join('&');
}, { enumerable: true });

setToStringTag(URLSearchParamsConstructor, URL_SEARCH_PARAMS);

$({ global: true, forced: !USE_NATIVE_URL }, {
  URLSearchParams: URLSearchParamsConstructor
});

// Wrap `fetch` for correct work with polyfilled `URLSearchParams`
// https://github.com/zloirock/core-js/issues/674
if (!USE_NATIVE_URL && typeof $fetch == 'function' && typeof Headers == 'function') {
  $({ global: true, enumerable: true, forced: true }, {
    fetch: function fetch(input /* , init */) {
      var args = [input];
      var init, body, headers;
      if (arguments.length > 1) {
        init = arguments[1];
        if (isObject(init)) {
          body = init.body;
          if (classof(body) === URL_SEARCH_PARAMS) {
            headers = init.headers ? new Headers(init.headers) : new Headers();
            if (!headers.has('content-type')) {
              headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
            }
            init = create(init, {
              body: createPropertyDescriptor(0, String(body)),
              headers: createPropertyDescriptor(0, headers)
            });
          }
        }
        args.push(init);
      } return $fetch.apply(this, args);
    }
  });
}

module.exports = {
  URLSearchParams: URLSearchParamsConstructor,
  getState: getInternalParamsState
};


/***/ }),
/* 133 */
/***/ (function(module, exports, __webpack_require__) {

var redefine = __webpack_require__(19);

module.exports = function (target, src, options) {
  for (var key in src) redefine(target, key, src[key], options);
  return target;
};


/***/ }),
/* 134 */
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(13);
var getIteratorMethod = __webpack_require__(52);

module.exports = function (it) {
  var iteratorMethod = getIteratorMethod(it);
  if (typeof iteratorMethod != 'function') {
    throw TypeError(String(it) + ' is not iterable');
  } return anObject(iteratorMethod.call(it));
};


/***/ }),
/* 135 */
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
/* 136 */
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
/* 137 */
/***/ (function(module, exports, __webpack_require__) {

var root = __webpack_require__(82);

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
/* 138 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

module.exports = freeGlobal;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(30)))

/***/ }),
/* 139 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(53),
    isSymbol = __webpack_require__(140);

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
/* 140 */
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__(141),
    isObjectLike = __webpack_require__(144);

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
/* 141 */
/***/ (function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__(83),
    getRawTag = __webpack_require__(142),
    objectToString = __webpack_require__(143);

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
/* 142 */
/***/ (function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__(83);

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
/* 143 */
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
/* 144 */
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


/***/ })
/******/ ])["default"];
});
//# sourceMappingURL=epub.js.map