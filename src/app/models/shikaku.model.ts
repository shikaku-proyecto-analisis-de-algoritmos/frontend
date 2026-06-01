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

export type SolverType = 'bt' | 'cp';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
}

export interface SolveResult {
  solution: Rectangle[];
  timeMs: number;
  nodesExplored: number;
  solverType: SolverType;
}

export interface HintResult {
  hintRect: Rectangle | null;
  clueRow?: number;
  clueCol?: number;
  clueValue?: number;
  message: string;
  forced?: boolean;
}

export interface RegionQueryResult {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

export interface BoardResponse {
  board: Board;
  boardId: string;
}
