const defSelectedPanelStyle = {'margin-bottom': '0', 'height': 'auto'};
const defSelectedItemStyle = {'padding-left': '0px', 'line-height': '1.5em'};
const defRemoveSelectedItemButtonStyle = {'font-size':'1.5em', 'line-height': '.9em'};

class Bs4AdapterJs {
    constructor(options, $) {
        const defaults = {
            selectedPanelDefMinHeight: 'calc(2.25rem + 2px)',
            selectedPanelLgMinHeight:  'calc(2.875rem + 2px)',
            selectedPanelSmMinHeight:  'calc(1.8125rem + 2px)',
            selectedPanelDisabledBackgroundColor: '#e9ecef',
            selectedPanelFocusBorderColor: '#80bdff',
            selectedPanelFocusBoxShadow: '0 0 0 0.2rem rgba(0, 123, 255, 0.25)',
            selectedPanelFocusValidBoxShadow: '0 0 0 0.2rem rgba(40, 167, 69, 0.25)',
            selectedPanelFocusInvalidBoxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)',
            filterInputColor: '#495057',
            selectedItemContentDisabledOpacity: '.65',
            dropdDownLabelDisabledColor: '#6c757d'
        };
        this.options = $.extend({}, defaults, options);
    }

    OnInit(dom){
        dom.selectedPanel.css(defSelectedPanelStyle);
        dom.filterInput.css("color", this.options.filterInputColor);
    }

    
    CreateSelectedItemContent($selectedItem, $button){
        $selectedItem.css(defSelectedItemStyle);
        $button.css(defRemoveSelectedItemButtonStyle);
    }

    DisableSelectedItemContent($content){
        $content.css("opacity", this.options.selectedItemContentDisabledOpacity )
    }

    DisabledStyle($checkBox, isDisbaled){
        $checkBox.siblings('label').css('color', isDisbaled?this.options.dropdDownLabelDisabledColor:'')
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
