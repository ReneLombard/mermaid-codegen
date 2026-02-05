Feature: Project Initialization
    Project setup and configuration functionality for mermaid-codegen.
    Enables developers to create new projects with language-specific templates.
    Includes language validation and project structure generation capabilities.
    Supports multiple programming languages with customizable project layouts.

Background: Project initialization testing environment
    Test subject: Project initialization commands and language setup
    Test tools: CLI testing framework with file system validation
    Involved applications: Mermaid-codegen CLI, template system, file system
    Test scope: Project creation, template selection, and error handling

        Given Alice has prepared a clean test workspace
            And the mermaid-codegen CLI is properly installed
            And template directories are available

    Scenario: Initialize a C# project successfully
        Create a new project structure with C# language templates

            Given Alice has set the target language to "C#"
                And Alice has set the project directory to "test-project"
            When Alice runs "mermaid-codegen initialize -l C# -d test-project"
            Then a directory "test-project" should be created
                And the directory "test-project/Templates/C#" should exist
                And the file "test-project/config.json" should contain "C#"
                And the command should return exit code 0

    Scenario: List available programming languages
        Verify that supported languages are properly displayed

            When Alice runs "mermaid-codegen list-languages"
            Then Alice should see "C#" in the output
                And Alice should see "Documentation" in the output
                And the command should return exit code 0

    Scenario: Handle invalid language selection gracefully
        Ensure proper error handling for unsupported languages

            Given Alice has set the target language to "invalidlang"
                And Alice has set the project directory to "test-project"
            When Alice runs "mermaid-codegen initialize -l invalidlang -d test-project"
            Then Alice should see "Template for language invalidlang does not exist" in the error output
                And the directory "test-project" should not exist
                And the command should return a non-zero exit code