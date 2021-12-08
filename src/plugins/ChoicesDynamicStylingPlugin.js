// aka auto height and scrolling
export function ChoicesDynamicStylingPlugin(defaults, environment){
    preset(defaults)
    return {
        plug
    }
}

export function preset(o){
    o.useChoicesDynamicStyling = false;
    o.choicesDynamicStyling = (aspects)=>choicesDynamicStyling(aspects, window);
    o.minimalChoicesDynamicStylingMaxHeight = 20;
}

export function plug(configuration){ 
    let {choicesDynamicStyling, useChoicesDynamicStyling} = configuration;
    return (aspects) => {
        return {
            layout: () => {
                
                if (useChoicesDynamicStyling) {
                    let {choicesVisibilityAspect, specialPicksEventsAspect} = aspects;
                    var origSetChoicesVisible = choicesVisibilityAspect.setChoicesVisible;
                    choicesVisibilityAspect.setChoicesVisible = 
                        function(visible){
                            if (visible)
                                choicesDynamicStyling(aspects);
                            origSetChoicesVisible(visible);
                        };
                    var origBackSpace = specialPicksEventsAspect.backSpace;
                    specialPicksEventsAspect.backSpace = (pick) => {origBackSpace(pick);  choicesDynamicStyling(aspects);};
                }
            }
        }
    }
}

function choicesDynamicStyling(aspects, window){
    let {choicesDom, navigateAspect, configuration} = aspects;
    let choicesElement = choicesDom.choicesElement;
    let minimalChoicesDynamicStylingMaxHeight = configuration.minimalChoicesDynamicStylingMaxHeight;

    //find height of the browser window
    var g = window.document.getElementsByTagName('body')[0],
        e = window.document.documentElement,
        y = window.innerHeight || e.clientHeight  || g.clientHeight;
  
    //find position of choicesElement, if it's at the bottom of the page make the choicesElement shorter
    var pos = choicesElement.parentNode.getBoundingClientRect();
    var new_y = y - pos.top;
  
    //calculate multi select max-height
    var msHeight = Math.max(minimalChoicesDynamicStylingMaxHeight, Math.round((new_y * 0.85))); // Michalek: 0.85 is empiric value, without it list was longer than footer height ; TODO: propose better way
  
    //add css height value
    choicesElement.style.setProperty("max-height", msHeight+"px");
    choicesElement.style.setProperty("overflow-y", "auto");

    if (!choicesDom.ChoicesDynamicStylingPlugin_scrollHandle){
        choicesDom.ChoicesDynamicStylingPlugin_scrollHandle = true;
        var origNavigateAspectNavigate = navigateAspect.navigate;
        navigateAspect.navigate = function(down){
            var wrap = origNavigateAspectNavigate(down);
            if (wrap!= null && wrap.choice!=null && wrap.choice.choiceDom.choiceElement!=null)
            wrap.choice.choiceDom.choiceElement.scrollIntoView(false); // alignTo false -  scroll to the top bottom of dropdown first
            // TODO: BUG if mouse left on the dropdow scroll to bottom and one after doesn't work properly
            return wrap;
        }
    }
}
