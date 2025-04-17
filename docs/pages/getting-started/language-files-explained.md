
### What does these files mean?

#### Language

The `language` option refers to the language [handlebars](https://handlebarsjs.com/) templates are defined.

::: info
You can also support multiple languages by providing the base folder path.
:::

#### GeneratedDirectory

This generated directory refers to the directory where the code is generated. In this example it will always start by the src/ directory as a starting point.

#### YmlDirectory

The YML Directory refers to the intermediate yml code that will be used for code generation.
It uses the mermaid class diagrams with the handlebars files to generate some code.

### Now for the `c#\config.csharp.json` file

```json
{
  "language": "CSharp",
  "extension": "cs",
  "mappings": {
    "Scope": {
      "Public": "public",
      "Private": "private",
      "Protected": "protected"
    },
    "Type": {
      "Number": "int",
      "String": "string",
      "REGEX:~(.*)~": "<$1>"
    }
  }
}
```
The mappings maps the mermaid types and scope to a language specific terminology.

#### Extension

The resulting output file extension e.g.
`PLACEHOLDER.Generated.cs`

#### Mappings

Not all languages use the same variable for the same datatype e.g. 
`Number` in Typescript,
`int` in C#
You can also create your own REGEX replace for more complex situations.


This functionality makes it possible to override the properties defined in the YML files for the languages specific types. 
The elements under the mappings can be extended with any property within the transformed YML files

