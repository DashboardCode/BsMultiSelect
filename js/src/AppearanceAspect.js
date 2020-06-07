export function DisabledComponentAspect(componentAspect, picks, multiSelectInputAspect, picksDom){
    let isComponentDisabled;
    return {
        updateDisabledComponent(){
            let newIsComponentDisabled = componentAspect.getDisabled();
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

export function LoadAspect(choicesAspect, multiSelectInputAspect, appearanceAspect){
    return {
        load(){
            choicesAspect.updateDataImpl(
                (c,e) => multiSelectInputAspect.adoptChoiceElement(c,e),
                (s) => multiSelectInputAspect.handleOnRemoveButton(s)
            );
            appearanceAspect.updateAppearance(); 
        }
    }
}