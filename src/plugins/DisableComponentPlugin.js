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
                var {updateAppearanceAspect, picksList, picksDom, picksElementAspect} = aspects;

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
    pickDomFactory.create = (pick) => {
        origCreatePickDomFactory(pick);
        let pickDomManagerHandlers = pick.pickDomManagerHandlers;
        pickDomManagerHandlers.updateComponentDisabled = () => {
            if (pickDomManagerHandlers.disableButton)
                pickDomManagerHandlers.disableButton(disabledComponentAspect.getDisabled()??false)
        };
        pickDomManagerHandlers.updateComponentDisabled();
    }
}