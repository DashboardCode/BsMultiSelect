import {addClass, removeClass} from './DomTools';

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

function updateSize(picksElement, size){
    if (size=="custom-select-lg"){
        addClass(picksElement,'form-control-lg');
        removeClass(picksElement,'form-control-sm');
    }
    else if (size=="custom-select-sm"){
        removeClass(picksElement,'form-control-lg');
        addClass(picksElement,'form-control-sm');
    }
    else{
        removeClass(picksElement,'form-control-lg');
        removeClass(picksElement,'form-control-sm');
    }
}

function updateSizeJs(picksElement, lgMinHeight, smMinHeight, defMinHeight, size){
    updateSize(picksElement, size);
    if (size=="custom-select-lg" || size=="input-group-lg"){
        picksElement.style.minHeight=lgMinHeight; 
    } else if (size=="custom-select-sm" || size=="input-group-sm"){
        picksElement.style.minHeight=smMinHeight; 
    } else {
        picksElement.style.minHeight=defMinHeight;
    }
}

function createBsAppearanceWithCss(picksElement){
    return Object.create({
        updateIsValid: (isValid, isInvalid) => updateIsValid(picksElement, isValid, isInvalid),
        updateSize: (size) => updateSize(picksElement, size)
    });
}

function createBsAppearanceWithJs(picksElement, lgMinHeight, smMinHeight, defMinHeight){
    return Object.create({
        updateIsValid: (isValid, isInvalid) => updateIsValid(picksElement, isValid, isInvalid),
        updateSize: (size) => updateSizeJs(picksElement, lgMinHeight, smMinHeight, defMinHeight, size)
    });
}

function createBsAppearanceForConfiguration(picksElement, configuration){
    if (configuration.useCss){
        return createBsAppearanceWithCss(picksElement);
    }else{
        return createBsAppearanceWithJs(picksElement
            ,configuration.selectedPanelLgMinHeight
            ,configuration.selectedPanelSmMinHeight
            ,configuration.selectedPanelDefMinHeight)
    }
}

export function createBsAppearance(picksElement, configuration, optionsAdapter){
    var internal = createBsAppearanceForConfiguration(picksElement, configuration);
    return Object.create({
        updateIsValid: () => internal.updateIsValid(optionsAdapter.getIsValid(), optionsAdapter.getIsInvalid()),
        updateSize: () => internal.updateSize(optionsAdapter.getSize())
    });
}