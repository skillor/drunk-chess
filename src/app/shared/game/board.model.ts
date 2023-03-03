export interface Board extends Function {
  removeGreySquares(): void;
  greySquare(square: string): void;
  position(fen: string): void;
  resize(): void;
  orientation(side: string): void;
  getLastSquare(): string;
};
