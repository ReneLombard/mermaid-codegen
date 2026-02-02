@smoke
Feature: Smoke Tests
  As a developer
  I want to run basic smoke tests
  So that I can quickly verify the core functionality works

  Background:
    Given I have a clean test workspace

  @smoke @quick
  Scenario: Basic CLI functionality
    When I run the list languages command
    Then the command should return exit code 0
    And I should see available programming languages

  @smoke @transform
  Scenario: Basic transform functionality
    Given I have a Mermaid file with a simple class definition
    """
    ```mermaid
    classDiagram
    class TestClass {
        +String Name
    }
    ```
    """
    When I run the transform command
    Then a YAML file should be generated
    And the command should return exit code 0

  @smoke @generate
  Scenario: Basic code generation
    Given I have a YAML file with Vehicle class definition
    And I have C# templates available
    When I run the generate command
    Then C# source files should be created
    And the command should return exit code 0