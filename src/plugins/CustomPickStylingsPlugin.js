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
                let {componentPropertiesAspect, pickDomFactory} = aspects;
                let customPickStylings = configuration.customPickStylings;
                let customPickStylingsAspect = CustomPickStylingsAspect(componentPropertiesAspect, customPickStylings);
                ExtendPickDomFactory(pickDomFactory, customPickStylingsAspect);
            }
        }
    }
}

function ExtendPickDomFactory(pickDomFactory, customPickStylingsAspect){
    
    let origPickDomFactoryCreate = pickDomFactory.create;
    pickDomFactory.create = function(pickElement, wrap, removeOnButton){
        var o = origPickDomFactoryCreate(pickElement, wrap, removeOnButton);
        customPickStylingsAspect.customize(wrap, o.pickDom, o.pickDomManagerHandlers);
        return o;
    }
}

function CustomPickStylingsAspect(componentPropertiesAspect, customPickStylings){
    return {
        customize(wrap, pickDom, pickDomManagerHandlers){
            if (customPickStylings){
                var handlers = customPickStylings(pickDom, wrap.option);

                if (handlers){
                    function customPickStylingsClosure(custom){
                        return function() {
                            custom({
                                isOptionDisabled: wrap.isOptionDisabled,
                                isComponentDisabled: componentPropertiesAspect.getDisabled()
                            });
                        }
                    }
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