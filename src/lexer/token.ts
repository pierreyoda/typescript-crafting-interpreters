import { LoxLiteral } from "../literal";
import { TokenType } from "./token-types";

export class Token {
  constructor(
    private readonly type: TokenType,
    private readonly lexeme: string,
    private readonly literal: LoxLiteral,
    private readonly line: number,
  ) {}

  getType(): TokenType {
    return this.type;
  }

  getLexeme(): string {
    return this.lexeme;
  }

  getLiteral(): LoxLiteral {
    return this.literal;
  }

  getLine(): number {
    return this.line;
  }

  toString() {
    return `${this.type} ${this.lexeme} ${this.literal}`;
  }
}
