const defContainerClass= 'dashboardcode-bsmultiselect';
const defDropDownMenuClass= 'dropdown-menu';
const defDropDownItemHoverClass= 'text-primary bg-light';
const defSelectedPanelClass = 'form-control';
const defDropDownItemClass = 'px-2';

const defSelectedItemClass = 'badge';
const defSelectedPanelStyle= {'margin-bottom': '0'};
const defSelectedItemStyle= {'padding-left': '0px', 'line-height': '1.5em'};
const defRemoveSelectedItemButtonClass = 'close';
const defRemoveSelectedItemButtonStyle= {'font-size':'1.5em', 'line-height': '.9em'};

class Bs4AdapterJs {

    constructor(jQuery, hiddenSelect, options) {
        const defaults = {
            selectedPanelDefMinHeight: 'calc(2.25rem + 2px)',
            selectedPanelLgMinHeight:  'calc(2.875rem + 2px)',
            selectedPanelSmMinHeight:  'calc(1.8125rem + 2px)',
            selectedPanelDisabledBackgroundColor: '#e9ecef',
            selectedPanelFocusBorderColor: '#80bdff',
            selectedPanelFocusBoxShadow: '0 0 0 0.2rem rgba(0, 123, 255, 0.25)',
            selectedPanelFocusValidBoxShadow: '0 0 0 0.2rem rgba(40, 167, 69, 0.25)',
            selectedPanelFocusInvalidBoxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)',
            filterInputColor: '#495057'
        };
        this.options = jQuery.extend({}, defaults, options);
        this.jQuery=jQuery;
        this.hiddenSelect=hiddenSelect;

    }

    GetDropDownItemClass(){
        return defDropDownItemClass;
    }

    GetContainerClass(){
        return defContainerClass;
    }

    GetDropDownItemHoverClass(){
        return defDropDownItemHoverClass;
    }

    Init($container, $selectedPanel, $filterInputItem, $filterInput, $dropDownMenu){
        $container.addClass(defContainerClass);
        $selectedPanel.addClass(defSelectedPanelClass);
        $selectedPanel.css(defSelectedPanelStyle);

        $dropDownMenu.addClass(defDropDownMenuClass);
        $filterInput.css("color", this.options.filterInputColor);
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

    CreateSelectedItemContent($selectedItem, $button){
        $selectedItem.addClass(defSelectedItemClass);
        $selectedItem.css(defSelectedItemStyle);
        $button.addClass(defRemoveSelectedItemButtonClass)
        $button.css(defRemoveSelectedItemButtonStyle);
    }

    Enable($selectedPanel){
        $selectedPanel.css({"background-color": ""})
    }

    Disable($selectedPanel){
        $selectedPanel.css({"background-color": this.options.selectedPanelDisabledBackgroundColor})
    }

    FocusIn($selectedPanel){
        if ($selectedPanel.hasClass("is-valid")){
            $selectedPanel.css("box-shadow", this.options.selectedPanelFocusValidBoxShadow);
        } else if ($selectedPanel.hasClass("is-invalid")){
            $selectedPanel.css("box-shadow", this.options.selectedPanelFocusInvalidBoxShadow);
        } else {
            $selectedPanel
                .css("box-shadow", this.options.selectedPanelFocusBoxShadow)
                .css("border-color", this.options.selectedPanelFocusBorderColor);
        }
    }

    FocusOut($selectedPanel){
            $selectedPanel.css("box-shadow", "" ).css("border-color", "")
    }
}

export default Bs4AdapterJs;
