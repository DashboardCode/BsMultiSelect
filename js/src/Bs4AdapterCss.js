class Bs4AdapterCss {

    constructor(options, $) {
        const defaults = {
            selectedPanelFocusClass : 'focus',
            selectedPanelDisabledClass: 'disabled',
            selectedItemContentDisabledClass: 'disabled'
        };
        this.options = $.extend({}, defaults, options);
    }

    DisableSelectedItemContent($content){
        $content.addClass("opacity", this.options.selectedItemContentDisabledOpacity )
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
