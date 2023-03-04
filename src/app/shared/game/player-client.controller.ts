import { Chess } from "chess.js";
import { AudioService } from "../audio/audio.service";
import { RemoteService } from "../remote/remote.service";
import { Board } from "./board.model";
import { GameService } from "./game.service";
import { PlayerController } from "./player.controller";

export class PlayerClientController extends PlayerController {
  constructor(
    private remoteService: RemoteService,
    gameService: GameService,
    audioService: AudioService,
  ) {
    super(gameService, audioService);
  }

  override async onDrop(game: Chess, board: Board, source: string, target: string, piece: string): Promise<string | void> {
    if (source == 'spare') source += piece;
    const promotion = 'q';
    const {fen, legal} = await this.remoteService.waitForResponse('waitMove', {source, target, promotion});
    board.removeGreySquares();
    board.position(fen);
    if (!legal) {
      await this.illegalMove(game, board, source, target, promotion);
      return 'snapback';
    }
    await this.makeMove(game, board, source, target, promotion);
  }

  override async onMouseoverSquare(game: Chess, board: Board, square: string) {
    const {toSquares} = await this.remoteService.waitForResponse('legalMoves', {square});
    if (board.getLastSquare() != square) return;
    board.removeGreySquares();
    for (let square of toSquares) {
      board.greySquare(square);
    }
  }
}
