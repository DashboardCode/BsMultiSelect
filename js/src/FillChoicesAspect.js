
export function FillChoicesAspect(
        document, createChoiceAspect, optionsAspect, choices, buildAndAttachChoiceAspect
        ) { 
    return {
        fillChoices(){
            var fillChoicesImpl = () => {
                let options = optionsAspect.getOptions();
                for(let i = 0; i<options.length; i++) {
                    let option = options[i];
                    let choice = createChoiceAspect.createChoice(option);
                    choices.push(choice);
                    buildAndAttachChoiceAspect.buildAndAttachChoice(choice);
                } 
            }
    
            // browsers can change select value as part of "autocomplete" (IE11) 
            // or "show preserved on go back" (Chrome) after page is loaded but before "ready" event;
            // but they never "restore" selected-disabled options.
            // TODO: make the FROM Validation for 'selected-disabled' easy.
            if (document.readyState != 'loading') {
                fillChoicesImpl();
            } else {
                var domContentLoadedHandler = function(){
                    fillChoicesImpl();
                    document.removeEventListener("DOMContentLoaded", domContentLoadedHandler);
                }
                document.addEventListener('DOMContentLoaded', domContentLoadedHandler); // IE9+
            }
        }
    }
}
