import  { ExtendIfUndefined } from './Tools';

const defaults = {
    selectedPanelFocusClass : 'focus',
    selectedPanelDisabledClass: 'disabled',
    dropDownItemDisabledClass: 'disabled'
};

function StylingBs4AdapterCss(configuration){
    ExtendIfUndefined(configuration, defaults);

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

export default StylingBs4AdapterCss;
