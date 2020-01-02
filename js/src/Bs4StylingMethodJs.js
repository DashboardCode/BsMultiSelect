
import  { setStyles } from './DomTools';

const defSelectedPanelStyle =
{
    marginBottom: 0, 
    height: 'auto'
};

export default function Bs4StylingMethodJs(configuration){
    return {
        OnInit(elements){
            setStyles(elements.picks, defSelectedPanelStyle);
            elements.input.style.color = configuration.filterInputColor;
            elements.input.style.fontWeight = configuration.filterInputFontWeight;
        },
    
        Enable(picksElement){
            picksElement.style.backgroundColor = ""
        },
    
        Disable(picksElement){
            picksElement.style.backgroundColor = configuration.selectedPanelDisabledBackgroundColor;
        },
    
        FocusIn(picksElement){
            if (picksElement.classList.contains("is-valid")){
                picksElement.style.boxShadow = configuration.selectedPanelFocusValidBoxShadow;
            } else if (picksElement.classList.contains("is-invalid")){
                picksElement.style.boxShadow = configuration.selectedPanelFocusInvalidBoxShadow;
            } else {
                picksElement.style.boxShadow = configuration.selectedPanelFocusBoxShadow;
                picksElement.style.borderColor = configuration.selectedPanelFocusBorderColor;
            }
        },
    
        FocusOut(picksElement){
            picksElement.style.boxShadow = "";
            picksElement.style.borderColor = "";
        }
    }
}