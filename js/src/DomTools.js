export function removeElement(e) {e.parentNode.removeChild(e)}

export function findDirectChildByTagName(element, tagName){
    var returnValue = null;
    for (var i = 0; i<element.children.length; i++)
    {
        let tmp = element.children[i];
        if (tmp.tagName==tagName)
        {
            returnValue = tmp;
            break;
        }
    }
    return returnValue;
}

export function addClass(element, c){
    element.classList.add(c);
}

export function removeClass(element, c){
    element.classList.remove(c);
}

export function addClasses(element, classes){
    modifyClasses(classes, e=>addClass(element,e))
}

export function removeClasses(element, classes){
    modifyClasses(classes, e=>removeClass(element,e))
}

export function setStyles(element, styles){
    for (var property in styles)
        element.style[property] = styles[property];
}

function modifyClasses(classes, modify){
    if (classes){
        if (Array.isArray(classes))
            classes.forEach(e => modify(e))
        else{
            var array = classes.split(" ");
            array.forEach(e => modify(e))
        }
    }
}