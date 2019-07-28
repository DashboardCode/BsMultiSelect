function disableButton($selectedPanel, isDisabled){
    $selectedPanel.find('BUTTON').prop("disabled", isDisabled);
}

class Bs4Adapter {

    constructor(hiddenSelect, adapter, classes, $){
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

        this.classes = $.extend({}, defaults, classes);
        this.$ = $;
        this.hiddenSelect=hiddenSelect;
        this.adapter = adapter;
        this.bs4LabelDispose = null;
    }

    HandleLabel($selectedPanel){
        let inputId = this.hiddenSelect.id;
        let $formGroup = this.$(this.hiddenSelect).closest('.form-group');
        if ($formGroup.length == 1) {
            let $label = $formGroup.find(`label[for="${inputId}"]`);
            let forId = $label.attr('for');
            if (forId == this.hiddenSelect.id) {
                let id = `${this.classes.containerClass}-generated-filter-id-${this.hiddenSelect.id}`;
                $selectedPanel.find('input').attr('id', id);
                $label.attr('for', id);
                return () => {
                    $label.attr('for', forId);
                }
            }
        }
        return null;
    }

    // ------------------------------------------
    Init(dom){
        dom.container.addClass(this.classes.containerClass);
        dom.selectedPanel.addClass(this.classes.selectedPanelClass);
        dom.dropDownMenu.addClass(this.classes.dropDownMenuClass);
        dom.filterInputItem.addClass(this.classes.filterInputItemClass);
        dom.filterInput.addClass(this.classes.filterInputClass);
        if (this.adapter.OnInit)
            this.adapter.OnInit(dom)
        this.bs4LabelDispose = this.HandleLabel(dom.selectedPanel);
    }

    Dispose(){
        if (this.bs4LabelDispose)
            this.bs4LabelDispose();
    }

    // ------------------------
    CreateDropDownItemContent($dropDownItem, optionId, itemText){

        let checkBoxId = `${this.classes.containerClass}-${this.hiddenSelect.name.toLowerCase()}-generated-id-${optionId.toLowerCase()}`;

        let $dropDownItemContent= this.$(`<div class="custom-control custom-checkbox">
            <input type="checkbox" class="custom-control-input" id="${checkBoxId}">
            <label class="custom-control-label" for="${checkBoxId}">${itemText}</label>
        </div>`)
        $dropDownItemContent.appendTo($dropDownItem);
        let $checkBox = $dropDownItemContent.find(`INPUT[type="checkbox"]`);
        $dropDownItem.addClass(this.classes.dropDownItemClass);

        let dropDownItem = $dropDownItem.get(0);
        let dropDownItemContent = $dropDownItemContent.get(0);
 
        let adapter = this.adapter;
        return { 
            select(isSelected){ $checkBox.prop('checked', isSelected); }, 
            disable(isDisabled){ $checkBox.prop('disabled', isDisabled); },
            disabledStyle(disabledStyle){ adapter.DisabledStyle($checkBox, disabledStyle); },
            onSelected(toggle) {
                    $checkBox.on("change", toggle)
                    $dropDownItem.on("click", (e) => {
                        if (e.target == dropDownItem || e.target == dropDownItemContent)
                            toggle();
                    })
            }
        }
    }

    CreateSelectedItemContent($selectedItem, itemText, removeSelectedItem, controlDisabled, optionDisabled){
        let $content = this.$(`<span>${itemText}</span>`).appendTo($selectedItem);
        if (optionDisabled)
            this.adapter.DisableSelectedItemContent($content);
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
        $selectedItem.addClass(this.classes.selectedItemClass);
        $button.addClass(this.classes.removeSelectedItemButtonClass) // bs close class set the float:right
        if (this.adapter.CreateSelectedItemContent)
            this.adapter.CreateSelectedItemContent($selectedItem, $button)
    }

    // -----------------------
    IsClickToOpenDropdown(event){
        const target = event.target;
        const nodeName = target.nodeName;
        return !(nodeName == "BUTTON" || (nodeName == "SPAN" && target.parentElement.nodeName == "BUTTON"))
    }

    UpdateIsValid($selectedPanel){
        let $hiddenSelect = this.$(this.hiddenSelect);
        if ($hiddenSelect.hasClass("is-valid")){
            $selectedPanel.addClass("is-valid");
        }

        if ($hiddenSelect.hasClass("is-invalid")){
            $selectedPanel.addClass("is-invalid");
        }
    }

    UpdateSize($selectedPanel){
        if(this.adapter.UpdateSize)
            this.adapter.UpdateSize($selectedPanel)
    }

    HoverIn($dropDownItem){
        $dropDownItem.addClass(this.classes.dropDownItemHoverClass);
    }

    HoverOut($dropDownItem){
        $dropDownItem.removeClass(this.classes.dropDownItemHoverClass);
    }

    Enable($selectedPanel){
        this.adapter.Enable($selectedPanel)
        disableButton($selectedPanel, false)
    }

    Disable($selectedPanel){
        this.adapter.Disable($selectedPanel)
        disableButton($selectedPanel, true)
    }

    FocusIn($selectedPanel){
        this.adapter.FocusIn($selectedPanel)
    }

    FocusOut($selectedPanel){
        this.adapter.FocusOut($selectedPanel)
    }
}

export default Bs4Adapter;
