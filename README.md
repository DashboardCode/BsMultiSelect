# Bootstrap 4 Multiselect plugin
*Reuse boostrap 4 styles where it can*

There are many of such plugins but this is small since reuses maximum of bootrap 4 styles and code.

# Architecture
Instead of using BS4 Dropdown (it was possible) it uses popper.js directly.
But it utilize dropdown-menu, dropdown-item styles.
BS4 Custom checkboxes
BS4 Close buttons.

Plugin doesn't have own styles (this was liek a goad but was achived by a trick).
In ideal worls if you customize bootsrap 4 this plugin should change with your new styles. And there is the number of style that it inherits:

a)
b)
c)

Unfortunatly BS4 do not provide several important constants as classes so if you have customized those values you should redifine them in options.

d)
e)
f)

Alternatives:
Chosen.js: https://harvesthq.github.io/chosen/ - (ver 1.8.5) strange "Consider marking event handler as 'passive' to make the page more responsive" warnings to console, heavy integrating to bootstrap theme (30KB+10KB js+css minified)
Select2: https://select2.org/appearance - (ver 3.5.3) strange or broken backspace handling (at least in Chrome 66), heavy integrating to bootstrap theme
    (66KB+14KB js+css minified)
Bootstrap multiselect: http://davidstutz.de/bootstrap-multiselect/  -  (ver. 0.9.15) BS 4 not supported, selected options looks as plain text (not as badges), no backspace key handling (67KB+1KB js+css NOT minified)
Bootstrap-select: https://silviomoreto.github.io/bootstrap-select/ - (ver. 1.12.4) BS 4 supported, but badges line can't be multiline (33KB+7KB js+css minified)

Other Bootstrap extension ideas:
https://github.com/trumbitta/bootstrap-css-utils 

Used tools:
VS Code https://code.visualstudio.com/
