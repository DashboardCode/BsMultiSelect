import {pushUnique, isString} from './ToolsJs';

export function removeElement(e) {e.parentNode.removeChild(e)}

export function findDirectChildByTagName(element, tagName){
    let value = null;
    for (let i = 0; i<element.children.length; i++)
    {
        let tmp = element.children[i];
        if (tmp.tagName==tagName)
        {
            value = tmp;
            break;
        }
    }
    return value;
}

export function closestByTagName(element, tagName){
    return closest(element, e => e.tagName===tagName)
}

export function closestByClassName(element, className){
    return closest(element, e => e.classList.contains(className))
}

function closest(element, predicate){
    if (!element || !(element instanceof Element)) return null; // should be element, not document (TODO: check iframe)
     
    if (predicate(element)) return element;
    return closest(element.parentNode, predicate);
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

// export function setStyle(element, style){
//     for (let property in style)
//         element.style[property] = style[property];
// }

function modifyClasses(classes, modify){
    if (classes){
        if (Array.isArray(classes))
            classes.forEach(e => modify(e))
        else{
            let array = classes.split(" ");
            array.forEach(e => modify(e))
        }
    }
}

// export function removeChildren(element){
//     var toRemove = element.firstChild;
//     while( toRemove ) {
//         element.removeChild( toRemove );
//         toRemove = element.firstChild;
//     }
// }

export function setClassAndStyle(element, classes, styles){
    classes.forEach(
        function(e){
            element.classList.add(e);
        }
    )
    for (let property in styles)
        element.style[property]  = styles[property];
}

export function unsetClassAndStyle(element, classes, styles){
    classes.forEach(
        function(e){
            element.classList.remove(e);
        }
    )
    for (let property in styles)
        element.style[property]  = '';
}

export function EventBinder(){
    var list = [];
    return {
        bind(element, eventName, handler){
            element.addEventListener(eventName, handler)
            list.push( {element, eventName, handler} )
        },
        unbind(){
            list.forEach( e=>
            {
                let {element, eventName, handler}=e;
                element.removeEventListener(eventName, handler)
            })
        }
    }
}