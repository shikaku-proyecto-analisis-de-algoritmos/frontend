export interface Board {
  rows: number;
  cols: number;
  cells: number[][];  // 0 = vacío, >0 = número del puzzle
}

export interface Rectangle {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}