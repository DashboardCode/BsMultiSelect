import {setStyles} from './DomTools';
import {createEmpty} from './JsTools';

export function StylingCorrector(configuration){
    var resetDisable = createEmpty(configuration.picksStyleDisabled, "");
    var resetFocus = createEmpty(configuration.picksStyleFocus, "");
    return {
        init(elements){
            setStyles(elements.picks, configuration.picksStyle);
            setStyles(elements.input, configuration.filterInputStyle);
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