import  { ExtendIfUndefined} from './Tools';

function Bs4DropDownItemContentStylingMethodCss(configuration) {
    const defaults = {
            selectedItemContentDisabledClass: 'disabled',
    };
    ExtendIfUndefined(configuration, defaults);
    return {
        disabledStyle($checkBox, $checkBoxLabel, isDisbaled){
            if (isDisbaled) 
                $checkBox.addClass(configuration.dropDownItemDisabledClass);
            else
                $checkBox.removeClass(configuration.dropDownItemDisabledClass);
        }
    }
}

function Bs4DropDownItemContentStylingMethodJs(configuration) {
    const defaults = {
            selectedItemContentDisabledOpacity: '.65',
            dropdDownLabelDisabledColor: '#6c757d'
    };
    ExtendIfUndefined(configuration, defaults);
    return{
        disabledStyle($checkBox, $checkBoxLabel, isDisbaled){
            $checkBoxLabel.css('color', isDisbaled?configuration.dropdDownLabelDisabledColor:'')
        }
    }
}

function Bs4DropDownItemContent(stylingMethod, configuration, $) {
    const defaults = {
            dropDownItemClass:  'px-2',
    }
    ExtendIfUndefined(configuration, defaults);
    return function(dropDownItem, option){
                let $dropDownItem = $(dropDownItem);
                $dropDownItem.addClass(configuration.dropDownItemClass);
                let $dropDownItemContent= $(`<div class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input">
                    <label class="custom-control-label"></label>
                </div>`);
                $dropDownItemContent.appendTo(dropDownItem);
                let $checkBox = $dropDownItemContent.find(`INPUT[type="checkbox"]`);
                let $checkBoxLabel = $dropDownItemContent.find(`label`);
                $checkBoxLabel.text(option.text);

                return { 
                    select(isSelected){ $checkBox.prop('checked', isSelected); }, 
                    disable(isDisabled){ $checkBox.prop('disabled', isDisabled); },
                    disabledStyle(isDisbaled){ stylingMethod.disabledStyle($checkBox, $checkBoxLabel, isDisbaled); },
                    onSelected(toggle) {
                        $checkBox.on("change", toggle)
                        $dropDownItem.on("click", event => {
                            if (dropDownItem === event.target || $.contains(dropDownItem, event.target)) {
                                toggle();
                            }
                        })
                    }
                }
            }
}

export { Bs4DropDownItemContent, Bs4DropDownItemContentStylingMethodJs, Bs4DropDownItemContentStylingMethodCss };