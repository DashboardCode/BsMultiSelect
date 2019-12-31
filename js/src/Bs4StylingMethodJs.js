import  { ExtendIfUndefined } from './Tools';

function defSelectedPanelStyle(e) 
{
    e.style.marginBottom = 0;
    e.style.height = 'auto';
};

const bs4StylingMethodJsDefaults = {
    selectedPanelDefMinHeight: 'calc(2.25rem + 2px)',
    selectedPanelLgMinHeight:  'calc(2.875rem + 2px)',
    selectedPanelSmMinHeight:  'calc(1.8125rem + 2px)',
    selectedPanelDisabledBackgroundColor: '#e9ecef',
    selectedPanelFocusBorderColor: '#80bdff',
    selectedPanelFocusBoxShadow: '0 0 0 0.2rem rgba(0, 123, 255, 0.25)',
    selectedPanelFocusValidBoxShadow: '0 0 0 0.2rem rgba(40, 167, 69, 0.25)',
    selectedPanelFocusInvalidBoxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)',
    filterInputColor: 'inherit', //'#495057',
    filterInputFontWeight: 'inherit' //'#495057',
};

export default function Bs4StylingMethodJs(configuration){
    ExtendIfUndefined(configuration, bs4StylingMethodJsDefaults);

    return {
        OnInit(composite){
            defSelectedPanelStyle(composite.selectedPanel)
            composite.filterInput.style.color = configuration.filterInputColor;
            composite.filterInput.style.fontWeight = configuration.filterInputFontWeight;
        },
    
        Enable(selectedPanel){
            selectedPanel.style.backgroundColor = ""
        },
    
        Disable(selectedPanel){
            selectedPanel.style.backgroundColor = configuration.selectedPanelDisabledBackgroundColor;
        },
    
        FocusIn(selectedPanel){
            if (selectedPanel.classList.contains("is-valid")){
                selectedPanel.style.boxShadow = configuration.selectedPanelFocusValidBoxShadow;
            } else if (selectedPanel.classList.contains("is-invalid")){
                selectedPanel.style.boxShadow = configuration.selectedPanelFocusInvalidBoxShadow;
            } else {
                selectedPanel.style.boxShadow = configuration.selectedPanelFocusBoxShadow;
                selectedPanel.style.borderColor = configuration.selectedPanelFocusBorderColor;
            }
        },
    
        FocusOut(selectedPanel){
            selectedPanel.style.boxShadow = "";
            selectedPanel.style.borderColor = "";
        },
    }
}
