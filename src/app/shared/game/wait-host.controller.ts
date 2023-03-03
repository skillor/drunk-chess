import { Chess } from "chess.js";
import { RemoteService } from "../remote/remote.service";
import { Board } from "./board.model";
import { Controller } from "./controller";
import { GameService } from "./game.service";

export class WaitHostController extends Controller {
  constructor(
    private gameService: GameService,
    private remoteService: RemoteService,
  ) {
    super();
  }

  override makeMove(game: Chess, board: Board): Promise<void> {
    return new Promise((resolve) => {
      this.remoteService.on('legalMoves', async ({square}, conn) => {
        const toSquares = await this.gameService.legalMoves(game, square);
        this.remoteService.send(conn, 'legalMoves', {toSquares});
      });
      this.remoteService.on('makeMove', async ({source, target}, conn) => {
        const legal = await this.gameService.makeMove(game, source, target);
        const fen = game.fen();
        board.position(fen);
        this.remoteService.send(conn, 'makeMove', {fen, legal});
        if (legal) {
          resolve();
        };
      });
    });
  }
}
