import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Chess } from 'chess.js';
import { Board } from 'src/app/shared/game/board.model';
import { GameService } from 'src/app/shared/game/game.service';
declare const Chessboard: Board;
declare const $: any;

@Component({
  selector: 'app-play',
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.scss']
})
export class PlayComponent implements AfterViewInit {
  @ViewChild('chessboard')
  chessboard?: ElementRef;

  constructor(
    private router: Router,
    public gameService: GameService,
  ) {}

  quit() {
    this.router.navigate(['lobby']);
  }

  board?: Board;
  game = new Chess();
  gameEnded = false;
  ngAfterViewInit(): void {
    const nativeElement = this.chessboard?.nativeElement;
    const game = new Chess();

    let dragging = false;
    let lastSquare: string | undefined = undefined;


    const gameController = this.gameService.getController();

    function removeGreySquares() {
      $(nativeElement).find('.square-55d63').removeClass('highlight');
      $('#offboard-trash').removeClass('highlight');
    }

    function greySquare(square: string) {
      if (square == 'offboard') {
        $('#offboard-trash').addClass('highlight');
        return;
      }
      $(nativeElement).find('.square-' + square).addClass('highlight');
    }

    function onDragStart(source: string, piece: string): boolean {
      dragging = true;
      return gameController.onDragStart(game, board, source, piece);
    }

    async function onDrop(source: string, target: string, piece: string): Promise<string | void> {
      dragging = false;
      return await gameController.onDrop(game, board, source, target, piece);
    }

    async function onMouseoverSquare(square: string) {
      lastSquare = square;
      return await gameController.onMouseoverSquare(game, board, square);
    }

    function onMouseoutSquare() {
      lastSquare = undefined;
      return gameController.onMouseoutSquare(game, board);
    }

    const board = Chessboard(nativeElement, {
      orientation: gameController.getOrientation(),
      pieceTheme: 'assets/chesspieces/{piece}.svg',
      draggable: true,
      dropOffBoard: 'trash',
      sparePieces: true,
      position: game.fen(),
      onDragStart: onDragStart,
      onDrop: onDrop,
      onMouseoutSquare: onMouseoutSquare,
      onMouseoverSquare: onMouseoverSquare,
    });

    function spareHover() {
      $(nativeElement).find('.spare-pieces-7492f *').hover((e:any) => {
        onMouseoverSquare('spare' + e.target.getAttribute('data-piece'));
      }, (e:any) => {
        if (!dragging) onMouseoutSquare();
      });
    }
    spareHover();

    const _resize = board.resize;
    board.resize = (...args: any) => {
      const t  = _resize(...args);
      spareHover();
      return t;
    }
    const _orientation = board.orientation;
    board.orientation = (...args: any) => {
      const t  = _orientation(...args);
      spareHover();
      return t;
    }
    board.greySquare = greySquare;
    board.removeGreySquares = removeGreySquares;
    board.getLastSquare = () => lastSquare;

    this.board = board;
    this.game = game;
    gameController.waitMove(game, board).then(() => this.gameEnded = true).catch(() => {});
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.board?.resize();
  }
}
