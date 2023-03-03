import { Chess } from "chess.js";
import { Board } from "./board.model";
import { GameService } from "./game.service";

export class Controller {
  async makeMove(game: Chess, board: Board): Promise<void> {};
  onDragStart(game: Chess, board: Board, source: string, piece: string): boolean { return false; };
  async onDrop(game: Chess, board: Board, source: string, target: string, piece: string): Promise<string | void> {};
  async onMouseoverSquare(game: Chess, board: Board, square: string): Promise<void> {};
  onMouseoutSquare(game: Chess, board: Board): void {};
}
