# DashboardCode Multiselect plugin for Bootstrap 4
*https://dashboardcode.github.io/BsMultiSelect/*

JSFiddle: https://jsfiddle.net/u2xf6bew/3/ Use it for bug reporting.

There are many similar plugins but this is small and clear since reuses maximum of bootrap 4 styles and code (BsMultiSelect size is 17KB+2KB js+css minified).

In many cases it can be adjusted for your theme without editing CSS. Optionally you can adjust some theme parameters in JS or you can copy/reference [./scss/BsMultiSelect.scss](https://github.com/DashboardCode/BsMultiSelect/blob/master/scss/BsMultiSelect.scss) to your SASS project (it utilize bootstrap variables).

Plugin follows Bootstrap 4 conventions and use the same instruments (babel, sass, rollup) so pretend to represent a BS team's modern plugin's **boilerplate**. 

![image](https://user-images.githubusercontent.com/11598038/39988733-cda205e2-5770-11e8-8ca2-0d30cefc3ca1.png)

# Install
`npm install @dashboardcode/bsmultiselect`

# Architecture
Instead of using BS4 Dropdown component (it is not possible since BS Dropdown requires presence of `toggle-buttons` https://github.com/twbs/bootstrap/issues/26420) the plugin uses popper.js directly.

Inspite of this the plugin utilize `dropdown-menu` class. Menu items contains BS4 Custom checkboxes.

Other BS4 classes were used:

* `form-control` class - it is applied to `ul` that emulates `input`

* `badge` class - selected items, each item contains BS4 `close` button

This plugin doesn't aim to bring its own styles. This was a clear design goal but unfortunatly it can be achived only with some exceptions. Not all bootstrap styles varibales can be accessed from a plugin as classes, therefore we need to setup them in javascript (or reference the BS scss files). Those variables are:

* $input-height - we need it for DIV `form-control`'s min-height; default value is "calc(2.25rem + 2px)",

* $input-disabled-bg - we need it to "disable" DIV `form-control` - set background color; default value is "#e9ecef"

* $input-color - we need to make DIV color the same as `input` color (color of text you are typing); default value is "#495057"

* focus for `isvalid`, focus for `isinvalid` effects (mixins)

If your theme changes those variables, you need to update them on the plugin initialization (option 1).

````
          $("select[multiple='multiple']").bsMultiSelect({
              selectedPanelDefMinHeight: 'calc(2.25rem + 2px)',  // default size
              selectedPanelLgMinHeight: 'calc(2.875rem + 2px)',  // LG size
              selectedPanelSmMinHeight: 'calc(1.8125rem + 2px)', // SM size
              selectedPanelDisabledBackgroundColor: '#e9ecef',   // disabled background
              selectedPanelFocusBorderColor: '#80bdff',          // focus border
              selectedPanelFocusBoxShadow: '0 0 0 0.2rem rgba(0, 123, 255, 0.25)',  // foxus shadow
              selectedPanelFocusValidBoxShadow: '0 0 0 0.2rem rgba(40, 167, 69, 0.25)',  // valid foxus shadow
              selectedPanelFocusInvalidBoxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)',  // invalid foxus shadow
              inputColor: '#495057', // color of keyboard entered text
              selectedItemContentDisabledOpacity: '.65' // btn disabled opacity used
          });
            
````

or (option 2) use `useCss=true` option and load the customized copy `BsMultiselect.css` or referencing `BsMultiselect.scss` in your css project.

BsMultiSelect handles click events friendly to modals and popups. Important: `preventDefault`, `stopPropagation` were not used (for mouse events), but I remove dom elments (intiated by the click on "x" button) using setTimeout(..,0) - to simplify the identification of click event's target during the bubling; 

For keyboard events `preventDefault` was used to 
    a) handle tab `9`  as autocompleate 
    b) arrows `38`, `40` to prevent browser still them; 
    c) enter `13` to prvent default button action (submit etc.)
    d) esc `27` to avoi `clear text on esc` functionlity dublication

Inspite plugin have form `reset` event listener, there are no MutationObserver defined inside (component does not track properties on original `SELECT`, `FIELDSET`). If you change  properties on original `SELECT` or `FIELDSET`, then you will need to push changes to component with methods `UpdateIsValid`, `UpdateDisabled`, `UpdateSize`, `UpdataData` or just `Update` (works like "update all") .

````
          $('#mySelect').bsMultiSelect("UpdateDisabled"); // bsMultiSelect call the method directly
````

Or this way.

````
          var bsMultiSelect = $('#mySelect').BsMultiSelect(); // BsMultiSelect return the object
          bsMultiSelect.Update();
````         

Other way to access the component's instance is using `data` :

````
          var bsMultiSelect = $('#mySelect').data('DashboardCode.BsMultiSelect');
          if (bsMultiSelect){
              // there you are sure that component is attached
          }
````         


## Features

**multiline**: input can grow vertically;

**SELECT disabled / readonly / FIELDSET disabled support**: although there is difference between those two attributes for `input`, the HTML 5.2 support only `disabled` for [`select`](https://www.w3.org/TR/2017/REC-html52-20171214/sec-forms.html#the-select-element) element. `Readonly` attribute on original `select` will be ignored;

**`<option disabled selected>`**: option that is `disabled` and `selected` at the same time can be deselected but can't be selected again (just as it is in HTML `select` and unlike `chosen.js`);

**`<option hidden>`**: options with `hidden` property are ... hidden. You can't deselect them either. This is exactly how HTML5.2 works, but many other plugins show hidden options;

**change event**: you can subscribe to original `select` change event;

**form reset**: integrated with HTML Form reset functionality - button type='reset' renew the selected list;  

**`<label>`**: click on the label puts focus on input and opens the dropdown;

**`<optgroup label=".." >`** grouped options will be flatten; there is no sense mixing "Browse Tree" and "Autosuggest popup" UI expirience. Even if it is possible, I consider this as true: "code that don't exist is infinitely performant and extremely easy to maintain and document." (c) Heydon Pickering;

**no flick**: optionally it is possible to add UL element (component's picks/selections/badges list) manually to HTML; then you will see less flicks during the page load 

**placeholder**: use `data-placeholder` or configuration `{placeholder:"select something.."}`

**.is-valid and .is-invalid**: supports bootstrap validation appearance of original `select`

**sizes**: supports bootstrap `custom-select-lg`, `custom-select-sm` or `input-group-lg`, `input-group-sm` on original `select`

**bootstrap input-group + prepend + append support**  but you will need to setup more infromation about the dom  - to mark a container
````
          <div class="input-group dashboardcode-bsmultiselect"> <!-- mark the container with dashboardcode-bsmultiselect"  -->
                <div class="input-group-prepend">
                    <span class="input-group-text">:-)</span>
                </div>
                <select name="Languages" id="languages-id" class="form-control"  multiple="multiple" style="display: none;">
                    <option value="EN">English</option>
                    <option value="ES">Spanish</option>
                </select>
                <ul class="form-control"></ul> <!-- optionally but recommended: component's  picks/selections/badges list for "no flick load" -->
          </div>
            
````

**dialog and popup** works on Bootstrap dialogs and dropdowns (BS dropdowns require additional click event filtering)

**CSS and SCSS**: you can copy BsMultiSelect.css (included to distribution) and update values manually for your theme.
Or you can use [./scss/BsMultiSelect.scss](https://github.com/DashboardCode/BsMultiSelect/blob/master/scss/BsMultiSelect.scss) copy it to your project and update reference to your custom BS variables in yout theme); these requires such configuration:

````
          $("select[multiple='multiple']").bsMultiSelect({
                         useCss: true // this disables many style's manipulation in js; and relly on classes
                     });
            
````
Also `useCss: true` allows you to go to heavy styling (and even use plugin without bootstrap). Those additional options are available (you see default values):


````
          $("select[multiple='multiple']").bsMultiSelect({
                         useCss: true,
                         containerClass: 'dashboardcode-bsmultiselect',
                         dropDownMenuClass: 'dropdown-menu',
                         dropDownItemClass:  'px-2',
                         dropDownItemHoverClass: 'text-primary bg-light',
                         selectedPanelClass: 'form-control',
                         selectedItemClass: 'badge',
                         removeSelectedItemButtonClass: 'close',
                         filterInputItemClass: '',
                         filterInputClass: ''
                         selectedPanelFocusClass : 'focus',
                         selectedPanelDisabledClass: 'disabled',
                         selectedItemContentDisabledClass: 'disabled'
                     });
            
````


With them you can change classes of generated HTML elements. Default generated HTML (for `useCss: true`) looks like:


````
        <div class="dashboardcode-bsmultiselect">
          <ul class="form-control focus" style="..">
              <li class="badge"><span>California</span><button class="close">..</button></li>
              <li class="badge"><span class="disabled">Pennsylvania</span><button class="close">..</button></li>
              <li><input id=".." style=".." ..></li>
          </ul>
          <ul class="dropdown-menu" style=".." ..>
              <li class="px-2 text-primary bg-light">
                <div class="custom-control custom-checkbox">
                   <input type="checkbox" .. >
                   <label ..>Alabama</label>
                </div>
              </li>
              <li class="px-2">
                <div class="custom-control custom-checkbox">
                  <input type="checkbox" ..>
                  <label ..>Alaska</label>
                </div>
              </li>
          </ul>
        </div>
````
**without select element - intialize with js**: initialize over div
````
$('div.#bsMultiSelectJson').bsMultiSelect(
                        {
                            options : [
                                        {text:"Asia", value:"C0",hidden:false,disabled:false,selected:true},
                                        {text:"Europe",value:"C1",hidden:false,disabled:false,selected:false},
                                        {text:"Australia",value:"C2",hidden:false,disabled:false,selected:false},
                                        {text:"America",value:"C3",hidden:false,disabled:false,selected:false},
                                        {text:"Africa",value:"C4",hidden:false,disabled:false,selected:false}
                                     ],
                            getDisabled : () => $('#optionDisable').is(":checked"), 
                            getIsValid : () => false, //... or from where you want
                            getIsInvalid : () => false, //... or from where you want
                        }
                );
````

Note: all options should contais all propoerties (text, value, hidden, disabled, selected) - you can't ommit them.

### Proposal to Bootstrap

It would be very nice if Bootstrap could provide those SASS variables as classes :

````
.h-input{
  min-height: $input-height; // support sm and lg form-controls also
}

.bg-disabled{
   background-color: $input-disabled-bg !important;
}

.text-input{
   color: $input-color !important;
}
````
Vote there: https://github.com/twbs/bootstrap/issues/26412

Note, BS allready provide classes like: `h-25`, `bg-light`, `text-primary` that make many variables available as classes so the proposal is just an improovement of theirs class system.


### Known issues
* Tested only for IE11, Chrome 66, Edge 42/17, IPhone Safari; Browser should support 'display':'flex' (IE 9 doesn't); 

* dropdown options list could be too long if your filter is weak (and items number is not configurable); there are no scroller.

* no 'smart tracking' of dynamic changes in options - do detach/attach at the end of changes or call 'Update/UpdateData' method (this is actally not a issue, but desing feature)

* no rtl (right to left) - as the whole Boostrap 4;

* no max selected option, no "X selected" message, or no "no result" message on empty filter;

* no smart disabling on mobile devices (manage it manually);

* validation through pseudo-classes `:invalid` , `:valid`, .was-validated class applied to form are not supported; 

* usually you still need css to patch some plugin element's styles to fix unexpected theme effects (e.g. in dark themes BS close button could be made white by theme, when you not expect it, then `.badge > close {color:black;}` fix the problem );

* memory leaks: as I see there is something like several KB memory leak on each attach/detach  (that can be ignored since as I see every jquery plugin "attach/detach" have the same effect). Memory leak is in the compiled objects, not nodes category. But I can't identify its source (jquery, bootstrap utilities?). If you have knowledge how to explain it: help me. Here is a quick way to experiment with attach/detach and memory snapshots: https://dashboardcode.github.io/BsMultiSelect/snippetLeaks.html ;

### Future development

Actually plugin is ready for BS 5 that means for "no jquery".
The better dropdown menu (two different looks for with and without filters;  limitation of size) should be provided soon.

### Alternatives:

BsMultiSelect was created because at the moment when bootstrap 4 was released all existed multi select plugins had strange side effects. It was just simpler to try to combine several BS 4 tools together: `form-control`, `dropdown-menu`, `close` button, `badge` then trying to understand internals of mature projects.


* Chosen.js: https://harvesthq.github.io/chosen/ - (ver 1.8.5), strange multiple "Consider marking event handler as 'passive' to make the page more responsive" warnings to console, not integrated to bootstrap theme (30KB+10KB js+css minified);

* Select2: https://select2.org/appearance - (ver 3.5.3) strange or broken backspace handling (at least in my Chrome 66), not integrated to bootstrap theme (66KB+14KB js+css minified);

* Bootstrap multiselect: http://davidstutz.de/bootstrap-multiselect/  -  (ver. 0.9.15) BS 4 was not supported, also no SCSS, selected options looks as plain text (not as badges, no backspace key handling (67KB+1KB js+css NOT minified);

* Bootstrap-select: https://silviomoreto.github.io/bootstrap-select/ - (ver. 1.12.4) BS 4 supported, but SCSS is not integrated with BS4 variables, also badges line can't be multiline (33KB+7KB js+css minified)

* Choices https://github.com/jshjohnson/Choices

Other Bootstrap extension ideas:
https://github.com/trumbitta/bootstrap-css-utils
https://github.com/tarkhov/postboot

For use case "search some enitities in remote data source" (this is not the same as "select the option") I highly recommend to use the 'typeahead.js' and 'bloodhound.js' combination.

Used tools:
VS Code https://code.visualstudio.com/
