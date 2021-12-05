import { composeSync } from "../ToolsJs";

export function CustomPickStylingsPlugin(defaults){
    defaults.customPickStylings = null;
    return {
        plug
    }
}

export function plug(configuration){
    return (aspects) => {
        return {
            plugStaticDom: ()=> {
                let {disabledComponentAspect, pickDomFactory} = aspects;
                let customPickStylings = configuration.customPickStylings;
                let customPickStylingsAspect = CustomPickStylingsAspect(disabledComponentAspect, customPickStylings);
                ExtendPickDomFactory(pickDomFactory, customPickStylingsAspect);
            }
        }
    }
}

function ExtendPickDomFactory(pickDomFactory, customPickStylingsAspect){
    let origCreatePickDomFactory = pickDomFactory.create;
    pickDomFactory.create = function(pick){
        origCreatePickDomFactory(pick);
        customPickStylingsAspect.customize(pick);
    }
}

function CustomPickStylingsAspect(disabledComponentAspect, customPickStylings){
    return {
        customize(pick){
            if (customPickStylings){
                var handlers = customPickStylings(pick.pickDom, pick.wrap.option);

                if (handlers){
                    function customPickStylingsClosure(custom){
                        return function() {
                            custom({
                                isOptionDisabled: pick.wrap.isOptionDisabled,
                                // wrap.component.getDisabled();
                                // wrap.group.getDisabled();
                                isComponentDisabled: disabledComponentAspect.getDisabled()
                            });
                        }
                    }
                    let pickDomManagerHandlers = pick.pickDomManagerHandlers;
                    // TODO: automate it
                    if (pickDomManagerHandlers.updateDisabled && handlers.updateDisabled)  
                        pickDomManagerHandlers.updateDisabled 
                            = composeSync(pickDomManagerHandlers.updateDisabled, customPickStylingsClosure(handlers.updateDisabled));
                    if (pickDomManagerHandlers.updateComponentDisabled && handlers.updateComponentDisabled)  
                        pickDomManagerHandlers.updateComponentDisabled 
                            = composeSync(pickDomManagerHandlers.updateComponentDisabled, customPickStylingsClosure(handlers.updateComponentDisabled));
                }
            }
        }
    }
}