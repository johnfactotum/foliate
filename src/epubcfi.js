/*

EPUB CFI utilities
Modified from Epub.js

Original file:
https://github.com/futurepress/epub.js/blob/90604b6bee8b95c9ecc3b586700e3f7e7be392ed/src/epubcfi.js

---

Copyright (c) 2013, FuturePress

All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

The views and conclusions contained in the software and documentation are those
of the authors and should not be interpreted as representing official policies,
either expressed or implied, of the FreeBSD Project.
*/

function extend(target) {
	var sources = [].slice.call(arguments, 1);
	sources.forEach(function (source) {
		if(!source) return;
		Object.getOwnPropertyNames(source).forEach(function(propName) {
			Object.defineProperty(target, propName, Object.getOwnPropertyDescriptor(source, propName));
		});
	});
	return target;
}

function type(obj){
	return Object.prototype.toString.call(obj).slice(8, -1);
}

function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

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
var EpubCFI = class EpubCFI {
	constructor(cfiFrom, base, ignoreClass){
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

		if(typeof base === "string") {
			this.base = this.parseComponent(base);
		} else if(typeof base === "object" && base.steps) {
			this.base = base;
		}

		type = this.checkType(cfiFrom);


		if(type === "string") {
			this.str = cfiFrom;
			return extend(this, this.parse(cfiFrom));
		} else if (type === "range") {
			return extend(this, this.fromRange(cfiFrom, this.base, ignoreClass));
		} else if (type === "node") {
			return extend(this, this.fromNode(cfiFrom, this.base, ignoreClass));
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
			return "string";
		// Is a range object
		} else if (cfi && typeof cfi === "object" && (type(cfi) === "Range" || typeof(cfi.startContainer) != "undefined")){
			return "range";
		} else if (cfi && typeof cfi === "object" && typeof(cfi.nodeType) != "undefined" ){ // || typeof cfi === "function"
			return "node";
		} else if (cfi && typeof cfi === "object" && cfi instanceof EpubCFI){
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

		if(typeof cfiStr !== "string") {
			return {spinePos: -1};
		}

		if(cfiStr.indexOf("epubcfi(") === 0 && cfiStr[cfiStr.length-1] === ")") {
			// Remove intial epubcfi( and ending )
			cfiStr = cfiStr.slice(8, cfiStr.length-1);
		}

		baseComponent = this.getChapterComponent(cfiStr);

		// Make sure this is a valid cfi or return
		if(!baseComponent) {
			return {spinePos: -1};
		}

		cfi.base = this.parseComponent(baseComponent);

		pathComponent = this.getPathComponent(cfiStr);
		cfi.path = this.parseComponent(pathComponent);

		range = this.getRange(cfiStr);

		if(range) {
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

	parseComponent(componentStr){
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

		if(parts.length > 1) {
			terminal = parts[1];
			component.terminal = this.parseTerminal(terminal);
		}

		if (steps[0] === "") {
			steps.shift(); // Ignore the first slash
		}

		component.steps = steps.map(function(step){
			return this.parseStep(step);
		}.bind(this));

		return component;
	}

	parseStep(stepStr){
		var type, num, index, has_brackets, id;

		has_brackets = stepStr.match(/\[(.*)\]/);
		if(has_brackets && has_brackets[1]){
			id = has_brackets[1];
		}

		//-- Check if step is a text node or element
		num = parseInt(stepStr);

		if(isNaN(num)) {
			return;
		}

		if(num % 2 === 0) { // Even = is an element
			type = "element";
			index = num / 2 - 1;
		} else {
			type = "text";
			index = (num - 1 ) / 2;
		}

		return {
			"type" : type,
			"index" : index,
			"id" : id || null
		};
	}

	parseTerminal(termialStr){
		var characterOffset, textLocationAssertion;
		var assertion = termialStr.match(/\[(.*)\]/);

		if(assertion && assertion[1]){
			characterOffset = parseInt(termialStr.split("[")[0]);
			textLocationAssertion = assertion[1];
		} else {
			characterOffset = parseInt(termialStr);
		}

		if (!isNumber(characterOffset)) {
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

		if(indirection[1]) {
			let ranges = indirection[1].split(",");
			return ranges[0];
		}

	}

	getRange(cfiStr) {

		var ranges = cfiStr.split(",");

		if(ranges.length === 3){
			return [
				ranges[1],
				ranges[2]
			];
		}

		return false;
	}

	getCharecterOffsetComponent(cfiStr) {
		var splitStr = cfiStr.split(":");
		return splitStr[1] || "";
	}

	joinSteps(steps) {
		if(!steps) {
			return "";
		}

		return steps.map(function(part){
			var segment = "";

			if(part.type === "element") {
				segment += (part.index + 1) * 2;
			}

			if(part.type === "text") {
				segment += 1 + (2 * part.index); // TODO: double check that this is odd
			}

			if(part.id) {
				segment += "[" + part.id + "]";
			}

			return segment;

		}).join("/");

	}

	segmentString(segment) {
		var segmentString = "/";

		segmentString += this.joinSteps(segment.steps);

		if(segment.terminal && segment.terminal.offset != null){
			segmentString += ":" + segment.terminal.offset;
		}

		if(segment.terminal && segment.terminal.assertion != null){
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
		cfiString += this.segmentString(this.path);

		// Add Range, if present
		if(this.range && this.start) {
			cfiString += ",";
			cfiString += this.segmentString(this.start);
		}

		if(this.range && this.end) {
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
	static compare(cfiOne, cfiTwo) {
		var stepsA, stepsB;
		var terminalA, terminalB;

		var rangeAStartSteps, rangeAEndSteps;
		var rangeBEndSteps, rangeBEndSteps;
		var rangeAStartTerminal, rangeAEndTerminal;
		var rangeBStartTerminal, rangeBEndTerminal;

		if(typeof cfiOne === "string") {
			cfiOne = new EpubCFI(cfiOne);
		}
		if(typeof cfiTwo === "string") {
			cfiTwo = new EpubCFI(cfiTwo);
		}
		// Compare Spine Positions
		if(cfiOne.spinePos > cfiTwo.spinePos) {
			return 1;
		}
		if(cfiOne.spinePos < cfiTwo.spinePos) {
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
			if(!stepsA[i]) {
				return -1;
			}
			if(!stepsB[i]) {
				return 1;
			}
			if(stepsA[i].index > stepsB[i].index) {
				return 1;
			}
			if(stepsA[i].index < stepsB[i].index) {
				return -1;
			}
			// Otherwise continue checking
		}

		// All steps in First equal to Second and First is Less Specific
		if(stepsA.length < stepsB.length) {
			return -1;
		}

		// Compare the charecter offset of the text node
		if(terminalA.offset > terminalB.offset) {
			return 1;
		}
		if(terminalA.offset < terminalB.offset) {
			return -1;
		}

		// CFI's are equal
		return 0;
	}

	/**
	 * Check if a string is wrapped with "epubcfi()"
	 * @param {string} str
	 * @returns {boolean}
	 */
	isCfiString(str) {
		if(typeof str === "string" &&
			str.indexOf("epubcfi(") === 0 &&
			str[str.length-1] === ")") {
			return true;
		}

		return false;
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
