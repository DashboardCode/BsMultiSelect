import  { ExtendIfUndefined, ExtendIfUndefinedFluent } from './Tools';

class Bs4SelectedItemContentCss {
    constructor(configuration) {
        const defaults = {
            selectedItemContentDisabledClass: 'disabled',
        };
        this.configuration=ExtendIfUndefinedFluent(configuration, defaults);
    }

    DisableSelectedItemContent($content){
        $content.addClass(this.configuration.selectedItemContentDisabledClass )
    }
}

const defSelectedItemStyle = {'padding-left': '0px', 'line-height': '1.5em'};
const defRemoveSelectedItemButtonStyle = {'font-size':'1.5em', 'line-height': '.9em'};

class Bs4SelectedItemContentJs {
    constructor(configuration) {
        const defaults = {
            selectedItemContentDisabledOpacity: '.65',
        };
        this.configuration=ExtendIfUndefinedFluent(configuration, defaults);
    }

    DisableSelectedItemContent($content){
        $content.css("opacity", this.configuration.selectedItemContentDisabledOpacity )
    }
    
    CreateSelectedItemContent($selectedItem, $button){
        $selectedItem.css(defSelectedItemStyle);
        if ($button)
            $button.css(defRemoveSelectedItemButtonStyle);
    }
}

class Bs4SelectedItemContent {

    constructor(stylingAdapter, configuration, $){
        const defaults = {
            selectedItemClass: 'badge',
            removeSelectedItemButtonClass: 'close'
        };
        ExtendIfUndefined(configuration, defaults);
        this.stylingAdapter = stylingAdapter;
        this.$ = $;
        
        if (configuration.createSelectedItemContent)
            this.createSelectedItemContent = configuration.createSelectedItemContent;
        else
            this.createSelectedItemContent = (selectedItem, optionItem, removeSelectedItem) => {
                let $selectedItem = $(selectedItem)
                $selectedItem.addClass(configuration.selectedItemClass);
                let $content = this.$(`<span/>`).text(optionItem.text);
                $content.appendTo($selectedItem);
                if (optionItem.disabled)
                    this.stylingAdapter.DisableSelectedItemContent($content);
                let $button = this.$('<button aria-label="Close" tabIndex="-1" type="button"><span aria-hidden="true">&times;</span></button>')
                    // bs 'close' class that will be added to button set the float:right, therefore it impossible to configure no-warp policy 
                    // with .css("white-space", "nowrap") or  .css("display", "inline-block"); TODO: migrate to flex? 
                    .css("float", "none").appendTo($selectedItem)
                    .addClass(configuration.removeSelectedItemButtonClass) // bs close class set the float:right
                    .on("click", (jqEvent) => removeSelectedItem(jqEvent));
                
                if (this.stylingAdapter.CreateSelectedItemContent)
                    this.stylingAdapter.CreateSelectedItemContent($selectedItem, $button);
                return {
                    disable(isDisabled){ $button.prop('disabled', isDisabled); }
                };
            }
    }

    CreateSelectedItemContent(selectedItem, optionItem, removeSelectedItem, skipProcessingEvent){
        return this.createSelectedItemContent(selectedItem, optionItem, removeSelectedItem, skipProcessingEvent);
    }

}

export { Bs4SelectedItemContent, Bs4SelectedItemContentJs, Bs4SelectedItemContentCss };
