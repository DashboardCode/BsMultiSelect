import  { ExtendIfUndefined, ExtendIfUndefinedFluent } from './Tools';

class Bs4DropDownItemContentCss {
    constructor(configuration) {
        const defaults = {
            selectedItemContentDisabledClass: 'disabled',
        };
        this.configuration=ExtendIfUndefinedFluent(configuration, defaults);
    }

    DisabledStyle($checkBox, $checkBoxLabel, isDisbaled){
        if (isDisbaled) 
            $checkBox.addClass(this.configuration.dropDownItemDisabledClass);
        else
            $checkBox.removeClass(this.configuration.dropDownItemDisabledClass);
    }
}

class Bs4DropDownItemContentJs {
    constructor(configuration) {
        const defaults = {
            selectedItemContentDisabledOpacity: '.65',
            dropdDownLabelDisabledColor: '#6c757d'
        };
        this.configuration=ExtendIfUndefinedFluent(configuration, defaults);
    }

    DisabledStyle($checkBox, $checkBoxLabel, isDisbaled){
        $checkBoxLabel.css('color', isDisbaled?this.configuration.dropdDownLabelDisabledColor:'')
    }
}

// addClass, removeClass, css, siblings('label'), hasClass, find('BUTTON').prop(..)
class Bs4DropDownItemContent {

    constructor(stylingAdapter, configuration, $){
        const defaults = {
            dropDownItemClass:  'px-2',
        }
        ExtendIfUndefined(configuration, defaults);
        this.$ = $;
        this.stylingAdapter = stylingAdapter;

        this.createDropDownItemContent = (dropDownItem, option) => {
            let $dropDownItem = $(dropDownItem);
            $dropDownItem.addClass(configuration.dropDownItemClass);
            let $dropDownItemContent= this.$(`<div class="custom-control custom-checkbox">
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
                disabledStyle(isDisbaled){ stylingAdapter.DisabledStyle($checkBox, $checkBoxLabel, isDisbaled); },
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

    // ------------------------------------------------------------------------------------------------
    CreateDropDownItemContent(dropDownItem, option){
        return this.createDropDownItemContent(dropDownItem, option);
    }
 }

export { Bs4DropDownItemContent, Bs4DropDownItemContentJs, Bs4DropDownItemContentCss };