function disableButton($selectedPanel, isDisabled){
    $selectedPanel.find('BUTTON').prop("disabled", isDisabled);
}

// addClass, removeClass, css, siblings('label'), hasClass, find('BUTTON').prop(..)
class Bs4Adapter {

    constructor(stylingAdapter, configuration, $){
        const defaults = {
            containerClass: 'dashboardcode-bsmultiselect',
            dropDownMenuClass: 'dropdown-menu',
            dropDownItemClass:  'px-2',
            dropDownItemHoverClass: 'text-primary bg-light',
            selectedPanelClass: 'form-control',
            selectedItemClass: 'badge',
            removeSelectedItemButtonClass: 'close',
            filterInputItemClass: '',
            filterInputClass: ''
        }
        let tmp = $.extend({}, defaults, configuration);
        this.configuration = $.extend(configuration, tmp);
        this.$ = $;
        this.stylingAdapter = stylingAdapter;
        this.bs4LabelDispose = null;
        
        this.createDropDownItemContent = (dropDownItem, option) => {
            let $dropDownItem = $(dropDownItem);
            $dropDownItem.addClass(configuration.dropDownItemClass);
            let $dropDownItemContent= this.$(`<div class="custom-control custom-checkbox">
                <input type="checkbox" class="custom-control-input">
                <label class="custom-control-label"></label>
            </div>`);
            $dropDownItemContent.appendTo(dropDownItem);
            let $checkBox = $dropDownItemContent.find(`INPUT[type="checkbox"]`);
            let $checkBoxLabel = $dropDownItemContent.find(`label`);
            $checkBoxLabel.text(option.text);
            
     
            let stylingAdapter = this.stylingAdapter;
            return { 
                select(isSelected){ $checkBox.prop('checked', isSelected); }, 
                disable(isDisabled){ $checkBox.prop('disabled', isDisabled); },
                disabledStyle(disabledStyle){ stylingAdapter.DisabledStyle($checkBox, disabledStyle); },
                onSelected(toggle) {
                        $checkBox.on("change", toggle)
                        $dropDownItem.on("click", event => {
                            if (dropDownItem === event.target || $.contains(dropDownItem, event.target)) {
                                toggle();
                            }
                        })
                }
            }
        }

        this.createSelectedItemContent = (selectedItem, optionItem, removeSelectedItem, controlDisabled) => {
            let $selectedItem = $(selectedItem)
            let $content = this.$(`<span/>`).text(optionItem.text);
            $content.appendTo($selectedItem);
            if (optionItem.disabled)
                this.stylingAdapter.DisableSelectedItemContent($content);
            let $button = this.$('<button aria-label="Close" tabIndex="-1" type="button"><span aria-hidden="true">&times;</span></button>')
                // bs 'close' class that will be added to button set the float:right, therefore it impossible to configure no-warp policy 
                // with .css("white-space", "nowrap") or  .css("display", "inline-block"); TODO: migrate to flex? 
                .css("float", "none")
    
                // what is a problem with calling removeSelectedItem directly (not using  setTimeout(removeSelectedItem, 0)):
                // consider situation "MultiSelect" on DROPDOWN (that should be closed on the click outside dropdown)
                // therefore we aslo have document's click's handler where we decide to close or leave the DROPDOWN open.
                // because of the event's bubling process removeSelectedItem runs first. 
                // that means the event's target element on which we click (the x button) will be removed from the DOM together with badge 
                // before we could analize is it belong to our dropdown or not.
                // important 1: we can't just the stop propogation using stopPropogate because click outside dropdown on the similar 
                // component that use stopPropogation will not close dropdown (error, dropdown should be closed)
                // important 2: we can't change the dropdown's event handler to leave dropdown open if event's target is null because of
                // the situation described above: click outside dropdown on the same component.
                // Alternatively it could be possible to use stopPropogate but together create custom click event setting new target that belomgs to DOM (e.g. panel)
                
                .on("click", () => setTimeout(removeSelectedItem, 0)) 
                .appendTo($selectedItem)
                .prop("disabled", controlDisabled)
            $selectedItem.addClass(configuration.selectedItemClass);
            $button.addClass(configuration.removeSelectedItemButtonClass) // bs close class set the float:right
            if (this.stylingAdapter.CreateSelectedItemContent)
                this.stylingAdapter.CreateSelectedItemContent($selectedItem, $button)
        }
    }
   

    // ------------------------------------------------------------------------------------------------
    Init(dom){
        dom.container.addClass(this.configuration.containerClass);
        dom.selectedPanel.addClass(this.configuration.selectedPanelClass);
        dom.dropDownMenu.addClass(this.configuration.dropDownMenuClass);
        dom.filterInputItem.addClass(this.configuration.filterInputItemClass);
        dom.filterInput.addClass(this.configuration.filterInputClass);
        if (this.stylingAdapter.OnInit)
            this.stylingAdapter.OnInit(dom)
        this.bs4LabelDispose = this.HandleLabel(dom.filterInput);
    }

    HandleLabel($filterInput){
        var label = this.configuration.label;
        if (label!=null) {
            var newForId = this.configuration.createInputId();
            var backupForId =  label.getAttribute('for');
            $filterInput.attr('id', newForId);
            label.setAttribute('for',newForId);
            return () => {
                label.setAttribute('for',backupForId);
            }
        }
        return null;
    }

    Dispose(){
        if (this.bs4LabelDispose)
            this.bs4LabelDispose();
    }

    // ------------------------------------------------------------------------------------------------
    CreateDropDownItemContent(dropDownItem, option){
        return this.createDropDownItemContent(dropDownItem, option);
    }

    CreateSelectedItemContent(selectedItem, optionItem, removeSelectedItem, controlDisabled){
        return this.createSelectedItemContent(selectedItem, optionItem, removeSelectedItem, controlDisabled);
    }

    // -----------------------
    IsClickToOpenDropdown(event){
        const target = event.target;
        const nodeName = target.nodeName;
        return !(nodeName == "BUTTON" || (nodeName == "SPAN" && target.parentElement.nodeName == "BUTTON"))
    }

    UpdateIsValid($selectedPanel){
        if (this.configuration.getIsValid()){
            $selectedPanel.addClass("is-valid");
        }

        if (this.configuration.getIsInvalid()){
            $selectedPanel.addClass("is-invalid");
        }
    }

    UpdateSize($selectedPanel){
        if(this.stylingAdapter.UpdateSize)
            this.stylingAdapter.UpdateSize($selectedPanel)
    }

    HoverIn($dropDownItem){
        $dropDownItem.addClass(this.configuration.dropDownItemHoverClass);
    }

    HoverOut($dropDownItem){
        $dropDownItem.removeClass(this.configuration.dropDownItemHoverClass);
    }

    Enable($selectedPanel){
        this.stylingAdapter.Enable($selectedPanel)
        disableButton($selectedPanel, false)
    }

    Disable($selectedPanel){
        this.stylingAdapter.Disable($selectedPanel)
        disableButton($selectedPanel, true)
    }

    FocusIn($selectedPanel){
        this.stylingAdapter.FocusIn($selectedPanel)
    }

    FocusOut($selectedPanel){
        this.stylingAdapter.FocusOut($selectedPanel)
    }
}

export default Bs4Adapter;
