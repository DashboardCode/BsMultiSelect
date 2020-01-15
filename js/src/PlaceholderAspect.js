export function PlaceholderAspect(placeholderText, picksIsEmpty, filterIsEmpty, picksElement, inputElement ){
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
        setEmptyInputWidth(isVisible);
    }
    showPlacehodler(true);

    return {
        updatePlacehodlerVisibility(){
            showPlacehodler(picksIsEmpty() && filterIsEmpty());
        },
        updateEmptyInputWidth(){
            setEmptyInputWidth(picksIsEmpty() && filterIsEmpty())
        },
        setDisabled(isDisabled)
        { 
            inputElement.disabled = isDisabled;
        }
    }
}