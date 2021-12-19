import {EventBinder} from '../ToolsDom';
import {addStyling} from '../ToolsStyling';
import {composeSync} from '../ToolsJs';

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
                var {pickDomFactory, staticDom} = aspects;
                ExtendPickDomFactory(pickDomFactory, staticDom.createElementAspect, configuration.pickButtonHTML, configuration.css);
            },
            layout: ()=>{
                var {producePickAspect} = aspects;
                ExtendProducePickAspect(producePickAspect);
                
            }
        }
    }
}

function ExtendProducePickAspect(producePickAspect){
    let origProducePickPickAspect = producePickAspect.producePick;
    producePickAspect.producePick = (wrap)=>{
        let pick = origProducePickPickAspect(wrap)
        pick.removeOnButton = (event) => {
            pick.setSelectedFalse();
        }
        pick.dispose = composeSync(
            pick.dispose,
            ()=>{pick.removeOnButton=null}
        );
        return pick;
    }
}

function ExtendPickDomFactory(pickDomFactory, createElementAspect, pickButtonHTML, css){
    var origCreatePickDomFactory = pickDomFactory.create;
    pickDomFactory.create = (pick) => {
        
        origCreatePickDomFactory(pick);
        let {pickDom,pickDomManagerHandlers} = pick;
        createElementAspect.createElementFromHtmlPutAfter(pickDom.pickContentElement, pickButtonHTML);
        let pickButtonElement  = pickDom.pickElement.querySelector('BUTTON');
        pickDom.pickButtonElement=pickButtonElement;
        pickDomManagerHandlers.disableButton = (val)=> {
            pickButtonElement.disabled = val;
        }

        let eventBinder = EventBinder();
        eventBinder.bind(pickButtonElement, "click", (event)=>pick.removeOnButton(event));
        
        addStyling(pickButtonElement, css.pickButton);
        
        pick.dispose = composeSync(
            pick.dispose,
            ()=>{
                eventBinder.unbind();
                pickDom.pickButtonElement=null;
                pickDomManagerHandlers.disableButton = null;
            }
        )
    }
}