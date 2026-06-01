import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Board, LeaderboardEntry, Rectangle, SolverType } from '../models/shikaku.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ShikakuService {
  private api = 'http://localhost:8000';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getLeaderboard(): Observable<LeaderboardEntry[]> {
    return this.http.get<LeaderboardEntry[]>(`${this.api}/leaderboard`);
  }

  getBoard(difficulty: string): Observable<any> {
    return this.http.get(`${this.api}/board?difficulty=${difficulty}`);
  }

  getGameLevel(id: number): Observable<any> {
    return this.http.get(`${this.api}/game/level/${id}`);
  }

  solve(board: Board, solverType: SolverType, difficulty?: string, level?: number, elapsedSecs?: number): Observable<any> {
    return this.http.post(
      `${this.api}/solve`,
      { board, solver_type: solverType, difficulty, level, elapsed_secs: elapsedSecs },
      { headers: this.authService.authHeaders() }
    );
  }

  validate(
    board: Board,
    rectangles: Rectangle[],
    difficulty?: string,
    level?: number,
    timeSecs?: number,
    hintsUsed?: number,
    solveUsed?: boolean
  ): Observable<any> {
    return this.http.post(
      `${this.api}/validate`,
      { board, rectangles, difficulty, level, time_secs: timeSecs, hints_used: hintsUsed, solve_used: solveUsed },
      { headers: this.authService.authHeaders() }
    );
  }

  hint(board: Board, userRectangles: Rectangle[], difficulty?: string, level?: number, elapsedSecs?: number): Observable<any> {
    return this.http.post(
      `${this.api}/hint`,
      { board, user_rectangles: userRectangles, difficulty, level, elapsed_secs: elapsedSecs },
      { headers: this.authService.authHeaders() }
    );
  }

  startSession(difficulty: string, level: number): Observable<any> {
    return this.http.post(
      `${this.api}/analytics/session/start`,
      { difficulty, level },
      { headers: this.authService.authHeaders() }
    );
  }
}
