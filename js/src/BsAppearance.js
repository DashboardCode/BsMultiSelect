import {addClass, removeClass, setStyles} from './ToolsDom';

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

function updateSizeJs(picksElement, picksStyleLg, picksStyleSm, picksStyleDef, size){
    updateSize(picksElement, size);
    if (size=="custom-select-lg" || size=="input-group-lg"){
        setStyles(picksElement, picksStyleLg);
    } else if (size=="custom-select-sm" || size=="input-group-sm"){
        setStyles(picksElement, picksStyleSm);
    } else {
        setStyles(picksElement, picksStyleDef);
    }
}

function updateIsValidForAdapter(picksElement, optionsAdapter){
    updateIsValid(picksElement, optionsAdapter.getIsValid(), optionsAdapter.getIsInvalid())
}

function updateSizeForAdapter(picksElement, optionsAdapter){
    updateSize(picksElement, optionsAdapter.getSize())
}

function updateSizeJsForAdapter(picksElement, picksStyleLg, picksStyleSm, picksStyleDef, optionsAdapter){
    updateSizeJs(picksElement, picksStyleLg, picksStyleSm, picksStyleDef,  optionsAdapter.getSize())
}

export function createBsAppearance(picksElement, configuration, optionsAdapter){
    var updateIsValid = () => updateIsValidForAdapter(picksElement, optionsAdapter);
    if (configuration.useCss){
        return Object.create({
            updateIsValid,
            updateSize: () => updateSizeForAdapter(picksElement, optionsAdapter)
        });
    }else{
        const {picksStyleLg, picksStyleSm, picksStyleDef} = configuration;
        return Object.create({
            updateIsValid,
            updateSize: () => updateSizeJsForAdapter(picksElement, 
                picksStyleLg, picksStyleSm, picksStyleDef, optionsAdapter)
        });
    }
}