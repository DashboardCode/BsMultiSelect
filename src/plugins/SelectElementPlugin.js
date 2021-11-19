import {closestByTagName, findDirectChildByTagName, closestByClassName} from '../ToolsDom';
import {composeSync} from '../ToolsJs';

export function SelectElementPlugin(){
    return {
        buildAspects: (aspects) => {
            return {
                plugStaticDom: ()=> {
                        let {configuration, staticDomFactory, createElementAspect,
                            componentPropertiesAspect, onChangeAspect, triggerAspect, optionsAspect, optGroupAspect, disposeAspect} = aspects;
                            
                        let origStaticDomFactoryCreate = staticDomFactory.create;
                        staticDomFactory.create = (choicesDomFactory, filterDomFactory, picksDomFactory) => {
                            let {createStaticDom: origCreateStaticDom} = origStaticDomFactoryCreate(choicesDomFactory, filterDomFactory, picksDomFactory);
                            return { 
                                createStaticDom(element, containerClass){
                                    console.log("createStaticDom");
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
                                            return origCreateStaticDom(element, containerClass);
                                        } 
                                    }
                    
                                    let disposableContainerElement = false;
                                    if (!containerElement) {
                                        containerElement = createElementAspect.createElement('DIV');
                                        containerElement.classList.add(containerClass);
                                        disposableContainerElement= true;
                                    }
                                
                                    let isDisposablePicksElement = false;
                                    if (!picksElement) {
                                        picksElement = createElementAspect.createElement('UL');
                                        isDisposablePicksElement = true; 
                                    }
                                
                                    if (selectElement){
                                        var backupDisplay = selectElement.style.display;
                                        selectElement.style.display = 'none';
                                        var backupedRequired = selectElement.required;
                    
                                        configuration.getValueRequired = function(){
                                            return backupedRequired;
                                        }
                    
                                        if(selectElement.required===true)
                                            selectElement.required = false;
                    
                                        let {getDisabled} = configuration;
                    
                                        if(!getDisabled) {
                                            var fieldsetElement = closestByTagName(selectElement, 'FIELDSET');
                                            if (fieldsetElement) {
                                                componentPropertiesAspect.getDisabled = () => selectElement.disabled || fieldsetElement.disabled;
                                            } else {
                                                componentPropertiesAspect.getDisabled = () => selectElement.disabled;
                                            }
                                        }
                                        onChangeAspect.onChange = composeSync(() => triggerAspect.trigger('change'), onChangeAspect.onChange) 
                                        optionsAspect.getOptions = () => selectElement.options;
                                        
                                        if (optGroupAspect){
                                            optGroupAspect.getOptionOptGroup = (option) => option.parentNode;
                                            optGroupAspect.getOptGroupText   = (optGroup) => optGroup.label;
                                            optGroupAspect.getOptGroupId = (optGroup) => optGroup.id;
                                        }
                    
                                        if (aspects.labelNewIdAspect){
                                            console.log("new aspects.labelNewIdAspect");
                                            aspects.labelNewIdAspect.createInputId = () => `${containerClass}-generated-input-${((selectElement.id)?selectElement.id:selectElement.name).toLowerCase()}-id`;
                                        } else {
                                            console.log("no new aspects.labelNewIdAspect");
                                        }
                    
                                        disposeAspect.dispose = composeSync(disposeAspect.dispose, () => {
                                             selectElement.required = backupedRequired;
                                             selectElement.style.display = backupDisplay;
                                        });
                                    }
                                    let choicesDom = choicesDomFactory.create();
                                    let filterDom = filterDomFactory.create(isDisposablePicksElement);
                                    let picksDom  = picksDomFactory.create(picksElement, isDisposablePicksElement);
                    
                                    let {choicesElement} = choicesDom; 
                                    
                                    return {
                                        choicesDom,
                                        filterDom,
                                        picksDom,
                    
                                        staticDom:{
                                                initialElement:element,
                                                containerElement,
                                                picksElement,
                                                isDisposablePicksElement,
                                                selectElement
                                        }, 
                    
                                        staticManager:{
                                            appendToContainer(){ 
                                                if (disposableContainerElement){
                                                    selectElement.parentNode.insertBefore(containerElement, selectElement.nextSibling) 
                                                    containerElement.appendChild(choicesElement)
                                                }else {
                                                    selectElement.parentNode.insertBefore(choicesElement, selectElement.nextSibling)
                                                }
                                                if (isDisposablePicksElement)
                                                    containerElement.appendChild(picksElement)
                                            },
                                            dispose(){ 
                                                choicesElement.parentNode.removeChild(choicesElement);
                                                if (disposableContainerElement)
                                                    selectElement.parentNode.removeChild(containerElement) 
                                                if (isDisposablePicksElement)
                                                    containerElement.removeChild(picksElement)
                                            }
                                        }
                                    };
                                }
                            }
                        }
                    
                },
                layout: ()=>{
                    var {loadAspect, environment} = aspects;
                    var document = environment.window.document;

                    var origLoadAspectLoop  = loadAspect.loop;
                    loadAspect.loop = function(){
                        // browsers can change select value as part of "autocomplete" (IE11) at load time
                        // or "show preserved on go back" (Chrome) after page is loaded but before "ready" event;
                        // mote: they never "restore" selected-disabled options.
                        // TODO: make the FROM Validation for 'selected-disabled' easy.
                        if (document.readyState != 'loading'){
                            origLoadAspectLoop();
                        }else{
                            var domContentLoadedHandler = function(){
                                origLoadAspectLoop();
                                document.removeEventListener("DOMContentLoaded", domContentLoadedHandler);
                            }
                            document.addEventListener('DOMContentLoaded', domContentLoadedHandler); // IE9+
                        }
                    }
                }
            }
        }
    }
}