import { Component, OnInit } from '@angular/core';
import { LeaderboardEntry } from '../../models/shikaku.model';
import { ShikakuService } from '../../services/shikaku.service';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit {
  entries: LeaderboardEntry[] = [];
  loading = true;
  error = '';

  constructor(private shikakuService: ShikakuService) {}

  ngOnInit(): void {
    this.shikakuService.getLeaderboard().subscribe({
      next: (entries) => {
        this.entries = entries;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el ranking.';
        this.loading = false;
      }
    });
  }

  rankClass(rank: number): string {
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    return '';
  }

  rankMedal(rank: number): string {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  }
}
