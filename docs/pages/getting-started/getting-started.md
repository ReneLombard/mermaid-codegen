---
outline: deep
---

## What we will be creating

In this tutorial we will be creating a `vehicle fleet management` starting application written in C# (as the only current languge supported)

## Initializing the Application

Once the `mermaid-codegen` tool is installed (as described in the previous step), you can begin by setting up the default configuration within your application. 

## Folder structure

For this example we will be creating the folder structure as follows:

fleet-management/
├── definitions/           # (the intermediate code that is generated)
│   ├── generated.yml
│   └── custom.yml
├── blue-prints/c#      # (the Handlebars templates)
│   ├── class.hbs
│   └── interface.hbs
├── docs/
│   └── detailed-design/
|       └── fleet-design.md
└── src/
    └── models/
        └── <-- Source code to be generated

## Lets get started

### Configuring the C# webapi
Create the folder structure manually as described above `navigate to the ./src/` directory and initialize a `dotnet` project

Run the following command to create the project

```cmd
dotnet new webapi -n fleet-management -o .\ --use-controllers true
```
This should create a scaffolded webapi application. 

If everything went as expected you should be able to run the default application:

```cmd
dotnet run fleet-management.csproj
```

### Initializing mermaid-codegen app

With the terminal open, navigate to the root directory of fleet-management

Run the following command

```cmd
mermaid-codegen initialize -l C# -d .\blue-prints\C#
```

::: info
If your language is not supported out of the box, you can easily initialize it using the C# base and then customize and create your own templates from scratch.

Please try to contribute the templates to add more funcitionality in the tool.
:::


3. Upon execution, the following folders and files will be created:

- `blue-prints\c#\config.csharp.json`
- A set of [handlebars](https://handlebarsjs.com/) templates, such as `class.csharp.hbs` etc are created.

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
The mappings maps the mermaid types and scope to a language specific terminology.

#### Extension

The resulting output file extension e.g.
`PLACEHOLDER.Generated.cs`

#### Mappings

Not all languages use the same variable for the same datatype e.g. 
`Number` in Typescript,
`int` in C#

This functionality makes it possible to override the properties defined in the YML files for the languages specific types. 
The elements under the mappings can be extended with any property within the transformed YML files

### TOBECONTINUED