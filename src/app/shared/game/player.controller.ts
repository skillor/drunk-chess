import { Chess } from "chess.js";
import { Board } from "./board.model";
import { Controller } from "./controller";
import { GameService } from "./game.service";

export class PlayerController extends Controller {
  moveResolve = () => {};

  constructor (
    private gameService: GameService,
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
    const legal = await this.gameService.makeMove(game, source, target);
    board.removeGreySquares();
    board.position(game.fen());
    if (!legal) {
      return 'snapback';
    }
    this.moveResolve();
  }

  override async onMouseoverSquare(game: Chess, board: Board, square: string) {
    const toSquares = await this.gameService.legalMoves(game, square);
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
