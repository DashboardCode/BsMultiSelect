import {closestByTagName, findDirectChildByTagName, closestByClassName} from '../ToolsDom';
import {composeSync} from '../ToolsJs';

export function SelectElementPlugin(pluginData){
    let {staticContent, staticDom, configuration, trigger, componentAspect, dataSourceAspect} = pluginData;
    
    var backupDisplay = null;
    let selectElement = staticDom.selectElement;
    if (selectElement){ 
        backupDisplay = selectElement.style.display;
        selectElement.style.display = 'none';
    }
    
    var backupedRequired = false;
    if (selectElement){
        backupedRequired = selectElement.required;
        pluginData.selectElementPluginData =  {required: selectElement.required};
        if(selectElement.required===true)
            selectElement.required = false;
    }
    
    let origDispose = staticContent.dispose;
    if (selectElement){
        staticContent.dispose = () => {
            origDispose();
            selectElement.required = backupedRequired;
            selectElement.style.display = backupDisplay;
        }
    }

    let {getDisabled, getIsOptionDisabled} = configuration;
    if (selectElement) {
        if(!getDisabled) {
            var fieldsetElement = closestByTagName(selectElement, 'FIELDSET');
            if (fieldsetElement) {
                componentAspect.getDisabled = () => selectElement.disabled || fieldsetElement.disabled;
            } else {
                componentAspect.getDisabled = () => selectElement.disabled;
            }
        }
        componentAspect.onChange = () => {
            trigger('change')
            trigger('dashboardcode.multiselect:change')
        }
        dataSourceAspect.getOptions = () => selectElement.options;
        if (!getIsOptionDisabled)
            dataSourceAspect.getDisabled = option => option.disabled;

        // if (!setSelected){
        //     setSelected = (option, value) => {option.selected = value};
        //     // NOTE: adding this (setAttribute) break Chrome's html form reset functionality:
        //     // if (value) option.setAttribute('selected','');
        //     // else option.removeAttribute('selected');
        // }

        let {attachContainerElement, detachContainerElement} = staticContent.selectElementContainerTools;
        staticContent.attachContainer = composeSync(attachContainerElement, staticContent.attachContainer)
        staticContent.dispose = composeSync(detachContainerElement, staticContent.dispose)                  

    }

    return {
        dispose(){
            // move staticContent.dispose = composeSync(detachContainerElement, staticContent.dispose)    there
        }
    }
}

export function selectElementStaticDomGenerator(staticDomGenerator, element, containerClass){
    let selectElement = null;
    let containerElement = null;
    let picksElement = null;
    if (element.tagName == 'SELECT') {
        selectElement = element;
        if (containerClass){
            containerElement = closestByClassName(selectElement, containerClass)
            if (containerElement)
                picksElement = findDirectChildByTagName(containerElement, 'UL');
        }
    } else if (element.tagName == 'DIV') {
        selectElement = findDirectChildByTagName(element, 'SELECT');
        if (selectElement) {
            if (containerClass){
                containerElement = closestByClassName(element, containerClass);
                if (containerElement)
                    picksElement = findDirectChildByTagName(containerElement, 'UL');
            }
        } else {
            return staticDomGenerator(element, containerClass);
        } 
    }
    return {initialElement:element, selectElement, containerElement, picksElement};
}

export function selectElementCompletedDomGenerator(staticDom, containerClass, createElement) {
    let attachContainerElement = null;
    let detachContainerElement = null;
    if (!staticDom.containerElement) {
        staticDom.containerElement = createElement('DIV');
        staticDom.containerElement.classList.add(containerClass);
        attachContainerElement = () => staticDom.selectElement.parentNode.insertBefore(staticDom.containerElement, staticDom.selectElement.nextSibling);
        detachContainerElement = () => staticDom.containerElement.parentNode.removeChild(staticDom.containerElement);
    }

    return {
        attachContainerElement,
        detachContainerElement
    }
}

// SelectElementPlugin.staticDomDefaults = (configuration, defaults, settings)=>{
// }