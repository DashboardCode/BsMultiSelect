export function isObject(value){
    return typeof value === 'object' && value !== null
}

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
        let next = getNext(e);
        let prev = getPrev(e);
        if (prev) {
            setNext(prev, next)
        }
        if (next) {
             setPrev(next, prev)
        }
        if (tail == e) {
            tail = prev;
        }
        if (head == e) {
            head = next; 
        }
        count--;
    }
    return {
        add(e, next){
            if (!tail){
                head = tail = e;
            }
            else {
                if (!next){
                    setPrev(e, tail);
                    setNext(tail, e);
                    tail = e;
                } 
                else{
                    if (next===head)
                        head=e;
                    let prev = getPrev(next);
                    setNext(e, next);
                    setPrev(next, e);
                    if (prev){
                        setPrev(e, prev);
                        setNext(prev, e);
                    } else {
                        setPrev(e, null);
                    }
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

export function CollectionFacade(getPrev, setPrev, getNext, setNext){
    var list = [];
    var head = null, tail = null;
    var count = 0;
    var remove = (key) => {
        var e = list[key];
        list.splice(key, 1);
        let next = getNext(e);
        let prev = getPrev(e);
        if (prev) {
            setNext(prev, next)
        }
        if (next) {
             setPrev(next, prev)
        }
        if (tail == e) {
            tail = prev;
        }
        if (head == e) {
            head = next; 
        }
        count--;
        return e;
    }
    return {
        getLength(){
            return list.length;
        },
        push(e){
            list.push(e);
            if (!tail){
                head = tail = e;
            }
            else {
                setPrev(e, tail);
                setNext(tail, e);
                tail = e;
            }
            count++;
        },
        add(e, key){
            if (!tail){
                head = tail = e;
            }
            else {
                let next = list[key];
                if (!next) {
                    setPrev(e, tail);
                    setNext(tail, e);
                    tail = e;
                } 
                else {
                    list.splice(key, 0, e);

                    if (next===head)
                        head=e;
                    let prev = getPrev(next);
                    setNext(e, next);
                    setPrev(next, e);
                    if (prev){
                        setPrev(e, prev);
                        setNext(prev, e);
                    } else {
                        setPrev(e, null);
                    }
                } 
            }
            count++;
        },
        get: (key) => list[key],
        remove, 
        forLoop(f){
            for(let i=0; i<list.length; i++)
            {
                let e = list[i];
                f(e);
            }
        },
        getHead(){ return head },
        getTail(){ return tail },
        getCount(){ return count },
        isEmpty(){ return count==0 },
        reset(){ 
            list=[];
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
            if (f instanceof Function){
                let tmp =  f();
                if (tmp)
                    return tmp;
            }
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