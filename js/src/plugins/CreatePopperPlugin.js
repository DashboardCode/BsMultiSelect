export function CreatePopperPlugin(aspects){
    let {environment} = aspects;
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
    
    aspects.createPopperAspect = CreatePopperAspect(createPopperVX, createModifiersVX);
}

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

function CreatePopperAspect(createPopperVX, createModifiersVX){
    return {
        createPopper(element, anchorElement, preventOverflow){
            
            let modifiers = createModifiersVX(preventOverflow);
            
            let popperConfiguration = {
                placement: 'bottom-start',
                modifiers: modifiers
            };
            let popper = null;
            return {
                init(){
                    popper = createPopperVX(anchorElement, element, popperConfiguration); 
                },
                update(){ 
                    popper.update(); // become async in popper 2; use forceUpdate if sync is needed? 
                },
                setRtl(isRtl){
                    if (isRtl) {
                        popperConfiguration.placement = 'bottom-end';
                    }
                },
                dispose(){
                    popper.destroy();
                }
            }
        }
    }   
}