export function DisabledComponentAspect(componentPropertiesAspect, picks, multiSelectInlineLayoutAspect, picksDom){
    let isComponentDisabled;
    return {
        updateDisabledComponent(){
            let newIsComponentDisabled = componentPropertiesAspect.getDisabled();
            if (isComponentDisabled!==newIsComponentDisabled){
                isComponentDisabled=newIsComponentDisabled;
                picks.disableRemoveAll(newIsComponentDisabled);
                multiSelectInlineLayoutAspect.disable(newIsComponentDisabled);
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

export function LoadAspect(fillChoicesAspect, multiSelectInlineLayoutAspect, appearanceAspect){
    return {
        load(){
            fillChoicesAspect.fillChoices(
                (c,e) => multiSelectInlineLayoutAspect.adoptChoiceElement(c,e),
                (s) => multiSelectInlineLayoutAspect.handleOnRemoveButton(s)
            );
            appearanceAspect.updateAppearance(); 
        }
    }
}