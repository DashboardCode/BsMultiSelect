export function HighlightPlugin(aspects){
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

HighlightPlugin.plugStaticDom = (aspects) => {
    if (aspects.configuration.useHighlighting)
        aspects.highlightAspect = HighlightAspect();
}

HighlightPlugin.plugDefaultConfig = (defaults) => {
    defaults.useHighlighting = false;
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