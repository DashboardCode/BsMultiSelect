export function HighlightPlugin(defaults){
    defaults.useHighlighting = false;
    return {
        buildAspects: (aspects, configuration) => {
            return {
	            plugStaticDom: ()=> {
                    if (configuration.useHighlighting)
                        aspects.highlightAspect = HighlightAspect();
        	    },
                plugStaticDomFactories: ()=> {
                    var {choiceDomFactory, optionPropertiesAspect} = aspects;

                    var origCreateChoiceDomFactory = choiceDomFactory.create;
                    choiceDomFactory.create = (choiceElement, wrap, toggle) => {
                        var value = origCreateChoiceDomFactory(choiceElement, wrap, toggle);
                        value.choiceDomManagerHandlers.updateHighlighted = ()=>{
                            var text = optionPropertiesAspect.getText(wrap.option);
                            var highlighter = aspects.highlightAspect.getHighlighter();
                            if (highlighter)
                                highlighter(choiceElement, value.choiceDom, text);                    
                            else
                            choiceElement.textContent = text;
                        };
                        return value;
                    }                    
        	    },
                layout: () => {
                    let {highlightAspect, filterManagerAspect,  buildChoiceAspect} = aspects;
                    if (highlightAspect) {
                          let origProcessEmptyInput = filterManagerAspect.processEmptyInput;
                          filterManagerAspect.processEmptyInput = function(){
                            highlightAspect.reset();
                            origProcessEmptyInput(); 
                          }
                          let origSetFilter = filterManagerAspect.setFilter;
                          filterManagerAspect.setFilter = function(text){
                            highlightAspect.set(text);
                            origSetFilter(text);
                          }
                          let origBuildChoice = buildChoiceAspect.buildChoice;
                          buildChoiceAspect.buildChoice = function(wrap){
                              origBuildChoice(wrap);
                              let origSetVisible =  wrap.choice.setVisible;
                              wrap.choice.setVisible = function(v){
                                origSetVisible(v);
                                wrap.choice.choiceDomManagerHandlers.updateHighlighted();
                              }
                          }
                      }
                }
            }
        }
    }
}