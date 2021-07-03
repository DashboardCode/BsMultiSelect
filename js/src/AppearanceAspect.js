
export function SetDisabledComponentAspect(picksList, picksDom){
    return {
        setDisabledComponent(isComponentDisabled){
            picksList.forEach(pick=>pick.pickDomManagerHandlers.updateComponentDisabled())
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
