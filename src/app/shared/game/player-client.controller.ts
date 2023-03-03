import { Chess } from "chess.js";
import { RemoteService } from "../remote/remote.service";
import { Board } from "./board.model";
import { Controller } from "./controller";

export class PlayerClientController extends Controller {
  moveResolve = () => {};

  constructor(
    private remoteService: RemoteService,
  ) {
    super();
  }

  override makeMove(game: Chess, board: Board): Promise<void> {
    board.orientation(game.turn() == 'w' ? 'white' : 'black');
    return new Promise((resolve) => this.moveResolve = resolve);
  }

  override onDragStart(game: Chess, board: Board, source: string, piece: string): boolean {
    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
      return false;
    }
    return true;
  }

  override async onDrop(game: Chess, board: Board, source: string, target: string, piece: string): Promise<string | void> {
    if (source == 'spare') source += piece;
    const {fen, legal} = await this.remoteService.waitForResponse('makeMove', {source, target});
    board.removeGreySquares();
    board.position(fen);
    if (!legal) {
      return 'snapback';
    }
    this.moveResolve();
  }

  override async onMouseoverSquare(game: Chess, board: Board, square: string) {
    const {toSquares} = await this.remoteService.waitForResponse('legalMoves', {square});
    if (board.getLastSquare() != square) return;
    board.removeGreySquares();
    for (let square of toSquares) {
      board.greySquare(square);
    }
  }

  override onMouseoutSquare(game: Chess, board: Board) {
    board.removeGreySquares();
  }
}
