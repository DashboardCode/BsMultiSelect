import  {EventBinder} from './ToolsDom';
import  {addStyling, toggleStyling} from './ToolsStyling';

export function ChoiceDomFactory(css, optionPropertiesAspect){
    return {
        create(choiceElement, wrap, toggle){
            choiceElement.innerHTML = '<div><input formnovalidate type="checkbox"><label></label></div>';
            let choiceContentElement = choiceElement.querySelector('DIV');
            let choiceCheckBoxElement = choiceContentElement.querySelector('INPUT');
            let choiceLabelElement = choiceContentElement.querySelector('LABEL');
            let eventBinder = EventBinder();
            eventBinder.bind(choiceElement, "click",  toggle);
            // TODO: explicit conditional styling 
            return {
                choiceDom:{
                    choiceContentElement,
                    choiceCheckBoxElement,
                    choiceLabelElement
                },
                choiceDomManager:{
                    init(){
                        addStyling(choiceContentElement, css.choiceContent); 
                        addStyling(choiceCheckBoxElement, css.choiceCheckBox); 
                        addStyling(choiceLabelElement, css.choiceLabel); 
            
                        let choiceSelectedToggle = toggleStyling(choiceElement, css.choice_selected);
                        let choiceDisabledToggle = toggleStyling(choiceElement, css.choice_disabled);
                        let choiceHoverToggle = toggleStyling(choiceElement, css.choice_hover);
             
                        let choiceCheckBoxDisabledToggle = toggleStyling(choiceCheckBoxElement, css.choiceCheckBox_disabled)
                        let choiceLabelDisabledToggle = toggleStyling(choiceLabelElement, css.choiceLabel_disabled)
            
                        function updateData() {
                            choiceLabelElement.textContent = optionPropertiesAspect.getText(wrap.option);
                        }
                        function updateSelected(){ 
                            choiceSelectedToggle(wrap.isOptionSelected);
                            choiceCheckBoxElement.checked = wrap.isOptionSelected;
                        }
                        function updateDisabled(){
                            choiceDisabledToggle(wrap.isOptionDisabled)
                            choiceCheckBoxDisabledToggle(wrap.isOptionDisabled)
                            choiceLabelDisabledToggle(wrap.isOptionDisabled)
            
                            // do not desable checkBox if option is selected! there should be possibility to unselect "disabled"
                            choiceCheckBoxElement.disabled = wrap.isOptionDisabled && !wrap.isOptionSelected;
                        }
                        updateData();
                        updateSelected();
                        updateDisabled();

                        return{
                            updateData,
                            updateSelected, 
                            updateDisabled,
                            updateHoverIn(){
                                choiceHoverToggle(wrap.choice.isHoverIn);
                            },
                        }
                    },
                    dispose(){
                        eventBinder.unbind();
                    }
                }
            }
        }
    }
}

