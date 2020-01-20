import  {EventBinder} from './ToolsDom';
import  {setStyling, unsetStyling} from './ToolsStyling';

export function pickContentGenerator(pickElement, css){
    setStyling(pickElement, css.pick);

    pickElement.innerHTML = '<span></span><button aria-label="Remove" tabIndex="-1" type="button"><span aria-hidden="true">&times;</span></button>'
    let pickContentElement = pickElement.querySelector('SPAN');
    let pickButtonElement = pickElement.querySelector('BUTTON');
    
    setStyling(pickButtonElement, css.pickButton);
    let eventBinder = EventBinder();

    return {
        setData(option){
            pickContentElement.textContent = option.text;
            var action = option.disabled?setStyling:unsetStyling;
            action(pickContentElement, css.pickContent_disabled);
        },
        disable(isRemoveDisabled){
            pickButtonElement.disabled = isRemoveDisabled;
        },
        onRemove(removePick){
            eventBinder.bind(pickButtonElement, "click", event => removePick(event));
        },
        dispose(){
            eventBinder.unbind();
        }
    };
}