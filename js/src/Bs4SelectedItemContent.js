import  { ExtendIfUndefined } from './Tools';

const bs4StylingMethodCssdefaults = {
    selectedItemContentDisabledClass: 'disabled'
};

function Bs4SelectedItemContentStylingMethodCss(configuration) {
    ExtendIfUndefined(configuration, bs4StylingMethodCssdefaults);

    return {
        disableSelectedItemContent($content){
            $content.addClass(configuration.selectedItemContentDisabledClass )
        }
    }
}

const defSelectedItemStyle = {'padding-left': '0px', 'line-height': '1.5em'};
const defRemoveSelectedItemButtonStyle = {'font-size':'1.5em', 'line-height': '.9em'};
const bs4StylingMethodJsDefaults = {
    selectedItemContentDisabledOpacity: '.65'
 };

function Bs4SelectedItemContentStylingMethodJs(configuration) {
    ExtendIfUndefined(configuration, bs4StylingMethodJsDefaults);
    return {
        disableSelectedItemContent($content){
            $content.css("opacity", configuration.selectedItemContentDisabledOpacity )
        },
    
        createSelectedItemContent($selectedItem, $button){
            $selectedItem.css(defSelectedItemStyle);
            if ($button)
                $button.css(defRemoveSelectedItemButtonStyle);
        }
    }
}

const bs4SelectedItemContentDefaults = {
    selectedItemClass: 'badge',
    removeSelectedItemButtonClass: 'close'
};
function Bs4SelectedItemContent(stylingMethod, configuration, $) {
        ExtendIfUndefined(configuration, bs4SelectedItemContentDefaults);
        
        return function (selectedItem, optionItem, removeSelectedItem, preventDefaultMultiSelect){
                let $selectedItem = $(selectedItem)
                $selectedItem.addClass(configuration.selectedItemClass);
                let $content = $(`<span/>`).text(optionItem.text);
                $content.appendTo($selectedItem);
                if (optionItem.disabled)
                    stylingMethod.disableSelectedItemContent($content);
                let $button = $('<button aria-label="Close" tabIndex="-1" type="button"><span aria-hidden="true">&times;</span></button>')
                    // bs 'close' class that will be added to button set the float:right, therefore it impossible to configure no-warp policy 
                    // with .css("white-space", "nowrap") or  .css("display", "inline-block"); TODO: migrate to flex? 
                    .css("float", "none").appendTo($selectedItem)
                    .addClass(configuration.removeSelectedItemButtonClass) // bs close class set the float:right
                    .on("click", (jqEvent) => 
                        { removeSelectedItem(); preventDefaultMultiSelect(jqEvent.originalEvent);});
                
                if (stylingMethod.createSelectedItemContent)
                    stylingMethod.createSelectedItemContent($selectedItem, $button);
                return {
                    disable(isDisabled){ $button.prop('disabled', isDisabled); }
                };
            }
}

export { Bs4SelectedItemContent as Bs4SelectedItemContent, Bs4SelectedItemContentStylingMethodJs, Bs4SelectedItemContentStylingMethodCss};