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

            // there is an argument to call event => event.stopPropogation on the click (to prevent closing dropdown if bsmultiselect located there)
            // but better solve it other way: filter clicks is dropdown responcibility; we remove item only after it could be catched by parents click filter
            // why click is so specific for us? it is used to close dropdowns by BS4
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
