import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';

import { IPendingBalance, PplnsService } from '../../services/pplns.service';

// Concept doc §10.4 "Miner dashboard — pending balance".
@Component({
  selector: 'app-pplns-miner-status',
  templateUrl: './pplns-miner-status.component.html',
  styleUrls: ['./pplns-miner-status.component.scss']
})
export class PplnsMinerStatusComponent implements OnChanges {

  @Input() address!: string;

  public balance$!: Observable<IPendingBalance>;

  constructor(
    private pplnsService: PplnsService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['address'] && this.address) {
      this.balance$ = this.pplnsService.getPendingBalance(this.address).pipe(
        shareReplay({ refCount: true, bufferSize: 1 })
      );
    }
  }
}
