import { composeSync } from "../ToolsJs";

export function PopperPlugin(pluginData){
    let {staticManager, environment, specialPicksEventsAspect, choicesVisibilityAspect, rtlAspect, choicesDom, filterDom } = pluginData;
    let {createPopper, Popper} = environment;
    let choicesElement = choicesDom.choicesElement;
    let filterInputElement = filterDom.filterInputElement;
    let popper = null;
    let popperConfiguration = {
        placement: 'bottom-start',
        modifiers: {
            preventOverflow: {enabled:true},
            hide: {enabled:false},
            flip: {enabled:false}
        }
    };

    if (typeof createPopper === 'undefined') {
        createPopper = Popper;
        if (typeof createPopper === 'undefined') {
            throw new Error("BsMultiSelect: Popper component (https://popper.js.org) is required")
        }
    } else {
        if (createPopper.createPopper) {
            createPopper = createPopper.createPopper;
        }
    }

    function init(){
        if (!!createPopper.prototype && !!createPopper.prototype.constructor) { // it is a constructor
            popper = new createPopper(filterInputElement, choicesElement, popperConfiguration); 
        }else{
            popper = createPopper(filterInputElement, choicesElement, popperConfiguration); 
            //throw new Error("BsMultiSelect: popper paramater is not a constructor")
        }
    };

    staticManager.appendToContainer = composeSync(staticManager.appendToContainer, init);
    
    var origBackSpace = specialPicksEventsAspect.backSpace;
    specialPicksEventsAspect.backSpace = (pick) => { origBackSpace(pick);  popper.update();  };
    
    if (rtlAspect){
        var origUpdateRtl = rtlAspect.updateRtl;
        rtlAspect.updateRtl = (isRtl) => {
            origUpdateRtl(isRtl); 
            if (isRtl) popperConfiguration.placement = 'bottom-end';
        };
    }
    
    choicesVisibilityAspect.updatePopupLocation = composeSync(choicesVisibilityAspect.updatePopupLocation, ()=>{
        popper.update();  // become async in poppoer 2; use forceUpdate if sync is needed? 
    })
    return {
        dispose(){
            popper.destroy();
        }
    }
}