import { Chess } from "chess.js";
import { AudioController } from "./audio.controller";
import { Board } from "./board.model";
import { Controller } from "./controller";

export class GameController extends Controller {
  getActiveController(game: Chess): Controller {
    if (game.turn() == 'w') return this.white;
    return this.black;
  }

  constructor(
    private white: AudioController,
    private black: AudioController,
    pov: 'w' | 'b' = 'w',
  ) {
    super();
    this.pov = pov;
    white.pov = pov;
    black.pov = pov;
  }

  getOrientation(): 'white' | 'black' {
    return this.pov == 'w' ? 'white' : 'black';
  }

  override async waitMove(game: Chess, board: Board): Promise<void> {
    while (!game.isGameOver()) {
      await this.getActiveController(game).waitMove(game, board);
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
