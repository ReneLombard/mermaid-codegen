@smoke
Feature: Smoke Tests
    Quick verification tests for core mermaid-codegen functionality.
    These tests validate that the essential command-line operations work correctly.
    Tests cover language listing, mermaid transformation, and basic code generation.
    Serves as a health check for the entire system before running comprehensive tests.

Background: Basic smoke test environment setup
    Test subject: Mermaid-codegen CLI application core functionality
    Test tools: Jest testing framework with Cucumber BDD integration
    Involved applications: Node.js runtime, mermaid-codegen CLI, file system
    Test scope: Command execution, file generation, and basic validation

        Given Bob has initialized a clean test workspace
            And the mermaid-codegen CLI is available

    @smoke @quick
    Scenario: Basic CLI functionality validation
        Verify that the list languages command executes successfully

            When Bob runs "mermaid-codegen list-languages"
            Then the CLI should return exit code 0
                And Bob should see "C#" in the output
                And Bob should see "Documentation" in the output

    @smoke @transform
    Scenario: Basic mermaid transformation capability
        Verify that mermaid class diagrams can be transformed to YAML format

            Given Bob has created a mermaid file "test-class.md" with content:
            """
            ```mermaid
            classDiagram
            class TestClass {
                +String Name
            }
            ```
            """
            When Bob runs "mermaid-codegen transform -i test-class.md -o ."
            Then a YAML file "global/TestClass.Generated.yml" should be created
                And the CLI should return exit code 0
                And the YAML file "global/TestClass.Generated.yml" should contain "TestClass"

    @smoke @generate
    Scenario: Basic code generation capability
        Verify that YAML definitions can generate source code files

            Given Bob has created a YAML file "vehicle.yml" with Vehicle class definition
                And the C# templates exist in "Templates/C#/" directory
            When Bob runs "mermaid-codegen generate -i vehicle.yml -o output/code -t Templates/C#"
            Then a C# file "Vehicle.Generated.cs" should be created in "output/code/global/"
                And the CLI should return exit code 0
                And the generated file should contain "class Vehicle"