import {composeSync} from '../ToolsJs';

export function CreatePopperPlugin(){
    return {
        plug
    }
}

export function plug(){ 
    return (aspects) => {
        return {
            plugStaticDom(){
                    let {environment} = aspects;
                    var popperRtlAspect = PopperRtlAspect();
                    aspects.popperRtlAspect = popperRtlAspect;

                    let {createPopper, Popper, globalPopper} = environment;
                    let createModifiersVX = null;
                    let createPopperVX = null;
                    if (Popper) { // V2
                        createPopperVX = createPopper =  (function(createPopperConstructor) {
                            return function(anchorElement, element, popperConfiguration) {
                                return new createPopperConstructor(anchorElement, element, popperConfiguration);
                            }
                        })(Popper);;
                        createModifiersVX = CreateModifiersV1;
                    } else if (createPopper) {
                        createPopperVX = createPopper;
                        createModifiersVX = CreateModifiersV2;
                    } else if (globalPopper) {
                        if (globalPopper.createPopper) {
                            createPopperVX = globalPopper.createPopper;
                            createModifiersVX = CreateModifiersV2;
                        } else {
                            createPopperVX = createPopper =  (function(createPopperConstructor) {
                                return function(anchorElement, element, popperConfiguration) {
                                    return new createPopperConstructor(anchorElement, element, popperConfiguration);
                                }
                            })(globalPopper);
                            createModifiersVX = CreateModifiersV1;
                        }
                    } else {
                        throw new Error("BsMultiSelect: Popper component (https://popper.js.org) is required");
                    }
                    var createPopperConfigurationAspect = CreatePopperConfigurationAspect(createModifiersVX);
                    aspects.createPopperAspect = CreatePopperAspect(createPopperVX, popperRtlAspect, createPopperConfigurationAspect); 
                },
                attach(){
                    let {createPopperAspect, filterDom, choicesDom, disposeAspect, staticManager, choicesVisibilityAspect, specialPicksEventsAspect} = aspects;
                    CreatePopper_ConstrunctorAspect(createPopperAspect, filterDom, choicesDom, disposeAspect, staticManager, choicesVisibilityAspect, specialPicksEventsAspect);
            }
        }
    }
}

function CreatePopper_ConstrunctorAspect(createPopperAspect, filterDom, choicesDom, disposeAspect, staticManager, choicesVisibilityAspect, specialPicksEventsAspect){
    let filterInputElement = filterDom.filterInputElement;
    let choicesElement     = choicesDom.choicesElement;

    let pop = createPopperAspect.createPopper(choicesElement, filterInputElement, true);

    staticManager.appendToContainer = composeSync(staticManager.appendToContainer, pop.init);

    var origBackSpace = specialPicksEventsAspect.backSpace;
    specialPicksEventsAspect.backSpace = (pick) => {origBackSpace(pick);  pop.update();};

    disposeAspect.dispose = composeSync(disposeAspect.dispose, pop.dispose);

    choicesVisibilityAspect.updatePopupLocation = composeSync(
        choicesVisibilityAspect.updatePopupLocation, 
        function(){pop.update();}
    );
}

function PopperRtlAspect(){
    return {
        getIsRtl(){
            return false;
        }
    }
}

// CreatePopperPlugin.attach = (aspects)=> {
//     let {createPopperAspect, filterDom, choicesDom, disposeAspect, staticManager, choicesVisibilityAspect, specialPicksEventsAspect} = aspects;
//     CreatePopper_ConstrunctorAspect(createPopperAspect, filterDom, choicesDom, disposeAspect, staticManager, choicesVisibilityAspect, specialPicksEventsAspect);
// }

// CreatePopperPlugin.plugStaticDom = (aspects) => {
//     let {environment} = aspects;
//     var popperRtlAspect = PopperRtlAspect();
//     aspects.popperRtlAspect = popperRtlAspect;

//     let {createPopper, Popper, globalPopper} = environment;
//     let createModifiersVX = null;
//     let createPopperVX = null;
//     if (Popper) { // V2
//         createPopperVX = createPopper =  (function(createPopperConstructor) {
//             return function(anchorElement, element, popperConfiguration) {
//                 return new createPopperConstructor(anchorElement, element, popperConfiguration);
//             }
//         })(Popper);;
//         createModifiersVX = CreateModifiersV1;
//     } else if (createPopper) {
//         createPopperVX = createPopper;
//         createModifiersVX = CreateModifiersV2;
//     } else if (globalPopper) {
//         if (globalPopper.createPopper) {
//             createPopperVX = globalPopper.createPopper;
//             createModifiersVX = CreateModifiersV2;
//         } else {
//             createPopperVX = createPopper =  (function(createPopperConstructor) {
//                 return function(anchorElement, element, popperConfiguration) {
//                     return new createPopperConstructor(anchorElement, element, popperConfiguration);
//                 }
//             })(globalPopper);
//             createModifiersVX = CreateModifiersV1;
//         }
//     } else {
//         throw new Error("BsMultiSelect: Popper component (https://popper.js.org) is required");
//     }
//     var createPopperConfigurationAspect = CreatePopperConfigurationAspect(createModifiersVX);
//     aspects.createPopperAspect = CreatePopperAspect(createPopperVX, popperRtlAspect, createPopperConfigurationAspect);
// }

function CreateModifiersV1(preventOverflow){
    return {
        preventOverflow: {enabled:preventOverflow},
        hide: {enabled:false},
        flip: {enabled:false}
    };
}

function CreateModifiersV2(preventOverflow){
    var modifiers = [{
            name: 'flip',
            options: {
                fallbackPlacements: ['bottom'],
            },
        }
    ];
    if (preventOverflow) {
        modifiers.push({name: 'preventOverflow'});
    }
    return modifiers;
}

function CreatePopperAspect(createPopperVX, popperRtlAspect, createPopperConfigurationAspect){
    return {
        createPopper(element, anchorElement, preventOverflow){
            let popper = null;
            return {
                init(){
                    var isRtl = popperRtlAspect.getIsRtl();
                    var popperConfiguration = createPopperConfigurationAspect.createConfiguration(preventOverflow, isRtl);
                    popper = createPopperVX(anchorElement, element, popperConfiguration); 

                },
                update(){ 
                    popper.update(); // become async in popper 2; use forceUpdate if sync is needed? 
                },
                dispose(){
                    popper.destroy();
                }
            }
        }
    }   
}

function CreatePopperConfigurationAspect(createModifiersVX){
    return {
        createConfiguration(preventOverflow, isRtl){
            let modifiers = createModifiersVX(preventOverflow);
            
            let popperConfiguration = {
                placement: 'bottom-start',
                modifiers: modifiers
            };

            if (isRtl){
                popperConfiguration.placement = 'bottom-end';
            }
            return popperConfiguration;
        }
    }   
}