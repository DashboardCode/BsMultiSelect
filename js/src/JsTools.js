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