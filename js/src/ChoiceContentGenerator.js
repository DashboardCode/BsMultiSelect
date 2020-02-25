import  {EventBinder} from './ToolsDom';
import  {addStyling, toggleStyling} from './ToolsStyling';

export function choiceContentGenerator(choiceElement, common, css){
    choiceElement.innerHTML = '<div><input formnovalidate type="checkbox"><label></label></div>';
    let choiceContentElement = choiceElement.querySelector('DIV');
    let choiceCheckBoxElement = choiceContentElement.querySelector('INPUT');
    let choiceLabelElement = choiceContentElement.querySelector('LABEL');
    
    addStyling(choiceContentElement, css.choiceContent); 
    addStyling(choiceCheckBoxElement, css.choiceCheckBox); 
    addStyling(choiceLabelElement, css.choiceLabel); 

    let selectToggleStyling = toggleStyling(choiceElement, css.choice_selected);
    let disable1ToggleStyling = toggleStyling(choiceElement, css.choice_disabled);
    let disable2ToggleStyling = toggleStyling(choiceCheckBoxElement, css.choiceCheckBox_disabled)
    let disable3ToggleStyling = toggleStyling(choiceLabelElement, css.choiceLabel_disabled)
    let hoverInToggleStyling = toggleStyling(choiceElement, css.choice_hover);
    let eventBinder = EventBinder();
    return {
        setData(option) {choiceLabelElement.textContent = option.text;},
        select(isOptionSelected){ 
            selectToggleStyling(isOptionSelected);
            choiceCheckBoxElement.checked = isOptionSelected 
        }, 
        disable(isOptionDisabled, isOptionSelected){
            disable1ToggleStyling(isOptionDisabled)
            disable2ToggleStyling(isOptionDisabled)
            disable3ToggleStyling(isOptionDisabled)

            // do not desable checkBox if option is selected! there should be possibility to unselect "disabled"
            choiceCheckBoxElement.disabled = isOptionDisabled && !isOptionSelected;
        },
        hoverIn(isHoverIn){
            hoverInToggleStyling(isHoverIn);
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
