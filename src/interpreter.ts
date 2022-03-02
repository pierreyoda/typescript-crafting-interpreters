import chalk from "chalk";

export class LoxInterpreter {
  hadError = false;

  reportError(line: number, where: string, message: string) {
    console.error(chalk.red(`[line "${line}"] Error ${where}: ${message}`));
    this.hadError = true;
  }

  error(line: number, message: string) {
    this.reportError(line, "", message);
  }

  run(source: string) {
    if (this.hadError) {
      process.exit(65);
    }
  }
}
