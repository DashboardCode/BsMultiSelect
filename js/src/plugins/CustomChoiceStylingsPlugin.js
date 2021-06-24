import { composeSync } from "../ToolsJs";

export function CustomChoiceStylingsPlugin(apsects){
    let {configuration, choiceDomFactory} = apsects;
    let customChoiceStylingsAspect = CustomChoiceStylingsAspect(configuration.customChoiceStylings);
    let origChoiceDomFactoryCreate = choiceDomFactory.create;
    choiceDomFactory.create = function(choiceElement, wrap, toggle){
        var o = origChoiceDomFactoryCreate(choiceElement, wrap, toggle);
        customChoiceStylingsAspect.customize(wrap, o.choiceDom, o.choiceDomManagerHandlers);
        return o;
    }
}

CustomChoiceStylingsPlugin.plugDefaultConfig = (defaults)=>{
    defaults.customChoiceStylings =  null;
}

export function CustomChoiceStylingsAspect(customChoiceStylings){
    
    return {
        customize(wrap, choiceDom, choiceDomManagerHandlers){
            if (customChoiceStylings){
                var handlers = customChoiceStylings(choiceDom, wrap.option);

                if (handlers){
                    function customChoiceStylingsClosure(custom){
                        return function() {
                                custom({
                                    isOptionSelected: wrap.isOptionSelected,
                                    isOptionDisabled: wrap.isOptionDisabled,
                                    isHoverIn: wrap.choice.isHoverIn,
                                    //isHighlighted: wrap.choice.isHighlighted  // TODO isHighlighted should be developed
                                });
                        }
                    }
                    if (choiceDomManagerHandlers.updateHoverIn && handlers.updateHoverIn)  
                        choiceDomManagerHandlers.updateHoverIn 
                            = composeSync(choiceDomManagerHandlers.updateHoverIn, customChoiceStylingsClosure(handlers.updateHoverIn) );
                    if (choiceDomManagerHandlers.updateSelected && handlers.updateSelected)  
                        choiceDomManagerHandlers.updateSelected 
                            = composeSync(choiceDomManagerHandlers.updateSelected, customChoiceStylingsClosure(handlers.updateSelected));
                    if (choiceDomManagerHandlers.updateDisabled && handlers.updateDisabled)  
                        choiceDomManagerHandlers.updateDisabled
                            = composeSync(choiceDomManagerHandlers.updateDisabled, customChoiceStylingsClosure(handlers.updateDisabled));
                    if (choiceDomManagerHandlers.updateHighlighted && handlers.updateHighlighted)  
                        choiceDomManagerHandlers.updateHighlighted
                            = composeSync(choiceDomManagerHandlers.updateHighlighted, customChoiceStylingsClosure(handlers.updateHighlighted));
                }
            }
        }
    }
}