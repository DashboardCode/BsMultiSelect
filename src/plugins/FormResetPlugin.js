import {EventBinder, closestByTagName} from '../ToolsDom';

export function FormResetPlugin(){
    return {
        plug
    }
}

export function plug(){
    return (aspects) => {
        return {
            layout: () => {
                var {staticDom, updateDataAspect, environment} = aspects;

                var eventBuilder = EventBinder();
                if (staticDom.selectElement){
                    var form = closestByTagName(staticDom.selectElement, 'FORM');
                    if (form) {
                        eventBuilder.bind(form, 
                            'reset', 
                            () => environment.window.setTimeout( ()=>updateDataAspect.updateData() ) );
                    }
                }
                return {
                    dispose(){
                        eventBuilder.unbind();
                    }
                }
            }
        }
    }
}