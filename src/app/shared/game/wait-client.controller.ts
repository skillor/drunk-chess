import { Chess } from "chess.js";
import { AudioService } from "../audio/audio.service";
import { RemoteService } from "../remote/remote.service";
import { AudioController } from "./audio.controller";
import { Board } from "./board.model";
import { GameService } from "./game.service";

export class WaitClientController extends AudioController {
  constructor(
    private remoteService: RemoteService,
    gameService: GameService,
    audioService: AudioService,
  ) {
    super(gameService, audioService);
  }

  override waitMove(game: Chess, board: Board): Promise<void> {
    return new Promise((resolve) => {
      this.remoteService.on('move', async ({fen, from, to, promotion}) => {
        game.load(fen);
        await this.makeMove(game, board, from, to, promotion);
        this.gameService.move(game, from, to, promotion);
        board.position(game.fen());
        resolve();
      });
    });
  }
}
