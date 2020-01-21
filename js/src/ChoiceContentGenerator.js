import  {EventBinder} from './ToolsDom';
import  {addStyling, toggleStyling} from './ToolsStyling';

export function choiceContentGenerator(choiceElement, css){
    addStyling(choiceElement, css.choice);
    choiceElement.innerHTML = '<div><input type="checkbox"><label></label></div>';
    let choiceContentElement = choiceElement.querySelector('DIV');
    let choiceCheckBoxElement = choiceContentElement.querySelector('INPUT');
    let choiceLabelElement = choiceContentElement.querySelector('LABEL');
    
    addStyling(choiceContentElement, css.choiceContent); 
    addStyling(choiceCheckBoxElement, css.choiceCheckBox); 
    addStyling(choiceLabelElement, css.choiceLabel); 

    let eventBinder = EventBinder();
    return {
        setData(option) {choiceLabelElement.textContent =option.text;},
        select(isSelected){ 
            toggleStyling(choiceElement, css.choice_selected, isSelected);
            choiceCheckBoxElement.checked = isSelected 
        }, 
        disable(isDisabled, isSelected){
            toggleStyling(choiceElement, css.choice_disabled, isDisabled);
            toggleStyling(choiceCheckBoxElement, css.choiceCheckBox_disabled, isDisabled)
            toggleStyling(choiceLabelElement, css.choiceLabel_disabled, isDisabled)

            // do not desable checkBox if option is selected! there should be possibility to unselect "disabled"
            choiceCheckBoxElement.disabled = isDisabled && !isSelected;
        },
        hoverIn(isHoverIn){
            toggleStyling(choiceElement, css.choice_hover, isHoverIn);
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
