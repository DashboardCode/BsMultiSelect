import  { ExtendIfUndefined } from './Tools';

const defSelectedPanelStyle = {'margin-bottom': '0', 'height': 'auto'};

const bs4StylingMethodJsDefaults = {
    selectedPanelDefMinHeight: 'calc(2.25rem + 2px)',
    selectedPanelLgMinHeight:  'calc(2.875rem + 2px)',
    selectedPanelSmMinHeight:  'calc(1.8125rem + 2px)',
    selectedPanelDisabledBackgroundColor: '#e9ecef',
    selectedPanelFocusBorderColor: '#80bdff',
    selectedPanelFocusBoxShadow: '0 0 0 0.2rem rgba(0, 123, 255, 0.25)',
    selectedPanelFocusValidBoxShadow: '0 0 0 0.2rem rgba(40, 167, 69, 0.25)',
    selectedPanelFocusInvalidBoxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)',
    filterInputColor: '#495057',
    //selectedItemContentDisabledOpacity: '.65'
};

function Bs4StylingMethodJs(configuration){
    ExtendIfUndefined(configuration, bs4StylingMethodJsDefaults);

    return {
        OnInit(composite){
            composite.$selectedPanel.css(defSelectedPanelStyle);
            composite.$filterInput.css("color", configuration.filterInputColor);
        },
    
        UpdateSize($selectedPanel){
            if ($selectedPanel.hasClass("form-control-lg")){
                $selectedPanel.css("min-height", configuration.selectedPanelLgMinHeight);
            } else if ($selectedPanel.hasClass("form-control-sm")){
                $selectedPanel.css("min-height", configuration.selectedPanelSmMinHeight);
            } else {
                $selectedPanel.css("min-height", configuration.selectedPanelDefMinHeight);
            }
        },
    
        Enable($selectedPanel){
            $selectedPanel.css("background-color", "")
        },
    
        Disable($selectedPanel){
            $selectedPanel.css("background-color", configuration.selectedPanelDisabledBackgroundColor)
        },
    
        FocusIn($selectedPanel){
            if ($selectedPanel.hasClass("is-valid")){
                $selectedPanel.css("box-shadow", configuration.selectedPanelFocusValidBoxShadow);
            } else if ($selectedPanel.hasClass("is-invalid")){
                $selectedPanel.css("box-shadow", configuration.selectedPanelFocusInvalidBoxShadow);
            } else {
                $selectedPanel
                    .css("box-shadow", configuration.selectedPanelFocusBoxShadow)
                    .css("border-color", configuration.selectedPanelFocusBorderColor);
            }
        },
    
        FocusOut($selectedPanel){
                $selectedPanel.css("box-shadow", "" ).css("border-color", "")
        },
    }
}

export default Bs4StylingMethodJs;