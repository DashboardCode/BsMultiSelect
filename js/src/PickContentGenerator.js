import  {EventBinder} from './ToolsDom';
import  {addStyling, toggleStyling} from './ToolsStyling';

export function pickContentGenerator(pickElement, css){
    pickElement.innerHTML = '<span></span><button aria-label="Remove" tabIndex="-1" type="button"><span aria-hidden="true">&times;</span></button>'
    let pickContentElement = pickElement.querySelector('SPAN');
    let pickButtonElement = pickElement.querySelector('BUTTON');
    
    addStyling(pickButtonElement, css.pickButton);
    let eventBinder = EventBinder();

    return {
        setData(option){
            pickContentElement.textContent = option.text;
        },
        disable(isDisabled){
            toggleStyling(pickContentElement, css.pickContent_disabled, isDisabled)
        },
        disableRemove(isRemoveDisabled){
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