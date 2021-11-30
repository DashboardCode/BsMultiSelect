import {EventBinder} from '../ToolsDom';
import {addStyling} from '../ToolsStyling';

export function PickButtonPlugCssPatchBs4(defaults){
    defaults.cssPatch.pickButton = {float : "none", fontSize:'1.5em', lineHeight: '.9em'}; 
    defaults.cssPatch.pick.lineHeight = '1.5em';
}

export function PickButtonPlugCssPatchBs5(defaults){
    defaults.cssPatch.pickButton = {float : "none", fontSize:'0.8em', verticalAlign: "text-top"};
    defaults.cssPatch.pick.color = 'var(--bs-dark)';
}

export function PickButtonBs4Plugin(defaults){
    defaults.pickButtonHTML = '<button aria-label="Remove" tabIndex="-1" type="button"><span aria-hidden="true">&times;</span></button>';
    defaults.css.pickButton = 'close';
    return PickButtonPlugin()
}

export function PickButtonBs5Plugin(defaults){
    defaults.pickButtonHTML = '<button aria-label="Remove" tabIndex="-1" type="button"></button>'; 
    defaults.css.pickButton = 'btn-close';
    return PickButtonPlugin()
}

export function PickButtonPlugin(){
    return {plug}
}

export function plug(configuration){
    return (aspects) => {
        return {
            plugStaticDom: () => {
                var {pickDomFactory, createElementAspect} = aspects;
                ExtendPickDomFactory(pickDomFactory, createElementAspect, disabledComponentAspect, configuration.pickButtonHTML, configuration.css);
            }
        }
    }
}

function ExtendPickDomFactory(pickDomFactory, createElementAspect, disabledComponentAspect, pickButtonHTML, css){
    var origCreatePickDomFactory = pickDomFactory.create;
    pickDomFactory.create = (pickElement, wrap, remove) => {
        // is there the way to get (event)=>pickHandlers.removeOnButton(event)
        // as wrap.pick.[pickDomManagerHandlers].removeOnButton

        // ADD remove like disable add updateComponentDisabled to pickDomManagerHandlers

        console.log(wrap);

        var value = origCreatePickDomFactory(pickElement, wrap, remove);
        createElementAspect.createElementFromHtmlPutAfter(value.pickDom.pickContentElement, pickButtonHTML);
        let pickButtonElement  = pickElement.querySelector('BUTTON');
        let eventBinder = EventBinder();
        eventBinder.bind(pickButtonElement, "click", remove);
        addStyling(pickButtonElement, css.pickButton);

        value.pickDom.pickButtonElement = pickButtonElement;
        var origDispose = value.pickDom.dispose;
        value.pickDom.dispose = ()=>{
            origDispose();
            eventBinder.unbind();
        }
        if (disabledComponentAspect){
            var origUpdateComponentDisabled = value.pickDomManagerHandlers.updateComponentDisabled;
            value.pickDomManagerHandlers.updateComponentDisabled = () => {
                origUpdateComponentDisabled();
                value.pickDom.pickButtonElement.disabled = disabledComponentAspect.getDisabled()??false;
            }
        }
        
        return value;
    }
}