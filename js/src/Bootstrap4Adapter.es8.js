class Bootstrap4Adapter {

    constructor(jQuery, hiddenSelect, options) {
        const defaults = {
            //usePopper: true,
            selectedPanelDefMinHeight: 'calc(2.25rem + 2px)',
            selectedPanelReadonlyBackgroundColor: '#e9ecef',
            selectedPanelBoxShadow: '0 0 0 0.2rem rgba(0, 123, 255, 0.25)',
            selectedPanelBorderColor: '#80bdff', 
            selectedPanelValidBoxShadow: ' 0 0 0 0.2rem rgba(40, 167, 69, 0.25)',
            selectedPanelInvalidBoxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)',
            filterInputColor: '#495057',
            containerClass: 'dashboardcode-bsmultiselect',
            dropDownMenuClass: 'dropdown-menu',
            dropDownItemClass: 'px-2',
            selectedPanelClass: '',
            selectedPanelFocusClass : '',
            selectedPanelReadonlyClass: '',
            selectedItemClass: '', 
            
            removeSelectedItemButtonClass: '',
            
            filterInputItemClass: '',
            filterInputClass: ''
        };
        this.options = jQuery.extend({}, defaults, options);
        this.jQuery=jQuery;
        this.hiddenSelect=hiddenSelect;
        
    }

    CreateSelectedItemContent($selectedItem, itemText, removeSelectedItem){
        const defSelectedItemClass = 'badge';
        const defSelectedItemStyle = {'padding-left': '0px', 'line-height': '1rem'};
        const defRemoveSelectedItemButtonClass = 'close';
        const defRemoveSelectedItemButtonStyle = {'line-height': '1rem', 'font-size':'1.3rem'};

        if (!this.options.selectedItemClass){
            $selectedItem.addClass(defSelectedItemClass);
            $selectedItem.css(defSelectedItemStyle)
        }else{
            $selectedItem.addClass(this.options.selectedItemClass);
        }
            
        let $text = this.jQuery(`<span>${itemText}</span>`)
        let $buttom = this.jQuery('<button aria-label="Close" tabIndex="-1" type="button"><span aria-hidden="true">&times;</span></button>');

        if (!this.options.removeSelectedItemButtonClass){
            $buttom.addClass(defRemoveSelectedItemButtonClass);
            $buttom.css(defRemoveSelectedItemButtonStyle);
        }
        else{
            $buttom.addClass(this.options.removeSelectedItemButtonClass)
        }
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
        const defSelectedPanelClass = 'form-control';
        const defSelectedPanelStyle = {'margin-bottom': '0'}; // 16 is for bootstrap reboot for UL

        $container.addClass(this.options.containerClass);

        if (!this.options.selectedPanelClass){
            $selectedPanel.addClass(defSelectedPanelClass);
            $selectedPanel.css(defSelectedPanelStyle);
            $selectedPanel.css({ "min-height" : this.options.selectedPanelMinHeight });
        }
        else {
            $selectedPanel.addClass(this.options.selectedPanelClass);
        }

        let $hiddenSelect = this.jQuery(this.hiddenSelect);
        if ($hiddenSelect.hasClass("is-valid")){
            $selectedPanel.addClass("is-valid");
        }
        
        if ($hiddenSelect.hasClass("is-invalid")){
            $selectedPanel.addClass("is-invalid");
        }

        $dropDownMenu.addClass(this.options.dropDownMenuClass);

        if (!this.options.filterInputItemClass)
            $filterInputItem.addClass(this.options.filterInputItemClass)


        if (!this.options.filterInputClass){
            $filterInput.css("color", this.options.filterInputColor);
        } else {
            $filterInput.addClass(this.options.filterInputClass);
        }
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
            if(!this.options.selectedPanelReadonlyClass){
                $selectedPanel.css({"background-color": this.options.selectedPanelReadonlyBackgroundColor});
            }else{
                $selectedPanel.addClass(this.options.selectedPanelReadonlyClass);
            }
            $selectedPanel.find('BUTTON').prop("disabled", true).off();
        }
    }

    Hover($dropDownItem, isHover){
        if (isHover)
            $dropDownItem.addClass('text-primary').addClass('bg-light');
        else
            $dropDownItem.removeClass('text-primary').removeClass('bg-light');
    }

    FilterClick(event){
        return !(event.target.nodeName == "BUTTON" || (event.target.nodeName == "SPAN" && event.target.parentElement.nodeName == "BUTTON"))
    }

    Focus($selectedPanel, isFocused){
        if (isFocused){
            if (this.options.selectedPanelFocusClass){
                $selectedPanel.addClass("this.options.selectedPanelFocusClass");
            }
            else
            {
                if ($selectedPanel.hasClass("is-valid") &&  this.options.selectedPanelValidBoxShadow){
                    $selectedPanel.css("box-shadow", this.options.selectedPanelValidBoxShadow);              
                } else if ($selectedPanel.hasClass("is-invalid") && this.options.selectedPanelInvalidBoxShadow){
                    $selectedPanel.css("box-shadow", this.options.selectedPanelInvalidBoxShadow);
                } else {
                    $selectedPanel
                        .css("box-shadow", this.options.selectedPanelBoxShadow)
                        .css("border-color", this.options.selectedPanelBorderColor);
                }
            }

        }else{
            if (this.options.selectedPanelFocusClass){
                $selectedPanel.removeClass(this.options.selectedPanelFocusClass);
            } else {
                $selectedPanel.css("box-shadow", "" ).css("border-color", "")
            }
        }
    }
}

export default Bootstrap4Adapter;