
import {EventBinder, closestByTagName} from '../ToolsDom';

export function FormResetPlugin(pluginData){
    var {staticContent, window} = pluginData;
    return {
        afterConstructor(multiSelect){
            var eventBuilder = EventBinder();
            if (staticContent.selectElement){
                var form = closestByTagName(staticContent.selectElement, 'FORM');
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