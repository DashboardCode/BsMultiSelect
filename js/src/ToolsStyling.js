import {shallowClearClone, isString} from './ToolsJs';

export function addStyling(element, styling){
    var backupStyling = {classes:[], styles:{}}
    if (styling) {
        var {classes, styles} = styling;
        classes.forEach(e => element.classList.add(e)) // todo use add(classes)
        backupStyling.classes = classes.slice();
        for (let property in styles){
            backupStyling.styles[property] = element.style[property];
            element.style[property] = styles[property]; // todo use Object.assign (need polyfill for IE11)
        }
    }
    return backupStyling;
}

function removeStyling(element, styling){
    if (styling) {
        var {classes, styles} = styling;
        classes.forEach(e=>element.classList.remove(e)) // todo use remove(classes)
        for (let property in styles)
            element.style[property]  = styles[property]; // todo use Object.assign (need polyfill for IE11)
    }
}

export function toggleStyling(element, styling){
    var backupStyling = {classes:[], styles:{}};
    var isOn=false;
    return (value)=>{
        if (value) {
            if (isOn===false){
                backupStyling = addStyling(element, styling)
                isOn=true;
            }
        } else {
            if (isOn===true){
                removeStyling(element,backupStyling);
                isOn=false;
            }
        }
    }
}

function extendClasses(out, param, actionStr, actionArr, isRemoveEmptyClasses){
    if (isString(param)){
        let c = param.split(' ');
        if (!isRemoveEmptyClasses || c.length>0)
            out.classes = actionStr(c);
        else if (c=="")
            out.classes = [];
        return true;
    } else if (param instanceof Array){
        if (!isRemoveEmptyClasses || param.length>0)
            out.classes = actionArr(param);
        else if (param.length==0)
            out.classes = [];
        return true;
    }
    return false;
}

function extend(value, param, actionStr, actionArr, actionObj, isRemoveEmptyClasses){
    var success = extendClasses(value, param, actionStr, actionArr, isRemoveEmptyClasses);
    if (success === false){
        if (param instanceof Object){
            var {classes, styles} = param;
            extendClasses(value, classes, actionStr, actionArr, isRemoveEmptyClasses);
            
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
        extend(value, param, a=>a, a=>a.slice(), o=>shallowClearClone(o), true);
    }
    return Object.freeze(value);
}

function createStyling(isReplace, param, ...params){
    var value = {classes:[], styles:{}};
    if (param){
        extend(value, param, a=>a, a=>a.slice(), o=>shallowClearClone(o),true);
        if (params){
            var {classes, styles} = value;
            var extendInt = isReplace? (p)=>extend(value, p, s=>s, a=>a.slice(), o=> shallowClearClone(styles, o),true):
                (p)=>extend(value, p, a=>classes.concat(a), a=>classes.concat(a), o=>shallowClearClone(styles, o),false)
            params.forEach(p=> extendInt(p));
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
            destination[property] = createStyling(true, param1, param2); 
        }
    }
    if (stylings2)
        for (let property in stylings2) {
            if (!stylings1[property])
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
            stylings1[property] = createStyling(false, param1, param2); 
        }
    }
}