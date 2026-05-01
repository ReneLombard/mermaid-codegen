# Language Files Explained

After running initialize, your template files are created under:

```text
fleet-management/Templates/C#
```

The most important file is:

```text
Templates/C#/config.json
```

## What config.json controls

Example:

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
            "Boolean": "bool",
            "REGEX:~(.*)~": "<$1>"
        }
    }
}
```

### language

A logical name for the target language used by this template set.

### extension

The output file extension for generated files.

Example:

```text
Vehicle.Generated.cs
```

### mappings

Mappings translate values in transformed YAML to language-specific values during generation.

Typical use cases:

1. Scope translation, such as `Public` to `public`.
2. Type translation, such as `Number` to `int`.
3. Regex-based replacements for generic patterns.

## How templates are selected

Template files in `Templates/C#` follow this pattern:

```text
<subtype>.<language>.hbs
```

Examples:

1. `class.csharp.hbs`
2. `endpoint.csharp.hbs`
3. `interface.csharp.hbs`

The Mermaid/YAML type and subtype determine which `.hbs` template is used when generating output.

## Practical Flow Recap

1. Mermaid diagrams are transformed into `.Generated.yml` files.
2. YAML files are processed with `Templates/C#/config.json` mappings.
3. Matching Handlebars templates produce language output files.

This design allows you to customize generated code behavior by changing mappings and templates without changing the
parser.
