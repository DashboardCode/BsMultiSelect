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
    let goOn = f(i.value); 
    if (!(goOn===false))
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

export function DoublyLinkedList(getPrev, setPrev, getNext, setNext){
    var head = null, tail = null;
    var count = 0;
    return {
        add(e, next){
            if (!tail){
                head = tail = e;
                setPrev(e, null);
                setNext(e, null);
            }
            else {
                if (!next){
                    setPrev(e, tail);
                    setNext(e, null);
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
        remove(e){
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

export function DoublyLinkedCollection(getPrev, setPrev, getNext, setNext){
    var list = [];
    var head = null, tail = null;
    return {
        push(e){
            list.push(e);
            if (!tail){
                head = tail = e;
                setPrev(e, null);
                setNext(e, null);
            }
            else {
                setPrev(e, tail);
                setNext(e, null);
                setNext(tail, e);
                tail = e;
            }
        },
        add(e, key){
            list.splice(key, 0, e);
            if (!tail){
                head = tail = e;
                setPrev(e, null);
                setNext(e, null);
            }
            else {
                let next = list[key];
                if (!next) {
                    setPrev(e, tail);
                    setNext(e, null);
                    setNext(tail, e);
                    tail = e;
                } 
                else {
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
        },
        get: (key) => list[key],
        remove(key){
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
            return e;
        }, 
        forLoop(f){
            for(let i=0; i<list.length; i++)
            {
                let e = list[i];
                f(e);
            }
        },
        getHead(){ return head },
        getTail(){ return tail },
        getCount(){ return list.length },
        isEmpty(){ return list.length==0 },
        reset(){ 
            list=[];
            tail=head=null; 
            }
    }
}

export function ArrayFacade(){
    var list = [];
    return {
        push(e){
            list.push(e);
        },
        add(e, key){
            list.splice(key, 0, e);
        },
        get: (key) => list[key],
        getNext: (key, predicate) => {
            let count = list.length;
            let start = key+1;
            if (key<count) {
                if (!predicate)
                    return list[start];
                for (let i = start; i < count; i++) {
                    let c = list[i];
                    if (predicate(c))
                        return c;
                }
            }
        },
        remove(key){
            var e = list[key];
            list.splice(key, 1);
            return e;
        }, 
        forLoop(f){
            for(let i=0; i<list.length; i++)
            {
                let e = list[i];
                f(e, i);
            }
        },
        getHead(){ return list[0] },
        getCount(){ return list.length },
        isEmpty(){ return list.length==0 },
        reset(){ list=[];}
    }
}

export function composeSync(...functions){
    return () => functions.forEach(
        (f) => {
            if (f)
                f();
        }
    )
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