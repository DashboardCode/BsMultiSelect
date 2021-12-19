import {closestByTagName, findDirectChildByTagName, closestByClassName} from '../ToolsDom';
import {composeSync} from '../ToolsJs';

export function SelectElementPlugin(){
    return {plug}
}

export function plug(configuration){
    return (aspects) => {
        return {
            data: (initialElement, staticDom, dataWrap, containerClass) => {
                let selectElement = null;
                staticDom.containerElement = null;
                
                if (initialElement.tagName == 'SELECT') {
                    selectElement = initialElement;
                    if (containerClass) {
                        staticDom.containerElement = closestByClassName(selectElement, containerClass)
                    }
                } else if (initialElement.tagName == 'DIV') {
                    selectElement = findDirectChildByTagName(initialElement, 'SELECT');
                    if (selectElement) {
                        if (containerClass) {
                            staticDom.containerElement = closestByClassName(initialElement, containerClass);
                        }
                    } else {
                        return origCreateStaticDom(initialElement, containerClass);
                    } 
                }
                if (selectElement){
                    staticDom.selectElement=selectElement;
                    dataWrap.getOptions = () => selectElement.options;
                }
            },
            dom: ()=> {
                let {
                    staticDomFactory, 
                    onChangeAspect, dataWrap,  disposeAspect, 
                    staticDom,
                    showErrorAspect, 
                    getValueRequiredAspect, createFilterInputElementIdAspect, optGroupAspect, disabledComponentAspect /* those four are plugins */
                } = aspects;

                let {createElementAspect, initialElement} = staticDom;
                let containerClass = configuration.containerClass;
                let origCreateStaticDom = staticDomFactory.createStaticDom;
                
                staticDomFactory.createStaticDom = () => {
                    let selectElement = null;
                    let containerElement = null;
                    
                    if (initialElement.tagName == 'SELECT') {
                        selectElement = initialElement;
                        if (containerClass) {
                            containerElement = closestByClassName(selectElement, containerClass)
                        }
                    } else if (initialElement.tagName == 'DIV') {
                        selectElement = findDirectChildByTagName(initialElement, 'SELECT');
                        if (selectElement) {
                            if (containerClass) {
                                containerElement = closestByClassName(initialElement, containerClass);
                            }
                        } else {
                            return origCreateStaticDom(initialElement, containerClass);
                        } 
                    }

                    let picksElement = null;
                    if (containerElement)
                        picksElement = findDirectChildByTagName(containerElement, 'UL');                    
                    
                    let isDisposableContainerElementFlag = false;
                    if (!containerElement) {
                        containerElement = createElementAspect.createElement('DIV');
                        containerElement.classList.add(containerClass);
                        isDisposableContainerElementFlag= true;
                    }
                    
                    if (selectElement){
                        
                        showErrorAspect.showError = (error)=>{
                            let errorElement = createElementAspect.createElement('SPAN'); 
                            errorElement.style.backgroundColor = 'red';
                            errorElement.style.color = 'white';
                            errorElement.style.padding = '0.2rem 0.5rem';
                            errorElement.textContent = 'BsMultiSelect ' + error.toString();
                            selectElement.parentNode.insertBefore(errorElement, selectElement.nextSibling)
                        }

                        var backupDisplay = selectElement.style.display;
                        selectElement.style.display = 'none';
                        var backupedRequired = selectElement.required;
                    
                        if (getValueRequiredAspect){
                            getValueRequiredAspect.getValueRequired = function(){
                                return backupedRequired;
                            }
                        }
                    
                        if(selectElement.required===true)
                            selectElement.required = false;
                    
                        // TODO: move to DisableCompenentPlugin
                        //let {getDisabled} = configuration;
                    
                        if (disabledComponentAspect){
                            var fieldsetElement = closestByTagName(selectElement, 'FIELDSET');
                            var origGetDisabled = disabledComponentAspect.getDisabled;
                            if (fieldsetElement)
                                disabledComponentAspect.getDisabled = () => {
                                    var value = origGetDisabled();
                                    if (value===null)
                                        value = selectElement.disabled || fieldsetElement.disabled;
                                    return value;
                                } 
                            else
                                disabledComponentAspect.getDisabled = () => {
                                    var value = origGetDisabled();
                                    if (value===null)
                                        value = selectElement.disabled;
                                    return value;
                                }
                        }

                        onChangeAspect.onChange = composeSync(() => staticDom.trigger('change'), onChangeAspect.onChange) 
                        dataWrap.getOptions = () => selectElement.options;

                        if (optGroupAspect){
                            optGroupAspect.getOptionOptGroup = (option) => option.parentNode;
                            optGroupAspect.getOptGroupText   = (optGroup) => optGroup.label;
                            optGroupAspect.getOptGroupId = (optGroup) => optGroup.id;
                        }
                    
                        if (selectElement && createFilterInputElementIdAspect){
                            var origCreateFilterInputElementId = createFilterInputElementIdAspect.createFilterInputElementId;
                            
                            createFilterInputElementIdAspect.createFilterInputElementId = () =>
                            { 
                                let id = origCreateFilterInputElementId();
                                if (!id) {
                                    id =`${containerClass}-generated-input-${((selectElement.id)?selectElement.id:selectElement.name).toLowerCase()}-id`;
                                }
                                return id;
                            }
                        }
                    
                        disposeAspect.dispose = composeSync(disposeAspect.dispose, () => {
                             selectElement.required = backupedRequired;
                             selectElement.style.display = backupDisplay;
                        });
                    }

                    let isDisposablePicksElementFlag = false;
                    if (!picksElement) {
                        picksElement = createElementAspect.createElement('UL');
                        isDisposablePicksElementFlag = true; 
                    }

                    staticDom.containerElement = containerElement;
                    staticDom.isDisposablePicksElementFlag = isDisposablePicksElementFlag;
                    staticDom.picksElement = picksElement;
                    staticDom.selectElement = selectElement;

                    return {
                        staticManager:{
                            appendToContainer(){ 
                                let {choicesDom, filterDom, picksDom, isDisposablePicksElementFlag} = staticDom;
                                picksDom.pickFilterElement.appendChild(filterDom.filterInputElement);
                                picksDom.picksElement.appendChild(picksDom.pickFilterElement); 
                                if (isDisposableContainerElementFlag){
                                    selectElement.parentNode.insertBefore(containerElement, selectElement.nextSibling) 
                                    containerElement.appendChild(choicesDom.choicesElement)
                                } else {
                                    selectElement.parentNode.insertBefore(choicesDom.choicesElement, selectElement.nextSibling)
                                }
                                if (isDisposablePicksElementFlag)
                                    containerElement.appendChild(picksDom.picksElement)
                            },
                            dispose(){ 
                                let {choicesDom, filterDom, picksDom, isDisposablePicksElementFlag} = staticDom;
                                choicesDom.choicesElement.parentNode.removeChild(choicesDom.choicesElement);
                                if (isDisposableContainerElementFlag)
                                    selectElement.parentNode.removeChild(containerElement) 
                                if (isDisposablePicksElementFlag)
                                    containerElement.removeChild(picksDom.picksElement)
                                picksDom.dispose();
                                filterDom.dispose();                                        
                            }
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
                    // NOTE: they never "restore" selected-disabled options.
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