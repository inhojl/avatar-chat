import State from './State';

export default class RunState extends State {
  constructor(parent) {
    super(parent);
    this.name = 'run';
  }

  enter(prevState) {
    const currentAction = this.parent.animations['run'].action;
    if (prevState) {
      const prevAction = this.parent.animations[prevState.name].action;
      currentAction.enabled = true;

      if (prevState.name === 'walk') {
        // ratio allows for smooth transition from walk to run
        const ratio = currentAction.getClip().duration / prevAction.getClip().duration;
        currentAction.time = prevAction.time * ratio;
      } else {
        currentAction.time = 0.0;
        currentAction.setEffectiveTimeScale(1.0);
        currentAction.setEffectiveWeight(1.0);
      }

      currentAction.crossFadeFrom(prevAction, 0.5, true);
    }
    currentAction.play()
  }

  exit() {}

  update(timeElapsed, input) {
    if (input.keys.forward || input.keys.backward) {
      if (!input.keys.shift) {
        this.parent.setState('walk');
      }
      return
    }
    this.parent.setState('idle');
  }
}