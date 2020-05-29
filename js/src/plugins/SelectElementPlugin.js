import {closestByTagName, findDirectChildByTagName, closestByClassName} from '../ToolsDom';
import {composeSync} from '../ToolsJs';

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
        let disposableContainerElement = false;
        if (!containerElement) {
            containerElement = createElement('DIV');
            containerElement.classList.add(containerClass);
            disposableContainerElement= true;
        }

       
        let disposablePicksElement = false;
        if (!picksElement) {
            picksElement = createElement('UL');
            disposablePicksElement = true; 
        }

        return {staticDom: {
            initialElement:element,
            containerElement,
            picksElement,
            disposablePicksElement,
            selectElement
        }, staticManager :{
            appendToContainer(){ 
                if (disposableContainerElement){
                    selectElement.parentNode.insertBefore(containerElement, selectElement.nextSibling) 
                    containerElement.appendChild(choicesElement)
                } else {
                    selectElement.parentNode.insertBefore(choicesElement, selectElement.nextSibling)
                }
                if (disposablePicksElement)
                    containerElement.appendChild(picksElement)
            },
            dispose(){ 
                choicesElement.parentNode.removeChild(choicesElement);
                if (disposableContainerElement)
                    selectElement.parentNode.removeChild(containerElement) 
                if (disposablePicksElement)
                    containerElement.removeChild(picksElement)
            }
        }};
    }
}