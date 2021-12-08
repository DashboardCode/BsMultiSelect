import { composeSync } from "../ToolsJs";

export function CustomChoiceStylingsPlugin(defaults){
    defaults.customChoiceStylings =  null;
    return {
        plug
    }
}

export function plug(configuration){
    return (aspects) => {
        return {
            plugStaticDom: ()=> {
                let {choiceDomFactory} = aspects;
                let customChoiceStylings = configuration.customChoiceStylings;
                if (customChoiceStylings) {

                    let customChoiceStylingsAspect = CustomChoiceStylingsAspect(customChoiceStylings);
                    ExtendChoiceDomFactory(choiceDomFactory, customChoiceStylingsAspect);
                }
            }
        }
    }
}

function ExtendChoiceDomFactory(choiceDomFactory, customChoiceStylingsAspect){
    let origChoiceDomFactoryCreate = choiceDomFactory.create;
    choiceDomFactory.create = function(choice){
        origChoiceDomFactoryCreate(choice);
        customChoiceStylingsAspect.customize(choice.wrap, choice.choiceDom, choice.choiceDomManagerHandlers);
    }
}

function CustomChoiceStylingsAspect(customChoiceStylings){
    return {
        customize(choice){
            var handlers = customChoiceStylings(choice.choiceDom, choice.wrap.option);

            if (handlers){
                function customChoiceStylingsClosure(custom){
                    return function() {
                            custom({
                                isOptionSelected: choice.wrap.isOptionSelected,
                                isOptionDisabled: choice.wrap.isOptionDisabled,
                                isHoverIn: choice.isHoverIn,
                                //isHighlighted: wrap.choice.isHighlighted  // TODO isHighlighted should be developed
                            });
                    }
                }
                let choiceDomManagerHandlers = choice.choiceDomManagerHandlers;
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