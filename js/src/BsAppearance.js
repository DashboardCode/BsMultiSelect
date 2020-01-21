import {closestByTagName, closestByClassName} from './ToolsDom';
import {addStyling} from './ToolsStyling'

function updateIsValid(picksElement, isValid, isInvalid){
    if (isValid) // todo use classList.toggle('is-valid', isValid)
        picksElement.classList.add('is-valid');
    else
        picksElement.classList.remove('is-valid');
    
    if (isInvalid)
        picksElement.classList.add('is-invalid');
    else
        picksElement.classList.remove('is-invalid');
}

function updateIsValidForAdapter(picksElement, optionsAdapter){
    updateIsValid(picksElement, optionsAdapter.getIsValid(), optionsAdapter.getIsInvalid())
}

export function pushIsValidClassToPicks(staticContent, css){
    var defFocus = staticContent.focus;
    staticContent.focus = (isFocusIn) => {
        if (isFocusIn)
        {
            var picksElement = staticContent.picksElement;
            if (picksElement.classList.contains("is-valid")) { 
                addStyling(picksElement, css.picks_focus_valid)
            } else if (picksElement.classList.contains("is-invalid")) {
                addStyling(picksElement, css.picks_focus_invalid)
            } else {
                defFocus(isFocusIn)
            }
        }
        else{
            defFocus(isFocusIn)
        }
    }
}

function updateSize(picksElement, size){
    if (size=="lg"){
        picksElement.classList.add('form-control-lg');
        picksElement.classList.remove('form-control-sm');
    }
    else if (size=="sm"){
        picksElement.classList.remove('form-control-lg');
        picksElement.classList.add('form-control-sm');
    }
    else{
        picksElement.classList.remove('form-control-lg');
        picksElement.classList.remove('form-control-sm');
    }
}

function updateSizeJs(picksElement, picksLgStyling, picksSmStyling, picksDefStyling, size){
    updateSize(picksElement, size);
    if (size=="lg"){
        addStyling(picksElement, picksLgStyling);
    } else if (size=="sm"){
        addStyling(picksElement, picksSmStyling);
    } else {
        addStyling(picksElement, picksDefStyling);
    }
}

function updateSizeForAdapter(picksElement, optionsAdapter){
    updateSize(picksElement, optionsAdapter.getSize())
}

function updateSizeJsForAdapter(picksElement, picksLgStyling, picksSmStyling, picksDefStyling, optionsAdapter){
    updateSizeJs(picksElement, picksLgStyling, picksSmStyling, picksDefStyling,  optionsAdapter.getSize())
}

export function bsAppearance(multiSelect, picksElement, optionsAdapter, useCssPatch, css){
    var value=null;
    var updateIsValid = () => updateIsValidForAdapter(picksElement, optionsAdapter);
    if (!useCssPatch){
        value= Object.create({
            updateIsValid,
            updateSize: () => updateSizeForAdapter(picksElement, optionsAdapter)
        });
    }else{
        const {picks_lg, picks_sm, picks_def} = css;
        value= Object.create({
            updateIsValid,
            updateSize: () => updateSizeJsForAdapter(picksElement, 
                picks_lg, picks_sm, picks_def, optionsAdapter)
        });
    }
    multiSelect.UpdateSize = value.updateSize;
    multiSelect.UpdateIsValid = value.updateIsValid;
    multiSelect.onUpdate=() => {
        value.updateSize();
        value.updateIsValid();
    };
}


export function adjustBsOptionAdapterConfiguration(configuration, selectElement){
    if (!configuration.getDisabled) {
        var fieldsetElement = closestByTagName(selectElement, 'fieldset');
        if (fieldsetElement) {
            configuration.getDisabled = () => selectElement.disabled || fieldsetElement.disabled;
        } else {
            configuration.getDisabled = () => selectElement.disabled;
        }
    }

    if (!configuration.getSize) {
        var inputGroupElement = closestByClassName(selectElement, 'input-group');
        if (inputGroupElement)
            configuration.getSize = function(){
                var value = null;
                if (inputGroupElement.classList.contains('input-group-lg'))
                    value = 'lg';
                else if (inputGroupElement.classList.contains('input-group-sm'))
                    value = 'sm';
                return value;
            }
        else 
            configuration.getSize = function(){
                var value = null;
                if (selectElement.classList.contains('custom-select-lg') || selectElement.classList.contains('form-control-lg'))
                    value = 'lg';
                else if (selectElement.classList.contains('custom-select-sm') || selectElement.classList.contains('form-control-sm'))
                    value = 'sm'; 
                return value;
        }
    }

    if (!configuration.getIsValid) {
        configuration.getIsValid = function()
        { return selectElement.classList.contains('is-valid')}
    }
    if (!configuration.getIsInvalid) {
        configuration.getIsInvalid = function()
        { return selectElement.classList.contains('is-invalid')}
    }
}

export function getLabelElement(selectElement){
    let value = null;
    let formGroup = closestByClassName(selectElement,'form-group');
    if (formGroup) {
        value = formGroup.querySelector(`label[for="${selectElement.id}"]`);
    }
    return value;
}
