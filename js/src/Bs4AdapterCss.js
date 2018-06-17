import Bs4Commons from "./Bs4Commons";

class Bs4AdapterCss {

    constructor(jQuery, hiddenSelect, options) {
        const defaults = {
            containerClass: 'dashboardcode-bsmultiselect',
            dropDownMenuClass: 'dropdown-menu',
            dropDownItemClass: 'px-2',
            dropDownItemHoverClass: 'text-primary bg-light',
            selectedPanelClass: 'form-control',
            selectedPanelFocusClass : 'focus',
            selectedPanelDisabledClass: 'disabled',
            selectedItemClass: 'badge',
            removeSelectedItemButtonClass: 'close',
            filterInputItemClass: '',
            filterInputClass: ''
        };
        this.options = jQuery.extend({}, defaults, options);
        this.jQuery=jQuery;
        this.hiddenSelect=hiddenSelect;
        this.bs4Commons = new Bs4Commons(jQuery, hiddenSelect, this.options.dropDownItemHoverClass);
        this.bs4CommonsLabelDispose = null;
    }

    Init($container, $selectedPanel, $filterInputItem, $filterInput, $dropDownMenu){
        $container.addClass(this.options.containerClass);
        $selectedPanel.addClass(this.options.selectedPanelClass);

        $dropDownMenu.addClass(this.options.dropDownMenuClass);
        $filterInputItem.addClass(this.options.filterInputItemClass)
        $filterInput.addClass(this.options.filterInputClass);

        this.bs4CommonsLabelDispose = this.bs4Commons.HandleLabel($selectedPanel, this.options.containerClass);
    }

    Dispose(){
        if (this.bs4CommonsLabelDispose !== null)
            this.bs4CommonsLabelDispose();
    }

    UpdateIsValid($selectedPanel){
        this.bs4Commons.UpdateIsValid($selectedPanel);
    }

    Enable($selectedPanel){
        $selectedPanel.removeClass(this.options.selectedPanelDisabledClass)
        this.bs4Commons.Enable($selectedPanel)
    }

    Disable($selectedPanel){
        $selectedPanel.addClass(this.options.selectedPanelDisabledClass)
        this.bs4Commons.Disable($selectedPanel);
    }

    CreateDropDownItemContent($dropDownItem, optionId, itemText, isSelected){
        return this.bs4Commons.CreateDropDownItemContent($dropDownItem, optionId, itemText, isSelected, this.options.containerClass, this.options.dropDownItemClass);
    }

    CreateSelectedItemContent($selectedItem, itemText, removeSelectedItem, disabled){
        this.bs4Commons.CreateSelectedItemContent($selectedItem, itemText, removeSelectedItem, this.options.selectedItemClass, this.options.removeSelectedItemButtonClass, disabled);
    }

    
    Hover($dropDownItem, isHover){
        this.bs4Commons.Hover($dropDownItem, isHover);
    }

    FilterClick(event){
        return this.bs4Commons.FilterClick(event)
    }

    Focus($selectedPanel, isFocused){
        if (isFocused){
            $selectedPanel.addClass(this.options.selectedPanelFocusClass);
        }else{
            $selectedPanel.removeClass(this.options.selectedPanelFocusClass);
        }
    }
}

export default Bs4AdapterCss;
