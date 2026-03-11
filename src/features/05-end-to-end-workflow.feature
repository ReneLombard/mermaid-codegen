Feature: End-to-End Workflow
    Complete workflow integration from Mermaid diagrams to generated source code.
    Validates the entire pipeline including parsing, transformation, and generation.
    Tests complex scenarios with multiple namespaces and class relationships.
    Ensures quality and consistency across the complete development workflow.

Background: End-to-end workflow testing environment
    Test subject: Complete mermaid-codegen pipeline from input to output
    Test tools: Full integration test suite, compilation validation, file verification
    Involved applications: Mermaid parser, YAML transformer, code generator, compiler
    Test scope: Complete workflow validation, error handling, and output quality

        Given Frank has established a clean test workspace
            And Frank has set the target language to "C#"
            And Frank has set the project directory to "output/"
            And the file watching service is available
        When Frank runs "mermaid-codegen initialize -l C# -d output/"
            And compilation tools are prepared for validation

    Scenario: Complete workflow from Mermaid to C# code generation
        Execute the full pipeline with comprehensive class diagrams

            Given Frank has created a file "comprehensive.md" with content:
            """
            ```mermaid
            classDiagram

            namespace Company.VTC.Models {
                class Vehicle {
                    <<class>>
                    +String Make
                    +String Model
                    +Number Year
                    +String Status
                }
            }

            namespace Company.VTC.Controllers {
                class VehiclesController {
                    <<endpoint>>
                    +GetVehicleByMake(string make): Task~ActionResult~Vehicle~~
                    +GetAllVehicles(): Task~ActionResult~List~Vehicle~~~
                    +AddVehicle(Vehicle vehicle): Task~ActionResult~Vehicle~~
                }
            }

            VehiclesController --> Vehicle : returns
            ```
            """
            When Frank runs "mermaid-codegen transform -i comprehensive.md -o output/yml"
            And Frank runs "mermaid-codegen generate -i output/yml -o output/code -t Templates/C#"
            Then files "output/yml/Company/VTC/Models/Vehicle.yml" and "output/yml/Company/VTC/Controllers/VehiclesController.yml" should be created
                And a file "output/code/Models/Vehicle.Generated.cs" should be created
                And the file "output/code/Models/Vehicle.Generated.cs" should contain:
                    """
                    using System;
                    using System.Collections.Generic;

                    namespace Company.VTC.Models;

                    public partial class Vehicle 
                    {

                        public string Make { get; set; }

                        public string Model { get; set; }

                        public int Year { get; set; }

                        public string Status { get; set; }

                    }
                    """
                And a file "output/code/Controllers/VehiclesController.Generated.cs" should be created
                And the file "output/code/Controllers/VehiclesController.Generated.cs" should contain:
                    """
                    using System;
                    using System.Collections.Generic;
                    using System.Threading;
                    using System.Threading.Tasks;
                    using Microsoft.AspNetCore.Mvc;

                    namespace Company.VTC.Controllers
                    {

                    [ApiController]
                    [Route("[controller]")]
                    public partial class VehiclesController : ControllerBase
                    {

                            private List<returns> returns;

                            [HttpGet]
                            public async Task<ActionResult<Task<ActionResult<Vehicle>>>> GetVehicleByMake(string make, CancellationToken cancellationToken = default)
                            {
                                var result = await OnGetVehicleByMake(make, cancellationToken);
                                return Ok(result);
                            }

                            protected partial Task<Task<ActionResult<Vehicle>>> OnGetVehicleByMake(string make, CancellationToken cancellationToken = default);

                            [HttpGet]
                            public async Task<ActionResult<Task<ActionResult<List<Vehicle>>>>> GetAllVehicles(CancellationToken cancellationToken = default)
                            {
                                var result = await OnGetAllVehicles(cancellationToken);
                                return Ok(result);
                            }

                            protected partial Task<Task<ActionResult<List<Vehicle>>>> OnGetAllVehicles(CancellationToken cancellationToken = default);

                            [HttpGet]
                                    public async Task<ActionResult<Task<ActionResult<Vehicle>>>> AddVehicle(Vehicle vehicle, CancellationToken cancellationToken = default)
                            {
                                var result = await OnAddVehicle(vehicle, cancellationToken);
                                return Ok(result);
                            }

                            protected partial Task<Task<ActionResult<Vehicle>>> OnAddVehicle(Vehicle vehicle, CancellationToken cancellationToken = default);

                    }

                    }
                    """
                And Frank can compile the generated code with "dotnet build output/code" successfully
                And the controller should reference the Vehicle model correctly

    Scenario: Workflow error handling and graceful failure
        Ensure robust error handling throughout the complete pipeline

            Given Frank has created a file "broken.md" with content:
            """
            ```mermaid
            classDiagram
            class Vehicle {
                +String Make
                +String Model
                // intentionally missing closing brace
            ```
            """
            When Frank runs "mermaid-codegen transform -i broken.md -o output/yml"
            Then Frank should see "Mermaid parsing failed" in the error output
                And the command should return a non-zero exit code
                And no files should be created in "output/yml/" directory
                And no files should be created in "output/code/" directory
                And the workspace should remain clean

    Scenario: Workflow with custom configuration and templates
        Support customized workflow execution with user-defined settings

                        Given Frank has created a file "custom.md" with content:
                        """
                        ```mermaid
                        classDiagram
                        namespace Company.VTC.Models {
                                class Vehicle {
                                        +String Make
                                        +String Model
                                        +Number Year
                                }
                        }
                        ```
                        """
                                And Frank has created a file "custom-config.json" with content:
                                """
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
                                """
                                And Frank has created a file "custom-templates/class.csharp.hbs" with content:
                                """
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
                                And Frank has created a file "custom-templates/config.json" with content:
                                """
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
                                """
            When Frank runs "mermaid-codegen transform -i custom.md -o output/yml"
            And Frank runs "mermaid-codegen generate -i output/yml -o output/code -t custom-templates"
            Then the generated code should use the custom templates
                And the output structure should match the configuration in "custom-config.json"
                And all custom variables should be resolved correctly