
import {EventBinder, closestByTagName} from './ToolsDom';

function OptionsAdapterElement(selectElement, getDisabled, getSize, getIsValid, getIsInvalid, trigger) {
    var form = closestByTagName(selectElement, 'form');
    var eventBuilder = EventBinder();
    return {
        getOptions(){
            return selectElement.getElementsByTagName('OPTION')
        },
        triggerChange(){
            trigger('change')
            trigger('multiselect:change')
        },
        getDisabled,
        getSize,
        getIsValid,
        getIsInvalid,
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

function OptionsAdapterJson(options, getDisabled, getSize, getIsValid, getIsInvalid, trigger) {
    return {
        getOptions(){
            return options
        },
        triggerChange(){
            trigger('multiselect:change')
        },
        getDisabled(){
            return getDisabled?getDisabled():false
        },
        getSize(){
            return getSize?getSize():null
        },
        getIsValid(){
            return getIsValid?getIsValid():false
        },
        getIsInvalid(){
            return getIsInvalid?getIsInvalid():false
        }
    }
}

export {OptionsAdapterJson, OptionsAdapterElement}