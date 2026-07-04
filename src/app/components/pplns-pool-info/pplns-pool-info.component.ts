import { Component } from '@angular/core';
import { combineLatest, map, Observable, shareReplay } from 'rxjs';

import { PplnsService } from '../../services/pplns.service';

// Concept doc §10.4 "Pool-wide PPLNS window info" + "Fee & threshold
// disclosure": pool-wide, not address-scoped, so it lives on the splash page
// rather than the per-address dashboard.
@Component({
  selector: 'app-pplns-pool-info',
  templateUrl: './pplns-pool-info.component.html',
  styleUrls: ['./pplns-pool-info.component.scss']
})
export class PplnsPoolInfoComponent {

  public info$: Observable<{
    windowMinutes: number;
    totalDifficultyInWindow: number;
    activeMinerCount: number;
    feePercent: number;
    minPayoutThresholdSats: number;
    payoutIntervalMinutes: number;
  }>;

  constructor(
    private pplnsService: PplnsService
  ) {
    this.info$ = combineLatest([
      this.pplnsService.getPplnsWindowStats(),
      this.pplnsService.getFeeInfo()
    ]).pipe(
      map(([windowStats, feeInfo]) => ({ ...windowStats, ...feeInfo })),
      shareReplay({ refCount: true, bufferSize: 1 })
    );
  }
}
