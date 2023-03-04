import { Chess, PieceSymbol } from "chess.js";
import { AudioService } from "../audio/audio.service";
import { AudioController } from "./audio.controller";
import { Board } from "./board.model";
import { Controller } from "./controller";
import { GameService } from "./game.service";

export class PlayerController extends AudioController {
  moveResolve = () => {};

  constructor (
    gameService: GameService,
    audioService: AudioService,
  ) {
    super(gameService, audioService);
  }

  override async makeMove(game: Chess, board: Board, from: string, to: string, promotion: PieceSymbol): Promise<void> {
    await super.makeMove(game, board, from, to, promotion);
    this.gameService.move(game, from, to, promotion);
    board.position(game.fen());
  }

  override waitMove(game: Chess, board: Board): Promise<void> {
    board.orientation(game.turn() == 'w' ? 'white' : 'black');
    return new Promise((resolve) => {
      this.moveResolve = () => {
        resolve();
      };
    });
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
    const legal = await this.gameService.legalMove(game, source, target);
    board.removeGreySquares();
    if (!legal) {
      board.position(game.fen());
      await this.illegalMove(game, board, source, target, 'q');
      return 'snapback';
    }
    await this.makeMove(game, board, source, target, 'q');
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
