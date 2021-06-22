import State from './State';

export default class IdleState extends State {
  constructor(parent) {
    super(parent);
    this.name = 'idle'
  }

  enter(prevState) {
    const idleAction = this.parent.animations['idle'].action;
    if (prevState) {
      const prevAction = this.parent.animations[prevState.name].action;
      idleAction.time = 0.0;
      idleAction.enabled = true;
      idleAction.setEffectiveTimeScale(1.0);
      idleAction.setEffectiveWeight(1.0);
      idleAction.crossFadeFrom(prevAction, 0.5, true);
      
    }
    idleAction.play();
  }

  exit() {}

  update(_, input) {
    if (input.keys.forward || input.keys.backward) {
      this.parent.setState('walk');
    }
  }

}
