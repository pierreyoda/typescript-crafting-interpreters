import { Token } from "./token";
import { LoxLiteral } from "../literal";
import { TokenType } from "./token-types";
import { ReportErrorFunction } from "../errors";
import { Keyword, tokenTypesPerKeyword } from "./keywords";

export class Lexer {
  private tokens: Token[] = [];
  /** Index of the first character in the lexeme being scanned. */
  private start = 0;
  /** Index of the character currently being considered. */
  private current = 0;
  /** Current line number. */
  private line = 1;

  constructor(private source: string) {}

  scanTokens(reportError: ReportErrorFunction): Token[] {
    while (!this.isAtEnd()) {
      // we are at the beginning of the next lexeme.
      this.start = this.current;
      this.scanToken(reportError);
    }
    this.tokens.push(new Token("EOF", "", null, this.line));
    return this.tokens;
  }

  private scanToken(reportError: ReportErrorFunction): void {
    const char = this.advance();
    switch (char) {
      case "(": this.addToken("LEFT_PAREN"); break;
      case ")": this.addToken("RIGHT_PAREN"); break;
      case "{": this.addToken("LEFT_BRACE"); break;
      case "}": this.addToken("RIGHT_BRACE"); break;
      case ",": this.addToken("COMMA"); break;
      case ".": this.addToken("DOT"); break;
      case "-": this.addToken("MINUS"); break;
      case "+": this.addToken("PLUS"); break;
      case ";": this.addToken("SEMICOLON"); break;
      case "*": this.addToken("STAR"); break;
      case "!":
        this.addToken(this.match("=") ? "BANG_EQUAL" : "BANG");
        break;
      case "=":
        this.addToken(this.match("=") ? "EQUAL_EQUAL" : "EQUAL");
        break;
      case "<":
        this.addToken(this.match("=") ? "LESS_EQUAL" : "LESS");
        break;
      case ">":
        this.addToken(this.match("=") ? "GREATER_EQUAL" : "GREATER");
        break;
      case "/":
        if (this.match("/")) {
          // a comment goes until the end of the line.
          while (this.peek() !== "\n" && !this.isAtEnd()) {
            this.advance();
          }
        } else {
          this.addToken("SLASH");
        }
        break;
      case " ":
      case "\r":
      case "\t":
        // ignore whitespace
        break;
      case "\n":
        ++this.line;
        break;
      case "\"":
        this.handleString(reportError);
        break;
      default:
        if (this.isDigit(char)) {
          this.handleNumber();
        } else if (this.isAlpha(char)) {
          this.handleIdentifier();
        }
        reportError(this.line, "Unexpected character.");
        break;
    }
  }

  private handleString(reportError: ReportErrorFunction): void {
    while (this.peek() != "\"" && !this.isAtEnd()) {
      if (this.peek() == "\n") {
        ++this.line;
      }
      this.advance();
    }

    if (this.isAtEnd()) {
      reportError(this.line, "Unterminated string.");
      return;
    }

    // the closing quote
    this.advance();

    // trim the surrounding quotes
    const value = this.source.substring(this.start + 1, this.current - 1);
    this.addToken("STRING", value)
  }

  private handleIdentifier(): void {
    while (this.isAlphaNumeric(this.peek())) {
      this.advance();
    }

    const text = this.source.substring(this.start, this.current);
    const type: TokenType | undefined = tokenTypesPerKeyword[text as Keyword];
    this.addToken(type ? type : "IDENTIFIER");
  }

  private handleNumber(): void {
    while (this.isDigit(this.peek())) {
      this.advance();
    }

    // look for a fractional part
    if (this.peek() == "." && this.isDigit(this.peekNext())) {
      // consume the "."
      this.advance();

      while (this.isDigit(this.peek())) {
        this.advance();
      }
    }

    this.addToken("NUMBER",
        Number(this.source.substring(this.start, this.current)));
  }

  private addToken(type: TokenType, literal?: LoxLiteral): void {
    const text = this.source.substring(this.start, this.current);
    this.tokens.push(new Token(type, text, literal ?? null, this.line));
  }

  /** Consumes the next character in the source file and returns it. */
  private advance(): string {
    return this.source.charAt(this.current++);
  }

  /**
   * Consumes the next character in the source file and returns true only if
   * it matches the given character.
   */
  private match(expected: string): boolean {
    if (this.isAtEnd()) {
      return false;
    }
    if (this.source.charAt(this.current) !== expected) {
      return false;
    }
    ++this.current;
    return true;
  }

  /** Returns the currently scanned character. */
  private peek(): string {
    if (this.isAtEnd()) {
      return "\0";
    }
    return this.source.charAt(this.current);
  }

  /** Returns the next character. */
  private peekNext(): string {
    if (this.current + 1 >= this.source.length) {
      return "\0";
    }
    return this.source.charAt(this.current + 1);
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  private isDigit(char: string): boolean {
    return char >= "0" && char <= "9";
  }

  private isAlpha(char: string): boolean {
    return (char >= 'a' && char <= 'z') ||
           (char >= 'A' && char <= 'Z') ||
            char == '_';
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }
}
