class Bs4AdapterCss {

    constructor(configuration, $) {
        const defaults = {
            selectedPanelFocusClass : 'focus',
            selectedPanelDisabledClass: 'disabled',
            selectedItemContentDisabledClass: 'disabled',
            dropDownItemDisabledClass: 'disabled'
        };
        let tmp = $.extend({}, defaults, configuration);
        this.configuration = $.extend(configuration, tmp);
    }

    DisableSelectedItemContent($content){
        $content.addClass(this.configuration.selectedItemContentDisabledClass )
    }

    DisabledStyle($checkBox, isDisbaled){
        if (isDisbaled) 
            $checkBox.addClass(this.configuration.dropDownItemDisabledClass);
        else
            $checkBox.removeClass(this.configuration.dropDownItemDisabledClass);
    }

    Enable($selectedPanel){
        $selectedPanel.removeClass(this.configuration.selectedPanelDisabledClass)
    }

    Disable($selectedPanel){
        $selectedPanel.addClass(this.configuration.selectedPanelDisabledClass)
    }

    FocusIn($selectedPanel){
        $selectedPanel.addClass(this.configuration.selectedPanelFocusClass);
    }

    FocusOut($selectedPanel){
        $selectedPanel.removeClass(this.configuration.selectedPanelFocusClass);
    }
}

export default Bs4AdapterCss;
