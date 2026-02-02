Feature: File Watching
  As a developer
  I want to watch for file changes
  So that code is automatically regenerated when I modify Mermaid or YAML files

  Background:
    Given I have a clean test workspace
    And I have initial Mermaid and YAML files

  Scenario: Watch Mermaid file changes
    Given I have started the watch command
    When I modify a Mermaid file
    Then the YAML file should be automatically updated
    And the generated code should be automatically updated

  Scenario: Watch YAML file changes
    Given I have started the watch command
    When I modify a YAML file
    Then the generated code should be automatically updated
    And the timestamp of output files should be newer

  Scenario: Watch with multiple file changes
    Given I have started the watch command
    When I modify multiple Mermaid files
    Then all corresponding YAML files should be updated
    And all corresponding code files should be updated

  Scenario: Watch handles file creation
    Given I have started the watch command
    When I create a new Mermaid file
    Then a new YAML file should be created
    And new code files should be generated

  Scenario: Watch handles file deletion
    Given I have started the watch command
    When I delete a Mermaid file
    Then the corresponding files should be cleaned up appropriately

  @manual
  Scenario: Stop watching gracefully
    Given I have started the watch command
    When I stop the watch process
    Then the watching should stop cleanly
    And no background processes should remain