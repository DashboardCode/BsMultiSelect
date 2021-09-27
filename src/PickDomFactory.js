import  {EventBinder} from './ToolsDom';
import  {addStyling, toggleStyling} from './ToolsStyling';

export function PickDomFactory(css, componentPropertiesAspect, optionPropertiesAspect, pickButtonAspect){
    return { 
        create(pickElement, wrap, remove){
            let eventBinder = EventBinder();
            let buttonHTML = pickButtonAspect.getButtonHTML();
            pickElement.innerHTML = '<span></span>'+buttonHTML;
            let pickContentElement = pickElement.querySelector('SPAN');
            let pickButtonElement  = pickElement.querySelector('BUTTON');
            eventBinder.bind(pickButtonElement, "click", remove);
            
            addStyling(pickContentElement, css.pickContent);
            addStyling(pickButtonElement, css.pickButton);
            let disableToggle = toggleStyling(pickContentElement, css.pickContent_disabled);

            function updateData(){
                pickContentElement.textContent = optionPropertiesAspect.getText(wrap.option); 
            }
            function updateDisabled(){
                disableToggle(wrap.isOptionDisabled)
            }
            function updateComponentDisabled(){
                pickButtonElement.disabled = componentPropertiesAspect.getDisabled();
            }
            

            return {
                pickDom:{
                    pickContentElement,
                    pickButtonElement,
                },
                pickDomManagerHandlers:{
                    updateData,
                    updateDisabled,
                    updateComponentDisabled,
                },
                dispose(){
                        eventBinder.unbind();
                }
            }
        }
    }
}
