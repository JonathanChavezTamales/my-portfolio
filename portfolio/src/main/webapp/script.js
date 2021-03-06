// Author: Jonathan Chavez - tabaresj@google.com
var isTerminalOpen = false;
var firstTimeOpening = true;
var currentSection = 'whoami';
var commentsLoaded = false;
var lastInputOnPrompt = '';

// Names for the sites in the terminal, each is a section of the portfolio
var sites = [
  'education.yaml',
  'work-experience.yaml',
  'projects.yaml',
  'skills.yaml',
  'virus.exe',
  'comments.yaml',
];

// List of commands available to use in the terminal
var commands = ['man', 'compgen', 'ls', 'cat', 'whoami', 'comment'];

window.addEventListener('keydown', keyboardHandler);

// If referred to a specific section (# in url), it loads it dynamically
window.onload = function () {
  switch (window.location.hash) {
    case '#whoami-':
      whoamiCommand();
      break;
    case '#education-':
      catCommand('education.yaml');
      break;
    case '#projects-':
      catCommand('projects.yaml');
      break;
    case '#work-experience-':
      catCommand('work-experience.yaml');
      break;
    case '#skills-':
      catCommand('skills.yaml');
      break;
    case '#interests-':
      catCommand('virus.exe');
      break;
    case '#comments-':
      catCommand('comments.yaml');
      break;
  }
};

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

        // Show tutorial only if it hasn't been shown before to the user
        if (localStorage.getItem('showedTutorial') !== 'true') {
          localStorage.setItem('showedTutorial', 'true');
          runTerminalTutorial();
        } else {
          // Timeout because if the terminal is prompted instantly, a bug happens (types 'T' on terminal)
          setTimeout(addTerminalPrompt, 200);
        }
      }
    } else {
      closeTerminal();
      isTerminalOpen = false;
    }
  } else if (e.keyCode === 38) {
    // If the user presses up arrow, it writes the last typed command

    // Check for bug if the terminal is currently writing
    document.getElementById('last-line').lastChild.value = lastInputOnPrompt;
  }
}

/*
 * Shows a tutorial on the terminal
 */
async function runTerminalTutorial() {
  await printTerminal(`^500Hola! ^400 I'm Jonathan,^300 nice to meet you.`);
  await printTerminal(`To list all commands, you can type 'compgen'.`);
  await printTerminal(
    `To learn more about a command, type 'man [command]',^500 e.g.:^400 'man compgen'.`
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
    lastInputOnPrompt = input;
    var originalInput = input;
    e.target.disabled = true;

    // Parsing the input, split by whitespaces and lefts only the tokens
    input = input.split(' ');
    input = input.filter(function (x) {
      return x !== '';
    });

    // Commands are only 1 or 2 tokens long
    if (input.length === 0) {
      addTerminalPrompt();
      return;
    }

    // Calls each function depending on the command and argument
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
      case 'comment':
        comment = originalInput.split('"')[1];
        if (comment !== undefined && comment !== '') commentCommand(comment);
        else
          printTerminalError('comment needs a valid argument', originalInput);
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
 * Shows information about the owner in the terminal
 */
async function whoamiCommand() {
  catCommand('whoami');
}

/*
 * Post a comment on the website
 * @param {string} comment Comment submited to the website
 */
async function commentCommand(comment) {
  if (comment === '') return;

  await fetch('/auth').then(function (response) {
    response.json().then(function (data) {
      if (!data.loggedIn) {
        addTerminalLine('You are not logged in.');
        // TODO(tabaresj): Add instructions to log in
      } else {
        params = new URLSearchParams();
        params.append('comment', comment);

        fetch('/comment', { method: 'POST', body: params });
        addCommentElement('Terminal comment', comment);

        addTerminalLine('Commented successfully - "' + comment + '"');
      }
      addTerminalPrompt();
    });
  });
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
    case 'comments.yaml':
      newSection = 'comments';
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

  // TODO(tabaresj): Check if bugs when loading multiple times
  if (currentSection == 'comments') {
    loadComments();
  }

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
    case 'comment':
      addTerminalLine(
        'comment: ADDS A COMMENT IN THE COMMENT SECTION - comment "[comment]" - e.g.: comment "Hello, this is a comment"'
      );
      break;
    default:
      printTerminalError('man: command does not exist', commandArgument);
      return;
  }
  addTerminalPrompt();
}

/*
 * Adds a new line to the terminal
 * @param {string} text Text to add to the line
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
    // Writes to the inner element from the component recently created
    var firstMessage = new Typed(document.getElementById('last-line'), {
      strings: [message + '^' + delayAtEnd],
      typeSpeed,
      onComplete: function () {
        scrollTerminalToBottom();

        // Hides the cursor on complete
        var cursorList = document.getElementsByClassName('typed-cursor');
        cursorList[cursorList.length - 1].style.display = 'none';

        resolve();
      },
    });
  });
}

function submitComment(e) {
  var comment = document.getElementById('comment-input').value;
  document.getElementById('comment-input').value = '';

  var params = new URLSearchParams();
  params.append('comment', comment);

  // Comment is submited to the database
  fetch('/comment', { method: 'POST', body: params });

  // Comment is added offline without loading comments again (updating the DOM).
  addCommentElement('JonathanHardocodedClient', comment, new Date());

  // This prevents form from reloading the page
  return false;
}

/*
 * Fetches all the comments, creates an element for each, and appends them to the comment section
 */
async function loadComments() {
  // If already loaded comments before, don't do it again
  if (commentsLoaded) return;

  // First check if user is logged in.
  await fetch('/auth').then(function (response) {
    response.json().then(function (data) {
      if (data.loggedIn === false) {
        document.getElementById(
          'comment-login-p'
        ).innerHTML = `You have to login clicking <u><a href="${data.loginUrl}">here</a></u>.`;
      } else {
        // If it's logged in, display the form.
        document.getElementById(
          'comment-login-p'
        ).innerHTML = `You can logout clicking <u><a href="${data.logoutUrl}">here</a></u>`;
        document.getElementById('comment-form').style.display = 'initial';
      }
    });
  });

  // Add every comment to the DOM
  await fetch('/comment').then(function (response) {
    response.json().then(function (data) {
      data.forEach(function (comment) {
        addCommentElement(comment.user, comment.text, comment.timestamp);
      });
    });
  });

  commentsLoaded = true;
}

/*
 * Appends a comment to the comment section
 * @param {string} user Username of the comment
 * @param {string} text Text of the comment (content)
 * @param {number} timestamp Timestamp in seconds of the comment
 */
function addCommentElement(user, text, timestamp) {
  var commentContainer = document.createElement('div');
  commentContainer.className = 'comment-container';

  var commentName = document.createElement('div');
  commentName.className = 'comment-name';
  commentName.innerText = user;

  var commentContent = document.createElement('div');
  commentContent.className = 'comment-content';
  commentContent.innerText = text;

  commentContainer.appendChild(commentName);
  commentContainer.appendChild(commentContent);

  document.getElementById('comment-section').prepend(commentContainer);
}

/*
 * Focus on the last terminal input
 */
function focusTerminal() {
  // If there exists a prompt on the terminal
  if (document.getElementById('last-line').lastChild.tagName === 'INPUT') {
    document.getElementById('last-line').lastChild.focus();
  }
}

/*
 * Scrolls the terminal to the bottom
 */
function scrollTerminalToBottom() {
  var terminal = document.getElementById('terminal');
  terminal.scrollTop = terminal.scrollHeight;
}

function openTerminal() {
  document.getElementById('terminal').style.display = 'initial';
  // Timeout to wait for the terminal to render
  setTimeout(focusTerminal, 10);
}

function closeTerminal() {
  document.getElementById('terminal').style.display = 'none';
}
