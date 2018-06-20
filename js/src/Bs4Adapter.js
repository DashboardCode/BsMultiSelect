function disableButton($selectedPanel, isDisabled){
    $selectedPanel.find('BUTTON').prop("disabled", isDisabled);
}

class Bs4Adapter {

    constructor(hiddenSelect, adapter, classes, $){
        this.$ = $;
        this.hiddenSelect=hiddenSelect;
        this.adapter = adapter;
        this.classes = classes;
        this.bs4CommonsLabelDispose = null;
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

        if (this.adapter.OnInit)
            this.adapter.OnInit(dom)
        this.bs4CommonsLabelDispose = this.HandleLabel(dom.selectedPanel);
    }

    Dispose(){
        if (this.bs4CommonsLabelDispose)
            this.bs4CommonsLabelDispose();
    }

    // ------------------------
    CreateDropDownItemContent($dropDownItem, optionId, itemText, isSelected){

        let checkBoxId = `${this.classes.containerClass}-${this.hiddenSelect.name.toLowerCase()}-generated-id-${optionId.toLowerCase()}`;
        let checked = isSelected ? "checked" : "";

        let $dropDownItemContent= this.$(`<div class="custom-control custom-checkbox">
            <input type="checkbox" class="custom-control-input" id="${checkBoxId}" ${checked}>
            <label class="custom-control-label" for="${checkBoxId}">${itemText}</label>
        </div>`)
        $dropDownItemContent.appendTo($dropDownItem);
        let $checkBox = $dropDownItem.find(`INPUT[type="checkbox"]`);
        let adoptDropDownItem = isSelected => {
            $checkBox.prop('checked', isSelected);
        }
        $dropDownItem.addClass(this.classes.dropDownItemClass);
        return adoptDropDownItem;
    }

    CreateSelectedItemContent($selectedItem, itemText, removeSelectedItem, disabled){
        this.$(`<span>${itemText}</span>`).appendTo($selectedItem);
        let $button = this.$('<button aria-label="Close" tabIndex="-1" type="button"><span aria-hidden="true">&times;</span></button>')
            .css("white-space", "nowrap")
            .on("click", removeSelectedItem)
            .appendTo($selectedItem)
            .prop("disabled", disabled)
        $selectedItem.addClass(this.classes.selectedItemClass);
        $button.addClass(this.classes.removeSelectedItemButtonClass)
        if (this.adapter.CreateSelectedItemContent)
            this.adapter.CreateSelectedItemContent($selectedItem, $button)
    }
    // -----------------------
    IsClickToOpenDropdown(event){
        return !(event.target.nodeName == "BUTTON" || (event.target.nodeName == "SPAN" && event.target.parentElement.nodeName == "BUTTON"))
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
