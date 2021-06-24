import { composeSync } from "../ToolsJs";

export function CustomPickStylingsPlugin(aspects){
    let {componentPropertiesAspect,configuration,buildPickAspect} = aspects;
    let customPickStylingsAspect = CustomPickStylingsAspect(componentPropertiesAspect, configuration.customPickStylings);
    let origBuildPick = buildPickAspect.buildPick;
    buildPickAspect.buildPick = function(wrap, removeOnButton){
        let pick = origBuildPick(wrap, removeOnButton);
        customPickStylingsAspect.customize(wrap, pick);
        return pick;
    }
}

CustomPickStylingsPlugin.plugDefaultConfig = (defaults)=>{
    defaults.customPickStylings = null;
}

function CustomPickStylingsAspect(componentPropertiesAspect, customPickStylings){
    
    return {
        customize(wrap, pick){
            let {pickDomManagerHandlers, pickDom} = pick;
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
                            = composeSync(pickDomManagerHandlers.updateDisabled, customPickStylingsClosure(handlers.updateDisabled) );
                    if (pickDomManagerHandlers.updateComponentDisabled && handlers.updateComponentDisabled)  
                        pickDomManagerHandlers.updateComponentDisabled 
                            = composeSync(pickDomManagerHandlers.updateComponentDisabled, customPickStylingsClosure(handlers.updateComponentDisabled) );
                }
            }
        }
    }
}
