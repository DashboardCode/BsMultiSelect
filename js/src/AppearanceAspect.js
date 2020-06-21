
export function SetDisabledComponentAspect(picks, picksDom){
    return {
        setDisabledComponent(isComponentDisabled){
            picks.disableRemoveAll(isComponentDisabled);
            picksDom.disable(isComponentDisabled);
        }
    }
}

export function UpdateDisabledComponentAspect(componentPropertiesAspect, setDisabledComponentAspect
    ){
    let isComponentDisabled;
    return {
        updateDisabledComponent(){
            let newIsComponentDisabled = componentPropertiesAspect.getDisabled();
            if (isComponentDisabled!==newIsComponentDisabled){
                isComponentDisabled=newIsComponentDisabled;
                setDisabledComponentAspect.setDisabledComponent(newIsComponentDisabled);
            }
        }
    }
}

export function ResetLayoutAspect(resetLayout){
    return {
        resetLayout
    }
}

export function AppearanceAspect(updateDisabledComponentAspect){
    return {
        updateAppearance(){
            updateDisabledComponentAspect.updateDisabledComponent();
        }
    }
}

export function LoadAspect(fillChoicesAspect, appearanceAspect){
    return {
        load(){
            fillChoicesAspect.fillChoices();
            appearanceAspect.updateAppearance(); 
        }
    }
}