import  {EventBinder} from './ToolsDom';
import  {addStyling, toggleStyling} from './ToolsStyling';

export function PickDomFactory(css, componentPropertiesAspect, optionPropertiesAspect){
    return { 
        create(pickElement, wrap, remove){
            let eventBinder = EventBinder();
            pickElement.innerHTML = '<span></span><button aria-label="Remove" tabIndex="-1" type="button"><span aria-hidden="true">&times;</span></button>'
            let pickContentElement = pickElement.querySelector('SPAN');
            let pickButtonElement  = pickElement.querySelector('BUTTON');
            eventBinder.bind(pickButtonElement, "click", remove);
            // TODO: explicit conditional styling 
            return {
                pickDom:{
                    pickContentElement,
                    pickButtonElement,
                },
                pickDomManager:{
                    init(){
                        addStyling(pickContentElement, css.pickContent);
                        addStyling(pickButtonElement, css.pickButton);
                        let disableToggle = toggleStyling(pickContentElement, css.pickContent_disabled);

                        function updateData(){
                            pickContentElement.textContent = optionPropertiesAspect.getText(wrap.option); 
                        }
                        function updateDisabled(){
                            disableToggle(wrap.isOptionDisabled)
                        }
                        function updateRemoveDisabled(){
                            pickButtonElement.disabled = componentPropertiesAspect.getDisabled();
                        }
                        updateData();
                        updateDisabled()
                        updateRemoveDisabled();

                        return {
                            updateData,
                            updateDisabled,
                            updateRemoveDisabled,
                        }
                    },
                    dispose(){
                        eventBinder.unbind();
                    },
                }
            }
        }
    }
}
