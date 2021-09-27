import {composeSync} from '../ToolsJs';

export function DisableComponentPlugin(aspects){
    var {updateAppearanceAspect, picksList, picksDom, componentPropertiesAspect} = aspects;
    var disableComponentAspect = DisableComponentAspect(picksList, picksDom);
    aspects.disableComponentAspect=disableComponentAspect;

    let isComponentDisabled; // state! 
    function updateDisabled(){
        let newIsComponentDisabled = componentPropertiesAspect.getDisabled();
        if (isComponentDisabled!==newIsComponentDisabled){
            isComponentDisabled=newIsComponentDisabled;
            disableComponentAspect.disableComponent(newIsComponentDisabled);
        }
    }

    updateAppearanceAspect.updateAppearance = composeSync (updateAppearanceAspect.updateAppearance,  updateDisabled);
    
    return{
        buildApi(api){
            api.updateDisabled = updateDisabled;
        }
    }
}

function DisableComponentAspect(picksList, picksDom){
    return {
        disableComponent(isComponentDisabled){
            picksList.forEach(pick=>pick.pickDomManagerHandlers.updateComponentDisabled())
            picksDom.disable(isComponentDisabled);
        }
    }
}