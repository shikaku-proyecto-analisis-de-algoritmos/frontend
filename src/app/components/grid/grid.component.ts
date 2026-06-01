import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ShikakuService } from 'src/app/services/shikaku.service';
import { Board, Difficulty, Rectangle, SolveResult, SolverType } from '../../models/shikaku.model';
import { AuthService } from '../../services/auth.service';
import { GameSettingsService } from '../../services/game-settings.service';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit, OnDestroy {
  board: Board | null = null;
  boardId: string | null = null;
  rectangles: Rectangle[] = [];
  currentRect: Partial<Rectangle> | null = null;
  previewRect: Rectangle | null = null;
  isDrawing = false;

  // --- Propiedades del Temporizador ---
  timeElapsed = 0;
  timerInterval: any = null;
  formattedTime = '00:00';
  timerRunning = false;

  // --- Propiedades del Solucionador ---
  solverType: SolverType = 'cp';
  isSolving = false;
  solveStats: SolveResult | null = null;
  showStats = false;
  isAnimating = false;
  currentLevel = 1;
  currentDifficulty: Difficulty = 'easy';
  showSolverSelector = false;
  validationStatus: 'success' | 'error' | null = null;
  validationMessage = '';
  hintMessage = '';
  hintsUsed = 0;
  solveUsed = false;

  consultMode = false;
  regionHighlight: Rectangle | null = null;
  isQueryingRegion = false;
  private regionHighlightTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private shikakuService: ShikakuService,
    private authService: AuthService,
    private gameSettings: GameSettingsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentDifficulty = this.gameSettings.getDifficulty();
    this.loadBoard(this.currentDifficulty);
  }

  ngOnDestroy(): void {
    this.stopTimer();
    this.clearRegionHighlight();
  }

  // --- Métodos del Temporizador ---
  startTimer(): void {
    if (this.timerRunning) return;
    this.timerRunning = true;
    this.timerInterval = setInterval(() => {
      this.timeElapsed++;
      this.formattedTime = this.formatTime(this.timeElapsed);
    }, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.timerRunning = false;
  }

  resetTimer(): void {
    this.stopTimer();
    this.timeElapsed = 0;
    this.formattedTime = '00:00';
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const formattedMins = mins < 10 ? `0${mins}` : `${mins}`;
    const formattedSecs = secs < 10 ? `0${secs}` : `${secs}`;
    return `${formattedMins}:${formattedSecs}`;
  }

  private colors = [
    '#7EC8E3', '#F4A261', '#A8DADC', '#E9C46A',
    '#95D5B2', '#FFB4A2', '#B5838D', '#6D6875',
  ];

  getColor(index: number): string {
    return this.colors[index % this.colors.length];
  }

  loadBoard(difficulty: Difficulty): void {
    this.currentDifficulty = difficulty;
    this.shikakuService.getBoard(difficulty).subscribe(data => {
      this.board = data.board;
      this.boardId = data.boardId;
      this.rectangles = [];
      this.previewRect = null;
      this.solveStats = null;
      this.showStats = false;
      this.showSolverSelector = false;
      this.validationStatus = null;
      this.validationMessage = '';
      this.hintMessage = '';
      this.hintsUsed = 0;
      this.solveUsed = false;
      this.exitConsultMode();
      this.resetTimer();
      this.startTimer();
      if (this.authService.isAuthenticated()) {
        this.shikakuService.startSession(difficulty, this.currentLevel).subscribe({
          error: (err) => console.error('Error al registrar sesion de juego', err)
        });
      }
    });
  }

  nextLevel(): void {
    this.currentLevel++;
    this.loadBoard(this.currentDifficulty);
  }

  newGame(): void {
    this.router.navigate(['/nueva-partida']);
  }

  onCellMouseDown(row: number, col: number): void {
    if (this.isAnimating) return;
    if (this.consultMode) {
      this.onConsultClueSelect(row, col);
      return;
    }
    this.isDrawing = true;
    this.currentRect = { startRow: row, startCol: col };
    this.previewRect = { startRow: row, startCol: col, endRow: row, endCol: col };
  }

  onCellMouseMove(row: number, col: number): void {
    if (this.consultMode || !this.isDrawing || !this.currentRect) return;

    this.previewRect = {
      startRow: Math.min(this.currentRect.startRow!, row),
      startCol: Math.min(this.currentRect.startCol!, col),
      endRow:   Math.max(this.currentRect.startRow!, row),
      endCol:   Math.max(this.currentRect.startCol!, col),
    };
  }

  onCellMouseUp(row: number, col: number): void {
    if (!this.currentRect || !this.isDrawing) return;

    const rect: Rectangle = {
      startRow: Math.min(this.currentRect.startRow!, row),
      startCol: Math.min(this.currentRect.startCol!, col),
      endRow:   Math.max(this.currentRect.startRow!, row),
      endCol:   Math.max(this.currentRect.startCol!, col),
    };

    this.rectangles = this.rectangles.filter(r => !this.overlaps(r, rect));
    this.rectangles.push(rect);

    this.currentRect = null;
    this.previewRect = null;
    this.isDrawing = false;
    this.validationStatus = null;
    this.validationMessage = '';
    this.hintMessage = '';
  }

  onMouseLeave(): void {
    if (this.isDrawing) {
      this.currentRect = null;
      this.previewRect = null;
      this.isDrawing = false;
    }
  }

  public inRect(row: number, col: number, rect: Rectangle): boolean {
    return row >= rect.startRow && row <= rect.endRow &&
           col >= rect.startCol && col <= rect.endCol;
  }

  // Método auxiliar: dos rectángulos se solapan si comparten alguna celda
  private overlaps(a: Rectangle, b: Rectangle): boolean {
    return (
      a.startRow <= b.endRow &&
      a.endRow >= b.startRow &&
      a.startCol <= b.endCol &&
      a.endCol >= b.startCol
    );
  }

  // ─────────────────────────────────────────────────
  //  Resolver via backend
  // ─────────────────────────────────────────────────
  openSolverSelector(): void {
    if (!this.board || this.isSolving) return;
    this.exitConsultMode();
    this.showSolverSelector = true;
    this.validationStatus = null;
    this.validationMessage = '';
    this.hintMessage = '';
  }

  solve(): void {
    if (!this.board || this.isSolving) return;
    this.isSolving = true;
    this.solveStats = null;
    this.showStats = false;
    this.showSolverSelector = false;
    this.validationStatus = null;
    this.validationMessage = '';

    this.solveUsed = true;

    this.shikakuService.solve(
      this.board,
      this.solverType,
      this.currentDifficulty,
      this.currentLevel,
      this.timeElapsed
    ).subscribe({
      next: (data) => {
        this.solveStats = {
          solution: data.solution,
          timeMs: 0,
          nodesExplored: 0,
          solverType: this.solverType
        };
        this.showStats = true;
        this.animateSolution(data.solution);
      },
      error: (err) => {
        console.error('Error al resolver el puzzle', err);
        this.isSolving = false;
        this.solveUsed = false;
        this.validationStatus = 'error';
        this.validationMessage = 'No se pudo resolver el puzzle. Intenta nuevamente.';
      }
    });
  }

  private animateSolution(solution: Rectangle[]): void {
    this.rectangles = [];
    this.isAnimating = true;

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < solution.length) {
        this.rectangles = [...this.rectangles, solution[idx]];
        idx++;
      } else {
        clearInterval(interval);
        this.stopTimer();
        this.isSolving = false;
        this.isAnimating = false;
      }
    }, 180);
  }

  setSolverType(type: SolverType): void {
    this.solverType = type;
  }

  dismissStats(): void {
    this.showStats = false;
  }

  reset(): void {
    this.rectangles = [];
    this.previewRect = null;
    this.currentRect = null;
    this.solveStats = null;
    this.showStats = false;
    this.showSolverSelector = false;
    this.isAnimating = false;
    this.isSolving = false;
    this.validationStatus = null;
    this.validationMessage = '';
    this.hintMessage = '';
    this.exitConsultMode();
  }

  checkVictory(): void {
    if (this.validationStatus === 'success') return;

    if (!this.board || this.rectangles.length === 0) {
      this.validationStatus = 'error';
      this.validationMessage = 'Dibuja al menos un rectangulo antes de verificar.';
      return;
    }

    this.shikakuService.validate(
      this.board,
      this.rectangles,
      this.currentDifficulty,
      this.currentLevel,
      this.timeElapsed,
      this.hintsUsed,
      this.solveUsed
    ).subscribe({
      next: (data) => {
        if (data.valid) {
          this.stopTimer();
          this.validationStatus = 'success';
          this.validationMessage = 'Puzzle completado';
        } else {
          this.validationStatus = 'error';
          this.validationMessage = 'La solucion aun no es correcta. Revisa tus rectangulos.';
        }
      },
      error: (err) => {
        console.error('Error al validar el puzzle', err);
        this.validationStatus = 'error';
        this.validationMessage = 'No se pudo validar la solucion. Intenta nuevamente.';
      }
    });
  }

  toggleConsultMode(): void {
    if (!this.board || this.isAnimating) return;

    if (this.consultMode) {
      this.exitConsultMode();
      return;
    }

    this.consultMode = true;
    this.clearRegionHighlight();
    this.hintMessage = 'Selecciona un número para revelar su región.';
    this.validationStatus = null;
    this.validationMessage = '';
    this.showSolverSelector = false;
  }

  exitConsultMode(): void {
    this.consultMode = false;
    this.isQueryingRegion = false;
    this.clearRegionHighlight();
    if (this.hintMessage === 'Selecciona un número para revelar su región.') {
      this.hintMessage = '';
    }
  }

  private clearRegionHighlight(): void {
    if (this.regionHighlightTimeout) {
      clearTimeout(this.regionHighlightTimeout);
      this.regionHighlightTimeout = null;
    }
    this.regionHighlight = null;
  }

  private showRegionHighlight(rect: Rectangle): void {
    this.clearRegionHighlight();
    this.regionHighlight = rect;
    this.regionHighlightTimeout = setTimeout(() => {
      this.regionHighlight = null;
      this.regionHighlightTimeout = null;
    }, 5000);
  }

  onConsultClueSelect(row: number, col: number): void {
    if (!this.board || !this.boardId || this.isQueryingRegion) return;

    const value = this.board.cells[row][col];
    if (value <= 0) {
      this.hintMessage = 'Selecciona una celda que contenga un número.';
      return;
    }

    this.isQueryingRegion = true;
    this.hintMessage = 'Consultando región...';

    this.shikakuService.queryRegion(
      this.boardId,
      row,
      col,
      this.currentDifficulty,
      this.currentLevel,
      this.timeElapsed
    ).subscribe({
      next: (region) => {
        this.hintsUsed++;
        this.showRegionHighlight(region);
        this.hintMessage = `Región de área ${value} revelada.`;
        this.isQueryingRegion = false;
      },
      error: (err) => {
        console.error('Error al consultar región', err);
        this.hintMessage = err?.error?.detail || 'No se pudo consultar la región.';
        this.isQueryingRegion = false;
      }
    });
  }

  isClueCell(row: number, col: number): boolean {
    return !!this.board && this.board.cells[row][col] > 0;
  }

  isInRegionHighlight(row: number, col: number): boolean {
    return !!this.regionHighlight && this.inRect(row, col, this.regionHighlight);
  }

  getCellClasses(r: number, c: number): { [key: string]: boolean } {
    const classes: { [key: string]: boolean } = {};

    if (this.regionHighlight && this.inRect(r, c, this.regionHighlight)) {
      classes['region-top'] = r === this.regionHighlight.startRow;
      classes['region-bottom'] = r === this.regionHighlight.endRow;
      classes['region-left'] = c === this.regionHighlight.startCol;
      classes['region-right'] = c === this.regionHighlight.endCol;
    }

    const rect = this.rectangles.find(rect => this.inRect(r, c, rect));
    if (rect && !this.isInRegionHighlight(r, c)) {
      classes['border-top-thick'] = r === rect.startRow;
      classes['border-bottom-thick'] = r === rect.endRow;
      classes['border-left-thick'] = c === rect.startCol;
      classes['border-right-thick'] = c === rect.endCol;
      
      classes['border-top-none'] = r > rect.startRow;
      classes['border-bottom-none'] = r < rect.endRow;
      classes['border-left-none'] = c > rect.startCol;
      classes['border-right-none'] = c < rect.endCol;
    } else if (this.previewRect && this.inRect(r, c, this.previewRect)) {
      // Clases para el rectángulo de vista previa en tiempo real
      classes['preview-top'] = r === this.previewRect.startRow;
      classes['preview-bottom'] = r === this.previewRect.endRow;
      classes['preview-left'] = c === this.previewRect.startCol;
      classes['preview-right'] = c === this.previewRect.endCol;
      
      classes['border-top-none'] = r > this.previewRect.startRow;
      classes['border-bottom-none'] = r < this.previewRect.endRow;
      classes['border-left-none'] = c > this.previewRect.startCol;
      classes['border-right-none'] = c < this.previewRect.endCol;
    }

    if (this.consultMode && this.isClueCell(r, c)) {
      classes['clue-selectable'] = true;
    }
    
    return classes;
  }

  getRectColor(row: number, col: number): string {
    if (this.regionHighlight && this.inRect(row, col, this.regionHighlight)) {
      return 'rgba(0, 229, 255, 0.42)';
    }

    // Preview al dibujar (no confundir con consulta de región)
    if (this.previewRect && this.inRect(row, col, this.previewRect)) {
      const futureIndex = this.rectangles.filter(
        r => !this.overlaps(r, this.previewRect!)
      ).length;
      return this.getColor(futureIndex) + 'CC';
    }

    // Rectángulos ya confirmados
    for (let i = 0; i < this.rectangles.length; i++) {
      if (this.inRect(row, col, this.rectangles[i])) {
        return this.getColor(i);
      }
    } 

    return '';
  }

}
