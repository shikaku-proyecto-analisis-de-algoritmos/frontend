import { Injectable } from '@angular/core';
import { Board, Rectangle } from '../models/shikaku.model';

/**
 * Resultado del solucionador con métricas de rendimiento.
 */
export interface SolveResult {
  solution: Rectangle[];
  timeMs: number;
  nodesExplored: number;
  solverType: 'bt' | 'cp';
}

type Candidate = [number, number, number, number]; // [r1, c1, r2, c2]
type Clue = [number, number, number];               // [row, col, value]

@Injectable({ providedIn: 'root' })
export class ShikakuSolverService {

  // ─────────────────────────────────────────────────
  //  Pre-cómputo de candidatos (compartido por ambos)
  // ─────────────────────────────────────────────────
  private precomputeCandidates(
    cells: number[][],
    n: number
  ): Map<string, Candidate[]> {
    const candidates = new Map<string, Candidate[]>();

    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const v = cells[r][c];
        if (v > 0) {
          const key = `${r},${c},${v}`;
          const list: Candidate[] = [];

          for (let h = 1; h <= v; h++) {
            if (v % h !== 0) continue;
            const w = v / h;

            const r1Min = Math.max(0, r - h + 1);
            const r1Max = Math.min(r, n - h);
            const c1Min = Math.max(0, c - w + 1);
            const c1Max = Math.min(c, n - w);

            for (let r1 = r1Min; r1 <= r1Max; r1++) {
              for (let c1 = c1Min; c1 <= c1Max; c1++) {
                const r2 = r1 + h - 1;
                const c2 = c1 + w - 1;
                list.push([r1, c1, r2, c2]);
              }
            }
          }

          candidates.set(key, list);
        }
      }
    }
    return candidates;
  }

  // ─────────────────────────────────────────────────
  //  Solver 1: Backtracking simple (BT)
  // ─────────────────────────────────────────────────
  solveBacktracking(board: Board): SolveResult {
    const t0 = performance.now();
    let nodesExplored = 0;

    const n = board.rows;
    const cells = board.cells;

    // Recolectar pistas
    const clues: Clue[] = [];
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (cells[r][c] > 0) {
          clues.push([r, c, cells[r][c]]);
        }
      }
    }

    if (clues.length === 0) {
      return { solution: [], timeMs: performance.now() - t0, nodesExplored: 0, solverType: 'bt' };
    }

    const candidatesDict = this.precomputeCandidates(cells, n);

    // Ordenar por número de candidatos (menor primero → MRV)
    const clueOrder = clues
      .map((_, i) => i)
      .sort((a, b) => {
        const ka = `${clues[a][0]},${clues[a][1]},${clues[a][2]}`;
        const kb = `${clues[b][0]},${clues[b][1]},${clues[b][2]}`;
        return (candidatesDict.get(ka)?.length ?? 0) - (candidatesDict.get(kb)?.length ?? 0);
      });

    // Matriz de ocupación
    const occupancy: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false));
    const solution: (Candidate | null)[] = new Array(clues.length).fill(null);

    const backtrack = (idx: number): boolean => {
      if (idx === clueOrder.length) return true;

      nodesExplored++;
      const origIdx = clueOrder[idx];
      const [r, c, v] = clues[origIdx];
      const key = `${r},${c},${v}`;
      const candidates = candidatesDict.get(key) ?? [];

      for (const [r1, c1, r2, c2] of candidates) {
        // Verificar si el rectángulo cabe
        let valid = true;
        outer:
        for (let rr = r1; rr <= r2; rr++) {
          for (let cc = c1; cc <= c2; cc++) {
            if (occupancy[rr][cc]) { valid = false; break outer; }
          }
        }
        if (!valid) continue;

        // Colocar rectángulo
        for (let rr = r1; rr <= r2; rr++) {
          for (let cc = c1; cc <= c2; cc++) {
            occupancy[rr][cc] = true;
          }
        }
        solution[origIdx] = [r1, c1, r2, c2];

        if (backtrack(idx + 1)) return true;

        // Revertir
        for (let rr = r1; rr <= r2; rr++) {
          for (let cc = c1; cc <= c2; cc++) {
            occupancy[rr][cc] = false;
          }
        }
        solution[origIdx] = null;
      }

      return false;
    };

    const found = backtrack(0);
    const timeMs = performance.now() - t0;

    if (found) {
      return {
        solution: solution.map(s => ({
          startRow: s![0], startCol: s![1], endRow: s![2], endCol: s![3]
        })),
        timeMs,
        nodesExplored,
        solverType: 'bt'
      };
    }
    return { solution: [], timeMs, nodesExplored, solverType: 'bt' };
  }

  // ─────────────────────────────────────────────────
  //  Solver 2: Backtracking + Propagación de
  //            Restricciones / Forward Checking (CP)
  // ─────────────────────────────────────────────────
  solveBacktrackingCP(board: Board): SolveResult {
    const t0 = performance.now();
    let nodesExplored = 0;

    const n = board.rows;
    const cells = board.cells;

    const clues: Clue[] = [];
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (cells[r][c] > 0) {
          clues.push([r, c, cells[r][c]]);
        }
      }
    }

    if (clues.length === 0) {
      return { solution: [], timeMs: performance.now() - t0, nodesExplored: 0, solverType: 'cp' };
    }

    const candidatesDict = this.precomputeCandidates(cells, n);

    // Candidatos restantes por pista (copia mutable)
    const remaining: Map<number, Candidate[]> = new Map();
    for (let i = 0; i < clues.length; i++) {
      const key = `${clues[i][0]},${clues[i][1]},${clues[i][2]}`;
      remaining.set(i, [...(candidatesDict.get(key) ?? [])]);
    }

    const occupancy: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false));
    const assigned: boolean[] = new Array(clues.length).fill(false);
    const solution: (Candidate | null)[] = new Array(clues.length).fill(null);

    const isFeasible = (): boolean => {
      for (let i = 0; i < clues.length; i++) {
        if (!assigned[i] && (remaining.get(i)?.length ?? 0) === 0) return false;
      }
      return true;
    };

    const applyForwardChecking = (): void => {
      for (let i = 0; i < clues.length; i++) {
        if (assigned[i]) continue;
        const viable: Candidate[] = [];
        for (const [r1, c1, r2, c2] of remaining.get(i) ?? []) {
          let overlaps = false;
          outer:
          for (let rr = r1; rr <= r2; rr++) {
            for (let cc = c1; cc <= c2; cc++) {
              if (occupancy[rr][cc]) { overlaps = true; break outer; }
            }
          }
          if (!overlaps) viable.push([r1, c1, r2, c2]);
        }
        remaining.set(i, viable);
      }
    };

    const placeRectangle = (clueIdx: number, r1: number, c1: number, r2: number, c2: number): void => {
      for (let rr = r1; rr <= r2; rr++) {
        for (let cc = c1; cc <= c2; cc++) {
          occupancy[rr][cc] = true;
        }
      }
      assigned[clueIdx] = true;
      solution[clueIdx] = [r1, c1, r2, c2];
    };

    const backtrack = (): boolean => {
      // Propagación de restricciones unitarias
      while (true) {
        if (!isFeasible()) return false;

        const units: number[] = [];
        for (let i = 0; i < clues.length; i++) {
          if (!assigned[i] && remaining.get(i)!.length === 1) {
            units.push(i);
          }
        }
        if (units.length === 0) break;

        for (const u of units) {
          nodesExplored++;
          const [r1, c1, r2, c2] = remaining.get(u)![0];
          placeRectangle(u, r1, c1, r2, c2);
          applyForwardChecking();
        }
      }

      if (assigned.every(a => a)) return true;

      // Seleccionar la pista no asignada con menos candidatos (MRV)
      let nextIdx = -1;
      let minLen = Infinity;
      for (let i = 0; i < clues.length; i++) {
        if (!assigned[i]) {
          const len = remaining.get(i)!.length;
          if (len < minLen) { minLen = len; nextIdx = i; }
        }
      }
      if (nextIdx === -1) return true;

      const candidates = [...remaining.get(nextIdx)!];

      for (const [r1, c1, r2, c2] of candidates) {
        nodesExplored++;

        // Guardar estado
        const savedRemaining = new Map<number, Candidate[]>();
        remaining.forEach((v, k) => savedRemaining.set(k, [...v]));
        const savedOccupancy = occupancy.map(row => [...row]);
        const savedAssigned = [...assigned];
        const savedSolution = [...solution];

        placeRectangle(nextIdx, r1, c1, r2, c2);
        applyForwardChecking();

        if (isFeasible() && backtrack()) return true;

        // Restaurar estado
        savedRemaining.forEach((v, k) => remaining.set(k, v));
        for (let rr = 0; rr < n; rr++) {
          for (let cc = 0; cc < n; cc++) {
            occupancy[rr][cc] = savedOccupancy[rr][cc];
          }
        }
        for (let i = 0; i < clues.length; i++) {
          assigned[i] = savedAssigned[i];
          solution[i] = savedSolution[i];
        }
      }

      return false;
    };

    const found = backtrack();
    const timeMs = performance.now() - t0;

    if (found) {
      return {
        solution: solution
          .filter(s => s !== null)
          .map(s => ({
            startRow: s![0], startCol: s![1], endRow: s![2], endCol: s![3]
          })),
        timeMs,
        nodesExplored,
        solverType: 'cp'
      };
    }
    return { solution: [], timeMs, nodesExplored, solverType: 'cp' };
  }

  // ─────────────────────────────────────────────────
  //  Validación local del tablero
  // ─────────────────────────────────────────────────
  validateSolution(board: Board, rectangles: Rectangle[]): boolean {
    const n = board.rows;
    const cells = board.cells;
    const coverage: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

    for (const rect of rectangles) {
      // Cada rectángulo debe contener exactamente una pista y su área debe coincidir
      const area = (rect.endRow - rect.startRow + 1) * (rect.endCol - rect.startCol + 1);
      let clueCount = 0;
      let clueValue = 0;

      for (let r = rect.startRow; r <= rect.endRow; r++) {
        for (let c = rect.startCol; c <= rect.endCol; c++) {
          if (r < 0 || r >= n || c < 0 || c >= n) return false;
          coverage[r][c]++;
          if (cells[r][c] > 0) {
            clueCount++;
            clueValue = cells[r][c];
          }
        }
      }

      // Exactamente una pista, y el área coincide con su valor
      if (clueCount !== 1 || area !== clueValue) return false;
    }

    // Todas las celdas deben estar cubiertas exactamente una vez
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (coverage[r][c] !== 1) return false;
      }
    }

    return true;
  }
}
