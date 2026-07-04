import 'chartjs-adapter-moment';

import { CommonModule, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgParticlesModule } from 'ng-particles';

import { PrimeNGModule } from '../prime-ng.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BackgroundParticlesComponent } from './components/background-particles/background-particles.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SettingsComponent } from './components/settings/settings.component';
import { SplashComponent } from './components/splash/splash.component';
import { UserAgentLinkComponent } from './components/user-agent-link/user-agent-link.component';
import { WorkerGroupComponent } from './components/worker-group/worker-group.component';
import { WorkerComponent } from './components/worker/worker.component';
import { AppLayoutModule } from './layout/app.layout.module';
import { DateAgoPipe } from './pipes/date-ago.pipe';
import { HashSuffixPipe } from './pipes/hash-suffix.pipe';
import { NumberSuffixPipe } from './pipes/number-suffix.pipe';
import { AverageTimeToBlockPipe } from './pipes/average-time-to-block.pipe';
import { PplnsPoolInfoComponent } from './components/pplns-pool-info/pplns-pool-info.component';
import { PplnsMinerStatusComponent } from './components/pplns-miner-status/pplns-miner-status.component';
import { PplnsPayoutHistoryComponent } from './components/pplns-payout-history/pplns-payout-history.component';
import { PoolModeBannerComponent } from './components/pool-mode-banner/pool-mode-banner.component';
import { PplnsAccountSettingsComponent } from './components/pplns-account-settings/pplns-account-settings.component';



@NgModule({
  declarations: [
    AppComponent,
    SplashComponent,
    DashboardComponent,
    WorkerComponent,
    NumberSuffixPipe,
    DateAgoPipe,
    WorkerGroupComponent,
    BackgroundParticlesComponent,
    HashSuffixPipe,
    SettingsComponent,
    UserAgentLinkComponent,
    PplnsPoolInfoComponent,
    PplnsMinerStatusComponent,
    PplnsPayoutHistoryComponent,
    PoolModeBannerComponent,
    PplnsAccountSettingsComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    PrimeNGModule,
    AppLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    NgParticlesModule,
    AverageTimeToBlockPipe
  ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
