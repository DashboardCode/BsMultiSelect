
import {EventBinder, closestByTagName} from './ToolsDom';

function OptionsAdapterElement(selectElement, getDisabled, getSize, getValidity, onChange) {
    var form = closestByTagName(selectElement, 'form');
    var eventBuilder = EventBinder();
    if(!getValidity)
        getValidity = () => selectElement.classList.contains('is-invalid')?false:(selectElement.classList.contains('is-valid')?true:null);
    return {
        getOptions(){
            return selectElement.getElementsByTagName('OPTION')
        },
        onChange,
        getDisabled,
        getSize,
        getValidity,
        onReset(handler){
            if (form)
                eventBuilder.bind(form, 'reset', handler)
        },
        dispose(){
            if (form)
                eventBuilder.unbind()
        }
    }
}

function OptionsAdapterJson(options, getDisabled, getSize, getValidity, onChange) {
    if (!getValidity){
        getValidity=()=>null
    }
    return {
        getOptions(){
            return options
        },
        onChange,
        getDisabled(){
            return getDisabled?getDisabled():false
        },
        getSize(){
            return getSize?getSize():null
        },
        getValidity,
    }
}

export {OptionsAdapterJson, OptionsAdapterElement}