import {composeSync} from '../ToolsJs';

export function DisableComponentPlugin(defaults){
    preset(defaults)
    return {
        plug
    }
}

export function preset(defaults){
    defaults.getDisabled = () => null;
}

export function plug(configuration){ 
    let disabledComponentAspect = DisabledComponentAspect(configuration.getDisabled);
    return (aspects) => {
        aspects.disabledComponentAspect=disabledComponentAspect;
        return {
            plugStaticDom: () => {
                var {pickDomFactory} = aspects;
                ExtendPickDomFactory(pickDomFactory, disabledComponentAspect);
            },
            layout: () => {
                var {updateAppearanceAspect, picksList, picksDom, picksElementAspect, buildPickAspect} = aspects;

                var disableComponent = (isComponentDisabled)=>{
                    picksList.forEach(pick=>pick.pickDomManagerHandlers.updateComponentDisabled())
                    picksDom.disable(isComponentDisabled);
                }

                var origOnClick = picksElementAspect.onClick;
                picksElementAspect.onClick = (handler)=>{
                    disableComponent = (isComponentDisabled)=>{
                        picksList.forEach(pick=>pick.pickDomManagerHandlers.updateComponentDisabled())
                        picksDom.disable(isComponentDisabled);
                        if (isComponentDisabled)
                            picksElementAspect.onClickUnbind(); //componentDisabledEventBinder.unbind();
                        else
                            origOnClick(handler); //componentDisabledEventBinder.bind(picksElement, "click",  handler); 
                    }
                } 
            
                let isComponentDisabled; // state! 
                function updateDisabled(){
                    let newIsComponentDisabled = disabledComponentAspect.getDisabled()??false;
                    if (isComponentDisabled!==newIsComponentDisabled){
                        isComponentDisabled=newIsComponentDisabled;
                        disableComponent(newIsComponentDisabled);
                    }
                }
            
                updateAppearanceAspect.updateAppearance = composeSync(updateAppearanceAspect.updateAppearance,  updateDisabled);
            
                let origBuildPick = buildPickAspect.buildPick;
                buildPickAspect.buildPick = (wrap /*, removeOnButton*/) => {
                    let pick = origBuildPick(wrap /*, removeOnButton*/);
                    
                    if (pick.pickDomManagerHandlers.updateComponentDisabled){
                        pick.pickDomManagerHandlers.updateComponentDisabled();
                    }
                    return pick;
                }

                return{
                    buildApi(api){
                        api.updateDisabled = updateDisabled;
                    }
                }
            }
        }
    }
}

export function DisabledComponentAspect(getDisabled) {
    return {
        getDisabled
    }
}

function ExtendPickDomFactory(pickDomFactory, disabledComponentAspect){
    var origCreatePickDomFactory = pickDomFactory.create;
    pickDomFactory.create = (pickElement, wrap/*, remove*/) => {
        var value = origCreatePickDomFactory(pickElement, wrap/*, remove*/);
        value.pickDomManagerHandlers.updateComponentDisabled = () => {
            if (value.pickDomManagerHandlers.disableButton)
                value.pickDomManagerHandlers.disableButton(disabledComponentAspect.getDisabled()??false)
        };
        return value;
    }
}