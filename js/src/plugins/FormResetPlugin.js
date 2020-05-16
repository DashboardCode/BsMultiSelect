
import {EventBinder, closestByTagName} from '../ToolsDom';

export function FormResetPlugin(pluginData){
    var {staticDom, window} = pluginData;
    return {
        afterConstructor(multiSelect){
            var eventBuilder = EventBinder();
            if (staticDom.selectElement){
                var form = closestByTagName(staticDom.selectElement, 'FORM');
                if (form) {
                    eventBuilder.bind(form, 
                        'reset', 
                        () => window.setTimeout( ()=>multiSelect.updateData() ) );
                }
            }
            return eventBuilder.unbind;
        }
    }
}