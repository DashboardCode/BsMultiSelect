export function ExtendIfUndefined(destination, source) {
    for (var property in source)
        if (destination[property] === undefined)
            destination[property] = source[property];
}

export function ExtendIfUndefinedFluent(destination, source) {
    ExtendIfUndefined(destination, source);
    return destination;
}