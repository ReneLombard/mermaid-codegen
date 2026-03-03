Feature: Code Generation
    Source code generation from structured YAML definitions.
    Supports multiple programming languages through template-based generation.
    Handles classes, controllers, and documentation with customizable output formats.
    Ensures type safety and consistent code structure across generated files.

Background: Code generation testing environment
    Test subject: Template-based code generation engine and output validation
    Test tools: Template processor, code generator, file system validation
    Involved applications: Handlebars template engine, code generator, file I/O
    Test scope: Template processing, code generation, and output validation

        Given David has prepared a clean test workspace
            And YAML files containing class definitions are available
            And the code generation engine is properly configured

    Scenario: Generate C# classes from YAML definitions
        Create C# source files from YAML class specifications

            Given David has created a file "vehicle.yml" with content:
            """
            Name: Vehicle
            Namespace: Company.VTC
            Type: Class
            Attributes:
              Make:
                Name: Make
                Type: String
                Scope: Public
              Model:
                Name: Model
                Type: String
                Scope: Public
              Year:
                Name: Year
                Type: Number
                Scope: Public
            Methods: {}
            Dependencies: {}
            Compositions: {}
            Aggregations: {}
            Associations: {}
            Realizations: {}
            Implementations: {}
            Lines: {}
            """
                And David has created a file "Templates/C#/config.json" with content:
                """
                {
                    "language": "CSharp",
                    "extension": "cs",
                    "mappings": {
                        "Scope": { "Public": "public", "Private": "private", "Protected": "protected" },
                        "Type": { "Number": "int", "String": "string", "Boolean": "bool" }
                    }
                }
                """
                And David has created a file "Templates/C#/class.csharp.hbs" with content:
                """
                using System;
                using System.Collections.Generic;

                namespace {{Namespace}}
                {
                    public partial class {{Name}}
                    {
                {{#each Attributes}}
                        public {{Type}} {{Name}} { get; set; }
                {{/each}}
                    }
                }
                """
            When David runs "mermaid-codegen generate -i vehicle.yml -o output/code -t Templates/C#"
            Then a file "output/code/Company/VTC/Vehicle.Generated.cs" should be created
                And the file should contain:
                """
                using System;
                using System.Collections.Generic;
                
                namespace Company.VTC
                {
                    public partial class Vehicle
                    {
                        public string Make { get; set; }
                        public string Model { get; set; }
                        public int Year { get; set; }
                    }
                }
                """

    Scenario: Generate C# controllers from YAML endpoints
        Create controller classes with proper action methods from YAML

            Given David has created a file "vehicle-controller.yml" with content:
            """
            Name: VehicleController
            Namespace: Company.VTC
            Type: endpoint
            Methods:
              GetVehicles:
                Name: GetVehicles
                Type: List<Vehicle>
              GetVehicle:
                Name: GetVehicle
                Type: Vehicle
                Arguments:
                  - Name: id
                    Type: int
            Dependencies: {}
            Compositions: {}
            Aggregations: {}
            Associations: {}
            Realizations: {}
            Implementations: {}
            Inheritance: {}
            Lines: {}
            """
                And David has created a file "Templates/C#/config.json" with content:
                """
                {
                    "language": "CSharp",
                    "extension": "cs",
                    "mappings": {
                        "Scope": { "Public": "public", "Private": "private", "Protected": "protected" },
                        "Type": { "Number": "int", "String": "string", "Boolean": "bool", "REGEX:~(.*)~": "<$1>" }
                    }
                }
                """
                And David has created a file "Templates/C#/endpoint.csharp.hbs" with content:
                """
                using System;
                using System.Collections.Generic;
                using System.Threading;
                using System.Threading.Tasks;
                using Microsoft.AspNetCore.Mvc;

                namespace {{Namespace}}
                {
                    [ApiController]
                    [Route("[controller]")]
                    public partial class {{Name}} : ControllerBase
                    {
                {{#each Methods}}
                        [HttpGet]
                        public async Task<ActionResult<{{{Type}}}>> {{Name}}({{#if Arguments}}{{#each Arguments}}{{Type}} {{Name}}, {{/each}}{{/if}}CancellationToken cancellationToken = default)
                        {
                            var result = await On{{Name}}({{#if Arguments}}{{#each Arguments}}{{Name}}, {{/each}}{{/if}}cancellationToken);
                            return Ok(result);
                        }

                        protected partial Task<{{{Type}}}> On{{Name}}({{#if Arguments}}{{#each Arguments}}{{Type}} {{Name}}, {{/each}}{{/if}}CancellationToken cancellationToken = default);

                {{/each}}
                    }
                }
                """
            When David runs "mermaid-codegen generate -i vehicle-controller.yml -o output/code -t Templates/C#"
            Then a file "output/code/Company/VTC/VehicleController.Generated.cs" should be created
                And the file should contain:
                """
                using System;
                using System.Collections.Generic;
                using System.Threading;
                using System.Threading.Tasks;
                using Microsoft.AspNetCore.Mvc;
                
                namespace Company.VTC
                {
                    [ApiController]
                    [Route("[controller]")]
                    public partial class VehicleController : ControllerBase
                    {
                        [HttpGet]
                        public async Task<ActionResult<List<Vehicle>>> GetVehicles(CancellationToken cancellationToken = default)
                        {
                            var result = await OnGetVehicles(cancellationToken);
                            return Ok(result);
                        }

                        protected partial Task<List<Vehicle>> OnGetVehicles(CancellationToken cancellationToken = default);

                        [HttpGet]
                        public async Task<ActionResult<Vehicle>> GetVehicle(int id, CancellationToken cancellationToken = default)
                        {
                            var result = await OnGetVehicle(id, cancellationToken);
                            return Ok(result);
                        }

                        protected partial Task<Vehicle> OnGetVehicle(int id, CancellationToken cancellationToken = default);

                    }
                }
                """

    @pending
    Scenario: Generate documentation from YAML specifications
        Create comprehensive documentation from class definitions

                        Given David has created a file "vehicle.yml" with content:
                        """
                        Name: Vehicle
                        Namespace: Company.VTC
                        Type: Class
                        Attributes:
                            Make:
                                Name: Make
                                Type: String
                                Scope: Public
                            Model:
                                Name: Model
                                Type: String
                                Scope: Public
                            Year:
                                Name: Year
                                Type: Number
                                Scope: Public
                        Methods: {}
                        Dependencies: {}
                        Compositions: {}
                        Aggregations: {}
                        Associations: {}
                        Realizations: {}
                        Implementations: {}
                        Lines: {}
                        """
                And David has created a file "Templates/Documentation/config.json" with content:
                """
                {
                    "language": "Markdown",
                    "extension": "md",
                    "namespace": {
                        "prefixToIgnore": "Company.VTC"
                    },
                    "mappings": {
                        "Scope": {
                            "Public": "Public",
                            "Private": "Private",
                            "Protected": "Protected"
                        },
                        "Type": {
                            "Number": "int",
                            "String": "string",
                            "REGEX:~(.*)~": "<$1>"
                        }
                    }
                }
                """
                And David has created a file "Templates/Documentation/class.markdown.hbs" with content:
                """
                # {{Name}}

                ## Overview

                Class: {{Name}}
                Namespace: {{Namespace}}

                ## Properties

                {{#if Attributes}}
                {{#each Attributes}}
                - **{{Name}}**: {{Type}} - {{Scope}} property
                {{/each}}
                {{else}}
                None defined.
                {{/if}}

                ## Methods

                {{#each Methods}}
                - **{{Name}}**: {{Type}}
                {{else}}
                None defined.
                {{/each}}

                ## Dependencies

                {{#each Dependencies}}
                - **{{Name}}**: {{Type}}
                {{else}}
                None defined.
                {{/each}}
                """
            When David runs "mermaid-codegen generate -i vehicle.yml -o output/docs -t Templates/Documentation"
            Then a file "output/docs/Vehicle.Generated.md" should be created
                And the file should contain:
                """
                # Vehicle
                
                ## Overview
                
                Class: Vehicle
                Namespace: Company.VTC
                
                ## Properties
                
                - **Make**: string - Public property
                - **Model**: string - Public property
                - **Year**: int - Public property
                
                ## Methods
                
                None defined.
                
                ## Dependencies
                
                None defined.
                """

    Scenario: Generate code with custom template configurations
        Support custom template directories and formatting rules

            Given David has created a file "vehicle.yml" with content:
            """
            Name: Vehicle
            Namespace: Company.VTC
            Type: Class
            Attributes:
              Make:
                Name: Make
                Type: String
                Scope: Public
              Model:
                Name: Model
                Type: String
                Scope: Public
              Year:
                Name: Year
                Type: Number
                Scope: Public
            Methods: {}
            Dependencies: {}
            Compositions: {}
            Aggregations: {}
            Associations: {}
            Realizations: {}
            Implementations: {}
            Lines: {}
            """
            
                And David has created a custom template "custom-templates/class.csharp.hbs" with content:
                """
                // Custom template with special formatting
                namespace {{Namespace}}
                {
                    /// <summary>
                    /// Auto-generated class: {{Name}}
                    /// </summary>
                    public partial class {{Name}}
                    {
                        {{#each Attributes}}
                        /// <summary>{{this.Name}}</summary>
                        public {{this.Type}} {{this.Name}} { get; set; }
                        {{/each}}
                    }
                }
                """
            When David runs "mermaid-codegen generate -i vehicle.yml -o output -t custom-templates"
            Then a file matching "output/Vehicle*.cs" should be created
                And the file should contain:
                """
                // Custom template with special formatting
                namespace Company.VTC
                {
                    /// <summary>
                    /// Auto-generated class: Vehicle
                    /// </summary>
                    public partial class Vehicle
                    {
                        /// <summary>Make</summary>
                        public string Make { get; set; }
                        /// <summary>Model</summary>
                        public string Model { get; set; }
                        /// <summary>Year</summary>
                        public int Year { get; set; }
                    }
                }
                """
                And the file should follow the custom template format

    Scenario: Handle missing template directories gracefully
        Ensure proper error handling for invalid template paths

                        Given David has created a file "vehicle.yml" with content:
                        """
                        Name: Vehicle
                        Namespace: Company.VTC
                        Type: Class
                        Attributes:
                            Make:
                                Name: Make
                                Type: String
                                Scope: Public
                            Model:
                                Name: Model
                                Type: String
                                Scope: Public
                            Year:
                                Name: Year
                                Type: Number
                                Scope: Public
                        Methods: {}
                        Dependencies: {}
                        Compositions: {}
                        Aggregations: {}
                        Associations: {}
                        Realizations: {}
                        Implementations: {}
                        Lines: {}
                        """
            When David runs "mermaid-codegen generate -i vehicle.yml -o output -t non-existent-templates"
            Then David should see "Templates directory does not exist" in the error output
                And no code files should be created
                And the command should return a non-zero exit code