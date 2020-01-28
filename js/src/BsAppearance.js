import {closestByTagName, closestByClassName, siblingsAsArray} from './ToolsDom';
import {addStyling} from './ToolsStyling'

function updateValidityForAdapter(container, picksElement, optionsAdapter){

    var siblings = siblingsAsArray(container);
    if (optionsAdapter.getIsValid()){ // todo use classList.toggle('is-valid', isValid)
        picksElement.classList.add('is-valid');
        siblings.filter(e=>e.classList.contains('valid-feedback') || 
            e.classList.contains('valid-tooltip')).map(e=>e.style.display='block');
    }
    else{
        siblings.filter(e=>e.classList.contains('valid-feedback') || 
            e.classList.contains('valid-tooltip')).map(e=>e.style.display='');      
        picksElement.classList.remove('is-valid');
    }
    
    if (optionsAdapter.getIsInvalid()){
        siblings.filter(e=>e.classList.contains('invalid-feedback') || 
        e.classList.contains('invalid-tooltip')).map(e=>e.style.display='block');      

        picksElement.classList.add('is-invalid');
    }
    else{
        siblings.filter(e=>e.classList.contains('invalid-feedback') || 
        e.classList.contains('invalid-tooltip')).map(e=>e.style.display=''); 
        picksElement.classList.remove('is-invalid');
    }
}

function updateWasValidatedForAdapter(){
    
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

export function bsAppearance(multiSelect, container, picksElement, optionsAdapter, useCssPatch, css){
    var value=null;
    var updateValidity = () => updateValidityForAdapter(container, picksElement, optionsAdapter);
    var updateWasValidated =() =>updateWasValidatedForAdapter(picksElement, optionsAdapter);
    if (!useCssPatch){
        value= Object.create({
            updateValidity,
            updateWasValidated,
            updateSize: () => updateSizeForAdapter(picksElement, optionsAdapter)
        });
    }else{
        const {picks_lg, picks_sm, picks_def} = css;
        value= Object.create({
            updateValidity,
            updateWasValidated,
            updateSize: () => updateSizeJsForAdapter(picksElement, 
                picks_lg, picks_sm, picks_def, optionsAdapter)
        });
    }
    multiSelect.UpdateSize = value.updateSize;
    multiSelect.UpdateValidity = value.updateValidity;
    multiSelect.UpdateWasValidated = value.updateWasValidated;
    
    multiSelect.onUpdate=() => {
        value.updateSize();
        value.updateValidity();
        value.updateWasValidated();
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
    
    if (!configuration.getCount) {
        configuration.getCount = ()=>{
            var count = 0;
            var options = selectElement.options;
            for (var i=0; i < options.length; i++) {
                if (options[i].selected) count++;
            }
            console.log("getCount "+ count);
            return count;
        }
    }
    
    if (!configuration.getIsValid) {
        configuration.getIsValid = function()
        { 
            var x = selectElement.classList.contains('is-valid') || 
                (closestByClassName(selectElement, 'was-validated')!=null && selectElement.checkValidity() )
            return x;
        }
    }
    if (!configuration.getIsInvalid) {
        configuration.getIsInvalid = function()
        { 
            var x = selectElement.classList.contains('is-invalid') ||
                (closestByClassName(selectElement, 'was-validated')!=null && !selectElement.checkValidity() )
            return x;
        }
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
