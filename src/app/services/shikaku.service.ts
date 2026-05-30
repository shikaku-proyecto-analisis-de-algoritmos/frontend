import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Board, Rectangle } from '../models/shikaku.model';

@Injectable({ providedIn: 'root' })
export class ShikakuService {
  private api = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  getBoard(difficulty: string): Observable<any> {
    return this.http.get(`${this.api}/board?difficulty=${difficulty}`);
  }

  getGameLevel(id: number): Observable<any> {
    return this.http.get(`${this.api}/game/level/${id}`);
  }

  solve(board: Board): Observable<any> {
    return this.http.post(`${this.api}/solve`, { board });
  }

  validate(board: Board, rectangles: Rectangle[]): Observable<any> {
    return this.http.post(`${this.api}/validate`, { board, rectangles });
  }
}