@docs-parity
Feature: Getting Started Docs Parity
    Protect the published getting started workflow from drifting away from actual CLI behavior.
    This scenario validates the canonical initialize, transform, and generate path.

Background: Docs parity test environment
    Test subject: Getting started command sequence and expected artifacts
    Test tools: Cucumber BDD steps with file-system assertions
    Involved applications: Mermaid-codegen CLI, transformer, generator
    Test scope: Canonical first-run workflow fidelity

        Given Grace has initialized a clean test workspace
            And the mermaid-codegen CLI is available

    @docs-parity @getting-started
    Scenario: Canonical C# quick start workflow remains valid
        Given Grace runs "mermaid-codegen initialize -l C# -d fleet-management"
            And the directory "fleet-management/Templates/C#" should exist
            And the file "fleet-management/mermaid-codegen.config.json" should contain:
            """
            {
              "language": "C#",
              "mermaidDirectory": "docs",
              "templatesDirectory": "Templates/C#",
              "definitionsDirectory": "Definitions",
              "outputDirectory": "src"
            }
            """
            And Grace has created a file "docs/detailed-design/vehicle.md" with content:
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
        When Grace runs "mermaid-codegen transform -i docs/detailed-design -o definitions"
        Then a file "definitions/global/Vehicle.Generated.yml" should be created
            And the file "definitions/global/Vehicle.Generated.yml" should contain:
            """
            Name: Vehicle
            Namespace: global
            Type: Class
            Attributes:
              Make:
                Type: String
                IsSystemType: true
                Scope: Public
              Model:
                Type: String
                IsSystemType: true
                Scope: Public
              Year:
                Type: Number
                IsSystemType: true
                Scope: Public
            """
        When Grace runs "mermaid-codegen generate -i definitions -o output/code -t fleet-management/Templates/C#"
        Then a file "output/code/global/Vehicle.Generated.cs" should be created
            And the file "output/code/global/Vehicle.Generated.cs" should contain:
            """
            using System;
            using System.Collections.Generic;

            namespace global;

            public partial class Vehicle 
            {

                public string Make { get; set; }

                public string Model { get; set; }

                public int Year { get; set; }

            }
            """
