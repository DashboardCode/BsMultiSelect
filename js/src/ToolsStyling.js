import {shallowClone, isString} from './ToolsJs';
import {setClassAndStyle, unsetClassAndStyle} from './ToolsDom';

export function setStyling(element, styling){
    if (styling)
        setClassAndStyle(element, styling.classes, styling.styles)
}

export function unsetStyling(element, styling){
    if (styling)
        unsetClassAndStyle(element, styling.classes, styling.styles)
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


function extendClassesAndStyles(value, param, actionStr, actionArr, actionObj){
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

export function Styling(param, ...params){
    var value = {classes:[], styles:{}};
    if (param){
        extendClassesAndStyles(value, param, a=>a, a=>a.slice(), o=>shallowClone(o));
        if (params){
            var {classes, styles} = value;
            params.forEach( p=>
                extendClassesAndStyles(value, p, a=>classes.concat(a), a=>classes.concat(a), o=>shallowClone(styles, o))); // add classes
        }
    }
    return Object.freeze(value);
}

export function createCss(stylings1, stylings2){
    var destination = {};
    for (let property in stylings1) {
        let param1 = stylings1[property];

        let param2 = stylings2?stylings2[property]:undefined;
        if (param2===undefined)
            destination[property] = Styling(param1)
        else{
            var styling = Styling(param1); 
            var {classes, styles} = styling;
            var value = {classes, styles};
            extendClassesAndStyles(value, param, s=>s, a=>a.slice(), o=> shallowClone(styles, o)); // override classes
            destination[property] = Styling(value); 
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
            stylings1[property] = Styling(param1, param2); 
        }
    }
}