import {addClasses, removeClasses, setStyles, EventBinder} from './ToolsDom';
import {createEmpty} from './ToolsJs'

export function BsChoiceContentStylingCorrector(configuration) {
    var resetStyle = createEmpty(resetStyle, configuration.choiceLabelStyleDisabled, '');
    return{
        disabledStyle(choiceLabelElement, isDisbaled){
            setStyles(choiceLabelElement, isDisbaled? configuration.choiceLabelStyleDisabled : resetStyle)
        }
    }
}

function bsChoiceContentGenerator(choiceElement, option, configuration, stylingCorrector){
    addClasses(choiceElement, configuration.choiceClass);
    choiceElement.innerHTML = '<div><input type="checkbox"><label></label></div>';
    let choiceCheckBoxElement = choiceElement.querySelector('INPUT');
    let choiceLabelElement = choiceElement.querySelector('LABEL');
    let choiceContentElement = choiceElement.querySelector('DIV');
    addClasses(choiceContentElement, configuration.choiceContentClass); 
    addClasses(choiceCheckBoxElement, configuration.choiceCheckBoxClass); 
    addClasses(choiceLabelElement, configuration.choiceLabelClass); 

    choiceLabelElement.textContent =option.text;
    let eventBinder = EventBinder();

    function disabledStyle(isDisabled){
        if (isDisabled) 
                addClasses(choiceCheckBoxElement, configuration.choiceCheckBoxClassDisabled);
            else
                removeClasses(choiceCheckBoxElement, configuration.choiceCheckBoxClassDisabled);
            if (stylingCorrector && stylingCorrector.disabledStyle)
                stylingCorrector.disabledStyle(choiceLabelElement, isDisabled);  
    };
    return { 
        select(isSelected){ choiceCheckBoxElement.checked = isSelected }, 
        // --- distinct disable and disabledStyle to provide a possibility to unselect disabled option
        //disable,//disable(isDisabled){ choiceCheckBoxElement.disabled = isDisabled },
        //disabledStyle,
        setChoiceContentDisabled : (isSelected) => {
            disabledStyle(true); // TODO add option update
            // do not desable checkBix if selected! there should be possibility to unselect "disabled"
            choiceCheckBoxElement.disabled = !isSelected;
        },
        hoverIn(){
            addClasses(choiceElement, configuration.choiceClassHover);
        },
        hoverOut(){
            removeClasses(choiceElement, configuration.choiceClassHover);
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

export function BsChoiceContentGenerator(configuration, stylingCorrector) {
    return function(choiceElement, option){
        return bsChoiceContentGenerator(choiceElement, option, configuration, stylingCorrector)
    }
}