//import styles from './../../scss/BsMutliSelect.scss'

class Bs4Adapter {

    constructor(jQuery, hiddenSelect, adapter){
        this.$=jQuery;
        this.hiddenSelect=hiddenSelect;
        this.adapter = adapter;
        this.containerClass = adapter.GetContainerClass();
        this.dropDownItemHoverClass = adapter.GetDropDownItemHoverClass();
        this.bs4CommonsLabelDispose = null;
    }

    HandleLabel($selectedPanel){
        let inputId = this.hiddenSelect.id;
        let $formGroup = this.$(this.hiddenSelect).closest('.form-group');
        if ($formGroup.length == 1) {
            let $label = $formGroup.find(`label[for="${inputId}"]`);
            let forId = $label.attr('for');
            let $filterInput = $selectedPanel.find('input');
            if (forId == this.hiddenSelect.id) {
                let id = `${this.containerClass}-generated-filter-id-${this.hiddenSelect.id}`;
                $filterInput.attr('id', id);
                $label.attr('for', id);
                return () => {
                    $label.attr('for', forId);
                }
            }
        }
        return null;
    }

    // ------------------------------------------
    Init($container, $selectedPanel, $filterInputItem, $filterInput, $dropDownMenu){
        this.adapter.Init($container, $selectedPanel, $filterInputItem, $filterInput, $dropDownMenu)
        this.bs4CommonsLabelDispose = this.HandleLabel($selectedPanel);
    }

    Dispose(){
        if (this.bs4CommonsLabelDispose)
            this.bs4CommonsLabelDispose();
    }

    // ------------------------
    CreateDropDownItemContent(
        $dropDownItem, optionId, itemText, isSelected){

        let checkBoxId = `${this.containerClass}-${this.hiddenSelect.name.toLowerCase()}-generated-id-${optionId.toLowerCase()}`;
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
        $dropDownItem.addClass(this.adapter.GetDropDownItemClass());
        return adoptDropDownItem;
    }

    CreateSelectedItemContent($selectedItem, itemText, removeSelectedItem, disabled){
        this.$(`<span>${itemText}</span>`).appendTo($selectedItem);
        let $button = this.$('<button aria-label="Close" tabIndex="-1" type="button"><span aria-hidden="true">&times;</span></button>')
            .css("white-space", "nowrap")
            .on("click", removeSelectedItem)
            .appendTo($selectedItem)
            .prop("disabled", disabled)
        this.adapter.CreateSelectedItemContent($selectedItem, $button)
    }
    // -----------------------
    FilterClick(event){
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


    Enable($selectedPanel){
        this.adapter.Enable($selectedPanel)
        $selectedPanel.find('BUTTON').prop("disabled", false);
    }

    Disable($selectedPanel){
        this.adapter.Disable($selectedPanel)
        $selectedPanel.find('BUTTON').prop("disabled", true);
    }

    FocusIn($selectedPanel){
        this.adapter.FocusIn($selectedPanel)
    }

    FocusOut($selectedPanel){
        this.adapter.FocusOut($selectedPanel)
    }

    HoverIn($dropDownItem){
        $dropDownItem.addClass(this.dropDownItemHoverClass);
    }

    HoverOut($dropDownItem){
        $dropDownItem.removeClass(this.dropDownItemHoverClass);
    }
}

export default Bs4Adapter;
