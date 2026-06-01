import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../services/auth.service';

interface ChartItem {
  label: string;
  value: number;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profile: any = null;
  stats: any = null;
  history: any[] = [];
  loading = true;
  error = '';

  levelsChart: ChartItem[] = [];
  algorithmsChart: ChartItem[] = [];
  manualTimesChart: ChartItem[] = [];
  hintsChart: ChartItem[] = [];
  activityChart: ChartItem[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    forkJoin({
      profile: this.authService.getProfile(),
      stats: this.authService.getStats(),
      history: this.authService.getHistory()
    }).subscribe({
      next: ({ profile, stats, history }: any) => {
        this.profile = profile;
        this.stats = stats;
        this.history = history.games || [];
        this.buildCharts();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar perfil', err);
        this.error = 'No se pudo cargar el perfil.';
        this.loading = false;
      }
    });
  }

  max(items: ChartItem[]): number {
    return Math.max(...items.map(item => item.value), 1);
  }

  barWidth(value: number, items: ChartItem[]): string {
    return `${Math.max((value / this.max(items)) * 100, value > 0 ? 8 : 0)}%`;
  }

  private buildCharts(): void {
    const levels = this.stats.levelsByDifficulty;
    const algorithms = this.stats.algorithmUsage;
    const manualTimes = this.stats.manualTimesByDifficulty;

    this.levelsChart = [
      { label: 'Easy', value: levels.easy },
      { label: 'Medium', value: levels.medium },
      { label: 'Hard', value: levels.hard }
    ];

    this.algorithmsChart = [
      { label: 'Backtracking', value: algorithms.bt },
      { label: 'Constraint Propagation', value: algorithms.cp }
    ];

    this.manualTimesChart = [
      { label: 'Easy', value: manualTimes.easy.average },
      { label: 'Medium', value: manualTimes.medium.average },
      { label: 'Hard', value: manualTimes.hard.average }
    ];

    this.hintsChart = Object.entries(this.stats.hintsByDay).map(([label, value]) => ({
      label,
      value: Number(value)
    }));

    this.activityChart = Object.entries(this.stats.activityByDay).map(([label, value]) => ({
      label,
      value: Number(value)
    }));
  }
}
