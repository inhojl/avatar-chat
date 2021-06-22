import FiniteStateMachine from './FiniteStateMachine';
import IdleState from '../State/IdleState';
import WalkState from '../State/WalkState';
import RunState from '../State/RunState';

export default class CharacterFiniteStateMachine extends FiniteStateMachine {
  constructor(animations) {
    super();
    this.animations = animations;
    this.addState('idle', IdleState);
    this.addState('walk', WalkState);
    this.addState('run', RunState);
  }
}