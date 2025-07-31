const world = 'world';

export function hello(who: string = world): string {
  return `Hello ${who}! `;
}

hello('Mermaid Codegen');
console.log(hello('Mermaid Codegen'));