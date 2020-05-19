import {closestByTagName, findDirectChildByTagName, closestByClassName} from '../ToolsDom';
import {composeSync} from '../ToolsJs';
import {completePicksElement} from '../StaticDomFactory';

export function SelectElementPlugin(pluginData){
    let {staticManager, staticDom, configuration, trigger, componentAspect, dataSourceAspect} = pluginData;
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

        let origDispose = staticManager.dispose;
        if (selectElement){
            staticManager.dispose = () => {
                origDispose();
                selectElement.required = backupedRequired;
                selectElement.style.display = backupDisplay;
            }
        }

        staticManager.appendToContainer = composeSync(staticManager.appendToContainer, staticDom.attachContainerElement)
        staticManager.dispose = composeSync(staticDom.detachContainerElement, staticManager.dispose)                  
    }
}

SelectElementPlugin.staticDomDefaults = (staticDomFactory)=>{
    let { choicesElement, createElement, staticDomGenerator:origStaticDomGenerator} = staticDomFactory;
    staticDomFactory.staticDomGenerator = (element, containerClass) =>
    {
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
                return origStaticDomGenerator(element, containerClass);
            } 
        }
        let ownContainerElement = containerElement?false:true;

        let staticManager = {};
        if (!containerElement) {
            containerElement = createElement('DIV');
            containerElement.classList.add(containerClass);
        
            staticManager = {
                appendToContainer(){ selectElement.parentNode.insertBefore(containerElement, selectElement.nextSibling) },
                dispose(){ selectElement.parentNode.removeChild(containerElement) }
            }
        }

        let staticDom = {initialElement:element, selectElement, containerElement, picksElement};
        
        completePicksElement(staticDom, staticManager, createElement);

        if (!ownContainerElement && selectElement) {
            staticManager.appendToContainer = composeSync(staticManager.appendToContainer,
                () => selectElement.parentNode.insertBefore(choicesElement, selectElement.nextSibling))
        } else {
            staticManager.appendToContainer = composeSync(staticManager.appendToContainer,
                () => containerElement.appendChild(choicesElement))
        }
        staticManager.dispose = composeSync(staticManager.dispose,
            () => choicesElement.parentNode.removeChild(choicesElement));
        return {staticDom, staticManager};
    }
}