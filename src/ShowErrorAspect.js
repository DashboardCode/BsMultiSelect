export function ShowErrorAspect(staticDom){
    return {
        showError(error){
            let {createElementAspect, initialElement} = staticDom;
            let errorElement = createElementAspect.createElement('SPAN'); 
            errorElement.style.backgroundColor = 'red';
            errorElement.style.color = 'white';
            errorElement.style.block = 'inline-block';
            errorElement.style.padding = '0.2rem 0.5rem';
            errorElement.textContent = 'BsMultiSelect ' + error.toString();
            initialElement.parentNode.insertBefore(errorElement, initialElement.nextSibling);
        }
    }
}