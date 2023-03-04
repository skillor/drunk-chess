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
      this.remoteService.on('legalMoves', async ({square}, conn, id) => {
        const toSquares = await this.gameService.legalMoves(game, square);
        this.remoteService.send(conn, 'legalMoves', {toSquares}, id);
      });
      this.remoteService.on('waitMove', async ({source, target, promotion}, conn, id) => {
        const legal = await this.gameService.legalMove(game, source, target);
        if (!legal) {
          this.remoteService.send(conn, 'waitMove', {fen: game.fen(), legal}, id);
          return;
        }
        await this.makeMove(game, board, source, target, promotion);
        this.gameService.move(game, source, target, promotion);
        const fen = game.fen();
        this.remoteService.send(conn, 'waitMove', {fen, legal}, id);
        board.position(fen);
        resolve();
      });
    });
  }
}
