import {setClassAndStyle, unsetClassAndStyle} from './ToolsJs';
import {setStyle} from './ToolsDom';

function cloneStylingItem(source){
    var destination = null;
    if (source)
    {
        if (source instanceof String){
            destination.classes = source;
        } else if (source instanceof Array){
            destination = [...source];
        } else if (source instanceof Object){
            if (source.classes){
                if (source instanceof String){
                    destination.classes = source;
                } else if (destination.classes instanceof Array){
                    destination.classes = [...source];
                }
            } else
            {
                if (source.styles) {
                    destination.styles= { ...source.styles }
                } else {
                    destination= { ...source.styles } //Object.assign({},source.styles);
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
        for (let property in source)
            destination.property = cloneStylingItem(source[property]);
    }
    return destination;
}

export function extendStyling(destination, source){
    if (source)
    {
        for (let property in source)
            if (destination.property==undefined)
                destination.property=cloneStylingItem(source[property]);
    }
    return destination;
}


export function setStylingStyle(stylings, name, style){
    var s = stylings[name]
    if (!s){
        s = {style:{}}
        s = stylings[s]
    }
    setStyle(s, style);
}


export function setStyling(styling){
    setClassAndStyle(styling.classes, styling.styles)
}

export function unsetStyling(styling){
    unsetClassAndStyle(styling.classes, styling.styles)
}