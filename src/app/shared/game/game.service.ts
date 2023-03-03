import { Injectable } from '@angular/core';
import { Chess, Color, Piece, PieceSymbol, Square, SQUARES } from 'chess.js';
import { StockfishScore, StockfishService } from '../stockfish/stockfish.service';
import { GameController } from './game.controller';
import { PlayerController } from './player.controller';
import { RandomController } from './random.controller';

@Injectable()
export class GameService {

  defaultSettings = {
    drunkCpPenalty: 50,
    sfWorkers: 32,
    sfDepth: 5,
    allowTrash: true,
    allowSpawn: true,
    allowCaptureOwn: false,
  };
  settings = {...this.defaultSettings};


  constructor(
    private stockfish: StockfishService,
  ) {
    this.loadSettings();
  }

  resetSettings(): void {
    this.settings = this.defaultSettings;
    localStorage.removeItem('settings');
  }

  loadSettings(): void {
    const s = localStorage.getItem('settings');
    if (!s) return;
    this.settings = {...this.settings, ...JSON.parse(s)};
  }

  saveSettings(): void {
    localStorage.setItem('settings', JSON.stringify(this.settings));
  }

  cacheScore?: StockfishScore;
  cachedLegal: {[from: string]: string[]} = {};
  gameController?: GameController;

  reset() {
    this.gameController = undefined;
    this.cacheScore = undefined;
    this.cachedLegal = {};
    this.stockfish.setWorkers(0);
  }

  getController(): GameController {
    if (this.gameController) return this.gameController;
    if (Math.random() > 0.5) return new GameController(
      new RandomController(this),
      new PlayerController(this),
      'black'
    );
    return new GameController(
      new PlayerController(this),
      new RandomController(this),
      'white'
    );
  }

  move(game: Chess, from: string, to: string, promotion: PieceSymbol = 'q'): boolean {
    try {
      game.move({from, to, promotion});
      return true;
    } catch {}
    let p: Piece;
    if (from.startsWith('spare')) {
      p = {color: <Color>from[5], type: <PieceSymbol>(from[6].toLowerCase())};
    } else {
      p = game.remove(<Square>from);
    }
    if (to != 'offboard') {
      if (!this.settings.allowCaptureOwn) {
        const top = game.get(<Square>to);
        if (top && top.color == game.turn()) return false;
      }
      if (p.type == 'p') {
        if (p.color == 'w' && to[1] == '8') {
          p.type = promotion;
        } else if (p.color == 'b' && to[1] == '1') {
          p.type = promotion;
        }
      }
      game.put(p, <Square>to);
    }
    if (game.inCheck()) return false;
    const tokens = game.fen().split(" ");
    tokens[1] = game.turn() === "b" ? "w" : "b";
    tokens[3] = "-";
    game.load(tokens.join(" "));
    return true;
  }

  async calcScore(game: Chess): Promise<StockfishScore> {
    return (await this.stockfish.analyzePosition(game.fen(), this.settings.sfDepth, this.settings.sfWorkers)).score;
  }

  async getScore(game: Chess): Promise<StockfishScore> {
    if (!this.cacheScore) {
      this.cacheScore = await this.calcScore(game);
      this.cacheScore.value = -this.cacheScore.value;
    }
    return this.cacheScore;
  }

  async calcLegalMoves(game: Chess, from: string): Promise<string[]> {
    const fromSquare = <Square>from;
    let legalTos: string[] = [];
    const toSquares: string[] = [...SQUARES];
    if (!from.startsWith('spare')) {
      const piece = game.get(fromSquare);
      if (!piece || piece.color != game.turn()) return [];
      legalTos = game.moves({
        square: fromSquare,
        verbose: true,
      }).map(m => m.to);
      if (this.settings.allowTrash && game.get(fromSquare).type != 'k') toSquares.push('offboard');
    } else {
      if (from[5] != game.turn()) return [];
    }

    const final: string[] = [];
    const positions: string[] = [];
    for (let to of toSquares) {
      if (from == to) continue;
      if (legalTos.includes(to)) continue;
      if (game.get(<Square>to).type == 'k') continue;
      const tg = new Chess(game.fen());
      const legal = this.move(tg, from, to);
      if (!legal) continue;
      if (tg.isGameOver()) continue;
      positions.push(tg.fen());
      final.push(to);
    }
    const r = await this.stockfish.analyzePositions(positions, this.settings.sfDepth, this.settings.sfWorkers);
    for (let i=0; i<r.length; i++) {
      const score = await this.getScore(game);
      // console.log(final[i], this.stockfish.mateScore(score), this.stockfish.mateScore(r[i].score));
      if (this.stockfish.mateScore(score) <= this.stockfish.mateScore(r[i].score) - this.settings.drunkCpPenalty) {
        legalTos.push(final[i]);
      }
    }
    return legalTos;
  }

  async legalMoves(game: Chess, from: string): Promise<string[]> {
    const cache = this.cachedLegal[from];
    if (cache !== undefined) return cache;
    const t = await this.calcLegalMoves(game, from);
    this.cachedLegal[from] = t;
    return t;
  }

  async makeMove(game: Chess, from: string, to: string): Promise<boolean> {
    if (from.startsWith('spare') && to == 'offboard') return false;
    if (from == to) return false;
    const legal = await this.legalMoves(game, from);
    if (legal.includes(to)) {
      this.move(game, from, to);
      this.cachedLegal = {};
      delete this.cacheScore;
      return true;
    }
    return false;
  }

  possibleSquaresForMove(game: Chess): string[] {
    const from: string[] = [];
    const turn = game.turn();
    if (this.settings.allowSpawn) {
      from.push(...[
        `spare${turn}P`,
        `spare${turn}N`,
        `spare${turn}B`,
        `spare${turn}R`,
        `spare${turn}Q`,
      ]);
    }
    for (let square of SQUARES) {
      if (game.get(square).color == turn) from.push(square);
    }
    return from;
  }
}
