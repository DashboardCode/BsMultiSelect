import  {setStyling, unsetStyling, EventBinder} from './ToolsDom';

export function pickContentGenerator(option, pickElement, stylings){
    setStyling(pickElement, stylings.pick);

    pickElement.innerHTML = '<span></span><button aria-label="Remove" tabIndex="-1" type="button"><span aria-hidden="true">&times;</span></button>'
    var pickContentElement = pickElement.querySelector(`SPAN`);
    pickContentElement.textContent= option.text;
    var disable = function(isDisabled){ 
        if (isDisabled)
            setStyling(pickElement, stylings.pickContent_disabled);
        else
            unsetStyling(pickElement, stylings.pickContent_disabled);
        pickButtonElement.disabled=isDisabled; 
    }
    disable(option.disabled);
    var pickButtonElement = pickContentElement.querySelector(`BUTTON`);
    // bs 'close' class that will be added to button set the float:right, therefore it impossible to configure no-warp policy 
        // with .css("white-space", "nowrap") or  .css("display", "inline-block"); TODO: migrate to flex? 
    pickButtonElement.style.float= "none";
    setStyling(pickButtonElement, stylings.pickButton); // bs close class set the float:right
    
    var eventBinder = EventBinder();
    setStyling(pickElement, stylings.pick);
    setStyling(pickButtonElement, stylings.pickButton);
    return {
        disable,
        onRemove(removePick){
            eventBinder.bind(pickButtonElement, "click", event => removePick(event));
        },
        dispose(){
            eventBinder.unbind();
        }
    };
}