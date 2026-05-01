Feature: File Watching
    Automated file monitoring and regeneration for development workflow.
    Watches Mermaid and YAML files for changes and triggers automatic regeneration.
    Supports real-time development with immediate feedback on file modifications.
    Handles file creation, modification, and deletion events gracefully.

Background: File watching system testing environment
    Test subject: File system watcher and automatic regeneration pipeline
    Test tools: File system monitoring, change detection, process management
    Involved applications: File watcher service, transformation engine, code generator
    Test scope: File monitoring, change detection, and automated processing

        Given Emma has set up a clean test workspace
            And Emma runs "mermaid-codegen initialize -l C# -d ."
            And Emma has prepared initial Mermaid and YAML files
            And the file watching service is available

    Scenario: Watch Mermaid file modifications automatically
        Monitor Mermaid files and trigger YAML regeneration on changes

            Given Emma has created a file "docs/vehicle.md" with:
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
                And Emma has started "mermaid-codegen watch" in the background
                And the watch process is running
                And Emma records the hash of "src/global/Vehicle.Generated.cs"
                And the file "src/global/Vehicle.Generated.cs" should contain:
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

            When Emma modifies the file "docs/vehicle.md" to:
                """
                ```mermaid
                classDiagram
                class Vehicle {
                    +String Make
                    +String Model
                    +Number Year
                    +String Color
                }
                ```
                """
            Then Emma verifies the hash of "src/global/Vehicle.Generated.cs" has changed
                And the timestamp of "Definitions/global/Vehicle.Generated.yml" should be newer than "docs/vehicle.md"
                And the file "Definitions/global/Vehicle.Generated.yml" should contain:
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
                      Color:
                        Type: String
                        IsSystemType: true
                        Scope: Public
                    """
                And the file "src/global/Vehicle.Generated.cs" should contain:
                    """
                    using System;
                    using System.Collections.Generic;

                    namespace global;

                    public partial class Vehicle 
                    {

                        public string Make { get; set; }

                        public string Model { get; set; }

                        public int Year { get; set; }

                        public string Color { get; set; }

                    }
                    """

    Scenario: Watch YAML file modifications for code updates
        Monitor YAML files and trigger code regeneration on changes

                        Given Emma has created a file "docs/vehicle.yml" with content:
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
                                Methods: {}
                                Dependencies: {}
                                Compositions: {}
                                Aggregations: {}
                                Associations: {}
                                Realizations: {}
                                Implementations: {}
                                Lines: {}
                                """
                And Emma has started "mermaid-codegen watch" in the background
                And the watch process is running
                And Emma records the hash of "src/global/Vehicle.Generated.cs"
            When Emma modifies the file "docs/vehicle.yml" to:
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
                        Type: String
                        IsSystemType: true
                        Scope: Public
                Methods: {}
                Dependencies: {}
                Compositions: {}
                Aggregations: {}
                Associations: {}
                Realizations: {}
                Implementations: {}
                Lines: {}
                """
            Then Emma verifies the hash of "src/global/Vehicle.Generated.cs" has changed
                And the timestamp of the generated file should be newer than "docs/vehicle.yml"
                And the file "src/global/Vehicle.Generated.cs" should contain:
                    """
                    using System;
                    using System.Collections.Generic;

                    namespace global;

                    public partial class Vehicle 
                    {

                        public string Make { get; set; }

                        public string Model { get; set; }

                        public string Year { get; set; }

                    }
                    """

    Scenario: Watch handles new file creation events
        Detect and process newly created files in watched directories

            Given Emma has created a file "docs/placeholder.md" with content:
                """
                ```mermaid
                classDiagram
                class Placeholder {
                    +String Id
                }
                ```
                """
                And Emma has started "mermaid-codegen watch" in the background
                And the watch process is running
                And Emma waits for initial file processing to complete
            When Emma creates a new file "docs/product.md" with a Product class definition:
                """
                ```mermaid
                classDiagram
                class Product {
                    +String Name
                    +Number Price
                    +String Category
                }
                ```
                """
               # And Emma waits for the file watcher to detect changes
                And Emma waits for initial file processing to complete
            Then a file "Definitions/global/Product.Generated.yml" should be created
                And the file "Definitions/global/Product.Generated.yml" should contain:
                    """
                    Name: Product
                    Namespace: global
                    Type: Class
                    Attributes:
                      Name:
                        Type: String
                        IsSystemType: true
                        Scope: Public
                      Price:
                        Type: Number
                        IsSystemType: true
                        Scope: Public
                      Category:
                        Type: String
                        IsSystemType: true
                        Scope: Public
                    """
                And a file "src/global/Product.Generated.cs" should be created
                And the file "src/global/Product.Generated.cs" should contain:
                    """
                    using System;
                    using System.Collections.Generic;

                    namespace global;

                    public partial class Product 
                    {

                        public string Name { get; set; }

                        public int Price { get; set; }

                        public string Category { get; set; }

                    }
                    """
        # Note: Code generation during file watching is now implemented with hash verification
    Scenario: Watch handles file deletion events appropriately
        Clean up generated files when source files are removed

            Given Emma has created a file "docs/temp-class.md" with content:
                """
                ```mermaid
                classDiagram
                class TempClass {
                    +String Name
                    +Number Version
                }
                ```
                """
                And Emma has started "mermaid-codegen watch" in the background
                And the corresponding output files exist
                And Emma records the hash of "src/global/TempClass.Generated.cs"
                And the file "src/global/TempClass.Generated.cs" should contain:
                    """
                    using System;
                    using System.Collections.Generic;

                    namespace global;

                    public partial class TempClass 
                    {

                        public string Name { get; set; }

                        public int Version { get; set; }

                    }
                    """
            When Emma deletes the file "docs/temp-class.md"
             #   And Emma waits for the file watcher to detect changes
            Then the file "Definitions/global/TempClass.Generated.yml" should be removed
                And the file "src/global/TempClass.Generated.cs" should be removed

    Scenario: Watch handles invalid file content gracefully
        Ensure watcher continues running and logs errors when invalid content is detected

            Given Emma has created a file "docs/vehicle.md" with:
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
                And Emma has started "mermaid-codegen watch" in the background
                And the watch process is running
                And Emma records the hash of "src/global/Vehicle.Generated.cs"
            When Emma modifies the file "docs/vehicle.md" to:
                """
                classDiagram
                    class Vehicle {
                        +String make
                        +String model
                        +String year
                        // This is invalid mermaid syntax - missing closing brace and random text
                        invalid syntax here $$$ @@@ broken content
                        class NotClosed {
                            +String property
                        // Missing closing brace intentionally
                """
            Then an error should be logged to the console output
                And the watch process should continue running
                And the watch process should not crash
                And Emma verifies the hash of "src/global/Vehicle.Generated.cs" has not changed
                And no new output files should be generated for the invalid content

    Scenario: Watch handles invalid YAML content gracefully
        Ensure watcher continues running and logs errors when invalid YAML is detected
            Given Emma has created a file "docs/vehicle.yml" with content:
                                """
                                Name: Vehicle
                                Namespace: global
                                Type: Class
                                Attributes:
                                    Make:
                                        Type: String
                                        IsSystemType: true
                                        Scope: Public
                                Methods: {}
                                Dependencies: {}
                                Compositions: {}
                                Aggregations: {}
                                Associations: {}
                                Realizations: {}
                                Implementations: {}
                                Lines: {}
                                """
                And Emma has started "mermaid-codegen watch" in the background
                And the watch process is running
                And Emma records the hash of "src/global/Vehicle.Generated.cs"
                And the file "src/global/Vehicle.Generated.cs" should contain:
                    """
                    using System;
                    using System.Collections.Generic;

                    namespace global;

                    public partial class Vehicle 
                    {

                        public string Make { get; set; }

                    }
                    """
            When Emma modifies the file "docs/vehicle.yml" to:
                """
                Name: Vehicle
                Namespace: Company.VTC
                Type: Class
                Attributes:
                  Make:
                    Type: String
                    - invalid yaml list syntax in wrong place
                    [invalid bracket syntax]: broken
                    Scope: Public
                    }: invalid closing brace in yaml
                Methods: {broken yaml structure
                Dependencies: invalid yaml content @@@ $$$ broken
                - random list item without proper indentation
                  }: more broken syntax
                """
            Then an error should be logged to the console output
                And the watch process should continue running
                And the watch process should not crash
                And Emma verifies the hash of "src/global/Vehicle.Generated.cs" has not changed
                And the file "src/global/Vehicle.Generated.cs" should contain:
                    """
                    using System;
                    using System.Collections.Generic;

                    namespace global;

                    public partial class Vehicle 
                    {

                        public string Make { get; set; }

                    }
                    """
                And no new code files should be generated for the invalid content

    Scenario: Watch fails clearly when mermaid-codegen.config.json is absent
        Config mode requires initialization; missing config must produce a clear actionable error

            Given Emma has set up a clean test workspace
                And Emma deletes the file "mermaid-codegen.config.json"
            When Emma has started "mermaid-codegen watch" in the background
            Then the watch process should have exited with a non-zero code
                And the error output should contain "mermaid-codegen.config.json"

    Scenario: Watch explicit mode works without a config file
        Verify that all four explicit flags bypass config discovery entirely

            Given Emma has set up a clean test workspace
                And Emma has created a file "docs/vehicle.md" with:
                    """
                    ```mermaid
                    classDiagram
                    class Vehicle {
                        +String Make
                    }
                    ```
                    """
                And Emma runs "mermaid-codegen initialize -l C# -d templates-only"
                And Emma has started "mermaid-codegen watch -m docs -y Definitions -o src --templates templates-only/Templates/C#" in the background
                And the watch process is running
                And Emma waits for initial file processing to complete
            Then a file "src/global/Vehicle.Generated.cs" should be created

        @manual
        Scenario: Stop watching process gracefully
            Ensure clean shutdown of file watching service

                Given Emma has started "mermaid-codegen watch" in the background
                When Emma sends SIGTERM signal to the watch process
                Then the watch process should exit with code 0 within 10 seconds
                    And no background processes should remain running
                    And all file handles should be properly released
