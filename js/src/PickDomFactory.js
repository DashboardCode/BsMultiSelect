import  {EventBinder} from './ToolsDom';
import  {addStyling, toggleStyling} from './ToolsStyling';

export function PickDomFactory(css, componentAspect){
    return {
        create(pickElement, choice, remove){
            let eventBinder = EventBinder();
            pickElement.innerHTML = '<span></span><button aria-label="Remove" tabIndex="-1" type="button"><span aria-hidden="true">&times;</span></button>'
            let pickContentElement = pickElement.querySelector('SPAN');
            let pickButtonElement  = pickElement.querySelector('BUTTON');
            eventBinder.bind(pickButtonElement, "click", remove);
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
                            pickContentElement.textContent = choice.option.text; 
                        }
                        function updateDisabled(){
                            disableToggle(choice.isOptionDisabled)
                        }
                        function updateRemoveDisabled(){
                            pickButtonElement.disabled = componentAspect.getDisabled();
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
