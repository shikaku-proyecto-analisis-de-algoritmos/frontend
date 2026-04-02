  import { Component, OnInit } from '@angular/core';
  import { ShikakuService } from 'src/app/services/shikaku.service';
  import { Board, Rectangle } from '../../models/shikaku.model';

  @Component({
    selector: 'app-grid',
    templateUrl: './grid.component.html',
    styleUrls: ['./grid.component.scss']
  })
  export class GridComponent implements OnInit {
    board: Board | null = null;
    rectangles: Rectangle[] = [];
    currentRect: Partial<Rectangle> | null = null; // rectángulo que el usuario está dibujando

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
}
    //Funcion que pide el datos del backend
    /*ngOnInit(): void {
      this.loadBoard('easy');
    }*/

    loadBoard(difficulty: string): void {
      this.shikakuService.getBoard(difficulty).subscribe(data => {
        this.board = data.board;
        this.rectangles = [];
      });
    }

    onCellMouseDown(row: number, col: number): void {
      this.currentRect = { startRow: row, startCol: col };
    }

    onCellMouseUp(row: number, col: number): void {
      if (!this.currentRect) return;

      const rect: Rectangle = {
        startRow: Math.min(this.currentRect.startRow!, row),
        startCol: Math.min(this.currentRect.startCol!, col),
        endRow: Math.max(this.currentRect.startRow!, row),
        endCol: Math.max(this.currentRect.startCol!, col),
      };

      this.rectangles.push(rect);
      this.currentRect = null;
      this.checkVictory();
    }

    solve(): void {
      if (!this.board) return;
      this.shikakuService.solve(this.board).subscribe(data => {
        this.rectangles = data.solution;
      });
    }

    reset(): void {
      this.rectangles = [];
    }

    checkVictory(): void {
      // lógica simple: verificar con el backend si la solución es correcta
      this.shikakuService.validate(this.board!, this.rectangles).subscribe(data => {
        if (data.valid) alert('¡Ganaste!'); // luego reemplazas por el modal
      });
    }

    getRectColor(row: number, col: number): string {
      const idx = this.rectangles.findIndex(r =>
        row >= r.startRow && row <= r.endRow &&
        col >= r.startCol && col <= r.endCol
      );
      return idx >= 0 ? this.colors[idx % this.colors.length] : 'transparent';
    }

    colors = ['#a8d8ea','#aa96da','#fcbad3','#ffffd2','#b5ead7','#ffdac1'];
  }