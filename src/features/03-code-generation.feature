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
                And the file "Templates/C#/class.csharp.hbs" exists
            When David runs "mermaid-codegen generate -i vehicle.yml -o output/code -t Templates/C#"
            Then a file "output/code/Vehicle.Generated.cs" should be created
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
                And the file "Templates/C#/endpoint.csharp.hbs" exists
            When David runs "mermaid-codegen generate -i vehicle-controller.yml -o output/code -t Templates/C#"
            Then a file "output/code/VehicleController.Generated.cs" should be created
                And the file should contain:
                """
                using System;
                using System.Collections.Generic;
                using System.Threading.Tasks;
                using Microsoft.AspNetCore.Mvc;
                
                namespace Company.VTC
                {
                    [ApiController]
                    [Route("[controller]")]
                    public partial class VehicleController : ControllerBase
                    {
                        public partial async Task<ActionResult<List&lt;Vehicle&gt;>> GetVehicles()
                        {
                            // Implementation goes here
                            throw new NotImplementedException();
                        }
                        public partial async Task<ActionResult<Vehicle>> GetVehicle(int id)
                        {
                            // Implementation goes here
                            throw new NotImplementedException();
                        }
                    }
                }
                """

    @pending
    Scenario: Generate documentation from YAML specifications
        Create comprehensive documentation from class definitions

            Given David has created a file "vehicle.yml" with Vehicle class definition
                And the file "Templates/Documentation/class.documentation.hbs" exists
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

            Given David has created a file "vehicle.yml" with Vehicle class definition
                And David has created a custom template "custom-templates/my-class.hbs"
            When David runs "mermaid-codegen generate -i vehicle.yml -o output -t custom-templates"
            Then a file matching "output/Vehicle*.cs" should be created
                And the file should follow the custom template format

    Scenario: Handle missing template directories gracefully
        Ensure proper error handling for invalid template paths

            Given David has created a file "vehicle.yml" with Vehicle class definition
            When David runs "mermaid-codegen generate -i vehicle.yml -o output -t non-existent-templates"
            Then David should see "Templates directory does not exist" in the error output
                And no code files should be created
                And the command should return a non-zero exit code