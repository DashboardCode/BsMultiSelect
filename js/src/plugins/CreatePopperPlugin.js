export function CreatePopperPlugin(pluginData){
    let {environment} = pluginData;
    let {createPopper, Popper} = environment;

    if (typeof createPopper === 'undefined') {
        createPopper = Popper;
        if (typeof createPopper === 'undefined') {
            throw new Error("BsMultiSelect: Popper component (https://popper.js.org) is required")
        }
    } else {
        if (createPopper.createPopper) {
            createPopper = createPopper.createPopper;
        }
    }

    pluginData.createPopperAspect = {
        create(element, anchorElement, preventOverflow){
            let popperConfiguration = {
                placement: 'bottom-start',
                modifiers: {
                    preventOverflow: {enabled:preventOverflow},
                    hide: {enabled:false},
                    flip: {enabled:false}
                }
            };
            let popper = null;
            return {
                init(){
                    if (!!createPopper.prototype && !!createPopper.prototype.constructor) { // it is a constructor
                        popper = new createPopper(anchorElement, element, popperConfiguration); 
                    }else{
                        popper = createPopper(anchorElement, element, popperConfiguration); 
                    }
                },
                update(){ 
                    popper.update(); // become async in poppoer 2; use forceUpdate if sync is needed? 
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
    };
}

