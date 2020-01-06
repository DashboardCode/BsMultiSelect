import {setStyles} from './ToolsDom';
import {createEmpty} from './ToolsJs';

export function StylingCorrector(configuration){
    var resetDisable = createEmpty(configuration.picksStyleDisabled, "");
    var resetFocus = createEmpty(configuration.picksStyleFocus, "");
    return {
        init(elements){
            setStyles(elements.picks, configuration.picksStyle);
        },
    
        enable(picksElement){
            setStyles(picksElement, resetDisable)
        },
    
        disable(picksElement){
            setStyles(picksElement, configuration.picksStyleDisabled);
        },
    
        focusIn(picksElement){
            setStyles(picksElement, configuration.picksStyleFocus)
        },
    
        focusOut(picksElement){
            setStyles(picksElement, resetFocus)
        }
    }
}