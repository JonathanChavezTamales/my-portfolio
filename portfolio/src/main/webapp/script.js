// Author: Jonathan Chavez - tabaresj@google.com
var isTerminalOpen = false;
var firstTimeOpening = true;

window.addEventListener('keydown', keyboardHandler);

function keyboardHandler(e) {
  e = e || window.event;
  if (String.fromCharCode(e.keyCode) === 'T') {
    if (!isTerminalOpen) {
      openTerminal();
      isTerminalOpen = true;
      if (firstTimeOpening) {
        firstTimeOpening = false;
        runTerminal();
      }
    } else {
      closeTerminal();
      isTerminalOpen = false;
    }
  }
}

function runTerminal() {
  printTerminal(
    '^300 Hi! ^500 This is a terminal. ^1000 Well... ^1000 Kind of. ^1000',
    function () {
      printTerminal('My name is Jonathan. ^500 Nice to meet you.');
    }
  );
}

function printTerminal(message, callback) {
  //Simulates writing a line to the terminal

  var typeSpeed = 33;

  //Creates the empty line component
  var line = document.createElement('div');
  line.className = 'terminal-line';
  line.appendChild(document.createElement('span'));
  document.getElementById('terminal').appendChild(line);

  //Writes to the inner element from the component recently created
  var firstMessage = new Typed(
    document.getElementById('terminal').lastChild.lastChild,
    {
      strings: [message],
      typeSpeed,
      onComplete: function () {
        scrollTerminalToBottom();

        //Hides the cursor on complete
        var cursorList = document.getElementsByClassName('typed-cursor');
        cursorList[cursorList.length - 1].style.display = 'none';

        if (callback) callback();
      },
    }
  );
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
