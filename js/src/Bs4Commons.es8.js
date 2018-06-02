class Bs4Commons {
    
    constructor(jQuery, hiddenSelect, dropDownItemHoverClass){
        this.$=jQuery;
        this.hiddenSelect=hiddenSelect;
        this.dropDownItemHoverClass = dropDownItemHoverClass;
    }

    CreateDropDownItemContent(
        $dropDownItem, optionId, itemText, isSelected,
        containerClass, dropDownItemClass){
        let checkBoxId = `${containerClass}-${this.hiddenSelect.name.toLowerCase()}-generated-id-${optionId.toLowerCase()}`;
        let checked = isSelected ? "checked" : "";

        let $dropDownItemContent= this.$(`<div class="custom-control custom-checkbox">
            <input type="checkbox" class="custom-control-input" id="${checkBoxId}" ${checked}>
            <label class="custom-control-label" for="${checkBoxId}">${itemText}</label>
        </div>`)
        $dropDownItemContent.appendTo($dropDownItem);
        let $checkBox = $dropDownItem.find(`INPUT[type="checkbox"]`);
        let adoptDropDownItem = (isSelected) => {
            $checkBox.prop('checked', isSelected);
        }
        $dropDownItem.addClass(dropDownItemClass)
        return adoptDropDownItem;
    }

    CreateSelectedItemContent($selectedItem, itemText, removeSelectedItem,
        selectedItemClass, removeSelectedItemButtonClass, disabled
    ){
        $selectedItem.addClass(selectedItemClass);
        
        this.$(`<span>${itemText}</span>`).appendTo($selectedItem);
        let $button = this.$('<button aria-label="Close" tabIndex="-1" type="button"><span aria-hidden="true">&times;</span></button>')
            .addClass(removeSelectedItemButtonClass)
            .css("white-space", "nowrap")
            .on("click", removeSelectedItem)
            .appendTo($selectedItem)
            .prop("disabled", disabled)
        return $button;
    }

    FilterClick(event){
        return !(event.target.nodeName == "BUTTON" || (event.target.nodeName == "SPAN" && event.target.parentElement.nodeName == "BUTTON"))
    }

    Hover($dropDownItem, isHover){
        if (isHover)
            $dropDownItem.addClass(this.dropDownItemHoverClass);
        else
            $dropDownItem.removeClass(this.dropDownItemHoverClass);
    }
}
export default Bs4Commons;
