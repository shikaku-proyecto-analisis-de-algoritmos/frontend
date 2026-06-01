import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Difficulty } from '../../models/shikaku.model';
import { GameSettingsService } from '../../services/game-settings.service';

interface DifficultyOption {
  value: Difficulty;
  label: string;
  boardSize: string;
  marker: string;
}

@Component({
  selector: 'app-new-game',
  templateUrl: './new-game.component.html',
  styleUrls: ['./new-game.component.scss']
})
export class NewGameComponent {
  selectedDifficulty: Difficulty = this.gameSettings.getDifficulty();

  difficultyOptions: DifficultyOption[] = [
    { value: 'easy', label: 'Facil', boardSize: 'Tablero 5x5', marker: 'easy' },
    { value: 'medium', label: 'Medio', boardSize: 'Tablero 8x8', marker: 'medium' },
    { value: 'hard', label: 'Dificil', boardSize: 'Tablero 10x10', marker: 'hard' }
  ];

  constructor(
    private gameSettings: GameSettingsService,
    private router: Router
  ) {}

  selectDifficulty(difficulty: Difficulty): void {
    this.selectedDifficulty = difficulty;
  }

  startGame(): void {
    this.gameSettings.setDifficulty(this.selectedDifficulty);
    this.router.navigate(['/grid']);
  }
}
