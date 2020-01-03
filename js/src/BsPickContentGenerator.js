import  {addClasses, setStyles} from './DomTools';

export function BsPickContentStylingCorrector(configuration) {
    return {
        disablePickContent(content){
            setStyles(content, configuration.pickContentStyleDisabled);
        },
    
        createPickContent(selectedItem, button){
            setStyles(selectedItem, configuration.pickStyle);
            setStyles(button, configuration.pickButtonStyle);
        }
    }
}

export function BsPickContentGenerator(configuration, stylingCorrector, $) {
    return function (selectedItem, optionItem, removeSelectedItem){
            let $selectedItem = $(selectedItem)
            addClasses(selectedItem, configuration.pickClass);
            let $content = $(`<span/>`).text(optionItem.text);
            let content = $content.get(0); 
            $content.appendTo($selectedItem);
            if (optionItem.disabled ){
                addClasses(content, configuration.pickContentClassDisabled)
                if (stylingCorrector && stylingCorrector.disablePickContent)
                    stylingCorrector.disablePickContent(content);
            }

            let $button = $('<button aria-label="Close" tabIndex="-1" type="button"><span aria-hidden="true">&times;</span></button>')
                // bs 'close' class that will be added to button set the float:right, therefore it impossible to configure no-warp policy 
                // with .css("white-space", "nowrap") or  .css("display", "inline-block"); TODO: migrate to flex? 
                .css("float", "none").appendTo($selectedItem)
                .addClass(configuration.pickRemoveButtonClass) // bs close class set the float:right
                .on("click", 
                    jqEvent =>    
                        removeSelectedItem(jqEvent.originalEvent)
                    );
            if (stylingCorrector && stylingCorrector.createPickContent)
                stylingCorrector.createPickContent(selectedItem, $button.get(0));
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