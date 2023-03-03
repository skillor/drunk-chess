import { Chess } from "chess.js";
import { RemoteService } from "../remote/remote.service";
import { Board } from "./board.model";
import { GameService } from "./game.service";
import { PlayerController } from "./player.controller";

export class PlayerHostController extends PlayerController {
  constructor(
    gameService: GameService,
    private remoteService: RemoteService,
  ) {
    super(gameService);
  }

  override async makeMove(game: Chess, board: Board): Promise<void> {
    const move = await super.makeMove(game, board);
    this.remoteService.broadcast('position', game.fen());
    return move;
  }
}
