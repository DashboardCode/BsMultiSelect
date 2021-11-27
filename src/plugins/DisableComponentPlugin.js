import { extend } from 'jquery';
import {composeSync} from '../ToolsJs';

export function DisableComponentPlugin(){
    return {
        plug
    }
}

export function plug(){ 
    return (aspects) => {
        return {
            plugStaticDom: () => {
                var {pickDomFactory, componentPropertiesAspect} = aspects;
                ExtendPickDomFactory(pickDomFactory, componentPropertiesAspect);
            },
            layout: () => {
                var {updateAppearanceAspect, picksList, picksDom, componentPropertiesAspect, picksElementAspect} = aspects;

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
                    let newIsComponentDisabled = componentPropertiesAspect.getDisabled();
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

function ExtendPickDomFactory(pickDomFactory, componentPropertiesAspect){
    var origCreatePickDomFactory = pickDomFactory.create;
    pickDomFactory.create = (pickElement, wrap, remove) => {
        var value = origCreatePickDomFactory(pickElement, wrap, remove);
        value.pickDomManagerHandlers.updateComponentDisabled = () => {
            value.pickDom.pickButtonElement.disabled = componentPropertiesAspect.getDisabled()
        };
        return value;
    }
}