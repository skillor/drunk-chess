import { Chess, PieceSymbol } from "chess.js";
import { AudioService } from "../audio/audio.service";
import { Board } from "./board.model";
import { Controller } from "./controller";
import { GameService } from "./game.service";

export class AudioController extends Controller {
  constructor(
    protected gameService: GameService,
    private audioService: AudioService,
  ) {
    super();
  }

  override async makeMove(game: Chess, board: Board, from: string, to: string, promotion: PieceSymbol): Promise<void> {
    if (this.gameService.isGameOver(game, from, to, promotion)) {
      if (this.gameService.isStalemate(game, from, to)) return this.audioService.playSfx('stalemate');
      if (this.gameService.isDraw(game, from, to)) return this.audioService.playSfx('draw');
      if (game.turn() == this.pov) return this.audioService.playSfx('won');
      return this.audioService.playSfx('lost');
    }
    if (this.gameService.isCheck(game, from, to, promotion)) return this.audioService.playSfx('check');
    if (this.gameService.isCapture(game, from, to, promotion)) return this.audioService.playSfx('capture');
    return this.audioService.playSfx('move');
  }

  async illegalMove(game: Chess, board: Board, from: string, to: string, promotion: PieceSymbol): Promise<void> {
    if (from == to) return;
    return this.audioService.playSfx('illegal');
  }
}
