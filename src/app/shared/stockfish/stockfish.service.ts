import { Injectable } from '@angular/core';

export type StockfishScore = {type: string, value: number};
export type StockfishInfo = {
  score: StockfishScore,
  pv: string[],
};
export type StockfishWorker = {id: string, busy: boolean, worker: Worker};

@Injectable()
export class StockfishService {
  wasmSupported = typeof WebAssembly === 'object' && WebAssembly.validate(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
  workers: {[id: string]: StockfishWorker} = {};
  waitingForWorker: ((worker: StockfishWorker) => void)[] = [];
  lineHandlers: {[id: string]: (line: string) => void} = {};

  resetLineHandler(worker: StockfishWorker) {
    delete this.lineHandlers[worker.id];
  }

  setLineHandler(worker: StockfishWorker, handler: (line: string) => void) {
    this.lineHandlers[worker.id] = handler;
  }

  addWorker() {
    let id = 0
    if (Object.keys(this.workers).length > 0) {
      id = Math.max(...Object.keys(this.workers).map(x => Number(x))) + 1;
    }
    const worker = {
      id: String(id),
      busy: true,
      worker: new Worker(this.wasmSupported ? 'assets/stockfish.js/stockfish.wasm.js' : 'assets/stockfish.js/stockfish.js'),
    };
    worker.worker.onmessage = ({ data }) => {
      if (this.lineHandlers[id]) this.lineHandlers[id](data);
    };
    this.setLineHandler(worker, (line) => {
      if (line == 'uciok') this.finishWork(worker);
    });
    worker.worker.postMessage('uci');
    this.workers[id] = worker;
  }

  async removeWorker() {
    const worker = await this.waitForWorker();
    worker.worker.terminate();
    delete this.workers[worker.id];
  }

  setWorkers(n: number) {
    const workerAmount = Object.keys(this.workers).length;
    for (let i=0; i<n-workerAmount; i++) {
      this.addWorker();
    }
    for (let i=0; i<workerAmount-n; i++) {
      this.removeWorker();
    }
  }

  waitForWorker(): Promise<StockfishWorker> {
    return new Promise((resolve) => {
      for (let id of Object.keys(this.workers)) {
        if (!this.workers[id].busy) {
          this.workers[id].busy = true;
          return resolve(this.workers[id]);
        }
      }
      this.waitingForWorker.push(resolve);
    });
  }

  finishWork(worker: StockfishWorker) {
    this.resetLineHandler(worker);
    const waiting = this.waitingForWorker.shift();
    if (waiting) {
      return waiting(worker);
    }
    worker.busy = false;
  }

  parseInfo(line: string) {
    let i = 0;
    const sp = line.split(' ');
    const info: any = {};
    while (i < sp.length) {
      if (sp[i] == 'score') {
        info[sp[i]] = {type: sp[i+1], value: +sp[i+2]};
        i += 3;
      } else if (sp[i] == 'pv') {
        info[sp[i]] = sp.slice(i+1);
        i += sp.length;
      } else {
        info[sp[i]] = sp[i+1];
        i += 2;
      }
    }
    return info;
  }

  mateScore(score: StockfishScore, mateScore = 9999): number {
    if (score.type == 'cp') return score.value;
    if (score.value > 0) return mateScore - score.value;
    return -mateScore - score.value;
  }

  analyzePosition(fen: string, depth = 5, workers = 32): Promise<StockfishInfo> {
    this.setWorkers(workers);
    return new Promise(async (resolve) => {
      const worker = await this.waitForWorker();
      let info: any;
      this.setLineHandler(worker, (line) => {
        if (line.startsWith('info ')) {
          info = this.parseInfo(line.substring(5));
        } else if (line.startsWith('bestmove ')) {
          this.finishWork(worker);
          resolve(info);
        }
      });
      worker.worker.postMessage(`position fen ${fen}`);
      worker.worker.postMessage(`go limit depth ${depth}`);
    });
  }

  analyzePositions(fens: string[], depth = 5, workers = 32): Promise<StockfishInfo[]> {
    return Promise.all(fens.map((fen) => this.analyzePosition(fen, depth, workers)));
  }
}
