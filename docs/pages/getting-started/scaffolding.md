---
outline: deep
---


# Initializing the Application

Once the `minotaur` tool is installed, you can begin by setting up the default configuration within your application.

## Scaffolding by Example

In this tutorial, we will demonstrate how to initialize and install the foundational structure for your application. While the example uses the C# language, the same procedure applies to other languages.

::: info
If your language is not supported out of the box, you can easily initialize it using the C# base and then customize and create your own templates from scratch.

Please try to contribute the templates to add more funcitionality in the tool.
:::

1. Open the terminal and navigate to the root directory of your application.
2. Execute the following command: `Minotaur -l csharp -d .\`
3. Upon execution, the following folders and files will be created:

- `minotaur.config.json`
- `scaffolding\csharp\config.csharp.json`
- A set of [handlebars](https://handlebarsjs.com/) templates, such as `scaffolding\csharp\class.csharp.hbs`

## What does these files mean?

### Lets start with the main `minotaur.config.json` config

```json
{
  "TemplateDirectory": "scaffolding\\csharp",
  "MermaidDirectory": "SampleFiles\\Mermaid",
  "GeneratedDirectory": "src/",
  "YmlDirectory": "SampleFiles\\YmlToCode"
}
```

#### TemplateDirectory

The `TemplateDirectory` option refers to the location of where the [handlebars](https://handlebarsjs.com/) templates are defined.

::: info
You can also support multiple languages by providing the base folder path.
:::

#### MermaidDirectory

The `MermaidDirectory` option refers to the location where the [Mermaid Class Diagrams](https://mermaid.js.org/syntax/classDiagram.html) is located.

#### GeneratedDirectory

This generated directory refers to the directory where the code is generated. In this example it will always start by the src/ directory as a starting point.

#### YmlDirectory

The YML Directory refers to the intermediate yml code that will be used for code generation.
It uses the mermaid class diagrams with the handlebars files to generate some code.

### Now for the `scaffolding\csharp\config.csharp.json` file

```json
{
  "language": "CSharp",
  "extension":  "cs",
  "mappings": {
    "Scope": {
      "Public": "public",
      "Private": "private",
      "Protected": "protected"
    },
    "Type": {
      "Number": "int",
      "String": "string"
    }
  }
}
```

#### Language

Refers to the language that is supported here

#### Extension

The resulting output file extension e.g.
`PLACEHOLDER.Generated.cs`

#### Mappings

Not all languages use the same variable for the same datatype e.g. 
`Number` in Typescript,
`int` in C#

This functionality makes it possible to override the properties defined in the YML files for the languages specific types. 
The elements under the mappings can be extended with any property within the transformed YML files

### Last but not least the template files

These template files require the elements that are defined within the 