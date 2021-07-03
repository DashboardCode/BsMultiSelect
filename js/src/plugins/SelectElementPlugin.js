import {closestByTagName, findDirectChildByTagName, closestByClassName} from '../ToolsDom';
import {composeSync} from '../ToolsJs';

export function SelectElementPlugin(aspects){
    var {/*optionsLoopAspect,*/ loadAspect, environment} = aspects;
    // var origOptionsLoopAspectLoop  = optionsLoopAspect.loop;
    // var document = environment.window.document;

    // optionsLoopAspect.loop = function(){
    //     // browsers can change select value as part of "autocomplete" (IE11) 
    //     // or "show preserved on go back" (Chrome) after page is loaded but before "ready" event;
    //     // but they never "restore" selected-disabled options.
    //     // TODO: make the FROM Validation for 'selected-disabled' easy.
    //     if (document.readyState != 'loading'){
    //         origOptionsLoopAspectLoop();
    //     }else{
    //         var domContentLoadedHandler = function(){
    //             origOptionsLoopAspectLoop();
    //             document.removeEventListener("DOMContentLoaded", domContentLoadedHandler);
    //         }
    //         document.addEventListener('DOMContentLoaded', domContentLoadedHandler); // IE9+
    //     }
    // }

    var origLoadAspectLoop  = loadAspect.loop;
    var document = environment.window.document;

    loadAspect.loop = function(){
        // browsers can change select value as part of "autocomplete" (IE11) 
        // or "show preserved on go back" (Chrome) after page is loaded but before "ready" event;
        // but they never "restore" selected-disabled options.
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

SelectElementPlugin.plugStaticDom = (aspects)=>{
    let {configuration, staticDomFactory, createElementAspect,
        componentPropertiesAspect, onChangeAspect, triggerAspect, optionsAspect, optGroupAspect, disposeAspect} = aspects;
    let origStaticDomFactoryCreate = staticDomFactory.create;
    staticDomFactory.create = (css) => {
        let {choicesDom, createStaticDom: origCreateStaticDom} = origStaticDomFactoryCreate(css);
        let {choicesElement} = choicesDom;
        return { 
            choicesDom,
            createStaticDom(element, containerClass){
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
            
                let disposablePicksElement = false;
                if (!picksElement) {
                    picksElement = createElementAspect.createElement('UL');
                    disposablePicksElement = true; 
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
                        optGroupAspect.getOptGroupText = (optGroup) => optGroup.label;
                        optGroupAspect.getOptGroupId = (optGroup) => optGroup.id;
                    }

                    // if (!setSelected){
                    //     setSelected = (option, value) => {option.selected = value};
                    //     // NOTE: adding this (setAttribute) break Chrome's html form reset functionality:
                    //     // if (value) option.setAttribute('selected','');
                    //     // else option.removeAttribute('selected');
                    // }
                    
                    disposeAspect.dispose = composeSync(disposeAspect.dispose, () => {
                        selectElement.required = backupedRequired;
                        selectElement.style.display = backupDisplay;
                    });
                }

                return {
                    staticDom:{
                            initialElement:element,
                            containerElement,
                            picksElement,
                            disposablePicksElement,
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
                    }
                };
            }
        }
    }
}