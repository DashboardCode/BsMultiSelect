import {extendAndOverride, isString} from './ToolsJs';
import {setClassAndStyle, unsetClassAndStyle} from './ToolsDom';


function extractClasses(styling){
    var value=[];
    if (isString(styling)){
        value = [...styling.split(' ')];
    } else if (styling instanceof Array){
        value = [...styling];
    } else if (styling instanceof Object){
        if (styling.classes){
            if (isString(styling.classes)){
                value = [...styling.classes.split(' ')];
            } else if (styling.classes instanceof Array){
                value = [...styling.classes];
            }
        }
    }
    return value; 
}

function mergeStylingItem(destination, styling){
    if (styling)
    {
        if (isString(styling)){
            destination.classes=destination.classes.concat(styling.split(' '));
        } else if (styling instanceof Array){
            destination.classes=destination.classes.concat(styling);
        } else if (styling instanceof Object){
            if (styling.classes){
                if (isString(styling.classes)){
                    destination.classes=destination.classes.concat(styling.classes.split(' '))
                } else if (styling.classes instanceof Array){
                    destination.classes=destination.classes.concat(styling.classes)
                }
            } 
            if (styling.styles) {
                extendAndOverride(destination.styles, styling.styles);
            } else if (!styling.classes){
                extendAndOverride(destination.styles, styling)
            }
        }
    }
    return destination;
}

function copyStylingItem(destination, styling){
    if (styling)
    {
        if (isString(styling)){
            destination.classes = styling.split(' ');
        } else if (styling instanceof Array){
            destination.classes = styling.slice();
        } else if (styling instanceof Object){
            if (styling.classes){
                if (isString(styling.classes)){
                    destination.classes = styling.classes.split(' ')
                } else if (styling.classes instanceof Array){
                    destination.classes = styling.classes.slice()
                }
            } 
            if (styling.styles) {
                extendAndOverride(destination.styles, styling.styles);
            } else if (!styling.classes) {
                extendAndOverride(destination.styles, styling)
            }
        }
    }
    return destination;
}


export function cloneStylings(stylings){
    var destination = {};
    if (stylings)
    {
        for (let property in stylings)
        {
            destination[property] = {classes:[], styles:{}};
            copyStylingItem(destination[property], stylings[property]);
        }
    }
    return destination;
}

export function mergeStylings(stylings, compensations){
    if (compensations)
    {
        for (let property in compensations)
        {
            if (!stylings[property])
                stylings[property] = {classes:[], styles:{}};
                mergeStylingItem(stylings[property], compensations[property]);
        }
    }
    return stylings;
}

export function setStylingStyles(stylings, name, styles){
    var styling = stylings[name]
    if (!styling){
        styling = {styles:{}, classe:[]}
        stylings[name] = styling
    }
    extendAndOverride(styling.styles, styles);
}

export function setStylingСlasses(destStylings, name, sourceStylings){
    if (!sourceStylings[name]){
        sourceStylings[name] =  {styles:{}, classes:[]}
    }
    if (!destStylings[name])
        destStylings[name] = {styles:{}, classes:[]}
    var classes = extractClasses(sourceStylings[name]);
    destStylings[name].classes=classes;
}

export function setStyling(element, styling){
    setClassAndStyle(element, styling.classes, styling.styles)
}

export function unsetStyling(element, styling){
    unsetClassAndStyle(element, styling.classes, styling.styles)
}