import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  private PARTICLES = 'PARTICLES';

  private _particles$: BehaviorSubject<boolean>;
  public particles$: Observable<boolean>;

  constructor() {
    this._particles$ = new BehaviorSubject<boolean>(this.getParticles());
    this.particles$ = this._particles$.asObservable().pipe(shareReplay({ refCount: true, bufferSize: 1 }));
  }

  private get(key: string): string | null {
    return localStorage.getItem(key);
  }

  private set(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  private remove(key: string): void {
    localStorage.removeItem(key);
  }


  public getParticles(): boolean {
    const result = this.get(this.PARTICLES);
    return result == null || JSON.parse(result)?.particles === true;
  }

  public setParticles(particles: boolean) {
    this.set(this.PARTICLES, JSON.stringify({ particles }));
    this._particles$.next(particles);

  }

  // Phase 2 miner login (concept doc §11): one JWT per address, namespaced
  // so a browser that's logged into multiple payout addresses doesn't clobber
  // its own tokens.
  public getAuthToken(address: string): string | null {
    return this.get(`AUTH_TOKEN_${address}`);
  }

  public setAuthToken(address: string, token: string): void {
    this.set(`AUTH_TOKEN_${address}`, token);
  }

  public clearAuthToken(address: string): void {
    this.remove(`AUTH_TOKEN_${address}`);
  }

}
