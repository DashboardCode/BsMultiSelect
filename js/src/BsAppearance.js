import {addClass, removeClass, closestByTagName, closestByClassName} from './ToolsDom';
import {setStyling} from './ToolsStyling'

function updateIsValid(picksElement, isValid, isInvalid){
    if (isValid)
        addClass(picksElement,'is-valid');
    else
        removeClass(picksElement,'is-valid');
    
    if (isInvalid)
        addClass(picksElement,'is-invalid');
    else
        removeClass(picksElement,'is-invalid');
}

function updateIsValidForAdapter(picksElement, optionsAdapter){
    updateIsValid(picksElement, optionsAdapter.getIsValid(), optionsAdapter.getIsInvalid())
}

export function pushIsValidClassToPicks(staticContent, css){
    var defFocusIn = staticContent.focusIn;
    staticContent.focusIn = () => {
        var picksElement = staticContent.picksElement;
        if (picksElement.classList.contains("is-valid")) { 
            setStyling(picksElement, css.picks_focus_valid)
        } else if (picksElement.classList.contains("is-invalid")) {
            setStyling(picksElement, css.picks_focus_invalid)
        } else {
            defFocusIn()
        }
    }
}

function updateSize(picksElement, size){
    if (size=="lg"){
        addClass(picksElement,'form-control-lg');
        removeClass(picksElement,'form-control-sm');
    }
    else if (size=="sm"){
        removeClass(picksElement,'form-control-lg');
        addClass(picksElement,'form-control-sm');
    }
    else{
        removeClass(picksElement,'form-control-lg');
        removeClass(picksElement,'form-control-sm');
    }
}

function updateSizeJs(picksElement, picksLgStyling, picksSmStyling, picksDefStyling, size){
    updateSize(picksElement, size);
    if (size=="lg"){
        setStyling(picksElement, picksLgStyling);
    } else if (size=="sm"){
        setStyling(picksElement, picksSmStyling);
    } else {
        setStyling(picksElement, picksDefStyling);
    }
}

function updateSizeForAdapter(picksElement, optionsAdapter){
    updateSize(picksElement, optionsAdapter.getSize())
}

function updateSizeJsForAdapter(picksElement, picksLgStyling, picksSmStyling, picksDefStyling, optionsAdapter){
    updateSizeJs(picksElement, picksLgStyling, picksSmStyling, picksDefStyling,  optionsAdapter.getSize())
}

export function createBsAppearance(picksElement, optionsAdapter, useCssPatch, css){
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
    return value;
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
