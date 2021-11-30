import {closestByClassName} from '../ToolsDom'
import {BsAppearancePlugin} from './BsAppearancePlugin'

export function BsAppearanceBs5Plugin(defaults) {
    defaults.composeGetSize = composeGetSize; // BsAppearancePlugin
    defaults.getDefaultLabel = getDefaultLabel; // FloatingLabelPlugin, BsAppearancePlugin
    return BsAppearancePlugin();
}

function composeGetSize(element){
    let inputGroupElement = closestByClassName(element, 'input-group');
    let getSize = null;
    if (inputGroupElement){
        getSize = function(){
            var value = null;
            if (inputGroupElement.classList.contains('input-group-lg'))
                value = 'lg';
            else if (inputGroupElement.classList.contains('input-group-sm'))
                value = 'sm';
            return value;
        }
    }
    else{ 
        getSize = function(){
            var value = null;
            if (element.classList.contains('form-select-lg') || element.classList.contains('form-control-lg')) // changed for BS
                value = 'lg';
            else if (element.classList.contains('form-select-sm') || element.classList.contains('form-control-sm'))
                value = 'sm'; 
            return value;
        }
    }
    return getSize;
}

function getDefaultLabel(element){
    let value = null;
    let query = `label[for="${element.id}"]`;
    let p1 = element.parentElement;
    value = p1.querySelector(query); // label can be wrapped into col-auto
    if (!value){
        let p2 = p1.parentElement;
        value = p2.querySelector(query);
    }
    return value;
}