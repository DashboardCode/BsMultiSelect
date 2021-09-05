# DashboardCode Multiselect plugin for Bootstrap 5 (4)
Demo: https://dashboardcode.github.io/BsMultiSelect/

Bootstrap 4 Demo : https://dashboardcode.github.io/BsMultiSelect/indexBs4.html


**Breaking Change in ver 1.1.0**: important only for those who had custom css; where selector was `ul.dropdown-menu` it should become `div.dropdown-menu` (with `ul` iniside as the firt child); nothing changes for those who use initial styling or reference BsMultiSelect.scss .

**Breaking Change in ver 1.0.0**: to use with legacy Bootstrap 4 reference the `BsMultiSelect.bs4.*` bundle|module: e.g. https://cdn.jsdelivr.net/npm/@dashboardcode/bsmultiselect@1.1.18/dist/js/BsMultiSelect.bs4.min.js and https://cdn.jsdelivr.net/npm/@dashboardcode/bsmultiselect@1.1.18/dist/css/BsMultiSelect.bs4.min.css



Snippets:

1. [Floating Labels](https://dashboardcode.github.io/BsMultiSelect/snippetFloating.html),  (Only BS5)
  
2. [Load UMD package to window.dashboardcode.BsMultiselect](https://dashboardcode.github.io/BsMultiSelect/snippetUmd.html),  ([BS4 Version](https://dashboardcode.github.io/BsMultiSelect/snippetUmdBs4.html))

3. [Custom Validation](https://dashboardcode.github.io/BsMultiSelect/snippetCustomValidation.html),  ([BS4 Version](https://dashboardcode.github.io/BsMultiSelect/snippetCustomValidationBs4.html))

4. [HTML Form Validation](https://dashboardcode.github.io/BsMultiSelect/snippetFormValidation.html),  ([BS4 Version](https://dashboardcode.github.io/BsMultiSelect/snippetFormValidationBs4.html))

5. [Right To Left (RTL)](https://dashboardcode.github.io/BsMultiSelect/snippetRtl.html),  ([BS4 Version](https://dashboardcode.github.io/BsMultiSelect/snippetRtlBs4.html))

6. [ES6 module, no jquery](https://dashboardcode.github.io/BsMultiSelect/snippetEsm.html), ([BS4 Version](https://dashboardcode.github.io/BsMultiSelect/snippetEsmBs4.html))

7. [Options manipulation API](https://dashboardcode.github.io/BsMultiSelect/snippetJs.html), ([BS4 Version](https://dashboardcode.github.io/BsMultiSelect/snippetJsBs4.html))

8. [Columns and 'no results warning'](https://dashboardcode.github.io/BsMultiSelect/snippetColumns.html), ([BS4 Version](https://dashboardcode.github.io/BsMultiSelect/snippetColumnsBs4.html))

9. [Popup Maximum Height and Scroll Bar](https://dashboardcode.github.io/BsMultiSelect/snippetMaxWidth.html), ([BS4 Version](https://dashboardcode.github.io/BsMultiSelect/snippetMaxWidthBs4.html))

10. [Custom items styling](https://dashboardcode.github.io/BsMultiSelect/snippetCustomStyling.html), ([BS4 Version](https://dashboardcode.github.io/BsMultiSelect/snippetCustomStylingBs4.html))

11. [Filter's highlighting](https://dashboardcode.github.io/BsMultiSelect/snippetFilter.html), ([BS4 Version](https://dashboardcode.github.io/BsMultiSelect/snippetFilterBs4.html))

CodePen snippets, use them for bug reporting: 
     https://codepen.io/rpokrovskij/pen/yLymQwW  (initialized using HTML SELECT)
     https://codepen.io/rpokrovskij/pen/ExWyZMN  (initialized using JS)

There are many similar plugins but this reuses maximum of Bootrap 4 styles/classes and code. In many cases it can be adjusted for your Bootsrap theme without editing CSS or with minimal efforts. 

There are two modes of usage: you can use plugin with or without external CSS (means, without BsMultiSelect.(s)css) .

1. There is a possibility to use plugin without CSS file/rules but adjusting styling parameters in javascript: this is default `useCssPatch=true` mode. 

2. If you are building your project CSS file form SASS then use `useCssPatch=false` mode and link [./scss/BsMultiSelect.scss](https://github.com/DashboardCode/BsMultiSelect/blob/master/scss/BsMultiSelect.scss) to your project. SCSS file utilize your Bootstrap theme variables.  Other use case is traditional (not involving SASS): copy static [./dist/css/BsMultiSelect.css](https://github.com/DashboardCode/BsMultiSelect/blob/master/dist/css/BsMultiSelect.css) and manually adjust it for your theme.

BsMultiSelect follows Bootstrap 5 conventions and use the same instruments (babel, sass, rollup) so pretend to represent a BS team's modern plugin's **boilerplate**.  Supports all Bootsrap component features: pre/append buttons, custom validation, [form validation](https://dashboardcode.github.io/BsMultiSelect/snippetFormValidation.html), [RTL](https://dashboardcode.github.io/BsMultiSelect/snippetRtl.html).

![image](https://user-images.githubusercontent.com/11598038/39988733-cda205e2-5770-11e8-8ca2-0d30cefc3ca1.png)

# Install
`npm install @dashboardcode/bsmultiselect`

# CDN
Bootstrap 5
https://cdn.jsdelivr.net/npm/@dashboardcode/bsmultiselect@1.1.18/dist/js/BsMultiSelect.min.js
https://cdn.jsdelivr.net/npm/@dashboardcode/bsmultiselect@1.1.18/dist/js/BsMultiSelect.esm.min.js
https://cdn.jsdelivr.net/npm/@dashboardcode/bsmultiselect@1.1.18/dist/css/BsMultiSelect.min.css

Bootstrap 4
https://cdn.jsdelivr.net/npm/@dashboardcode/bsmultiselect@1.1.18/dist/js/BsMultiSelect.bs4.min.js
https://cdn.jsdelivr.net/npm/@dashboardcode/bsmultiselect@1.1.18/dist/js/BsMultiSelect.bs4.esm.min.js
https://cdn.jsdelivr.net/npm/@dashboardcode/bsmultiselect@1.1.18/dist/css/BsMultiSelect.bs4.min.css

# Architecture
Instead of using BS5 Dropdown component (it is not possible since BS Dropdown requires presence of `toggle-buttons` https://github.com/twbs/bootstrap/issues/26420) the plugin uses `popper.js` (V1) directly.

Inspite of this the plugin utilize `dropdown-menu` CSS class. Menu items contains BS Custom checkboxes.

Other BS classes were used:

* `form-control` class - it is applied to `ul` that emulates `input`

* `badge` class - selected items, each item contains BS `close` button

* `custom-control-input` class - each dropdown item contains BS custom checkboxes

It was a clear design goal to provide the MultiSelect that not require external css (use Bootstrap components only) but unfortunatly, if you do not use SCSS, this can be achived only for limited number of themes. Not all bootstrap themes varibales can be accessed from a plugin as classes, or CSS-variables, therefore we need to setup them in javascript (default `useCssPatch=true` mode). Some of those variables are:

* $input-height - we need it for DIV `form-control`'s min-height; default value is "calc(2.25rem + 2px)",

* $input-disabled-bg - we need it to "disable" DIV `form-control` - set background color; default value is "#e9ecef"

* $input-color - we need to make DIV color the same as `input` color (color of text you are typing); default value is "#495057"

* focus for `isvalid`, focus for `isinvalid` effects (mixins)

If your theme changes those variables, and you do not want to start with custom css, I highly recommend to update them on the plugin initialization:

Sample `useCssPatch=true` configuration (default values used):
````
          $("select[multiple='multiple']").bsMultiSelect({
              useCssPatch=true, // default, can be ommitted
              cssPatch: {
                choicesList: {listStyleType:'none', paddingLeft:'0', paddingRight:'0', marginBottom:'0'},
                picks: {listStyleType:'none', display:'flex', flexWrap:'wrap',  height: 'auto', marginBottom: '0'},
                choice: 'px-md-2 px-1',  
                choice_hover: 'text-primary bg-light', 
                filterInput: {
                    border:'0px', height: 'auto', boxShadow:'none', 
                    padding:'0', margin:'0', 
                    outline:'none', backgroundColor:'transparent',
                    backgroundImage: 'none' // otherwise BS .was-validated set its image
                },
                filterInput_empty: 'form-control', // need for placeholder, TODO test form-control-plaintext

                // used in PicksDom
                picks_disabled: {backgroundColor: '#e9ecef'},

                picks_focus: {borderColor: '#80bdff', boxShadow: '0 0 0 0.2rem rgba(0, 123, 255, 0.25)'},
                picks_focus_valid: {borderColor: '', boxShadow: '0 0 0 0.2rem rgba(40, 167, 69, 0.25)'},
                picks_focus_invalid: {borderColor: '', boxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)'},

                // used in BsAppearancePlugin
                picks_def: {minHeight: 'calc(2.25rem + 2px)'},
                picks_lg:  {minHeight: 'calc(2.875rem + 2px)'},
                picks_sm:  {minHeight: 'calc(1.8125rem + 2px)'},
                picks_floating_def: {minHeight: 'calc(3.5rem + 2px)'},

                // used in pickContentGenerator
                pick: {paddingLeft: '0', paddingRight: '.5rem', paddingInlineStart:'0', paddingInlineEnd:'0.5rem'},
                pickButton: {fontSize:'0.8em',  float : "none", verticalAlign: "text-top"},
                pickContent_disabled: {opacity: '.65'}, 

                // used in choiceContentGenerator
                choiceContent: {justifyContent: 'flex-start'}, // BS problem: without this on inline form menu items justified center
                choiceLabel: {color: 'inherit'}, // otherwise BS .was-validated set its color
                choiceCheckBox: {color: 'inherit'},
                choiceLabel_disabled: {opacity: '.65'},  // more flexible than {color: '#6c757d'}; note: avoid opacity on pickElement's border; 

                // floating plugin
                label_floating_lifted: {opacity: '.65', transform : 'scale(.85) translateY(-.5rem) translateX(.15rem)'},
                picks_floating_lifted: {paddingTop: '1.625rem', paddingLeft:'0.8rem', paddingBottom : '0'},

                warning: {paddingLeft: '.25rem', paddingRight: '.25rem', zIndex: 4,  fontSize:'small', backgroundColor: 'var(--bs-warning)'} // zIndex=4  since the input-group zIndex=3
              }
          });
````

Note 1: in `cssPatch` and `css` (discussed below) parameters you can mix styles and classes (depending on your theme available features) this way:
````
      choiceLabel_disabled: { classes: '...', styles: {...}}   
````

Note 2: when you setup `cssPatch` and `css` (discussed below) parameters in configuration as object parameter - you do not need to repeat all default values -  when `classes` replaces default `classes`, `styles` from configuraion merge default `styles` (you are able to add/replace default styles only you need).

`BsMultiSelect` handles click events friendly to your modals and popups. Important: for mouse events `preventDefault`, `stopPropagation` were not used (so your other controls always will get 'clicks' on them). BsMultiSelect remove its DOM elements (in 'option was deselected intiated by the click on "x" button' scenario) using setTimeout(..,0) - this simplifies the identification of click event's target during the bubling (bacause of element is not removing in click event loop iteration you always are able to identify that click's target belongs to BsMultiselect - and skip processing - most probably cancel popup close handler); 

For keyboard events `preventDefault` was used to 
    a) handle tab (`9`)  as autocompleate 
    b) arrows (`38`, `40`) to prevent browser still them; 
    c) enter (`13`) to prvent default button action (submit etc.)
    d) esc (`27`) to avoid "clear text on `esc`" functionlity dublication

## Manipulations with SELECT > OPTION

When data source is `select` element then when user make a selection the option's `selected` attribute is not removed or added, only `HTMLOptionElement.selected` value is setuped (this automitically doesn't add\remove `selected` attribute). If it is not enough and you need to add/remove an attribute, then you can override `setSelected` in the configuration (note: but this break [HTML Form reset](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/reset) functionality in Chrome).

````
          $('#mySelect').bsMultiSelect({
              setSelected: function(option /*element*/, value /*true|false*/){
                  if (value) 
                      option.setAttribute('selected','');
                  else  
                      option.removeAttribute('selected');
                  option.selected = value;
              }
          }); 
````

`setSelected` also can be used for validation (if return `false`) and this is discussed below.

## Dynamic Updates 

Inspite plugin subscribes to form's `reset` event listener, there are no `MutationObserver` defined inside (`BsMultiSelect` does not track properties on original `SELECT`, or js object data, on parent `FIELDSET` element, or presence of `.was-validated` on parent , or presence of `is-valid`, `is-invalid`  original `select` or substitutional configuration methods. 

If you change original `select`'s appearance after `BsMultiSelecte` was created then you will need to push changes to component with corresponded methods `UpdateIsValid`, `UpdateDisabled`, `UpdateSize`, `UpdateWasValidated`, `UpdateValidy`. Or All together with `UpdateAppearance`.

If you change options/items properties (text, `selected`, `disabled`, `hidden`) or if you delete them or insert new items you need to push changes to component with  `UpdateData`. There is specific `UpdateOptionsSelected` method synchronize only `selected` states of options, `UpdateOptionsDisabled` to synchronize only `disabled` states of options, `UpdateOptionsHidden` for `hidden`.

`Update` method works like "update all": it call `UpdateAppearance` and `UpdateData`.

Samples:

````
          $('#mySelect').bsMultiSelect("UpdateDisabled"); // bsMultiSelect call the method directly
````

Or this way.

````
          var bsMultiSelect = $('#mySelect').BsMultiSelect(); // BsMultiSelect return the api object
          bsMultiSelect.updateDisabled(); // ! use traditional low case first letter calling the api methods
````         

Other way to access the component's instance is using `data` :

````
          var bsMultiSelect = $('#mySelect').data('DashboardCode.BsMultiSelect');
          if (bsMultiSelect){
              // there you are sure that component is attached
          }
````         

To update specific option `UpdateOptionSelected`,`UpdateOptionDisabled`,`UpdateOptionHidden` (*Option* here without *s*) with index argument could be used:

````
          var index =15;
          bsMultiSelect.updateOptionSelected(index);
          bsMultiSelect.updateOptionDisabled(index);
          bsMultiSelect.updateOptionHidden(index);
````    

## Umd factories
````
      <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/@dashboardcode/bsmultiselect@1.1.18/dist/js/BsMultiSelect.min.js"></script>
        
      <script>
            dashboardcode.BsMultiSelect("#myElement" /*, options*/);

            // alternatively
            // var element = document.querySelector("#myElement");
            // dashboardcode.BsMultiSelect(element /*, options*/);
      </script>
````

## ESM factories
````
      <script type="module">
            import {createPopper} from "https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/esm/popper.min.js"
            import {ModuleFactory as dashboardCodeFactory} from "https://cdn.jsdelivr.net/npm/@dashboardcode/bsmultiselect@1.1.18/dist/js/BsMultiSelect.esm.min.js"
            var element = document.querySelector('#languages-id');
            var environment = {window, createPopper};
            let dashboardCode = dashboardCodeFactory(environment);
            bsMultiSelect = dashboardCode.BsMultiSelect(element /*, options*/); 
      </script>
````
## jQuery factories

Method 1:
````
          // bsMultiSelect returns jQuery selector
          var bsMultiSelect = $('.myMultiSelect').bsMultiSelect(options); 
````

Method 2:
````
          // BsMultiSelect return the instance of MultiSelect class (or an array 
          // of them, ir selector '.myMultiSelect' returns multiple elements)
          var bsMultiSelect = $('.myMultiSelect').BsMultiSelect(options); 
````

`$.fn["bsMultiSelect"].noConflict` and `$.fn["BsMultiSelect"].noConflict` are available.

## Bundling with WEBPACK from UMD bundles

Building webpack bumndel from UMD bundles with webpack 1) use exact names in aliases 2) manually put jQuery first

Lets `index.js` - used as start point for webpack :
````
import 'jquery'; // should be manually loaded first since '@dashboardcode/bsmultiselect' do not require it as dependency and can be loaded ahead it 
import '@popperjs/core'; // do not use aliases for jquery and '@popperjs/core' since exact names are required by bootstrap and bsmultiselect umd bundle
import 'bootstrap#umd'; // requires jquery and popper
import '@dashboardcode/bsmultiselect#umd'; // requires popper

````

Then UMD resolution in `webpack.config` should look like:
````
resolve: {
        alias: {
            '@popperjs/core': '@popperjs/core/dist/umd/popper.js',
            'bootstrap#umd': 'bootstrap/dist/js/bootstrap.js',
            '@dashboardcode/bsmultiselect#umd':'@dashboardcode/bsmultiselect/dist/js/BsMultiSelect.js'
            // ......
        }
    },
````


## Features

 Shortly: BsMultiSelect supports ALL Bootstrap 5 component features (append/prepend input buttons, floating labels, custom validation, HTML form validation visualization with `.was-validated`). Additionally it also supports RTL (right-to-left).

**multiline**: input can grow vertically;

**right-to-left support**: search for `[dir='rtl']` on parents; [`snippet is here...`](https://dashboardcode.github.io/BsMultiSelect/snippetRtl.html) 

**SELECT disabled / readonly / FIELDSET disabled support**: although there is difference between those two attributes for `input`, the HTML 5.2 support only `disabled` for [`select`](https://www.w3.org/TR/2017/REC-html52-20171214/sec-forms.html#the-select-element) element. `Readonly` attribute on original `select` will be ignored;

**`<option disabled selected>`**: option that is `disabled` and `selected` at the same time can be deselected but can't be selected again (just as it is in HTML `select`; important note: during the form's submit HTML ignore `disabled selected` - doesn't send them; also browser's "go back" step done with autocomplete never removes `disabled` options; have it in mind or use the feature only with options passed as JavaScript object);

**`<option hidden>`**: options with `hidden` property are ... hidden. You can't deselect them either. This is exactly how HTML5.2 works, but many other plugins show hidden options;

**change event**: you can subscribe to original `select` change event;

**form reset**: integrated with HTML Form reset functionality - button type='reset' renew the selected list;  

**`<label>`**: click on the label puts focus on input and opens the dropdown;

**`<optgroup label=".." >`** grouped options will be flatten; there is no sense mixing "Browse Tree" and "Autosuggest popup" UI expirience. Even if it is possible, I consider this as true: "code that don't exist is infinitely performant and extremely easy to maintain and document." (c) Heydon Pickering;

**no flick**: optionally it is possible to add UL element (component's picks/selections/badges list) manually to HTML; then you will see less flicks during the page load 

**placeholder**: use `data-placeholder`, `data-bsmultiselect-placeholder` or configuration parameter `{placeholder:"select something.."}`

**Bootstrap custom validation .is-valid and .is-invalid**: supports Bootstrap validation behaviour as for the original `select`, that means manage border, hovered border, toggle siblings `(in)valid-feedback` or `(in)valid-tooltip` ); [`snippet is here...`](https://dashboardcode.github.io/BsMultiSelect/snippetCustomValidation.html) ;

**Suports HTML form validation**: if original select is invalid (option is required - required attribute) then BsMultiSelect informs user on submit; [`snippet is here...`](https://dashboardcode.github.io/BsMultiSelect/snippetFormValidation.html) ;

**Suports HTML form custom validation**: you can get HTMLElement *validation API* "emulation" by `multiSelect.validationApi`, then you can call `.setCustomValidity(...)` method the same as you would do it for original [`select`](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation)

**Bootstrap HTML form validation visualizations with .was-validated**: supports Bbootstrap 5 styles for input elements with pseudoclasses `.was-validated :invalid` and `.was-validated :valid`; manage border, hoovered border, toggle sibling `(in)valid-feedback` or `(in)valid-tooltip` );  [`snippet is here...`](https://dashboardcode.github.io/BsMultiSelect/snippetFormValidation.html) ;

**sizes**: supports bootstrap `custom-select-lg`, `custom-select-sm` or `input-group-lg`, `input-group-sm` on original `select`

**no results found warning**: can be found usefull by some users, since "no results" situation blocks TAB jump to next field (ESC bypass this)

````
      dashboardCode.BsMultiSelect({
           isNoResultsWarningEnabled : true,
           // noResultsWarning = "No results found";  // default message
      });
````

**bootstrap input-group + prepend + append support**  but you will need to setup more infromation about the dom  - to mark a container with `dashboardcode-bsmultiselect` class
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

**dialog and popup** works on Bootstrap dialogs and dropdowns (BS dropdowns requires to add additional click event filtering from developer to do not close popup when clicking is inside the component - usually on click the popups should be closed )

**CSS and SCSS**: you can copy BsMultiSelect.css (included to distribution) and update values manually for your theme.
Or you can use [./scss/BsMultiSelect.scss](https://github.com/DashboardCode/BsMultiSelect/blob/master/scss/BsMultiSelect.scss) copy it to your project and update reference to your custom BS variables in yout theme); these requires such configuration:

````
          $("select[multiple='multiple']").bsMultiSelect({
              useCssPatch: false // this disables style's manipulation in js; and relly only on classes
          });
            
````
Also `useCssPatch: false` allows you to go to heavy styling (and even use plugin without bootstrap 5). Those additional options are available (you see default values):


````
          $("select[multiple='multiple']").bsMultiSelect({
              useCssPatch: false,
              css : {
                      choices: 'dropdown-menu', // bs, in bsmultiselect.scss as div.dropdown-menu
                      choicesList: '', // bs, in bsmultiselect.scss as div.dropdown-menu>ul (first child)
                      choice_hover:  'hover',  //  not bs, in scss as 'ul.dropdown-menu li.hover'
                      choice_selected: '', 
                      choice_disabled: '', 

                      picks: 'form-control',  // bs, in scss 'ul.form-control'
                      picks_focus: 'focus', // not bs, in scss 'ul.form-control.focus'
                      picks_disabled: 'disabled', //  not bs, in scss 'ul.form-control.disabled'
                      pick_disabled: '',  

                      pickFilter: '', 
                      filterInput: '',

                      // used in pickContentGenerator
                      pick: 'badge text-dark', // bs
                      pickContent: '',
                      pickContent_disabled: 'disabled', // not bs, in scss 'ul.form-control li span.disabled'
                      pickButton: 'btn-close', // bs

                      // used in choiceContentGenerator
                      // choice:  'dropdown-item', // it seems like hover should be managed manually since there should be keyboard support
                      choiceCheckBox_disabled: 'disabled', //  not bs, in scss as 'ul.form-control li .custom-control-input.disabled ~ .custom-control-label'
                      choiceContent: 'form-check', // bs d-flex required for rtl to align items
                      choiceCheckBox: 'form-check-input', // bs
                      choiceLabel: 'form-check-label',
                      choiceLabel_disabled: '',

                      label_floating_lifted: 'floating-lifted',
                      picks_floating_lifted: 'floating-lifted',

                      warning: 'alert-warning'
                }
            });
            
````

With `css` parameter  you can change classes of generated HTML elements. Default HTML generated (for `useCssPatch: false`) looks like:


````
        <div class="dashboardcode-bsmultiselect">
          <ul class="form-control focus" style="..">
              <li class="badge"><span>California</span><button class="close">..</button></li>
              <li class="badge"><span class="disabled">Pennsylvania</span><button class="close">..</button></li>
              <li><input id=".." style=".." ..></li>
          </ul>
          <div class="dropdown-menu">
            <ul style=".." ..>
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
        </div>
````
**without select element - intialize with js object**: in this case plugin should be initialized over `div`
````
$('div#bsMultiSelectJson').bsMultiSelect(
            {
                options : [
                            {text:"Asia", value:"C0",hidden:false,disabled:false,selected:true},
                            {text:"Europe",value:"C1",hidden:false,disabled:false,selected:false},
                            {text:"Australia",value:"C2",hidden:false,disabled:false,selected:false},
                            {text:"America",value:"C3",hidden:false,disabled:false,selected:false},
                            {text:"Africa",value:"C4",hidden:false,disabled:false,selected:false}
                         ],
                getDisabled : () => $('#optionDisable').is(":checked"), 
                getValidity : () => null, //... or true, or false 
                // setSelected : ... if there are no selected property in option
            }
    );
````

Note: option's item should contais two required properties (text, value) - you can't ommit them. If `selected` is ommited then `setSelected` configuration method become obligated. If `setSelected` return false this cancel update "process" - this way can be achieved such goals as **"max selected"**.

### HTML Configuration

`$("#myMultiSelect").bsMultiSelect()` would work over several configurations of initial elements

Here are recommended variants: 

1. Over `<SELECT>`
````
<select id="#myMultiSelect"></select>

<!-- no flick -->
<div class="dashboardcode-bsmultiselect">
  <select id="#myMultiSelect"></select>
  <ul class="form-control" style="..." /> <!-- styles/classes should contains everithing you need for "no flick" -->
</div>

<!-- input-group -->
<div class="input-group dashboardcode-bsmultiselect">
   <div class="input-group-prepend">...</div>
   <select id="#myMultiSelect"></select>
   <ul class="form-control" style="..."/> <!-- or put it before select  -->
   <div class="input-group-append">...</div>
</div>

````

2. Over JS Object
````
<div id="#myMultiSelect"/>

<!-- no flick -->
<div id="#myMultiSelect">
  <ul class="form-control" style="..."/> <!-- styles/classes should contains everithing you need for "no flick" -->
</div>

<!-- input-group -->
<div class="input-group dashboardcode-bsmultiselect">
   <div class="input-group-prepend">...</div>
   <ul id="#myMultiSelect" class="form-control" style="..."/> <!-- required, become picks -->
   <div class="input-group-append">...</div>
</div>

````
Note: `input-group` variants are inconsistent, but you need them not too often. 

Note: `dashboardcode-bsmultiselect` class (aka *container*) is used just to limit the search in DOM selectors and it should be never used for styling or positioning; still `(in)valid-feedback` classes should be siblings of the *container*; (also *container* is a good element to setup rtl attribute, so when RTL for `BsMultiSelect` is configured through `js` configuration `isRtl` field, `BsMultiSelect` force rtl attribute on *container*).

Note: in case of `SELECT` datasource if there are no parent `dashboardcode-bsmultiselect`  then container will be created as sibling of `SELECT`, so the `SELECT` will be located outside `dashboardcode-bsmultiselect`

Note: picks (`UL`) should be direct child of `dashboardcode-bsmultiselect` .

Note: picks (`UL`) should be styled to have compleated look suitable for "no flick" e.g. `style="list-style-type: none; display: flex; flex-wrap: wrap; height: auto; margin-bottom: 0px; min-height: calc(2.25rem + 2px);"`:  

Note: `choices` element (dropdown menu) and `picks` element (selectrd items) are always inside `dashboardcode-bsmultiselect`.


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

### Browser compatability
`Popper v2` requires those polyfills for IE11:
````
<script src="https://polyfill.io/v3/polyfill.min.js?features=CustomEvent,Array.prototype.find,Promise,Object.assign"></script>
````

### Known issues
* Tested only for IE11, Chrome 66, Edge 42/17, IPhone Safari; Browser should support flexbox (IE 9 doesn't); 

* no 'smart tracking' of dynamic changes in options/data - after changes in data you need to call 'Update/UpdateData' method manually (this is actally not an issue, but desing decision); also you can't update concreate option (wait for `UpdateDataItem` in future versions). Detach/attach should be used if you have changed plugin styling parameters or RTL dinamically;

* no "X selected" message on filter's dropdown;

* no smart disabling on mobile devices (manage it manually);

* usually you still need css to patch some plugin element's styles to fix unexpected theme effects (e.g. BS close button could be made white by a dark theme,  then `.badge > close {color:black;}` fix the problem );

* memory leaks: as I see there is something like several KB memory leak on each attach/detach  (that can be ignored since as I see every jquery plugin "attach/detach" have the same effect). Memory leak is in the compiled objects, not nodes. But I can't identify its source (jquery, bootstrap utilities, my code?). If you know how to explain it: help me. Here is a quick way to experiment with attach/detach and memory snapshots: https://dashboardcode.github.io/BsMultiSelect/snippetLeaks.html ;

### Future development

Plugin is highly customizable even now, but API is not published. "Single select", "Enter Tags" or "Enter emails", "Fonts list" etc. can be developed right now with it, but I need to stabilize API before open it (also I should made "search" customizable).

### Alternatives:

BsMultiSelect was created because at the moment when Bootstrap 4 was released all existed multiselect plugins had strange side effects. It was just simpler to try to combine several BS 5 tools together: `form-control`, `dropdown-menu`, `close` button, `badge` then trying to understand internals of mature projects. Now I mantain this list only to motivate myself to improove the BsMultiSelect.  


* Chosen.js: https://harvesthq.github.io/chosen/  

* Select2: https://select2.org/appearance  

* Bootstrap multiselect: http://davidstutz.de/bootstrap-multiselect/  

* Bootstrap-select: https://developer.snapappointments.com/bootstrap-select/examples/#live-search 

* Choices https://github.com/jshjohnson/Choices 

Other Bootstrap extension ideas:
https://github.com/trumbitta/bootstrap-css-utils
https://github.com/tarkhov/postboot

For use case "search some enitities in remote data source" (this is not the same as "select the option") I highly recommend to use the 'typeahead.js' and 'bloodhound.js' combination.

Used tools:
VS Code https://code.visualstudio.com/


## Credits

* to Bootstrap team, I follow theirs npm/rollup project configuration
* Github user https://github.com/michalchrzastek  , for poposed popup max-heigt|scrolling realization (now ChoicesDynamicStylingPlugin)