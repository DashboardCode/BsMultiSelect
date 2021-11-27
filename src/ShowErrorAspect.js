export function ShowErrorAspect(initialDom, createElementAspect){
    return {
        showError(error){
            let errorElement = createElementAspect.createElement('SPAN'); 
            errorElement.style.backgroundColor = 'red';
            errorElement.style.color = 'white';
            errorElement.style.block = 'inline-block';
            errorElement.style.padding = '0.2rem 0.5rem';
            errorElement.textContent = 'BsMultiSelect ' + error.toString();
            initialDom.initialElement.parentNode.insertBefore(errorElement, initialDom.initialElement.nextSibling)
        }
    }
}