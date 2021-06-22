import State from './State';

export default class WalkState extends State {
  constructor(parent) {
    super(parent);
    this.name = 'walk';
  }

  enter(prevState) {
    const currentAction = this.parent.animations['walk'].action;
    if (prevState) {
      const prevAction = this.parent.animations[prevState.name].action;
      currentAction.enabled = true;

      if (prevState.name === 'run') {
        const ratio = currentAction.getClip().duration / prevAction.getClip().duration;
        currentAction.time = prevAction.time * ratio;
      } else {
        currentAction.time = 0.0;
        currentAction.setEffectiveTimeScale(1.0);
        currentAction.setEffectiveWeight(1.0);
      }
      currentAction.crossFadeFrom(prevAction, 0.5, true);
    }
    currentAction.play();
  }

  exit() {}

  update(timeElapsed, input) {
    if (input.keys.forward || input.keys.backward) {
      if (input.keys.shift) {
        this.parent.setState('run');
      }
      return
    }
    this.parent.setState('idle');
  }
}