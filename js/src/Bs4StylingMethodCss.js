import  { ExtendIfUndefined } from './Tools';

const bs4StylingMethodCssDefaults = {
    selectedPanelFocusClass : 'focus',
    selectedPanelDisabledClass: 'disabled',
    dropDownItemDisabledClass: 'disabled'
};

function Bs4StylingMethodCss(configuration){
    ExtendIfUndefined(configuration, bs4StylingMethodCssDefaults);

    return {
        Enable($selectedPanel){
            $selectedPanel.removeClass(configuration.selectedPanelDisabledClass)
        },
    
        Disable($selectedPanel){
            $selectedPanel.addClass(configuration.selectedPanelDisabledClass)
        },
    
        FocusIn($selectedPanel){
            $selectedPanel.addClass(configuration.selectedPanelFocusClass);
        },
    
        FocusOut($selectedPanel){
            $selectedPanel.removeClass(configuration.selectedPanelFocusClass);
        }
    }
}

export default Bs4StylingMethodCss;