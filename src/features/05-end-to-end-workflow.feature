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
            And the complete mermaid-codegen toolchain is available
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
                And a file "output/code/Controllers/VehiclesController.Generated.cs" should be created
                And Frank can compile the generated code with "dotnet build output/code" successfully
                And the controller should reference the Vehicle model correctly

    Scenario: Workflow error handling and graceful failure
        Ensure robust error handling throughout the complete pipeline

            Given Frank has created a file "broken.md" with invalid mermaid syntax
            When Frank runs "mermaid-codegen transform -i broken.md -o output/yml"
            Then Frank should see "Mermaid parsing failed" in the error output
                And the command should return a non-zero exit code
                And no files should be created in "output/yml/" directory
                And no files should be created in "output/code/" directory
                And the workspace should remain clean

    Scenario: Workflow with custom configuration and templates
        Support customized workflow execution with user-defined settings

            Given Frank has created a file "custom.md" with Vehicle class definition
                And Frank has created a config file "custom-config.json" with template settings
                And Frank has custom templates in "custom-templates/" directory
            When Frank runs "mermaid-codegen transform -i custom.md -o output/yml"
            And Frank runs "mermaid-codegen generate -i output/yml -o output/code -t custom-templates"
            Then the generated code should use the custom templates
                And the output structure should match the configuration in "custom-config.json"
                And all custom variables should be resolved correctly