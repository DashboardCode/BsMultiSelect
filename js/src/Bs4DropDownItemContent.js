import  { ExtendIfUndefined} from './Tools';

const bs4StylingMethodCssDefaults = {
    selectedItemContentDisabledClass: 'disabled',
};

function Bs4DropDownItemContentStylingMethodCss(configuration) {
    ExtendIfUndefined(configuration, bs4StylingMethodCssDefaults);
    return {
        disabledStyle($checkBox, $checkBoxLabel, isDisbaled){
            if (isDisbaled) 
                $checkBox.addClass(configuration.dropDownItemDisabledClass);
            else
                $checkBox.removeClass(configuration.dropDownItemDisabledClass);
        }
    }
}

const bs4StylingMethodJsDefaults = {
    selectedItemContentDisabledOpacity: '.65',
    dropdDownLabelDisabledColor: '#6c757d'
};

function Bs4DropDownItemContentStylingMethodJs(configuration) {
    ExtendIfUndefined(configuration, bs4StylingMethodJsDefaults);
    return{
        disabledStyle($checkBox, $checkBoxLabel, isDisbaled){
            $checkBoxLabel.css('color', isDisbaled?configuration.dropdDownLabelDisabledColor:'')
        }
    }
}

const bs4DropDownItemContentDefaults = {
    dropDownItemClass:  'px-2',
}

function Bs4DropDownItemContent(stylingMethod, configuration, $) {
    ExtendIfUndefined(configuration, bs4DropDownItemContentDefaults);
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