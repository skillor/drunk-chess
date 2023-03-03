import { Chess } from "chess.js";
import { Board } from "./board.model";
import { Controller } from "./controller";
import { GameService } from "./game.service";

export class RandomController extends Controller {
  constructor (
    private gameService: GameService,
  ) {
    super();
  }

  override async makeMove(game: Chess, board: Board): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const from = this.gameService.possibleSquaresForMove(game);
    while (from.length > 0) {
      const randomFrom = from.splice(Math.floor(Math.random() * from.length), 1)[0];
      const to = await this.gameService.legalMoves(game, randomFrom);
      if (to.length > 0) {
        const randomTo = to[Math.floor(Math.random() * to.length)];
        const legal = await this.gameService.makeMove(game, randomFrom, randomTo);
        if (legal) {
          board.position(game.fen());
          return;
        }
      }
    }
    console.log('found no move');
  }
}
