import  {addClasses, setStyles, EventBinder} from './ToolsDom';


export function BsPickContentStylingCorrector(configuration) {
    return {
        disablePickContent(pickContentElement){
            setStyles(pickContentElement, configuration.pickContentStyleDisabled);
        },
    
        createPickContent(pickElement, pickButtonElement){
            setStyles(pickElement, configuration.pickStyle);
            setStyles(pickButtonElement, configuration.pickButtonStyle);
        }
    }
}

function bsPickContentGenerator(pickElement, option, removePick, configuration, stylingCorrector){
    addClasses(pickElement, configuration.pickClass);

    pickElement.innerHTML = '<span></span><button aria-label="Remove" tabIndex="-1" type="button"><span aria-hidden="true">&times;</span></button>'
    var pickContentElement = pickElement.querySelector(`SPAN`);
    pickContentElement.textContent= option.text;
    if (option.disabled ){
        addClasses(pickContentElement, configuration.pickContentClassDisabled)
        if (stylingCorrector && stylingCorrector.disablePickContent)
            stylingCorrector.disablePickContent(pickContentElement);
    }
    var pickButtonElement = pickElement.querySelector(`BUTTON`);
    // bs 'close' class that will be added to button set the float:right, therefore it impossible to configure no-warp policy 
        // with .css("white-space", "nowrap") or  .css("display", "inline-block"); TODO: migrate to flex? 
    pickButtonElement.style.float= "none";
    addClasses(pickButtonElement, configuration.pickButtonClass); // bs close class set the float:right
    
    var eventBinder = EventBinder();
    eventBinder.bind(pickButtonElement, "click", event => removePick(event));
    if (stylingCorrector && stylingCorrector.createPickContent)
        stylingCorrector.createPickContent(pickElement, pickButtonElement);
    return {
        disable(isDisabled){ 
            pickButtonElement.disabled=isDisabled; 
        },
        dispose(){
            eventBinder.unbind();
        }
    };
}

export function BsPickContentGenerator(configuration, stylingCorrector) {
    return function (pickElement, option, removePick){
            return bsPickContentGenerator(pickElement, option, removePick, configuration, stylingCorrector)
        }
}