import { Expression } from "../ast";
import { Token } from "../lexer/token";
import { TokenType } from "../lexer/token-types";
import { ParserReportErrorFunction } from "../errors";

export class ParserError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class Parser {
  /** Index of the currently parsed token. */
  private current = 0;

  constructor(
    private readonly reportError: ParserReportErrorFunction,
    private readonly tokens: readonly Token[],
  ) {}

  parse(): Expression | null {
    try {
      return this.handleExpression();
    } catch (err) {
      return null;
    }
  }

  /**
   * Discards tokens until it founds a statement boundary.
   *
   * Meant to be called after a `ParserError` is thrown to get back in sync.
   */
  private synchronize() {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().getType() === "SEMICOLON") {
        return;
      }

      switch (this.peek().getType()) {
        case "CLASS":
        case "FUN":
        case "VAR":
        case "FOR":
        case "IF":
        case "WHILE":
        case "PRINT":
        case "RETURN":
          return;
      }

      this.advance();
    }
  }

  private handleExpression(): Expression {
    return this.handleEquality();
  }

  private handleEquality(): Expression {
    let expression = this.handleComparison();

    while (this.match("BANG_EQUAL", "EQUAL_EQUAL")) {
      const operator = this.previous();
      const right = this.handleComparison();
      expression = {
        type: "binary",
        left: expression,
        operator,
        right,
      };
    }

    return expression;
  }

  private handleComparison(): Expression {
    let expression = this.handleTerm();

    while (this.match("GREATER", "GREATER_EQUAL", "LESS", "LESS_EQUAL")) {
      const operator = this.previous();
      const right = this.handleTerm();
      expression = {
        type: "binary",
        left: expression,
        operator,
        right,
      };
    }

    return expression;
  }

  private handleTerm(): Expression {
    let expression = this.handleUnary();

    while (this.match("SLASH", "STAR")) {
      const operator = this.previous();
      const right = this.handleUnary();
      expression = {
        type: "binary",
        left: expression,
        operator,
        right,
      };
    }

    return expression;
  }

  private handleUnary(): Expression {
    if (this.match("BANG", "MINUS")) {
      const operator = this.previous();
      const right = this.handleUnary();
      return {
        type: "unary",
        operator,
        right,
      };
    }
    return this.handlePrimary();
  }

  private handlePrimary(): Expression {
    if (this.match("FALSE")) {
      return { type: "literal", literal: false };
    }
    if (this.match("TRUE")) {
      return { type: "literal", literal: true };
    }
    if (this.match("NIL")) {
      return { type: "literal", literal: null };
    }

    if (this.match("NUMBER", "STRING")) {
      return { type: "literal", literal: this.previous().getLiteral() };
    }

    if (this.match("LEFT_PAREN")) {
      const expression = this.handleExpression();
      this.consume("RIGHT_PAREN", "Expect ')' after expression.");
      return { type: "grouping", expression };
    }

    throw this.error(this.peek(), "Expect expression.");
  }

  /**
   * Advances and returns true if the current token matches any of the given types.
   */
  private match(...types: readonly TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  /**
   * Advances and returns the previous token if the expected token type is encountered.
   *
   * Throws an error otherwise.
   */
  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) {
      return this.advance();
    }
    throw this.error(this.peek(), message);
  }

  /**
   * Consumes the current token and returns it.
   */
  private advance(): Token {
    if (!this.isAtEnd()) {
      ++this.current;
    }
    return this.previous();
  }

  /**
   * Returns true if the current token is of the given type.
   */
  private check(type: TokenType): boolean {
    return this.isAtEnd() ? false : this.peek().getType() === type;
  }

  /**
   * Returns the previously parsed token.
   */
  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  /**
   * Returns the currently parsed token.
   */
  private peek(): Token {
    return this.tokens[this.current];
  }

  /**
   * Returns true if there are no more tokens to parse.
   */
  private isAtEnd(): boolean {
    return this.peek().getType() === "EOF";
  }

  private error(token: Token, message: string): ParserError {
    this.reportError(token, message);
    return new ParserError(message);
  }
}
