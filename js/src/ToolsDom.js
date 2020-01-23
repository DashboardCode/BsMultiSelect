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

export function closestByAttribute(element, attributeName, attribute){
    return closest(element, e => e.getAttribute(attributeName)===attribute )
}

function closest(element, predicate){
    if (!element || !(element instanceof Element)) return null; // should be element, not document (TODO: check iframe)
     
    if (predicate(element)) return element;
    return closest(element.parentNode, predicate);
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

export function AttributeBackup(){
    var list = [];
    return {
        set(element, attributeName, attribute){
            var currentAtribute =  element.getAttribute(attributeName); 
            list.push( {element, currentAtribute, attribute} )
            element.setAttribute(attributeName, attribute)
        },
        restore(){
            list.forEach( e =>
            {
                let {element, attributeName, attribute}=e;
                if (attributeName)
                    element.setAttribute(attributeName, attribute)
                else
                    element.removeAttribute(attributeName)
            })
        }
    }
}

export function EventSkipper(window) {
    var isSkippable = false;
    return {
        isSkippable(){
            return isSkippable;
        },
        setSkippable(){
            isSkippable = true;
            window.setTimeout( 
                () => {  
                    isSkippable = false;
                }, 0)
        }
    }
}