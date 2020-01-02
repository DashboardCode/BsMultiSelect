import {addClasses,removeClasses} from './DomTools';

function Bs4DropDownItemContentStylingMethodJs(configuration) {
    return{
        disabledStyle($checkBox, $checkBoxLabel, isDisbaled){
            $checkBoxLabel.css('color', isDisbaled?configuration.checkBoxLabelDisabledColor:'')
        }
    }
}

function Bs4DropDownItemContent(configuration, stylingMethod, $) {
   
    return function(dropDownItem, option){
        let $dropDownItem = $(dropDownItem);
        $dropDownItem.addClass(configuration.dropDownItemClass);
        let $dropDownItemContent= $(`<div class="custom-control custom-checkbox">
            <input type="checkbox" class="custom-control-input">
            <label class="custom-control-label justify-content-start"></label>
        </div>`);
        $dropDownItemContent.appendTo(dropDownItem);
        let $checkBox = $dropDownItemContent.find(`INPUT[type="checkbox"]`);
        let $checkBoxLabel = $dropDownItemContent.find(`label`);
        $checkBoxLabel.text(option.text);

        var tmp = { 
            select(isSelected){ $checkBox.prop('checked', isSelected); }, 
            // --- distinct disable and disabledStyle to provide a possibility to unselect disabled option
            disable(isDisabled){ $checkBox.prop('disabled', isDisabled); },
            disabledStyle(isDisbaled){ 
                if (isDisbaled) 
                    $checkBox.addClass(configuration.checkBoxDisabledClass);
                else
                    $checkBox.removeClass(configuration.checkBoxDisabledClass);
                if (stylingMethod && stylingMethod.disabledStyle)
                    stylingMethod.disabledStyle($checkBox, $checkBoxLabel, isDisbaled); 
            },
            hoverIn(){
                addClasses(dropDownItem, configuration.dropDownItemHoverClass);
            },
            hoverOut(){
                removeClasses(dropDownItem, configuration.dropDownItemHoverClass);
            },
            onSelected(toggle) {
                $checkBox.on("change", toggle)
                $dropDownItem.on("click", event => {
                    if (dropDownItem === event.target || $.contains(dropDownItem, event.target)) {
                        toggle();
                    }
                })
            },
            dispose(){
                $checkBox.unbind();
                $dropDownItem.unbind();
            }
        }
        
        return tmp;
    }
}

 export { Bs4DropDownItemContent, Bs4DropDownItemContentStylingMethodJs };