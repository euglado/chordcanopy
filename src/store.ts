import { randomUUID } from "node:crypto";
import type { Language, Plan } from "./chords.ts";
export interface Binding {
  user: string;
  guild: string;
  channel: string;
  message: string;
}
export interface Draft extends Binding {
  plan: Plan;
  language: Language;
  expires: number;
}
export class DraftStore {
  readonly drafts = new Map<string, Draft>();
  readonly now: () => number;
  constructor(now: () => number = Date.now) {
    this.now = now;
  }
  prune(): void {
    for (const [id, draft] of this.drafts)
      if (draft.expires <= this.now()) this.drafts.delete(id);
  }
  add(draft: Omit<Draft, "expires">): string {
    this.prune();
    if (this.drafts.size >= 100) throw new Error("capacity");
    const id = randomUUID();
    this.drafts.set(id, { ...draft, expires: this.now() + 300_000 });
    return id;
  }
  take(id: string, binding: Binding): Draft | undefined {
    this.prune();
    const draft = this.drafts.get(id);
    if (
      !draft ||
      draft.user !== binding.user ||
      draft.guild !== binding.guild ||
      draft.channel !== binding.channel ||
      draft.message !== binding.message
    )
      return;
    this.drafts.delete(id);
    return draft;
  }
}
export class Gate {
  readonly times = new Map<string, number>();
  readonly running = new Set<string>();
  readonly now: () => number;
  readonly delay: number;
  constructor(delay: number, now: () => number = Date.now) {
    this.delay = delay;
    this.now = now;
  }
  prune(): void {
    for (const [key, until] of this.times)
      if (until <= this.now()) this.times.delete(key);
  }
  enter(key: string): boolean {
    this.prune();
    if (
      this.running.has(key) ||
      this.times.has(key) ||
      this.running.size >= 100 ||
      this.times.size >= 1000
    )
      return false;
    this.running.add(key);
    this.times.set(key, this.now() + this.delay);
    return true;
  }
  leave(key: string): void {
    this.running.delete(key);
  }
}
