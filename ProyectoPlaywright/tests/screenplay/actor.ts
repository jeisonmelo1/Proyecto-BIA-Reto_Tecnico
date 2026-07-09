import { Ability } from './abilities/ability';

export interface Task {
  performAs(actor: Actor): Promise<void>;
}

export interface Question<T> {
  answeredBy(actor: Actor): Promise<T>;
}

export class Actor {
  private readonly abilities = new Map<string, Ability>();

  constructor(public readonly name: string) {}

  static named(name: string) {
    return new Actor(name);
  }

  whoCan(ability: Ability) {
    this.abilities.set(ability.constructor.name, ability);
    return this;
  }

  abilityTo<T extends Ability>(abilityType: new (...args: Array<any>) => T): T {
    const ability = this.abilities.get(abilityType.name);
    if (!ability) {
      throw new Error(`${this.name} does not have ability ${abilityType.name}`);
    }
    return ability as T;
  }

  async attemptsTo(...tasks: Array<Task>): Promise<void> {
    for (const task of tasks) {
      await task.performAs(this);
    }
  }

  asksFor<T>(question: Question<T>): Promise<T> {
    return question.answeredBy(this);
  }
}

export function actorCalled(name: string) {
  return Actor.named(name);
}
