import {EventBinder, containsAndSelf} from './ToolsDom';

export function PicksElementAspect(picksElement){
    var componentDisabledEventBinder = EventBinder();
    var skipoutAndResetMousedownEventBinder = EventBinder();
    return {
        containsAndSelf(element){
            return containsAndSelf(picksElement, element);
        },
        onClickUnbind(){
            componentDisabledEventBinder.unbind();
        },
        onClick(handler){
            componentDisabledEventBinder.bind(picksElement, "click",  handler);
        },
        onMousedown(handler){
            skipoutAndResetMousedownEventBinder.bind(picksElement, "mousedown",  handler);
        },
        unbind(){
            skipoutAndResetMousedownEventBinder.unbind();
            componentDisabledEventBinder.unbind();
        }
    }
}