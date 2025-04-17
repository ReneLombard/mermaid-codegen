
## Commands Overview

`mermaid-codegen` provides several commands to help you work with Mermaid class diagrams and transform them into code.

### `initialize`

Initializes a new project for a specific programming language.

```cmd
mermaid-codegen initialize -l <language> -d <directory>
```

- **`-l, --language`**: The programming language to initialize (currently `C#` is the only supported language).
- **`-d, --directory`**: The root directory of the source repository.

### `list-languages`

Lists all the programming languages supported by `mermaid-codegen`.

```cmd
npx mermaid-codegen list-languages
```

### `transform`

Transforms Mermaid diagrams into YAML templates.

```cmd
npx mermaid-codegen transform -i <input> -o <output>
```

- **`-i, --input`**: Path to the input Mermaid file or directory.
- **`-o, --output`**: Path to the output directory where YAML templates will be saved.

### `generate`

Generates code from YAML templates using Handlebars templates.

```cmd
npx mermaid-codegen generate -i <input> -o <output> -t <templates>
```

- **`-i, --input`**: Path to the input YAML file or directory.
- **`-o, --output`**: Path to the output directory where the generated code will be saved.
- **`-t, --templates`**: Path to the directory containing Handlebars (`.hbs`) templates.

### `watch`

Watches for changes in Mermaid or YAML files and automatically regenerates the output.

```cmd
npx mermaid-codegen watch -m <mermaidInput> -y <ymlInput> -o <generateOutput> --templates <templates>
```

- **`-m, --mermaidInput`**: Path to the Mermaid file or directory to watch.
- **`-y, --ymlInput`**: Path to the YAML file or directory to watch.
- **`-o, --generateOutput`**: Path to the output directory for the generated code.
- **`--templates`**: Path to the directory containing Handlebars (`.hbs`) templates.

When running the application for the first time, you will be greeted with a seamless workflow to transform your diagrams into code. Explore the commands above to unlock the full potential of `mermaid-codegen`!
