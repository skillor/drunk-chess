import { Chess, PieceSymbol } from "chess.js";
import { AudioService } from "../audio/audio.service";
import { RemoteService } from "../remote/remote.service";
import { Board } from "./board.model";
import { GameService } from "./game.service";
import { PlayerController } from "./player.controller";

export class PlayerHostController extends PlayerController {
  constructor(
    private remoteService: RemoteService,
    gameService: GameService,
    audioService: AudioService,
  ) {
    super(gameService, audioService);
  }

  override async makeMove(game: Chess, board: Board, from: string, to: string, promotion: PieceSymbol): Promise<void> {
    const fen = game.fen();
    await super.makeMove(game, board, from, to, promotion);
    this.remoteService.broadcast('move', {fen, from, to, promotion});
  }
}
