import {closestByClassName, siblingsAsArray} from '../ToolsDom';
import {addStyling} from '../ToolsStyling'
import {ObservableLambda, composeSync} from '../ToolsJs';

export function BsAppearancePlugin(){
    return {
        plug
    }
}

export function plug(configuration){ 
    let getSizeComponentAspect = {};
    let getValidityComponentAspect = {};
    return (aspects) => {
        aspects.getSizeComponentAspect = getSizeComponentAspect;
        aspects.getValidityComponentAspect = getValidityComponentAspect;
        return {
            // TODO1, LabelElement should be moved to StaticDomFactory and staticDom 
            // NOTE: preLayout means first after createStaticDom
            preLayout: () => {
                var {getLabelAspect, staticDom} = aspects; 
                var {selectElement} = staticDom;
                var {getDefaultLabel} = configuration;
                let origLabelAspectGetLabel = getLabelAspect.getLabel; 
                getLabelAspect.getLabel = () => {
                    var e = origLabelAspectGetLabel();
                    if (e)
                        return e;
                    else{
                        if (selectElement){
                            let labelElement = getDefaultLabel(selectElement);
                            return labelElement;
                        }
                    }
                }
            },
            layout: () => {
                let {validationApiAspect, 
                    picksDom, staticDom, updateAppearanceAspect, floatingLabelAspect} = aspects;
                let {getValidity, getSize, useCssPatch, css, composeGetSize} = configuration;
                
                let {selectElement, initialElement} = staticDom;
                
                let isFloatingLabel = false;
                if (floatingLabelAspect){
                    isFloatingLabel =  closestByClassName(initialElement, 'form-floating');
                    floatingLabelAspect.isFloatingLabel = () => isFloatingLabel
                }
            
                if (selectElement) {
                    if(!getValidity)
                        getValidity = composeGetValidity(selectElement)
                    if(!getSize) 
                        getSize = composeGetSize(selectElement)
                } else {
                    if (!getValidity)
                        getValidity = () => null
                    if (!getSize)
                        getSize = () => null
                }
            
                getSizeComponentAspect.getSize=getSize;
            
                getValidityComponentAspect.getValidity=getValidity;
            
                var updateSize;
                if (!useCssPatch){
                    updateSize= () => updateSizeForAdapter(picksDom.picksElement, getSize)
                }
                else{
                    let {picks_lg, picks_sm, picks_def, picks_floating_def} = css;
                    if (isFloatingLabel)
                        picks_lg = picks_sm = picks_def = picks_floating_def;
                    updateSize = () => updateSizeJsForAdapter(picksDom.picksElement, picks_lg, picks_sm, picks_def,  getSize);
                }
            
                if (useCssPatch){
                    var origToggleFocusStyling = picksDom.toggleFocusStyling;
                    picksDom.toggleFocusStyling = () => {
                        var validity =  validationObservable.getValue();
                        var isFocusIn = picksDom.getIsFocusIn();
                        origToggleFocusStyling(isFocusIn)
                        if (isFocusIn){
                            if (validity===false) { 
                                // but not toggle events (I know it will be done in future)
                                picksDom.setIsFocusIn(isFocusIn);
                                
                                addStyling(picksDom.picksElement, css.picks_focus_invalid)
                            } else if (validity===true) {
                                // but not toggle events (I know it will be done in future)
                                picksDom.setIsFocusIn(isFocusIn);
                                
                                addStyling(picksDom.picksElement, css.picks_focus_valid)  
                            }              
                        }
                    }
                }
            
                var getWasValidated = () => {
                    var wasValidatedElement = closestByClassName(initialElement, 'was-validated');
                    return wasValidatedElement?true:false;
                }
                
                var wasUpdatedObservable = ObservableLambda(()=>getWasValidated());
                var getManualValidationObservable = ObservableLambda(()=>getValidity());
                
                var validationObservable = ObservableLambda(
                    () => wasUpdatedObservable.getValue()?validationApiAspect.getValue():getManualValidationObservable.getValue()
                )
                
                validationObservable.attach(
                    (value)=>{
                        var  {validMessages, invalidMessages} = getMessagesElements(staticDom.containerElement);
                        updateValidity(picksDom.picksElement, validMessages, invalidMessages, value);
                        picksDom.toggleFocusStyling();
                    }
                )
                wasUpdatedObservable.attach(
                    ()=>validationObservable.call()
                )
                if (validationApiAspect)
                    validationApiAspect.attach(
                        ()=>validationObservable.call()
                    )
                getManualValidationObservable.attach(
                    ()=>validationObservable.call()
                )
                
                updateAppearanceAspect.updateAppearance = composeSync(
                    updateAppearanceAspect.updateAppearance, 
                    updateSize, 
                    validationObservable.call, 
                    getManualValidationObservable.call);
                
                return {
                    buildApi(api){
                        api.updateSize=updateSize;
                        api.updateValidity=()=>getManualValidationObservable.call();
                        api.updateWasValidated=()=>wasUpdatedObservable.call();
                    },
                    dispose(){
                        wasUpdatedObservable.detachAll();
                        validationObservable.detachAll();
                        getManualValidationObservable.detachAll();
                    }
                }
            }
        }
    }
}

function updateValidity(picksElement, validMessages, invalidMessages, validity){
    if (validity===false){
        picksElement.classList.add('is-invalid');
        picksElement.classList.remove('is-valid');
        invalidMessages.map(e=>e.style.display='block'); 
        validMessages.map(e=>e.style.display='none');      
    }
    else if (validity===true){
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

function updateSizeClasses(picksElement, size){
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

function updateSizeJsPicks(picksElement, picksLgStyling, picksSmStyling, picksDefStyling, size){
    if (size=="lg"){
        addStyling(picksElement, picksLgStyling);
    } else if (size=="sm"){
        addStyling(picksElement, picksSmStyling);
    } else {
        addStyling(picksElement, picksDefStyling);
    }
}

function updateSizeJs(picksElement, picksLgStyling, picksSmStyling, picksDefStyling, size){
    updateSizeClasses(picksElement, size);
    updateSizeJsPicks(picksElement, picksLgStyling, picksSmStyling, picksDefStyling, size)
}

function updateSizeForAdapter(picksElement, getSize){
    updateSizeClasses(picksElement, getSize())
}

function updateSizeJsForAdapter(picksElement, picksLgStyling, picksSmStyling, picksDefStyling, getSize){
    updateSizeJs(picksElement, picksLgStyling, picksSmStyling, picksDefStyling, getSize())
}

function getMessagesElements(containerElement){
    var siblings = siblingsAsArray(containerElement);
    var invalidMessages =  siblings.filter(e=>e.classList.contains('invalid-feedback') || 
        e.classList.contains('invalid-tooltip'));
    var validMessages =  siblings.filter(e=>e.classList.contains('valid-feedback') || 
        e.classList.contains('valid-tooltip'));
    return {validMessages, invalidMessages}    
} 

function composeGetValidity(selectElement){
    var getValidity = () => 
        selectElement.classList.contains('is-invalid')?false:
        (selectElement.classList.contains('is-valid')?true:null);
    return getValidity;
}