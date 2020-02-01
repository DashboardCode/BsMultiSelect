import {closestByTagName, closestByClassName, siblingsAsArray} from './ToolsDom';
import {addStyling} from './ToolsStyling'

export function updateValidity(picksElement, validMessages, invalidMessages, validity){
    console.log("updateValidity validity="+validity)
    if (validity===false){
        picksElement.classList.add('is-invalid');
        picksElement.classList.remove('is-valid');
        invalidMessages.map(e=>e.style.display='block'); 
        validMessages.map(e=>e.style.display='none');      
    }
    else  if (validity===true){
        picksElement.classList.remove('is-invalid');
        picksElement.classList.add('is-valid');
        invalidMessages.map(e=>e.style.display='none'); 
        validMessages.map(e=>e.style.display='block'); 
    }else {
        picksElement.classList.remove('is-invalid');
        picksElement.classList.remove('is-valid');
        invalidMessages.map(e=>e.style.display=''); 
        validMessages.map(e=>e.style.display=''); 
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



export function bsAppearance(multiSelect, staticContent, picksElement, optionsAdapter, 
    useCssPatch, wasUpdatedObservable, getWasValidated, validationObservable, css){
    var value=null;

    // var getValidity = ()=> {
    //     var validity = null;
    //     if (picksElement.classList.contains("is-valid")){
    //         validity =  true;
    //     } else if (picksElement.classList.contains("is-invalid")){
    //         validity =  false;
    //     }
    //     console.log("contains validity "+validity)
    //     return validity;
    // }

    if (useCssPatch){
        var defFocus = staticContent.focus;
        staticContent.focus = (isFocusIn) => {
            var validity =  validationObservable.getValue();

            if (isFocusIn)
            {
                if (validity===false) { 
                    staticContent.isActive=isFocusIn;
                    addStyling(picksElement, css.picks_focus_invalid)
                } else if (validity===true) {
                    staticContent.isActive=isFocusIn;
                    addStyling(picksElement, css.picks_focus_valid)
                } else {
                    defFocus(isFocusIn)
                }
            }
            else{
                defFocus(isFocusIn)
            }
            //setBsFocusCss(picksElement, isFocusIn, validity , defFocus, css);
        }
    }

    var updateWasValidated =() => {
        var value = getWasValidated();
        wasUpdatedObservable.setValue(value);
        return value;
        //updateWasValidatedForAdapter(containerElement, picksElement, binder)
    }
    
   

    if (!useCssPatch){
        value= Object.create({
            updateValidity: 
                ()=>validationObservable.setValue(optionsAdapter.getIsInvalid()===true?false:(optionsAdapter.getIsValid()===true?true:null))
            ,
            updateWasValidated,
            updateSize: () => updateSizeForAdapter(picksElement, optionsAdapter)
        });
    }else{
        const {picks_lg, picks_sm, picks_def} = css;
        value= Object.create({
            updateValidity: ()=>
                validationObservable.setValue(optionsAdapter.getIsInvalid()===true?false:(optionsAdapter.getIsValid()===true?true:null)),
                //updateValidity(picksElement, validMessages, invalidMessages,
                //optionsAdapter.getIsInvalid()===true?false:(optionsAdapter.getIsValid()===true?true:null)
            //),
            updateWasValidated,
            updateSize: () => updateSizeJsForAdapter(picksElement, 
                picks_lg, picks_sm, picks_def, optionsAdapter)
        });
    }
    multiSelect.UpdateSize = value.updateSize;
    multiSelect.UpdateValidity = value.updateValidity;
    multiSelect.UpdateWasValidated = value.updateWasValidated;
    
    multiSelect.onUpdate = () => {
        value.updateSize();
        var wasVildatedPresent = value.updateWasValidated();
        if (!wasVildatedPresent)
            value.updateValidity();
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

export function getMessagesElements(containerElement){
    var siblings = siblingsAsArray(containerElement);
    var invalidMessages =  siblings.filter(e=>e.classList.contains('invalid-feedback') || 
        e.classList.contains('invalid-tooltip'));
    var validMessages =  siblings.filter(e=>e.classList.contains('valid-feedback') || 
        e.classList.contains('valid-tooltip'));
    return {validMessages, invalidMessages}    
} 

export function getLabelElement(selectElement){
    let value = null;
    let formGroup = closestByClassName(selectElement,'form-group');
    if (formGroup) {
        value = formGroup.querySelector(`label[for="${selectElement.id}"]`);
    }
    return value;
}
