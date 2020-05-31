import {EventBinder, closestByTagName} from '../ToolsDom';

export function FormResetPlugin(pluginData){
    var {staticDom, environment} = pluginData;
    return {
        buildApi(api){
            var eventBuilder = EventBinder();
            if (staticDom.selectElement){
                var form = closestByTagName(staticDom.selectElement, 'FORM');
                if (form) {
                    eventBuilder.bind(form, 
                        'reset', 
                        () => environment.window.setTimeout( ()=>api.updateData() ) );
                }
            }
            return eventBuilder.unbind;
        }
    }
}