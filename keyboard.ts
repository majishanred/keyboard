type EventEmitter = typeof EventEmitter;

const EventEmitter = require("node:events");

class Keyboard extends EventEmitter { 
  keys: Key[] = [
    new Key('q'),
    new Key('w'),
    new Key('e'),
    new Key('r'),
    new Key('shift'),
    new Key('alt')
  ];

  private _states = {
    default: new DefaultState(),
    shiftState: new ShiftState(),
    altState: new AltState()
  };

  private _current_state: State;

  history: HistoryAction[] = [];

  constructor() {
    super();
    
    this._current_state = this._states.default;
    this.on('key_pressed', (name: string) => {
      switch(name) {
        case 'shift':
          this._current_state = this._states.shiftState;
          break;
        case 'alt':
          this._current_state = this._states.altState;
          break;
        default:
          this.history.push({
            key: name,
            state: this._current_state
          });

          this._current_state._eventHandler(name);  
      }
    });
  }

  press(keys: string) {
    this.emit("key_pressed", keys);
  }

  undo() {
    const command = this.history.pop();
    command?.state._undo(command.key);
  }

  test() {
    for(let i = 0; i < 4; i++) {
      this.press(this.keys[i].name);
    }

    this.press(this.keys[4].name);

    for(let key of this.keys) {
      this.press(key.name);
    }

    this.press(this.keys[5].name);

    for(let i = 0; i < 2; i++) {
      this.press(this.keys[i].name);
    }

    this.undo();

    this._states.altState.rebind_command('q', {
      command: () => { return "Открыть блокнот"},
      undo: () => { return "Закрыть блокнот" }
    });

    this.press(this.keys[0].name);
  }
};

abstract class State {
  abstract commands: {};

  abstract _eventHandler(name: string): void;
  abstract rebind_command(name: string, action: Action): void;
  abstract _undo(name: string): void;
};

class DefaultState extends State {
  commands = {};

  _eventHandler(name: string) {
    console.log(`${name} | press(${name})`);
  }

  rebind_command(name: string, action: Action): void {}
  _undo(name: string): void {};
}

class ShiftState extends State {
  commands = {};

  _eventHandler(name: string): void {
    console.log(`${name.toUpperCase()} | press(${name})`);
  }

  rebind_command(name: string, action: Action): void {};
  _undo(name: string): void {};
}

class AltState extends State {
  commands = {};

  constructor() {
    super();
    this.commands = {
      q: {
        command: () => { return "Open Browser" },
        undo: () => { return "Close Browser" }
      },
      w: {
        command: () => { return "Open Console" },
        undo: () => { return "Close Console" }
      }
    };
  }

  _eventHandler(name: string): void {
    this.commands[name] == undefined ? () => {} : console.log(`${this.commands[name].command()} | press(alt+${name})`);
  }

  _undo(name: string): void {
    this.commands[name] == undefined ? () => {} : console.log(`${this.commands[name].undo()} | press(alt+${name})`)
  }

  rebind_command(name: string, action: Action): void {
    this.commands[name] = action;
  };
}

class Key {
  name: string;
  constructor(name) {
    this.name = name;
  }
}

interface HistoryAction {
  key: string;
  state: State;
}

type Action = {
  command: Function,
  undo: Function
}

const keyboard = new Keyboard();

keyboard.test();