export function DisabledComponentAspect(componentPropertiesAspect, picks, multiSelectInputAspect, picksDom){
    let isComponentDisabled;
    return {
        updateDisabledComponent(){
            let newIsComponentDisabled = componentPropertiesAspect.getDisabled();
            if (isComponentDisabled!==newIsComponentDisabled){
                isComponentDisabled=newIsComponentDisabled;
                picks.disableRemoveAll(newIsComponentDisabled);
                multiSelectInputAspect.disable(newIsComponentDisabled);
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

export function LoadAspect(fillChoicesAspect, multiSelectInputAspect, appearanceAspect){
    return {
        load(){
            fillChoicesAspect.fillChoices(
                (c,e) => multiSelectInputAspect.adoptChoiceElement(c,e),
                (s) => multiSelectInputAspect.handleOnRemoveButton(s)
            );
            appearanceAspect.updateAppearance(); 
        }
    }
}