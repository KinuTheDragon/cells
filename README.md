# Cells
## A cellular automaton designing engine
This engine is heavily inspired by [SandPond](https://github.com/TodePond/Sandpond)
by the amazing [Lu Wilson](https://github.com/TodePond/).

## So how does the engine work?
- The canvas on the left is where you can place various cells.
- The code panel on the right is where you define the rules for the cells.
- The gray box on the bottom-right is for logging error messages when updating the rules.
- The buttons in the upper-right are for various actions:

**Button**|**Function**
:-----:|:-----:
![image](images/update.png)|Update the rules
![image](images/pause.png)|Pause the simulation
![image](images/play.png)|Resume the simulation
![image](images/step.png)|Do one step of the simulation
![image](images/help.png)|Opens this documentation

## How do I write code for it?
The code is divided into 2-3 sections separated by two newlines:
### Elements
Each line of this section is in the format
<code>&lt;name&gt; &lt;key&gt; &lt;color&gt;</code>.
The <code>name</code> is the name of the element,
the <code>key</code> is the [key to press to access it,](https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values)
and the <code>color</code> is a [CSS color](https://www.w3schools.com/css/css_colors.asp).
### Replacements (optional)
Each line of this section is in the format
<code>&lt;start&gt; := &lt;end&gt;</code>.
This replaces the <code>start</code> with <code>end</code>
in the rules section.
### Rules
(todo)