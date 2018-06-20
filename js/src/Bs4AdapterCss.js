import {defContainerClass, defDropDownMenuClass,
        defDropDownItemHoverClass, defSelectedPanelClass, defDropDownItemClass,
        defSelectedItemClass, defRemoveSelectedItemButtonClass} from './Bs4Const'

class Bs4AdapterCss {

    constructor(options, $) {
        const defaults = {
            containerClass: defContainerClass,
            dropDownMenuClass: defDropDownMenuClass,
            dropDownItemClass: defDropDownItemClass,
            dropDownItemHoverClass: defDropDownItemHoverClass,
            selectedPanelClass: defSelectedPanelClass,
            selectedPanelFocusClass : 'focus',
            selectedPanelDisabledClass: 'disabled',
            selectedItemClass: defSelectedItemClass,
            removeSelectedItemButtonClass: defRemoveSelectedItemButtonClass
        };
        this.options = $.extend({}, defaults, options);
    }

    GetClasses(){
        return this.options;
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
