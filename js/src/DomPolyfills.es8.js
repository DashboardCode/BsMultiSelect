// polyfill Element.closest
// not referenced in main file. use it on demands.

if (!Element.prototype.matches){
	Element.prototype.matches = Element.prototype.msMatchesSelector ||
		Element.prototype.webkitMatchesSelector;
}
if (!Element.prototype.closest)
    Element.prototype.closest = function (s) {
        function recursion(elem){
			if (!(elem !== null && elem.nodeType === 1))
				return null;
			if (elem.matches(s))
				return elem;
			return recursion(elem.parentElement || elem.parentNode);
		}
		if (!document.documentElement.contains(this)) 
			return null;
		
		const result = recursion(this);
        return result;
	};