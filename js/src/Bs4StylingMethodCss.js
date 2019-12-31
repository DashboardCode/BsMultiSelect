import  { ExtendIfUndefined } from './Tools';
import  { addClass, removeClass } from './DomTools';

const bs4StylingMethodCssDefaults = {
    selectedPanelFocusClass : 'focus',
    selectedPanelDisabledClass: 'disabled'//,
    //dropDownItemDisabledClass: 'disabled'
};

function Bs4StylingMethodCss(configuration){
    ExtendIfUndefined(configuration, bs4StylingMethodCssDefaults);

    return {
        Enable(selectedPanel){
            removeClass(selectedPanel,configuration.selectedPanelDisabledClass)
        },
    
        Disable(selectedPanel){
            addClass(selectedPanel, configuration.selectedPanelDisabledClass)
        },
    
        FocusIn(selectedPanel){
            addClass(selectedPanel, configuration.selectedPanelFocusClass);
        },
    
        FocusOut(selectedPanel){
            removeClass(selectedPanel, configuration.selectedPanelFocusClass);
        }
    }
}

export default Bs4StylingMethodCss;