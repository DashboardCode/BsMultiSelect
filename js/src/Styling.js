import {addClasses, removeClasses} from './ToolsDom';

export function Styling(configuration, stylingCorrector) {
    return {
        Init(elements){
            addClasses(elements.container, configuration.containerClass);
            addClasses(elements.picks, configuration.picksClass);
            addClasses(elements.choices, configuration.choicesClass);
            addClasses(elements.pickFilter, configuration.pickFilterClass);
            addClasses(elements.input, configuration.filterInputClass);
            if (stylingCorrector && stylingCorrector.init)
                stylingCorrector.init(elements)
        },

        Enable(elements){
            removeClasses(elements.picks, configuration.picksClassDisabled);
            if (stylingCorrector && stylingCorrector.enable)
                stylingCorrector.enable(elements.picks)
        },

        Disable(elements){
            addClasses(elements.picks, configuration.picksClassDisabled);
            if (stylingCorrector && stylingCorrector.disable)
                stylingCorrector.disable(elements.picks)
        },

        FocusIn(elements){
            addClasses(elements.picks, configuration.picksClassFocus);
            if (stylingCorrector && stylingCorrector.focusIn)
                stylingCorrector.focusIn(elements.picks)
        },

        FocusOut(elements){
            removeClasses(elements.picks, configuration.picksClassFocus);
            if (stylingCorrector && stylingCorrector.focusOut)
                stylingCorrector.focusOut(elements.picks)
        }
    }
}