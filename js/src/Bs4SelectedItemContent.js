function Bs4SelectedItemContentStylingMethodJs(configuration) {
    return {
        disableSelectedItemContent($content){
            $content.css("opacity", configuration.selectedItemContentDisabledOpacity )
        },
    
        createSelectedItemContent($selectedItem, $button){
            $selectedItem.css(configuration.defSelectedItemStyle);
            if ($button)
                $button.css(configuration.defRemoveSelectedItemButtonStyle);
        }
    }
}

function Bs4SelectedItemContent(configuration, stylingMethod, $) {
    return function (selectedItem, optionItem, removeSelectedItem){
            let $selectedItem = $(selectedItem)
            $selectedItem.addClass(configuration.selectedItemClass);
            let $content = $(`<span/>`).text(optionItem.text);
            $content.appendTo($selectedItem);
            if (optionItem.disabled ){
                $content.addClass(configuration.selectedItemContentDisabledClass )
                if (stylingMethod && stylingMethod.disableSelectedItemContent)
                    stylingMethod.disableSelectedItemContent($content);
            }

            let $button = $('<button aria-label="Close" tabIndex="-1" type="button"><span aria-hidden="true">&times;</span></button>')
                // bs 'close' class that will be added to button set the float:right, therefore it impossible to configure no-warp policy 
                // with .css("white-space", "nowrap") or  .css("display", "inline-block"); TODO: migrate to flex? 
                .css("float", "none").appendTo($selectedItem)
                .addClass(configuration.removeSelectedItemButtonClass) // bs close class set the float:right
                .on("click", 
                    jqEvent =>    
                        removeSelectedItem(jqEvent.originalEvent)
                    );
            if (stylingMethod && stylingMethod.createSelectedItemContent)
                stylingMethod.createSelectedItemContent($selectedItem, $button);
            return {
                disable(isDisabled){ 
                    $button.prop('disabled', isDisabled); 
                },
                dispose(){
                    $button.unbind();
                }
            };
        }
}

export { Bs4SelectedItemContent, Bs4SelectedItemContentStylingMethodJs};