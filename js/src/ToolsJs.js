export function extendIfUndefined(destination, source) {
    for (var property in source)
        if (destination[property] === undefined)
            destination[property] = source[property];
}

export function createEmpty(source, value) {
    var destination={};
    for (var property in source)
         destination[property] = value;
    return destination;
}

function forEachRecursion(f, i){
    if (!i)
        return;
    f(i.value); 
    forEachRecursion(f, i.prev);
};

export function List(){
    var tail = null;
    var count = 0;
    return {
        add(e){
            if (tail){
                tail.next = {value:e , prev:tail};
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
            forEachRecursion(f,tail);
        },
        getTail(){return (tail)?tail.value:null},
        getCount(){return count},
        isEmpty(){return count==0},
        reset(){tail=null;count=0;}
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
        function(f){
            if (f)
                f();
        }
    )
}