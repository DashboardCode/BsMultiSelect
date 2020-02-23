import  {EventBinder} from './ToolsDom';
import  {addStyling, toggleStyling} from './ToolsStyling';

export function pickContentGenerator(pickElement, common, css){
    pickElement.innerHTML = '<span></span><button aria-label="Remove" tabIndex="-1" type="button"><span aria-hidden="true">&times;</span></button>'
    let pickContentElement = pickElement.querySelector('SPAN');
    let pickButtonElement = pickElement.querySelector('BUTTON');
    addStyling(pickContentElement, css.pickContent);
    addStyling(pickButtonElement, css.pickButton);
    let eventBinder = EventBinder();
    var disableToggleStyling = toggleStyling(pickContentElement, css.pickContent_disabled);
    return {
        setData(option){
            pickContentElement.textContent = option.text; 
        },
        disable: (isDisabled)=>disableToggleStyling(isDisabled),
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