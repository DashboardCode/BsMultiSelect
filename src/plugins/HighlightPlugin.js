export function HighlightPlugin(defaults){
    defaults.useHighlighting = false;
    return {
        plug
    }
}

function ExtendChoiceDomFactory(choiceDomFactory, dataWrap){
    var origChoiceDomFactoryCreate = choiceDomFactory.create;
    choiceDomFactory.create = (choice) => {
        origChoiceDomFactoryCreate(choice);
        let choiceElement = choice.choiceDom.choiceElement;
        choice.choiceDomManagerHandlers.updateHighlighted = () => {
            var text = dataWrap.getText(choice.wrap.option);
            var highlighter = aspects.highlightAspect.getHighlighter();
            if (highlighter)
                highlighter(choiceElement, choice.choiceDom, text);                    
            else
            choiceElement.textContent = text;
        };
    }
}

export function plug(configuration){
    return (aspects) => {
        if (configuration.useHighlighting)
            aspects.highlightAspect = HighlightAspect();
        return {
            plugStaticDom(){
                var {choiceDomFactory, dataWrap} = aspects;
                ExtendChoiceDomFactory(choiceDomFactory, dataWrap);
            },
            layout(){
                let {highlightAspect, filterManagerAspect,  produceChoiceAspect} = aspects;
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
                    let origProduceChoice = produceChoiceAspect.produceChoice;
                    produceChoiceAspect.produceChoice = function(wrap){
                        origProduceChoice(wrap);
                        let origSetVisible =  wrap.choice.choiceDomManagerHandlers.setVisible;
                        wrap.choice.choiceDomManagerHandlers.setVisible = function(v){
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