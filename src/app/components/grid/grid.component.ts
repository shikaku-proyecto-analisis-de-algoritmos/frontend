import { Component, OnInit, OnDestroy } from '@angular/core';
import { ShikakuService } from 'src/app/services/shikaku.service';
import { Board, Rectangle, SolveResult } from '../../models/shikaku.model';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit, OnDestroy {
  board: Board | null = null;
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
  solverType: 'bt' | 'cp' = 'cp';
  isSolving = false;
  solveStats: SolveResult | null = null;
  showStats = false;
  isAnimating = false;

  constructor(
    private shikakuService: ShikakuService
  ) {}

  ngOnInit(): void {
    this.board = {
      rows: 5,
      cols: 5,
      cells: [
        [0, 0, 2, 0, 0],
        [0, 0, 0, 0, 3],
        [4, 0, 0, 0, 0],
        [0, 0, 0, 2, 0],
        [0, 0, 4, 0, 0],
      ]
    };
    this.startTimer();
  }

  ngOnDestroy(): void {
    this.stopTimer();
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

  loadBoard(difficulty: string): void {
    this.shikakuService.getBoard(difficulty).subscribe(data => {
      this.board = data.board;
      this.rectangles = [];
      this.solveStats = null;
      this.showStats = false;
      this.resetTimer();
      this.startTimer();
    });
  }

  nextLevel(): void {
    // Carga un nuevo tablero aleatorio (por defecto 'easy')
    this.loadBoard('easy');
  }

  onCellMouseDown(row: number, col: number): void {
    if (this.isAnimating) return;
    this.isDrawing = true;
    this.currentRect = { startRow: row, startCol: col };
    this.previewRect = { startRow: row, startCol: col, endRow: row, endCol: col };
  }

  onCellMouseMove(row: number, col: number): void {
    if (!this.isDrawing || !this.currentRect) return;

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
    this.checkVictory();
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
  //  Resolver — local (frontend) o remoto (backend)
  // ─────────────────────────────────────────────────
  solve(): void {
    if (!this.board || this.isSolving) return;
    this.isSolving = true;
    this.solveStats = null;
    this.showStats = false;

    this.shikakuService.solve(this.board, this.solverType).subscribe({
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

  setSolverType(type: 'bt' | 'cp'): void {
    this.solverType = type;
  }

  dismissStats(): void {
    this.showStats = false;
  }

  reset(): void {
    this.rectangles = [];
    this.solveStats = null;
    this.showStats = false;
    this.isAnimating = false;
    this.isSolving = false;
    this.resetTimer();
    this.startTimer();
  }

  checkVictory(): void {
    if (!this.board || this.rectangles.length === 0) return;

    // Validación remota (Backend)
    this.shikakuService.validate(this.board, this.rectangles).subscribe({
      next: (data) => {
        if (data.valid) {
          this.stopTimer();
          alert(`¡Ganaste! 🎉 Tiempo total: ${this.formattedTime}`);
        }
      }
    });
  }

  getCellClasses(r: number, c: number): { [key: string]: boolean } {
    const classes: { [key: string]: boolean } = {};
    
    // Buscar si la celda está dentro de un rectángulo ya confirmado
    const rect = this.rectangles.find(rect => this.inRect(r, c, rect));
    if (rect) {
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
    
    return classes;
  }

  getRectColor(row: number, col: number): string {
    // Primero mostrar preview (encima de todo)
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