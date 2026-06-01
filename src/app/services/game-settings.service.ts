import { Injectable } from '@angular/core';
import { Difficulty } from '../models/shikaku.model';

@Injectable({ providedIn: 'root' })
export class GameSettingsService {
  private readonly difficultyKey = 'shikaku.difficulty';
  private readonly defaultDifficulty: Difficulty = 'easy';

  getDifficulty(): Difficulty {
    const saved = localStorage.getItem(this.difficultyKey);
    if (saved === 'easy' || saved === 'medium' || saved === 'hard') {
      return saved;
    }

    return this.defaultDifficulty;
  }

  setDifficulty(difficulty: Difficulty): void {
    localStorage.setItem(this.difficultyKey, difficulty);
  }
}
