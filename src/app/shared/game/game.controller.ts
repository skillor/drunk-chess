import { Chess } from "chess.js";
import { Board } from "./board.model";
import { Controller } from "./controller";

export class GameController extends Controller {
  getActiveController(game: Chess): Controller {
    if (game.turn() == 'w') return this.white;
    return this.black;
  }

  constructor(
    private white: Controller,
    private black: Controller,
    public defaultOrientation: 'white' | 'black' = 'white') {
    super();
  }

  override async makeMove(game: Chess, board: Board): Promise<void> {
    while (!game.isGameOver()) {
      await this.getActiveController(game).makeMove(game, board);
    }
  }

  override onDragStart(game: Chess, board: Board, source: string, piece: string): boolean {
    return this.getActiveController(game).onDragStart(game,board, source, piece);
  }
  override onDrop(game: Chess, board: Board, source: string, target: string, piece: string): Promise<string | void> {
    return this.getActiveController(game).onDrop(game, board, source, target, piece);
  }
  override onMouseoverSquare(game: Chess, board: Board, square: string): Promise<void> {
    return this.getActiveController(game).onMouseoverSquare(game, board, square);
  }
  override onMouseoutSquare(game: Chess, board: Board): void {
    return this.getActiveController(game).onMouseoutSquare(game, board);
  }
}
