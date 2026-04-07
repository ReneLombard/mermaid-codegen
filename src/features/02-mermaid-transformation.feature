Feature: Mermaid to YAML Transformation
    Transformation of Mermaid class diagrams into structured YAML format.
    Supports parsing of class definitions, namespaces, and controller endpoints.
    Handles complex class relationships and method signatures with proper validation.
    Enables downstream code generation through standardized YAML schema.

Background: Mermaid transformation testing environment
    Test subject: Mermaid class diagram parser and YAML transformation engine
    Test tools: Mermaid parser, YAML generator, file system validation
    Involved applications: Mermaid-codegen transformer, file I/O system
    Test scope: Syntax parsing, structure validation, and output generation

        Given Charlie has set up a clean test workspace
            And the mermaid transformation engine is available
            And YAML output directories are prepared

    Scenario: Transform simple class diagram structure
        Convert basic Mermaid class definition to YAML format

            Given Charlie has created a file "vehicle.md" with content:
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
            When Charlie runs "mermaid-codegen transform -i vehicle.md -o ."
            Then a file "global/Vehicle.Generated.yml" should be created
                And the file "global/Vehicle.Generated.yml" should contain:
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

    Scenario: Transform class diagram with namespace organization
        Handle namespace definitions and directory structure generation

            Given Charlie has created a file "models.md" with content:
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
            When Charlie runs "mermaid-codegen transform -i models.md -o . -n Company.VTC"
            Then a file "Models/Vehicle.Generated.yml" should be created
                And the file "Models/Vehicle.Generated.yml" should contain:
                """
                Name: Vehicle
                Namespace: Company.VTC.Models
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
                """

    Scenario: Transform class diagram with controller endpoints
        Process controller classes with endpoint annotations and method signatures

            Given Charlie has created a file "controller.md" with content:
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
            When Charlie runs "mermaid-codegen transform -i controller.md -o ."
            Then a file "global/VehicleController.Generated.yml" should be created
                And the file "global/VehicleController.Generated.yml" should contain:
                """
                Name: VehicleController
                Namespace: global
                Type: endpoint
                Methods:
                  GetVehicles:
                    Type: List~Vehicle~
                    Scope: Public
                  GetVehicle:
                    Type: Vehicle
                    Scope: Public
                    Arguments:
                      - Type: 'id:'
                        Name: int
                """

    Scenario: Handle invalid Mermaid syntax gracefully
        Ensure proper error reporting for malformed Mermaid diagrams

            Given Charlie has created a file "invalid.md" with content:
            """
            ```mermaid
            classDiagram
            class Vehicle {
                +String Make
                // missing closing brace
            ```
            """
            When Charlie runs "mermaid-codegen transform -i invalid.md -o ."
            Then Charlie should see "Error parsing Mermaid" in the error output
                And no YAML files should be created
                And the command should return a non-zero exit code