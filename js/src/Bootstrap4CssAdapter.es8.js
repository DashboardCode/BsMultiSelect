class Bootstrap4CssAdapter {

    constructor(jQuery, hiddenSelect, options) {
        const defaults = {
            containerClass: 'dashboardcode-bsmultiselect',
            dropDownMenuClass: 'dropdown-menu',
            dropDownItemClass: 'px-2',
            dropDownItemHoverClass: 'text-primary bg-light',
            selectedPanelClass: 'form-control',
            selectedPanelFocusClass : 'focus',
            selectedPanelReadonlyClass: 'disabled',
            selectedItemClass: 'badge', 
            removeSelectedItemButtonClass: 'close',
            filterInputItemClass: '',
            filterInputClass: ''
        };
        this.options = jQuery.extend({}, defaults, options);
        this.jQuery=jQuery;
        this.hiddenSelect=hiddenSelect;
        
    }

    CreateSelectedItemContent($selectedItem, itemText, removeSelectedItem){
        $selectedItem.addClass(this.options.selectedItemClass);
        let $text = this.jQuery(`<span>${itemText}</span>`)
        let $buttom = this.jQuery('<button aria-label="Close" tabIndex="-1" type="button"><span aria-hidden="true">&times;</span></button>');
        $buttom.addClass(this.options.removeSelectedItemButtonClass)
        $buttom.on("click", removeSelectedItem);
        $text.appendTo($selectedItem);
        $buttom.appendTo($selectedItem); 
    }

    CreateDropDownItemContent($dropDownItem, optionId, itemText, isSelected){
        let checkBoxId = `${this.options.containerClass}-${this.hiddenSelect.name.toLowerCase()}-generated-id-${optionId.toLowerCase()}`;
        let checked = isSelected ? "checked" : "";

        let $dropDownItemContent= this.jQuery(`<div class="custom-control custom-checkbox">
                <input type="checkbox" class="custom-control-input" id="${checkBoxId}" ${checked}>
                <label class="custom-control-label" for="${checkBoxId}">${itemText}</label>
        </div>`)
        $dropDownItemContent.appendTo($dropDownItem);
        $dropDownItem.addClass(this.options.dropDownItemClass)
        let $checkBox = $dropDownItem.find(`INPUT[type="checkbox"]`);
        let adoptDropDownItem = (isSelected) => {
            $checkBox.prop('checked', isSelected);
        }
        return adoptDropDownItem;
    }

    Init($container, $selectedPanel, $filterInputItem, $filterInput, $dropDownMenu){
        $container.addClass(this.options.containerClass);
        $selectedPanel.addClass(this.options.selectedPanelClass);
        

        let $hiddenSelect = this.jQuery(this.hiddenSelect);
        if ($hiddenSelect.hasClass("is-valid")){
            $selectedPanel.addClass("is-valid");
        }
        
        if ($hiddenSelect.hasClass("is-invalid")){
            $selectedPanel.addClass("is-invalid");
        }

        $dropDownMenu.addClass(this.options.dropDownMenuClass);
        $filterInputItem.addClass(this.options.filterInputItemClass)
        $filterInput.addClass(this.options.filterInputClass);
    }

    Enable($selectedPanel, isEnabled){
        if(isEnabled){
            let inputId = this.hiddenSelect.id;
            let $formGroup = this.jQuery(this.hiddenSelect).closest('.form-group');
            
            if ($formGroup.length == 1) {
                let $label = $formGroup.find(`label[for="${inputId}"]`);
                let f = $label.attr('for');
                let $filterInput = $selectedPanel.find('input');
                if (f == this.hiddenSelect.id) {
                    let id = `${this.options.containerClass}-generated-filter-id-${this.hiddenSelect.id}`;
                    $filterInput.attr('id', id);
                    $label.attr('for', id);
                }
            }
        }
        else{
            $selectedPanel.addClass(this.options.selectedPanelReadonlyClass);
            $selectedPanel.find('BUTTON').prop("disabled", true).off();
        }
    }

    Hover($dropDownItem, isHover){
        if (isHover)
            $dropDownItem.addClass(this.options.dropDownItemHoverClass);
        else
            $dropDownItem.removeClass(this.options.dropDownItemHoverClass);
    }

    FilterClick(event){
        return !(event.target.nodeName == "BUTTON" || (event.target.nodeName == "SPAN" && event.target.parentElement.nodeName == "BUTTON"))
    }

    Focus($selectedPanel, isFocused){
        if (isFocused){
            $selectedPanel.addClass(this.options.selectedPanelFocusClass);
        }else{
            $selectedPanel.removeClass(this.options.selectedPanelFocusClass);
        }
    }
}

export default Bootstrap4CssAdapter;