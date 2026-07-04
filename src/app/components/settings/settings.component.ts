import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { LocalStorageService } from '../../services/local-storage.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {

  public stateOptions: any[] = [{ label: 'On', value: true }, { label: 'Off', value: false },];

  public value: boolean = true;
  public address: string;

  constructor(
    private localStorageService: LocalStorageService,
    private route: ActivatedRoute,
  ) {
    this.value = this.localStorageService.getParticles();
    this.address = this.route.snapshot.params['address'];
  }

  public particlesChanged(newVal: boolean) {
    this.localStorageService.setParticles(newVal);
    this.value = newVal;
  }
}
