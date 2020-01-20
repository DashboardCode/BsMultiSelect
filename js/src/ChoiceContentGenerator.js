import  {EventBinder} from './ToolsDom';
import  {setStyling, unsetStyling} from './ToolsStyling';

export function choiceContentGenerator(choiceElement, css){
    setStyling(choiceElement, css.choice);
    choiceElement.innerHTML = '<div><input type="checkbox"><label></label></div>';
    let choiceContentElement = choiceElement.querySelector('DIV');
    let choiceCheckBoxElement = choiceContentElement.querySelector('INPUT');
    let choiceLabelElement = choiceContentElement.querySelector('LABEL');
    
    setStyling(choiceContentElement, css.choiceContent); 
    setStyling(choiceCheckBoxElement, css.choiceCheckBox); 
    setStyling(choiceLabelElement, css.choiceLabel); 

    let eventBinder = EventBinder();
    return {
        setData(option) {choiceLabelElement.textContent =option.text;},
        select(isSelected){ choiceCheckBoxElement.checked = isSelected }, 
        disable : (isDisabled, isSelected) => {
            var action = isDisabled?setStyling:unsetStyling;
            action(choiceCheckBoxElement, css.choiceCheckBox_disabled);
            action(choiceLabelElement, css.choiceLabel_disabled)
            // do not desable checkBox if option is selected! there should be possibility to unselect "disabled"
            choiceCheckBoxElement.disabled = isDisabled && !isSelected;
        },
        hoverIn(){
            setStyling(choiceElement, css.choice_hover);
        },
        hoverOut(){
            unsetStyling(choiceElement, css.choice_hover);
        },
        onSelected(toggle) {
            eventBinder.bind(choiceCheckBoxElement, "change", toggle);
            eventBinder.bind(choiceElement, "click", 
                event => {
                    if (choiceElement === event.target || choiceElement.contains(event.target)) {
                        toggle();
                    }
                }
            );
        },
        dispose(){
            eventBinder.unbind();
        }
    }
}
