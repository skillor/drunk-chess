import { Injectable } from '@angular/core';

@Injectable()
export class AudioService {
  constructor() { }

  playSfx(sfx: string): void {
    console.log('sfx: ' + sfx);
    const audio = new Audio();
    audio.src = `assets/sfx/${sfx}.ogg`;
    audio.load();
    audio.play();
  }
}
