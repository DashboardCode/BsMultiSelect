import {setClassAndStyle, unsetClassAndStyle} from './ToolsJs';

function cloneStylingItem(source){
    var destination = null;
    if (source)
    {
        if (source instanceof String){
            destination.classes = Object.assign("", source);
        } else if (source instanceof Array){
            destination = [...source];
        } else if (source instanceof Object){
            if (source.classes){
                if (source instanceof String){
                    destination.classes = Object.assign("", source);
                } else if (classes instanceof Array){
                    destination.classes = [...source];
                }
            } else
            {
                if (source.styles) {
                    destination.styles=Object.assign({},source.styles);
                } else {
                    destination=Object.assign({},source.styles);
                }
            }
        }
    }
    return destination;
}

export function cloneStyling(source){
    var destination = null;
    if (source)
    {
        for (var property in source)
            destination.property = cloneStylingItem(source[property]);
    }
    return destination;
}

export function extendStyling(destination, source){
    if (source)
    {
        for (var property in source)
            if (destination.property==undefined)
                destination.property=cloneStylingItem(source[property]);
    }
    return destination;
}

export function setStyling(styling){
    setClassAndStyle(styling.classes, styling.styles)
}

export function unsetStyling(styling){
    unsetClassAndStyle(styling.classes, styling.styles)
}