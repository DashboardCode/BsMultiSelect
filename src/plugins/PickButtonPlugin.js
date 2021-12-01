import {EventBinder} from '../ToolsDom';
import {addStyling} from '../ToolsStyling';

export function PickButtonPlugCssPatchBs4(defaults){
    // increase font and limit the line
    defaults.cssPatch.pickButton = {float : "none",  verticalAlign: "text-top", fontSize:'1.8em', lineHeight: '0.5em', fontWeight:'400' }; 

}

export function PickButtonPlugCssPatchBs5(defaults){
    defaults.cssPatch.pickButton = {float : "none", verticalAlign: "text-top", fontSize:'0.8em'};
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
                ExtendPickDomFactory(pickDomFactory, createElementAspect, configuration.pickButtonHTML, configuration.css);
            }
        }
    }
}

function ExtendPickDomFactory(pickDomFactory, createElementAspect, pickButtonHTML, css){
    var origCreatePickDomFactory = pickDomFactory.create;
    pickDomFactory.create = (pickElement, wrap) => {
        
        var value = origCreatePickDomFactory(pickElement, wrap);
        createElementAspect.createElementFromHtmlPutAfter(value.pickDom.pickContentElement, pickButtonHTML);
        let pickButtonElement  = pickElement.querySelector('BUTTON');
        
        value.pickDomManagerHandlers.disableButton = (val)=> {
            pickButtonElement.disabled = val;
        }

        value.pickDomManagerHandlers.composeRemoveOnButton = (event) => {
            wrap.pick.setSelectedFalse();
        }
        let eventBinder = EventBinder();

        eventBinder.bind(pickButtonElement, "click", (event)=>value.pickDomManagerHandlers.composeRemoveOnButton(event) // NOTE : warapped in multiselect layout
        );  
        addStyling(pickButtonElement, css.pickButton);
        
        
        value.pickDom.pickButtonElement = pickButtonElement;
        var origDispose = value.pickDom.dispose;
        value.pickDom.dispose = ()=>{
            origDispose();
            eventBinder.unbind();
        }
        return value;
    }
}