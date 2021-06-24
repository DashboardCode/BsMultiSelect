import {closestByClassName, siblingsAsArray} from '../ToolsDom';
import {addStyling} from '../ToolsStyling'
import {ObservableLambda, composeSync} from '../ToolsJs';

export function BsAppearancePlugin(pluginData){
    let {configuration, validationApiPluginData, 
        picksDom, staticDom, labelPluginData, appearanceAspect, componentPropertiesAspect, floatingLabelAspect} = pluginData;
    let {getValidity, getSize, useCssPatch, css, composeGetSize, getDefaultLabel} = configuration;
    let selectElement = staticDom.selectElement;
    
    let initialElement = staticDom.initialElement;

    let isFloatingLabel = false;
    if (floatingLabelAspect){
        isFloatingLabel =  closestByClassName(initialElement, 'form-floating');
        floatingLabelAspect.isFloatingLabel = () => isFloatingLabel
    }

    if (labelPluginData){
        let origGetLabelElementAspect = labelPluginData.getLabelElementAspect;
        labelPluginData.getLabelElementAspect = () => {
            var e = origGetLabelElementAspect();
            if (e)
                return e;
            else{
                if (selectElement){
                    let labelElement = getDefaultLabel(selectElement);
                    return labelElement;
                }
            }
        }
    }
    
    if (staticDom.selectElement) {
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

    componentPropertiesAspect.getSize=getSize;
    componentPropertiesAspect.getValidity=getValidity;

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
        var wasValidatedElement = closestByClassName(staticDom.initialElement, 'was-validated');
        return wasValidatedElement?true:false;
    }
    var wasUpdatedObservable = ObservableLambda(()=>getWasValidated());
    var getManualValidationObservable = ObservableLambda(()=>getValidity());
    let validationApiObservable = validationApiPluginData?.validationApiObservable;
    
    var validationObservable = ObservableLambda(
        () => wasUpdatedObservable.getValue()?validationApiObservable.getValue():getManualValidationObservable.getValue()
    )
  
    validationObservable.attach(
        (value)=>{
            var  {validMessages, invalidMessages} = getMessagesElements(staticDom.containerElement);
            updateValidity( picksDom.picksElement, validMessages, invalidMessages, value);
            picksDom.toggleFocusStyling();
        }
    )
    wasUpdatedObservable.attach(
        ()=>validationObservable.call()
    )
    if (validationApiObservable)
    validationApiObservable.attach(
        ()=>validationObservable.call()
    )
    getManualValidationObservable.attach(
        ()=>validationObservable.call()
    )

    appearanceAspect.updateAppearance = composeSync(
        appearanceAspect.updateAppearance, 
        updateSize, 
        validationObservable.call, getManualValidationObservable.call);

    return {
        buildApi(api){
            api.updateSize = updateSize;
            api.updateValidity = ()=> getManualValidationObservable.call();
            api.updateWasValidated = ()=>wasUpdatedObservable.call();
        },
        dispose(){
            wasUpdatedObservable.detachAll();
            validationObservable.detachAll();
            getManualValidationObservable.detachAll();
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



