
import  { addClasses, removeClasses } from './DomTools';

export function Styling(configuration, stylingMethod) {
    return {
        Init(elements){
            addClasses(elements.container, configuration.containerClass);
            addClasses(elements.picks, configuration.selectedPanelClass);
            addClasses(elements.options, configuration.dropDownMenuClass);
            addClasses(elements.inputItem, configuration.filterInputItemClass);
            addClasses(elements.input, configuration.filterInputClass);
            if (stylingMethod && stylingMethod.OnInit)
                stylingMethod.OnInit(elements)
        },

        Enable(elements){
            removeClasses(elements.picks, configuration.selectedPanelDisabledClass);
            if (stylingMethod && stylingMethod.Enable)
                stylingMethod.Enable(elements.picks)
        },

        Disable(elements){
            addClasses(elements.picks, configuration.selectedPanelDisabledClass);
            if (stylingMethod && stylingMethod.Disable)
                stylingMethod.Disable(elements.picks)
        },

        FocusIn(elements){
            addClasses(elements.picks, configuration.selectedPanelFocusClass);
            if (stylingMethod && stylingMethod.FocusIn)
                stylingMethod.FocusIn(elements.picks)
        },

        FocusOut(elements){
            removeClasses(elements.picks, configuration.selectedPanelFocusClass);
            if (stylingMethod && stylingMethod.FocusOut)
                stylingMethod.FocusOut(elements.picks)
        }
    }
}
