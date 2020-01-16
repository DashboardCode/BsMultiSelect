import {extendAndOverride} from './ToolsJs';
import {setClassAndStyle, unsetClassAndStyle} from './ToolsDom';


function extractClasses(styling){
    var value=[];
    if (styling instanceof String){
        value = [...styling.split(' ')];
    } else if (styling instanceof Array){
        value = [...styling];
    } else if (styling instanceof Object){
        if (styling.classes){
            if (styling.classes instanceof String){
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
        if (styling instanceof String){
            destination.classes = [...styling.split(' ')];
        } else if (styling instanceof Array){
            destination.classes = [...styling];
        } else if (styling instanceof Object){
            if (styling.classes){
                if (styling.classes instanceof String){
                    destination.classes = [...styling.classes.split(' ')];
                } else if (styling.classes instanceof Array){
                    destination.classes = [...styling.classes];
                }
            } 
            else
            {
                if (styling.styles) {
                    extendAndOverride(destination.styles, styling.styles)
                } else {
                    extendAndOverride(destination.styles, styling)
                }
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
            mergeStylingItem(destination[property], stylings[property]);
        }
    }
    return destination;
}

export function mergeStylings(stylings, compensations){
    if (compensations)
    {
        for (let property in compensations)
        {
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
        sourceStylings[name] =  {styles:{}, classe:[]}
    }
    if (!destStylings[name])
        destStylings[name] = {styles:{}, classe:[]}
    var classes = extractClasses(sourceStylings[name]);
    destStylings[name].classes=classes;
}

export function setStyling(styling){
    setClassAndStyle(styling.classes, styling.styles)
}

export function unsetStyling(styling){
    unsetClassAndStyle(styling.classes, styling.styles)
}