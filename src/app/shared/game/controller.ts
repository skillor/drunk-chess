import { Chess, PieceSymbol } from "chess.js";
import { Board } from "./board.model";

export class Controller {
  public pov: 'w' | 'b' = 'w';
  async makeMove(game: Chess, board: Board, from: string, to: string, promotion: PieceSymbol): Promise<void> {};
  async waitMove(game: Chess, board: Board): Promise<void> {};
  onDragStart(game: Chess, board: Board, source: string, piece: string): boolean { return false; };
  async onDrop(game: Chess, board: Board, source: string, target: string, piece: string): Promise<string | void> {};
  async onMouseoverSquare(game: Chess, board: Board, square: string): Promise<void> {};
  onMouseoutSquare(game: Chess, board: Board): void {};
}
