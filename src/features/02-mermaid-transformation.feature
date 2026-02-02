Feature: Mermaid to YAML Transformation
  As a developer
  I want to transform Mermaid class diagrams to YAML
  So that I can generate code from structured data

  Background:
    Given I have a clean test workspace

  Scenario: Transform simple class diagram
    Given I have a Mermaid file with a simple class definition
    """
    ```mermaid
    classDiagram
    class Vehicle {
        +String Make
        +String Model
        +Number Year
    }
    ```
    """
    When I run the transform command
    Then a YAML file should be generated
    And the YAML should contain the Vehicle class definition
    And the YAML should include Make, Model, and Year properties

  Scenario: Transform class diagram with namespaces
    Given I have a Mermaid file with namespace definitions
    """
    ```mermaid
    classDiagram
    namespace Company.VTC.Models {
        class Vehicle {
            +String Make
            +String Model
        }
    }
    ```
    """
    When I run the transform command with namespace "Company.VTC"
    Then a YAML file should be generated in the correct directory structure
    And the namespace should be properly reflected in the output

  Scenario: Transform class diagram with endpoints
    Given I have a Mermaid file with controller endpoints
    """
    ```mermaid
    classDiagram
    class VehicleController {
        <<endpoint>>
        +GetVehicles(): List~Vehicle~
        +GetVehicle(id: int): Vehicle
    }
    ```
    """
    When I run the transform command
    Then a YAML file should be generated
    And the controller should be marked as an endpoint
    And the methods should include return types

  Scenario: Transform invalid Mermaid syntax
    Given I have a Mermaid file with invalid syntax
    When I run the transform command
    Then I should see an error message about parsing failure
    And no YAML file should be generated