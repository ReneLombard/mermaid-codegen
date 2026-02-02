Feature: End-to-End Workflow
  As a developer
  I want to use the complete workflow
  So that I can go from Mermaid diagrams to generated code

  Background:
    Given I have a clean test workspace

  Scenario: Complete workflow from Mermaid to C# code
    Given I have a Mermaid file with a comprehensive class diagram
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
    When I run the complete workflow
    Then YAML files should be generated for all classes
    And C# model classes should be generated
    And C# controller classes should be generated
    And the generated code should compile successfully
    And the relationships between classes should be maintained

  Scenario: Workflow with error handling
    Given I have a Mermaid file with syntax errors
    When I run the complete workflow
    Then the process should fail gracefully
    And I should receive informative error messages
    And no partial files should be left behind

  Scenario: Workflow with custom configuration
    Given I have a Mermaid file with class definitions
    And I have custom template configurations
    When I run the complete workflow with custom settings
    Then the generated code should follow custom conventions
    And the output structure should match custom configuration