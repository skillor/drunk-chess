import { Chess } from "chess.js";
import { RemoteService } from "../remote/remote.service";
import { Board } from "./board.model";
import { Controller } from "./controller";

export class WaitClientController extends Controller {
  constructor(
    private remoteService: RemoteService,
  ) {
    super();
  }

  override makeMove(game: Chess, board: Board): Promise<void> {
    return new Promise((resolve) => {
      this.remoteService.on('position', (fen) => {
        board.position(fen);
        game.load(fen);
        resolve();
      });
    });
  }
}
