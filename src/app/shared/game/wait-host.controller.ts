import { Chess, PieceSymbol } from "chess.js";
import { AudioService } from "../audio/audio.service";
import { RemoteService } from "../remote/remote.service";
import { AudioController } from "./audio.controller";
import { Board } from "./board.model";
import { GameService } from "./game.service";

export class WaitHostController extends AudioController {
  constructor(
    private remoteService: RemoteService,
    gameService: GameService,
    audioService: AudioService,
  ) {
    super(gameService, audioService);
  }

  override waitMove(game: Chess, board: Board): Promise<void> {
    return new Promise((resolve) => {
      this.remoteService.on('legalMoves', async ({square}, conn) => {
        const toSquares = await this.gameService.legalMoves(game, square);
        this.remoteService.send(conn, 'legalMoves', {toSquares});
      });
      this.remoteService.on('waitMove', async ({source, target, promotion}, conn) => {
        const legal = await this.gameService.legalMove(game, source, target);
        if (!legal) {
          this.remoteService.send(conn, 'waitMove', {fen: game.fen(), legal});
          return;
        }
        await this.makeMove(game, board, source, target, promotion);
        this.remoteService.send(conn, 'waitMove', {fen: game.fen(), legal});
        resolve();
      });
    });
  }
}
