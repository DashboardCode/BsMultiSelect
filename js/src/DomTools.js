export function addClass(element, classes){
    modifyClass(classes, e=>element.classList.add(e))
}

export function removeClass(element, classes){
    modifyClass(classes, e=>element.classList.remove(e))
}

function modifyClass(classes, modify){
    if (classes){
        if (Array.isArray(classes))
            classes.forEach(e => modify(e))
        else{
            var array = classes.split(" ");
            array.forEach(e => modify(e))
        }
    }
}