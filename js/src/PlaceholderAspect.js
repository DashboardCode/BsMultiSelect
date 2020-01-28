import  {toggleStyling} from './ToolsStyling';

export function PlaceholderAspect(placeholderText, isEmpty, picksElement, inputElement , css ){
    function setEmptyInputWidth(isVisible){
        if(isVisible)
            inputElement.style.width="100%"
        else
            inputElement.style.width="2ch";
    }

    function showPlacehodler(isVisible){
        if (isVisible)
        {
            inputElement.placeholder = placeholderText?placeholderText:"";
            picksElement.style.display= "block";
        }
        else
        {
            inputElement.placeholder = "";
            picksElement.style.display= "flex";
        }
        toggleStyling(inputElement, css.filterInput_empty, isVisible);
        setEmptyInputWidth(isVisible);
    }
    showPlacehodler(true);

    return {
        updatePlacehodlerVisibility(){
            showPlacehodler(isEmpty());
        },
        updateEmptyInputWidth(){
            setEmptyInputWidth(isEmpty())
        },
        setDisabled(isDisabled)
        { 
            inputElement.disabled = isDisabled;
        }
    }
}