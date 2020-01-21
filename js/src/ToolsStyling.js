import {shallowClone, isString} from './ToolsJs';

export function addStyling(element, styling){
    if (styling) {
        var {classes, styles} = styling;
        classes.forEach(e => element.classList.add(e)) // todo use add(classes)
        for (let property in styles)
            element.style[property]  = styles[property]; // todo use Object.assign (need polyfill for IE11)
    }
}

export function removeStyling(element, styling){
    if (styling) {
        var {classes, styles} = styling;
        classes.forEach(e=>element.classList.remove(e)) // todo use remove(classes)
        for (let property in styles)
            element.style[property]  = ''; // todo use Object.assign (need polyfill for IE11)
    }
}

export function toggleStyling(element, styling, value){
    var action = value?addStyling:removeStyling;
    action(element, styling)
}

function extendClasses(out, param, actionStr, actionArr){
    if (isString(param)){
        out.classes = actionStr(param.split(' '));
        return true;
    } else if (param instanceof Array){
        out.classes = actionArr(param);
        return true;
    }
    return false;
}

function extend(value, param, actionStr, actionArr, actionObj){
    var success = extendClasses(value, param, actionStr, actionArr);
    if (success === false){
        if (param instanceof Object){
            var {classes, styles} = param;
            if (classes){
                extendClasses(value, classes, actionStr, actionArr);
            }
            if (styles) {
                value.styles = actionObj(styles);
            } else if (!classes) {
                value.styles = actionObj(param)
            }
        }
    }
}

export function Styling(param){
    var value = {classes:[], styles:{}};
    if (param){
        extend(value, param, a=>a, a=>a.slice(), o=>shallowClone(o));
    }
    return Object.freeze(value);
}

function createStylingReplaceClasses(param, ...params){
    var value = {classes:[], styles:{}};
    if (param){
        extend(value, param, a=>a, a=>a.slice(), o=>shallowClone(o));
        if (params){
            var {classes, styles} = value;
            params.forEach( p=>
                extend(value, p, a=>classes.concat(a), a=>classes.concat(a), o=>shallowClone(styles, o))); // add classes
        }
    }
    return Styling(value);
}

function createStylingJoinClasses(param, ...params){
    var value = {classes:[], styles:{}};
    if (param){
        extend(value, param, a=>a, a=>a.slice(), o=>shallowClone(o));
        if (params){
            let {styles} = value;
            params.forEach( p=>
                extend(value, param, s=>s, a=>a.slice(), o=> shallowClone(styles, o))); // override classes
        }
    }
    return Styling(value);
}

export function createCss(stylings1, stylings2){
    var destination = {};
    for (let property in stylings1) {
        let param1 = stylings1[property];

        let param2 = stylings2?stylings2[property]:undefined;
        if (param2===undefined)
            destination[property] = Styling(param1)
        else{
            destination[property] = createStylingJoinClasses(param1, param2); 
        }
    }
    if (stylings2)
        for (let property in stylings2) {
            destination[property] = Styling(stylings2[property])
        }
    return destination;
}

export function extendCss(stylings1, stylings2){
    for (let property in stylings2) {
        let param2 = stylings2[property];
        let param1 = stylings1[property];
        if (param1 === undefined)
            stylings1[property] = Styling(param2)
        else{
            stylings1[property] = createStylingReplaceClasses(param1, param2); 
        }
    }
}