import  {EventBinder} from './ToolsDom';
import  {setStyling, unsetStyling} from './ToolsStyling';

export function choiceContentGenerator(choiceElement, stylings){
    setStyling(choiceElement, stylings.choice);
    choiceElement.innerHTML = '<div><input type="checkbox"><label></label></div>';
    let choiceContentElement = choiceElement.querySelector('DIV');
    let choiceCheckBoxElement = choiceContentElement.querySelector('INPUT');
    let choiceLabelElement = choiceContentElement.querySelector('LABEL');
    
    setStyling(choiceContentElement, stylings.choiceContent); 
    setStyling(choiceCheckBoxElement, stylings.choiceCheckBox); 
    setStyling(choiceLabelElement, stylings.choiceLabel); 

    let eventBinder = EventBinder();
    return {
        setData(option) {choiceLabelElement.textContent =option.text;},
        select(isSelected){ choiceCheckBoxElement.checked = isSelected }, 
        disable : (isDisabled, isSelected) => {
            var action = isDisabled?setStyling:unsetStyling;
            action(choiceCheckBoxElement, stylings.choiceCheckBox_disabled);
            action(choiceLabelElement, stylings.choiceLabel_disabled)
            // do not desable checkBox if option is selected! there should be possibility to unselect "disabled"
            choiceCheckBoxElement.disabled = isDisabled && !isSelected;
        },
        hoverIn(){
            setStyling(choiceElement, stylings.choice_hover);
        },
        hoverOut(){
            unsetStyling(choiceElement, stylings.choice_hover);
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
