import {addClasses, removeClasses, setStyles} from './DomTools';
import {createEmpty} from './JsTools'

export function BsChoiceContentStylingCorrector(configuration) {
    var resetStyle = createEmpty(resetStyle, configuration.choiceLabelStyleDisabled, '');
    return{
        disabledStyle(checkBox, checkBoxLabel, isDisbaled){
            setStyles(checkBoxLabel, isDisbaled? configuration.choiceLabelStyleDisabled : resetStyle)
        }
    }
}

export function BsChoiceContentGenerator(configuration, stylingCorrector, $) {
   
    return function(choiceElement, option){
        let $choiceElement = $(choiceElement);
        $choiceElement.addClass(configuration.choiceClass);
        let $choiceContent= $(`<div class="custom-control custom-checkbox">
            <input type="checkbox" class="custom-control-input">
            <label class="custom-control-label justify-content-start"></label>
        </div>`);
        $choiceContent.appendTo(choiceElement);
        let $checkBox = $choiceContent.find(`INPUT[type="checkbox"]`);
        let $checkBoxLabel = $choiceContent.find(`label`);
        $checkBoxLabel.text(option.text);

        var tmp = { 
            select(isSelected){ $checkBox.prop('checked', isSelected); }, 
            // --- distinct disable and disabledStyle to provide a possibility to unselect disabled option
            disable(isDisabled){ $checkBox.prop('disabled', isDisabled); },
            disabledStyle(isDisbaled){ 
                if (isDisbaled) 
                    $checkBox.addClass(configuration.choiceCheckBoxClassDisabled);
                else
                    $checkBox.removeClass(configuration.choiceCheckBoxClassDisabled);
                if (stylingCorrector && stylingCorrector.disabledStyle)
                    stylingCorrector.disabledStyle($checkBox.get(0), $checkBoxLabel.get(0), isDisbaled); 
            },
            hoverIn(){
                addClasses(choiceElement, configuration.choiceClassHover);
            },
            hoverOut(){
                removeClasses(choiceElement, configuration.choiceClassHover);
            },
            onSelected(toggle) {
                $checkBox.on("change", toggle)
                $choiceElement.on("click", event => {
                    if (choiceElement === event.target || $.contains(choiceElement, event.target)) {
                        toggle();
                    }
                })
            },
            dispose(){
                $checkBox.unbind();
                $choiceElement.unbind();
            }
        }
        
        return tmp;
    }
}