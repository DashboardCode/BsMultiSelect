export function DisabledComponentAspect(componentAspect, picks, multiSelectInputAspect, picksDom){
    let isComponentDisabled;
    return {
        updateDisabled(){
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
            disabledComponentAspect.updateDisabled();
        }
    }
}

export function LoadAspect(choicesAspect, multiSelectInputAspect, appearanceAspect){
    return {
        load(){
            choicesAspect.updateDataImpl(
                (c,e) => multiSelectInputAspect.adoptChoiceElement(c,e),
                (o,s) => multiSelectInputAspect.handleOnRemoveButton(o,s)
            );
            appearanceAspect.updateAppearance(); 
        }
    }
}