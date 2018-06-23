class Bs4AdapterCss {

    constructor(options, $) {
        const defaults = {
            selectedPanelFocusClass : 'focus',
            selectedPanelDisabledClass: 'disabled',
            selectedItemContentDisabledClass: 'disabled',
            dropDownItemDisabledClass: 'disabled'
        };
        this.options = $.extend({}, defaults, options);
    }

    DisableSelectedItemContent($content){
        $content.addClass(this.options.selectedItemContentDisabledClass )
    }

    DisabledStyle($checkBox, isDisbaled){
        if (isDisbaled) //? $checkBox.addClass : $checkBox.removeClass
            $checkBox.addClass(this.options.dropDownItemDisabledClass);
        else
            $checkBox.removeClass(this.options.dropDownItemDisabledClass);
    }

    Enable($selectedPanel){
        $selectedPanel.removeClass(this.options.selectedPanelDisabledClass)
    }

    Disable($selectedPanel){
        $selectedPanel.addClass(this.options.selectedPanelDisabledClass)
    }

    FocusIn($selectedPanel){
        $selectedPanel.addClass(this.options.selectedPanelFocusClass);
    }

    FocusOut($selectedPanel){
        $selectedPanel.removeClass(this.options.selectedPanelFocusClass);
    }
}

export default Bs4AdapterCss;
