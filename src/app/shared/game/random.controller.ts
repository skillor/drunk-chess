import { Chess, PieceSymbol } from "chess.js";
import { AudioService } from "../audio/audio.service";
import { AudioController } from "./audio.controller";
import { Board } from "./board.model";
import { GameService } from "./game.service";

export class RandomController extends AudioController {
  constructor (
    gameService: GameService,
    audioService: AudioService,
  ) {
    super(gameService, audioService);
  }

  override async makeMove(game: Chess, board: Board, from: string, to: string, promotion: PieceSymbol): Promise<void> {
    await super.makeMove(game, board, from, to, promotion);
    this.gameService.move(game, from, to, promotion);
    board.position(game.fen());
  }

  override async waitMove(game: Chess, board: Board): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const from = this.gameService.possibleSquaresForMove(game);
    while (from.length > 0) {
      const randomFrom = from.splice(Math.floor(Math.random() * from.length), 1)[0];
      const to = await this.gameService.legalMoves(game, randomFrom);
      if (to.length > 0) {
        const randomTo = to[Math.floor(Math.random() * to.length)];
        const legal = await this.gameService.legalMove(game, randomFrom, randomTo);
        if (legal) {
          await this.makeMove(game, board, randomFrom, randomTo, 'q');
          return;
        }
      }
    }
    console.log('found no move');
  }
}
