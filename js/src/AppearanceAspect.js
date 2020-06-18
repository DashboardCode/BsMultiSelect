export function DisabledComponentAspect(componentPropertiesAspect, picks, picksDom,
    disableComponent 
    ){
    let isComponentDisabled;
    return {
        updateDisabledComponent(){
            let newIsComponentDisabled = componentPropertiesAspect.getDisabled();
            if (isComponentDisabled!==newIsComponentDisabled){
                isComponentDisabled=newIsComponentDisabled;
                picks.disableRemoveAll(newIsComponentDisabled);
                disableComponent(newIsComponentDisabled);
                picksDom.disable(newIsComponentDisabled);
            }
        }
    }
}

export function AppearanceAspect(disabledComponentAspect){
    return {
        updateAppearance(){
            disabledComponentAspect.updateDisabledComponent();
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