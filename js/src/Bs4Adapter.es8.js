import Bs4Commons from "./Bs4Commons.es8";
//import styles from './../../scss/BsMutliSelect.scss'

class Bs4Adapter {

    constructor(jQuery, hiddenSelect, options) {
        const defaults = {
            selectedPanelDefMinHeight: 'calc(2.25rem + 2px)',
            selectedPanelLgMinHeight: 'calc(2.875rem + 2px)',
            selectedPanelSmMinHeight: 'calc(1.8125rem + 2px)',
            selectedPanelReadonlyBackgroundColor: '#e9ecef',
            selectedPanelFocusBorderColor: '#80bdff',
            selectedPanelFocusBoxShadow: '0 0 0 0.2rem rgba(0, 123, 255, 0.25)',
            selectedPanelFocusValidBoxShadow: '0 0 0 0.2rem rgba(40, 167, 69, 0.25)',
            selectedPanelFocusInvalidBoxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)',
            filterInputColor: '#495057'
        };
        this.options = jQuery.extend({}, defaults, options);
        this.jQuery=jQuery;
        this.hiddenSelect=hiddenSelect;

        this.containerClass= 'dashboardcode-bsmultiselect';
        this.dropDownMenuClass= 'dropdown-menu';
        this.dropDownItemClass= 'px-2';
        this.dropDownItemHoverClass= 'text-primary bg-light';
        this.selectedPanelClass= 'form-control';
        this.selectedItemClass= 'badge';
        this.removeSelectedItemButtonClass= 'close';

        this.selectedPanelStyle= {'margin-bottom': '0'};
        this.selectedItemStyle= {'padding-left': '0px', 'line-height': '1rem'};
        this.removeSelectedItemButtonStyle= {'line-height': '1rem', 'font-size':'1.3rem'};

        this.bs4Commons = new Bs4Commons(jQuery, hiddenSelect, this.dropDownItemHoverClass);
    }

    Init($container, $selectedPanel, $filterInputItem, $filterInput, $dropDownMenu){

        $container.addClass(this.containerClass);
        $selectedPanel.addClass(this.selectedPanelClass);
        $selectedPanel.css(this.selectedPanelStyle);

        $dropDownMenu.addClass(this.dropDownMenuClass);
        $filterInput.css("color", this.options.filterInputColor);

        let inputId = this.hiddenSelect.id;
        let $formGroup = this.jQuery(this.hiddenSelect).closest('.form-group');
        
        if ($formGroup.length == 1) {
            let $label = $formGroup.find(`label[for="${inputId}"]`);
            let f = $label.attr('for');
            let $filterInput = $selectedPanel.find('input');
            if (f == this.hiddenSelect.id) {
                let id = `${this.containerClass}-generated-filter-id-${this.hiddenSelect.id}`;
                $filterInput.attr('id', id);
                $label.attr('for', id);
            }
        }
    }

    UpdateIsValid($selectedPanel){
        let $hiddenSelect = this.jQuery(this.hiddenSelect);
        if ($hiddenSelect.hasClass("is-valid")){
            $selectedPanel.addClass("is-valid");
        }

        if ($hiddenSelect.hasClass("is-invalid")){
            $selectedPanel.addClass("is-invalid");
        }
    }

    UpdateSize($selectedPanel){
        if ($selectedPanel.hasClass("form-control-lg")){
            $selectedPanel.css("min-height", this.options.selectedPanelLgMinHeight);
        } else if ($selectedPanel.hasClass("form-control-sm")){
            $selectedPanel.css("min-height", this.options.selectedPanelSmMinHeight);
        } else {
            $selectedPanel.css("min-height", this.options.selectedPanelDefMinHeight);
        }
    }

    Enable($selectedPanel, isEnabled){
        if(isEnabled){
            $selectedPanel.css({"background-color": ""});
            $selectedPanel.find('BUTTON').prop("disabled", false);
        }
        else{
            $selectedPanel.css({"background-color": this.options.selectedPanelReadonlyBackgroundColor});
            $selectedPanel.find('BUTTON').prop("disabled", true);
        }
    }

    CreateDropDownItemContent($dropDownItem, optionId, itemText, isSelected){
        return this.bs4Commons.CreateDropDownItemContent($dropDownItem, optionId, itemText, isSelected, this.containerClass, this.dropDownItemClass)
    }

    CreateSelectedItemContent($selectedItem, itemText, removeSelectedItem, disabled){
        let $buttom = this.bs4Commons.CreateSelectedItemContent($selectedItem, itemText, removeSelectedItem, this.selectedItemClass, this.removeSelectedItemButtonClass, disabled);
        $buttom.css(this.removeSelectedItemButtonStyle);
        $selectedItem.css(this.selectedItemStyle);
    }

    Hover($dropDownItem, isHover){
        this.bs4Commons.Hover($dropDownItem, isHover);
    }

    FilterClick(event){
        return this.bs4Commons.FilterClick(event)
    }

    Focus($selectedPanel, isFocused){
        if (isFocused){
                if ($selectedPanel.hasClass("is-valid")){
                    $selectedPanel.css("box-shadow", this.options.selectedPanelFocusValidBoxShadow);
                } else if ($selectedPanel.hasClass("is-invalid")){
                    $selectedPanel.css("box-shadow", this.options.selectedPanelFocusInvalidBoxShadow);
                } else {
                    $selectedPanel
                        .css("box-shadow", this.options.selectedPanelFocusBoxShadow)
                        .css("border-color", this.options.selectedPanelFocusBorderColor);
                }
        }else{
            $selectedPanel.css("box-shadow", "" ).css("border-color", "")
        }
    }
}

export default Bs4Adapter;
