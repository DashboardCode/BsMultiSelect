import {closestByClassName} from '../ToolsDom'
import {BsAppearancePlugin} from './BsAppearancePlugin'

export function BsAppearanceBs4Plugin(defaults) {
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
            if (element.classList.contains('custom-select-lg') || element.classList.contains('form-control-lg'))
                value = 'lg';
            else if (element.classList.contains('custom-select-sm') || element.classList.contains('form-control-sm'))
                value = 'sm'; 
            return value;
        }
    }
    return getSize;
}

function getDefaultLabel(element){
    let value = null;
    let formGroup = closestByClassName(element,'form-group');
    if (formGroup) 
        value = formGroup.querySelector(`label[for="${element.id}"]`);
    return value;
}