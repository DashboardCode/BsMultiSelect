export function HighlightPlugin(defaults){
    defaults.useHighlighting = false;
    return {
        plug
    }
}

function ExtendChoiceDomFactory(choiceDomFactory, optionPropertiesAspect){
    var origCreateChoiceDomFactory = choiceDomFactory.create;
    choiceDomFactory.create = (choiceElement, wrap, toggle) => {
        var value = origCreateChoiceDomFactory(choiceElement, wrap, toggle);
        value.choiceDomManagerHandlers.updateHighlighted = () => {
            var text = optionPropertiesAspect.getText(wrap.option);
            var highlighter = aspects.highlightAspect.getHighlighter();
            if (highlighter)
                highlighter(choiceElement, value.choiceDom, text);                    
            else
            choiceElement.textContent = text;
        };
        return value;
    }
}

export function plug(configuration){
    return (aspects) => {
        if (configuration.useHighlighting)
            aspects.highlightAspect = HighlightAspect();
        return {
            plugStaticDom(){
                var {choiceDomFactory, optionPropertiesAspect} = aspects;
                ExtendChoiceDomFactory(choiceDomFactory, optionPropertiesAspect);
            },
            layout(){
                let {highlightAspect, filterManagerAspect,  buildChoiceAspect} = aspects;
                if (highlightAspect){
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

function HighlightAspect(){
    let highlighter = null;
    return {
        getHighlighter(){
            return highlighter;
        },
        set(filter){
            var guarded = filter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            var regex = new RegExp("("+guarded+")","gi");
            highlighter = function(e, choiceDom, text){
                // TODO replace with
                // var pos = text.indexOf(filter);
                e.innerHTML = text.replace(regex,"<u>$1</u>");
                // TODO to method
                // var nodes = e.querySelectorAll('u');
                // var array = Array.prototype.slice.call(nodes);
                // if (choiceDom.highlightedElements)
                //     choiceDom.highlightedElements.concat(array);
                // else
                //     choiceDom.highlightedElements = array;
            }
        },
        reset(){
            highlighter = null;
        }
    }
}