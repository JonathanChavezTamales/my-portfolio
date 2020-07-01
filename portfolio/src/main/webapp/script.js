// Author: Jonathan Chavez - tabaresj@google.com
var isTerminalOpen = false;
var firstTimeOpening = true;
var currentSection = 'whoami';

// Names for the sites in the terminal, each is a section of the portfolio
var sites = [
  'education.yaml',
  'work-experience.yaml',
  'projects.yaml',
  'skills.yaml',
  'virus.exe',
];

// List of commands available to use in the terminal
var commands = ['man', 'compgen', 'ls', 'cat', 'whoami'];

window.addEventListener('keydown', keyboardHandler);

/*
 * Handles keyboard strokes for detecting when toggling the terminal
 */
function keyboardHandler(e) {
  e = e || window.event;
  if (String.fromCharCode(e.keyCode) === 'T' && e.shiftKey) {
    if (!isTerminalOpen) {
      openTerminal();
      isTerminalOpen = true;
      if (firstTimeOpening) {
        firstTimeOpening = false;
        runTerminalTutorial();
      }
    } else {
      closeTerminal();
      isTerminalOpen = false;
    }
  }
}

/*
 * Shows a tutorial on the terminal
 */
async function runTerminalTutorial() {
  await printTerminal(`^500Hola! ^400 I'm Jonathan,^300 nice to meet you.`);
  await printTerminal(
    'This is a terminal, ^500 well^300.^100.^100.^400 kind of.'
  );
  await printTerminal(`To list all commands you can type 'compgen'.`);
  await printTerminal(
    `To learn more about a command type 'man [command]',^500 e.g.:^400 'man compgen'.`
  );
  await printTerminal(
    'You can navigate through my portfolio with the terminal.^400 If you prefer to navigate like a human,^200 you can hide the terminal with "shift + t" and use the navbar above.'
  );
  addTerminalPrompt();
}

/*
 * Handles input from the terminal when 'Enter' is pressed.
 * @param {e} object Event from window
 */
function handlePrompt(e) {
  if (e.key === 'Enter') {
    var input = e.target.value;
    e.target.disabled = true;

    //Parsing the input, split by whitespaces and lefts only the tokens
    input = input.split(' ');
    input = input.filter(function (x) {
      return x !== '';
    });

    //Commands are only 1 or 2 tokens long
    if (input.length > 2) {
      printTerminalError('command not found', input);
      return;
    } else if (input.length === 0) {
      addTerminalPrompt();
      return;
    }

    //Calls each function depending on the command and argument
    switch (input[0]) {
      case 'man':
        if (input[1]) manCommand(input[1]);
        else printTerminalError('man needs an argument', input);
        break;
      case 'compgen':
        compgenCommand();
        break;
      case 'ls':
        lsCommand();
        break;
      case 'cat':
        if (input[1]) catCommand(input[1]);
        else printTerminalError('cat needs an argument', input);
        break;
      case 'whoami':
        whoamiCommand();
        break;
      default:
        printTerminalError('command not found', input[0]);
        break;
    }
  } else if (e.key === 'Tab') {
    e.preventDefault();
    printTerminalError('no autocompletion on this terminal');
  }
}

/*
 * Adds a prompt for the user in the terminal
 */
function addTerminalPrompt() {
  addTerminalLine();

  var inputField = document.createElement('input');
  inputField.className = 'terminal-prompt';
  inputField.maxLength = 64;
  inputField.autofocus = true;
  inputField.addEventListener('keydown', handlePrompt);

  document.getElementById('last-line').appendChild(inputField);

  focusTerminal();
  scrollTerminalToBottom();
}

/*
 * Function used to throw an error to the terminal when input is invalid
 */
function printTerminalError(errorText, originalInput) {
  if (!originalInput) originalInput = '';
  addTerminalLine('jonathanshell: ' + errorText + ': ' + originalInput);
  addTerminalPrompt();
}

/*
 * Lists all the sites on the terminal
 */
function lsCommand() {
  var commandOutput = '';
  sites.forEach((site) => {
    commandOutput += site + '\xa0\xa0\xa0';
  });

  addTerminalLine(commandOutput);
  addTerminalPrompt();
}

/*
 * Lists all the commands on the terminal
 */
function compgenCommand() {
  var commandOutput = '';
  commands.forEach((command) => {
    commandOutput += command + '\xa0\xa0\xa0';
  });

  addTerminalLine(commandOutput);
  addTerminalPrompt();
}

/*
 * Lists all the commands on the terminal
 */
function whoamiCommand() {
  catCommand('whoami');
}

/*
 * Renders a selected site from the list
 * @param {string} commandArgument Argument used in the command, expects a filename
 */
function catCommand(commandArgument) {
  var newSection = '';

  switch (commandArgument) {
    case 'education.yaml':
      newSection = 'education';
      break;
    case 'work-experience.yaml':
      newSection = 'work-experience';
      break;
    case 'projects.yaml':
      newSection = 'projects';
      break;
    case 'skills.yaml':
      newSection = 'skills';
      break;
    case 'virus.exe':
      newSection = 'interests';
      break;
    case 'whoami':
      newSection = 'whoami';
      break;
    default:
      printTerminalError(
        'cat: the file selected does not exist',
        commandArgument
      );
      return;
  }

  document.getElementById(currentSection).style.display = 'none';
  document.getElementById(newSection).style.display = 'block';

  currentSection = newSection;

  addTerminalPrompt();
}

/*
 * Explains what a command does on the terminal
 * @param {string} commandArgument Argument used in the command, expects a command
 */
function manCommand(commandArgument) {
  switch (commandArgument) {
    case 'man':
      addTerminalLine('man : PROVIDES DETAILS OF A COMMAND - man [command]');
      break;
    case 'compgen':
      addTerminalLine('compgen : LISTS ALL AVAILABLE COMMANDS');
      break;
    case 'ls':
      addTerminalLine('ls : LISTS ALL FILES');
      break;
    case 'cat':
      addTerminalLine('cat : SEE CONTENTS A FILE - cat [filename]');
      break;
    case 'whoami':
      addTerminalLine('whoami : SHOWS INFORMATION ABOUT USER');
      break;
  }
  addTerminalPrompt();
}

/*
 * Adds a new line to the terminal
 * @param {string} text Text to add to the line
 * @return {object}
 */
function addTerminalLine(text) {
  // Searches for the last line if exists.
  lastLine = document.getElementById('last-line');
  if (lastLine !== null) {
    lastLine.removeAttribute('id');
  }

  var line = document.createElement('div');
  line.className = 'terminal-line';
  innerSpan = document.createElement('span');
  innerSpan.textContent = text;

  // Updates the new last line
  innerSpan.id = 'last-line';

  line.appendChild(innerSpan);
  document.getElementById('terminal').appendChild(line);
  scrollTerminalToBottom();
}

/*
 * Prints some text to the terminal
 * @param {string} message Message to print
 * @param {function} callback Callback
 */
function printTerminal(message) {
  var typeSpeed = 21;
  var delayAtEnd = '1000';

  var line = addTerminalLine();

  return new Promise(function (resolve) {
    //Writes to the inner element from the component recently created
    var firstMessage = new Typed(document.getElementById('last-line'), {
      strings: [message + '^' + delayAtEnd],
      typeSpeed,
      onComplete: function () {
        scrollTerminalToBottom();

        //Hides the cursor on complete
        var cursorList = document.getElementsByClassName('typed-cursor');
        cursorList[cursorList.length - 1].style.display = 'none';

        resolve();
      },
    });
  });
}

function focusTerminal() {
  //If there exists a prompt on the terminal
  if (document.getElementById('last-line').lastChild.tagName === 'INPUT') {
    document.getElementById('last-line').lastChild.focus();
  }
}

function scrollTerminalToBottom() {
  var terminal = document.getElementById('terminal');
  terminal.scrollTop = terminal.scrollHeight;
}

function openTerminal() {
  document.getElementById('terminal').style.display = 'initial';
}

function closeTerminal() {
  document.getElementById('terminal').style.display = 'none';
}
