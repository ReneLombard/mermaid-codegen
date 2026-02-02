Feature: Code Generation
  As a developer
  I want to generate code from YAML files
  So that I can automatically create consistent source code

  Background:
    Given I have a clean test workspace
    And I have YAML files containing class definitions

  Scenario: Generate C# classes from YAML
    Given I have a YAML file with Vehicle class definition
    And I have C# templates available
    When I run the generate command
    Then C# source files should be created
    And the generated code should contain proper class structure
    And the generated code should include all properties

  Scenario: Generate C# controllers from YAML
    Given I have a YAML file with controller endpoints
    And I have C# templates available
    When I run the generate command
    Then C# controller files should be created
    And the generated controllers should have proper action methods
    And the generated methods should include correct return types

  Scenario: Generate documentation from YAML
    Given I have a YAML file with class definitions
    And I have documentation templates available
    When I run the generate command with documentation templates
    Then documentation files should be created
    And the documentation should include class descriptions
    And the documentation should include property details

  Scenario: Generate code with custom templates
    Given I have a YAML file with class definitions
    And I have custom templates in a specific directory
    When I run the generate command with custom template path
    Then code should be generated using custom templates
    And the output should reflect custom template format

  Scenario: Generate code with missing templates
    Given I have a YAML file with class definitions
    And I have specified a non-existent template directory
    When I run the generate command
    Then I should see an error about missing templates
    And no code files should be generated