export function isBoolean(value){
    return value === true || value === false;
}

export function isString(value){
    return value instanceof String || typeof(value) === 'string';
}

export function extendIfUndefined(destination, source) {
    for (let property in source)
        if (destination[property] === undefined)
            destination[property] = source[property];
}

export function extendOverriding(destination, source) {
    for (let property in source)
        destination[property] = source[property];
}

export function shallowClearClone(source, ...sources) { // override previous, no null and undefined
    var destination = {};
    for (let property in source){ // TODO:  Object.assign (need polyfill for IE11)
        let v = source[property];
        if (!(v === null || v===undefined))
            destination[property] = v;
    }
    if(sources)
        sources.forEach(
            s=>{
                for(let property in s){
                    let v = s[property];
                    if (!(v === null || v===undefined))
                        destination[property] = v;
                    else
                        if (destination.hasOwnProperty(property)){
                            delete destination[property];
                        }
                }
            }
        )
    return destination;
}

function forEachRecursion(f, i){
    if (!i)
        return;
    f(i.value); 
    forEachRecursion(f, i.prev);
}

export function List(){
    var tail = null;
    var count = 0;
    return {
        add(e){
            if (tail){
                tail.next = {value:e, prev:tail, next:null};
                tail = tail.next;
            } else 
                tail = {value:e, prev:null, next:null}
            count++;
            let node = tail;
            function remove(){
                if (node.prev){
                    (node.prev).next = node.next;
                }
                if (node.next){
                    (node.next).prev = node.prev;
                }
                if (tail == node){
                    tail = node.prev;
                }
                count--;
            }
            return remove;
        },
        forEach(f){
            forEachRecursion(f, tail);
        },
        getTail(){ return (tail)?tail.value:null },
        getCount(){ return count },
        isEmpty(){ return count==0 },
        reset(){ tail=null; 
            count = 0 }
    }
}

export function ListFacade(getPrev, setPrev, getNext, setNext){
    var head = null, tail = null;
    var count = 0;
    var remove = (e) => {
        if (getPrev(e)) {
            setNext(getPrev(e), getNext(e))
        }
        if (getNext(e)) {
             setPrev(getNext(e), getPrev(e))
        }
        if (tail == e) {
            tail = getPrev(e);
        }
        if (head == e) {
            head = null;
        }
        count--;
    }
    return {
        add(e, prev){
            if (!tail){
                head = tail = e;
            }
            else {
                if (!prev || prev===tail){
                    setPrev(e, tail);
                    setNext(tail, e);
                    tail = e;
                }
                else{
                    setPrev(e, prev);
                    setNext(e, getNext(prev));
                    setNext(prev, e);
                    setPrev(e.next, e);
                } 
            }
            count++;
        },
        remove, 
        forEach(f){
            forEachRecursion(f, tail);
        },
        getHead(){ return head },
        getTail(){ return tail },
        getCount(){ return count },
        isEmpty(){ return count==0 },
        reset(){ 
            tail=head=null; 
            count = 0; }
    }
}

export function pushUnique(array, item){
    if(array.indexOf(item) == -1) {
        array.push(item);
            return true;
    }
    return false;
} 

export function composeSync(...functions){
    return () => sync(...functions)
}

export function sync(...functions){
    functions.forEach(
        (f) => {
            if (f)
                f();
        }
    )
}

export function def(...functions){
    for (let f of functions) 
        if (f) {
           return f;
        }
}

export function defCall(...functions){
    for (let f of functions) 
        if (f) {
            if (f instanceof Function)
                return f()
            else
                return f 
        }
}


export function Observable(){
    var list = [];
    return {
        trigger(){
            f();
        },
        attach(f){
            list.push(f)
        },
        detachAll(){
            list.length = 0;
        }
    }
}

export function ObservableValue(value){
    var list = List();
    return {
        getValue(){
            return value;
        },
        setValue(newValue){
            value = newValue;
            list.forEach(f=>f(newValue));
        },
        attach(f){
            return list.add(f)
        },
        detachAll(){
            list.reset();
        }
    }
}

// export function isFunction(obj){
//     return typeof obj === 'function'
// }

export function ObservableLambda(func){
    var list = List();
    var value = func();
    return {
        getValue(){
            return value;
        },
        call(){
            value = func();
            list.forEach(f=>f(value));
        },
        attach(f){
            return list.add(f)
        },
        detachAll(){
            list.reset();
        }
    }
}