import { Component, OnInit, OnDestroy } from '@angular/core';
import { ShikakuService } from 'src/app/services/shikaku.service';
import { Board, Rectangle } from '../../models/shikaku.model';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit, OnDestroy {
  board: Board | null = null;
  rectangles: Rectangle[] = [];
  currentRect: Partial<Rectangle> | null = null; // rectángulo que el usuario está dibujando
  previewRect: Rectangle | null = null; // ← NUEVO
  isDrawing = false;                     // ← NUEVO

  // --- Propiedades del Temporizador ---
  timeElapsed = 0;
  timerInterval: any = null;
  formattedTime = '00:00';
  timerRunning = false;

  constructor(private shikakuService: ShikakuService) {}

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
      this.resetTimer();
      this.startTimer();
    });
  }

  onCellMouseDown(row: number, col: number): void {
    this.isDrawing = true; // ← faltaba esto
    this.currentRect = { startRow: row, startCol: col };
    this.previewRect = { startRow: row, startCol: col, endRow: row, endCol: col };
  }

  onCellMouseMove(row: number, col: number): void {
    if (!this.isDrawing || !this.currentRect) return;

    // ← NUEVO: actualizar preview en tiempo real
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

    // ← eliminar el bloque duplicado que tenías antes
    this.currentRect = null;
    this.previewRect = null;
    this.isDrawing = false;
    this.checkVictory();
  }

  onMouseLeave(): void {
    // ← NUEVO: cancelar si el mouse sale del grid
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

  solve(): void {
    if (!this.board) return;
    this.shikakuService.solve(this.board).subscribe({
      next: (data) => {
        this.rectangles = data.solution;
        this.stopTimer(); // Detener el temporizador ya que se resolvió automáticamente
      },
      error: (err) => console.error('Error al resolver el puzzle', err)
    });
  }

  reset(): void {
    this.rectangles = [];
    this.resetTimer();
    this.startTimer();
  }

  checkVictory(): void {
    if (!this.board || this.rectangles.length === 0) return;

    this.shikakuService.validate(this.board, this.rectangles).subscribe({
      next: (data) => {
        if (data.valid) {
          this.stopTimer(); // Detener el temporizador al ganar
          alert(`¡Ganaste! Tiempo total: ${this.formattedTime}`);
          // Aquí podrías llamar a un método para guardar el récord en la BD
          // this.saveGameRecord(); 
        }
      },
      error: (err) => console.error('Error en la validación', err)
    });
  }

  getRectColor(row: number, col: number): string {
    // Primero mostrar preview (encima de todo)
    if (this.previewRect && this.inRect(row, col, this.previewRect)) {
      // Mismo color que tendrá cuando se suelte
      const futureIndex = this.rectangles.filter(
        r => !this.overlaps(r, this.previewRect!)
      ).length;
      return this.getColor(futureIndex) + 'CC'; // ← opacidad 80% para distinguir preview
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