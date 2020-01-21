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