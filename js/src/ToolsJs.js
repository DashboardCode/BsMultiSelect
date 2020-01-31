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

export function shallowClone(source, ...sources) { // override previous
    var destination = {};
    for (let property in source) // TODO:  Object.assign (need polyfill for IE11)
         destination[property] = source[property];
    if(sources)
        sources.forEach(
            s=>{
                for(let property in s)
                    destination[property] = s[property];
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
                tail.next = {value:e, prev:tail};
                tail = tail.next;
            } else 
                tail = {value:e}
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

export function pushUnique(array, item){
    if(array.indexOf(item) == -1) {
        array.push(item);
            return true;
        }
    return false;
} 

export function sync(...functions){
    functions.forEach(
        (f) => {
            if (f)
                f();
        }
    )
}

// export function Observable(){
//     var list = [];
//     return {
//         trigger(){
//             f();
//         },
//         attach(f){
//             list.push(f)
//         },
//         detachAll(){
//             list.length = 0;
//         }
//     }
// }

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