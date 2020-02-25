import  {toggleStyling} from './ToolsStyling';

export function PlaceholderAspect(placeholderText, isEmpty, picksElement, inputElement , css ){
    function setEmptyInputWidth(isVisible){
        if(isVisible)
            inputElement.style.width ='100%';
        else
            inputElement.style.width ='2ch';
    }
    var emptyToggleStyling = toggleStyling(inputElement, css.filterInput_empty);
    function showPlacehodler(isVisible){
        if (isVisible)
        {
            inputElement.placeholder = placeholderText?placeholderText:'';
            picksElement.style.display = 'block';
        }
        else
        {
            inputElement.placeholder = '';
            picksElement.style.display = 'flex';
        }
        emptyToggleStyling(isVisible);
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
        setDisabled(isComponentDisabled)
        { 
            inputElement.disabled = isComponentDisabled;
        }
    }
}