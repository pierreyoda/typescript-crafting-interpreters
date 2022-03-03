import { Expression } from ".";

const parenthesize = (name: string, ...expressions: readonly Expression[]): string => {
  let output = `(${name}`;
  for (const expression of expressions) {
    output += ` ${printExpression(expression)}`;
  }
  output += ")";
  return output;
};

export const printExpression = (expression: Expression): string => {
  switch (expression.type) {
    case "binary": return parenthesize(expression.operator.getLexeme(), expression.left, expression.right);
  }
};
