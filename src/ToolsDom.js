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

export function composeEventTrigger(window){ 
    let trigger;
    if (typeof(window.Event) === 'function'){
        trigger = (e, eventName) =>{ 
            var event = new window.Event(eventName);
            e.dispatchEvent(event);
        }
    }
    else
        trigger = (e, eventName) =>  { // IE 11 polyfill
            let event = window.document.createEvent("CustomEvent");
            event.initCustomEvent(eventName, false, false, undefined);
            e.dispatchEvent(event);
    }
    return trigger;
}

export function closestByTagName(element, tagName){
    return closest(element, e => e.tagName === tagName) // TODO support xhtml?  e.tagName.toUpperCase() ?
}

export function closestByClassName(element, className){
    return closest(element, e => e.classList.contains(className))
}

export function closestByAttribute(element, attributeName, attribute){
    return closest(element, e => e.getAttribute(attributeName)===attribute )
}

export function containsAndSelf(node, otherNode ){
    return node === otherNode || node.contains(otherNode);  
}

export function getDataGuardedWithPrefix(element, prefix, name){
    var tmp1 = element.getAttribute('data-' + prefix + '-' + name);
    if (tmp1) {
        return tmp1;
    } else  {
        var tmp2 = element.getAttribute('data-' + name);
        if (tmp2)
            return tmp2;
    }
    return null;
}

function closest(element, predicate){
    if (!element || !(element instanceof Element)) return null; // should be element, not document (TODO: check iframe)
     
    if (predicate(element)) return element;
    return closest(element.parentNode, predicate);
}

export function siblingsAsArray(element){
    var value = []
    if (element.parentNode){
        var children = element.parentNode.children;
        var l = element.parentNode.children.length;
        if (children.length>1){
            for (var i=0; i < l; ++i){
                var e = children[i];
                if (e!=element)
                    value.push(e);
                
            }
        }
    }
    return value;
}

export function getIsRtl(element){
    var isRtl = false;
    var e = closestByAttribute(element,"dir","rtl");
    if (e)
        isRtl = true;
    return isRtl;
}

export function EventBinder(){
    var list = [];
    return {
        bind(element, eventName, handler) {
            element.addEventListener(eventName, handler)
            list.push( {element, eventName, handler} )
        },
        unbind() {
            list.forEach( e=> {
                let {element, eventName, handler}=e;
                element.removeEventListener(eventName, handler)
            })
        }
    }
}

export function EventTumbler(element, eventName, handler){
    return {
        on() {
            element.addEventListener(eventName, handler)
        },
        off() {
            element.removeEventListener(eventName, handler)
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
            list.forEach(e=>{
                let {element, attributeName, attribute} = e;
                if (attributeName)
                    element.setAttribute(attributeName, attribute)
                else
                    element.removeAttribute(attributeName)
            })
        }
    }
}

export function EventLoopFlag(window) {
    var flag = false;
    return {
        get(){
            return flag;
        },
        set(){
            flag = true;
            pr = window.setTimeout( 
                () => {  
                        flag = false;
            })
            
        }
    }
}

export function EventLoopProlongableFlag(window) {
    var flag = false;
    var pr = null;
    return {
        get(){
            return flag;
        },
        set(timeout){
            if (flag && pr){
                window.clearTimeout(pr);
            }
            flag = true;
            pr = window.setTimeout( 
                () => {  
                        flag = false;
                        pr=null;
                }, timeout?timeout:0)
            
        }
    }
}

export function ResetableFlag() {
    var flag = false;
    return {
        get(){
            return flag;
        },
        set(){
            flag = true;
        },
        reset(){
            flag = false;
        }
    }
}