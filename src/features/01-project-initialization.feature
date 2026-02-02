Feature: Project Initialization
  As a developer
  I want to initialize a new project
  So that I can quickly set up code generation for a specific programming language

  Background:
    Given I have a clean test workspace

  Scenario: Initialize a C# project
    Given I have selected "C#" as the target language
    And I have specified "test-project" as the project directory
    When I run the initialize command
    Then a new project structure should be created
    And the project should contain C# specific templates
    And the command should return exit code 0

  Scenario: List available languages
    When I run the list languages command
    Then I should see available programming languages
    And the output should contain "C#"
    And the command should return exit code 0

  Scenario: Initialize project with invalid language
    Given I have selected "InvalidLanguage" as the target language
    And I have specified "test-project" as the project directory
    When I run the initialize command
    Then I should see an error message about unsupported language
    And no project structure should be created