import { TokenType } from "./token-types";

export class Token {
  constructor(
    private type: TokenType,
    private lexeme: string,
    private literal: unknown,
    private line: number,
  ) {}

  toString() {
    return `${this.type} ${this.lexeme} ${this.literal}`;
  }
}
