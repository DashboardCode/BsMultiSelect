export function ChoicesDynamicStylingPlugin(aspects){
    let {configuration} = aspects;
    if (configuration.useChoicesDynamicStyling) {
        let {choicesVisibilityAspect, specialPicksEventsAspect} = aspects;
        var origSetChoicesVisible = choicesVisibilityAspect.setChoicesVisible;
        aspects.choicesVisibilityAspect.setChoicesVisible = 
            function(visible){
                if (visible)
                    choicesDynamicStyling(aspects);
                origSetChoicesVisible(visible);
            };
        var origBackSpace = specialPicksEventsAspect.backSpace;
        specialPicksEventsAspect.backSpace = (pick) => { origBackSpace(pick);  choicesDynamicStyling(aspects);};
    }
}

function choicesDynamicStyling(aspects){
    let {configuration, environment, choicesDom} = aspects;
    let window = environment.window;
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
}

ChoicesDynamicStylingPlugin.plugDefaultConfig = (defaults)=>{
    defaults.useChoicesDynamicStyling = false;
    defaults.choicesDynamicStyling = choicesDynamicStyling;
    defaults.minimalChoicesDynamicStylingMaxHeight = 20;
}
