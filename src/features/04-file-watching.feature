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
            And Emma has prepared initial Mermaid and YAML files
            And the file watching service is available

    Scenario: Watch Mermaid file modifications automatically
        Monitor Mermaid files and trigger YAML regeneration on changes

            Given Emma has created a file "vehicle.md" with a simple Vehicle class
                And Emma has started "mermaid-codegen watch --input-dir=. --output-dir=output" in the background
                And the watch process is running
                And Emma records the hash of "output/code/global/Vehicle.Generated.cs"
            When Emma modifies the file "vehicle.md" by adding a new property
                # And Emma waits for the file watcher to detect changes
            Then Emma verifies the hash of "output/code/global/Vehicle.Generated.cs" has changed
                And the timestamp of "output/global/Vehicle.Generated.yml" should be newer than "vehicle.md"

    Scenario: Watch YAML file modifications for code updates
        Monitor YAML files and trigger code regeneration on changes

            Given Emma has created a file "vehicle.yml" with Vehicle class definition
                And Emma has started "mermaid-codegen watch --input-dir=. --output-dir=output" in the background
                And the watch process is running
                And Emma records the hash of "output/code/global/Vehicle.Generated.cs"
            When Emma modifies "vehicle.yml" by changing a property type
                # And Emma waits for the file watcher to detect changes
            Then Emma verifies the hash of "output/code/global/Vehicle.Generated.cs" has changed
                And the timestamp of the generated file should be newer than "vehicle.yml"

    Scenario: Watch handles new file creation events
        Detect and process newly created files in watched directories

            Given Emma has started "mermaid-codegen watch --input-dir=. --output-dir=output" in the background
            When Emma creates a new file "product.md" with a Product class definition
               # And Emma waits for the file watcher to detect changes
                And Emma waits for initial file processing to complete
            Then a file "output/global/Product.Generated.yml" should be created
                And a file "output/code/global/Product.Generated.cs" should be created
        # Note: Code generation during file watching is now implemented with hash verification
    Scenario: Watch handles file deletion events appropriately
        Clean up generated files when source files are removed

            Given Emma has created a file "temp-class.md" with a class definition
                And Emma has started "mermaid-codegen watch --input-dir=. --output-dir=output" in the background
                And the corresponding output files exist
                And Emma records the hash of "output/code/global/TempClass.Generated.cs"
            When Emma deletes the file "temp-class.md"
             #   And Emma waits for the file watcher to detect changes
            Then the file "output/global/temp-class.yml" should be removed
                And the file "output/code/global/TempClass.Generated.cs" should be removed

    Scenario: Watch handles invalid file content gracefully
        Ensure watcher continues running and logs errors when invalid content is detected

            Given Emma has created a file "vehicle.md" with a simple Vehicle class
                And Emma has started "mermaid-codegen watch --input-dir=. --output-dir=output" in the background
                And the watch process is running
                And Emma records the hash of "output/code/global/Vehicle.Generated.cs"
            When Emma modifies "vehicle.md" with invalid mermaid syntax
              #  And Emma waits for the file watcher to detect changes
            Then an error should be logged to the console output
                And the watch process should continue running
                And the watch process should not crash
                And Emma verifies the hash of "output/code/global/Vehicle.Generated.cs" has not changed
                And no new output files should be generated for the invalid content

    Scenario: Watch handles invalid YAML content gracefully
        Ensure watcher continues running and logs errors when invalid YAML is detected

            Given Emma has created a file "vehicle.yml" with Vehicle class definition
                And Emma has started "mermaid-codegen watch --input-dir=. --output-dir=output" in the background
                And the watch process is running
                And Emma records the hash of "output/code/global/Vehicle.Generated.cs"
            When Emma modifies "vehicle.yml" with invalid YAML syntax
              #  And Emma waits for the file watcher to detect changes
            Then an error should be logged to the console output
                And the watch process should continue running
                And the watch process should not crash
                And Emma verifies the hash of "output/code/global/Vehicle.Generated.cs" has not changed
                And no new code files should be generated for the invalid content

        @manual
        Scenario: Stop watching process gracefully
            Ensure clean shutdown of file watching service

                Given Emma has started "mermaid-codegen watch" as process with PID
                When Emma sends SIGTERM signal to the watch process
                Then the watch process should exit with code 0 within 10 seconds
                    And no background processes should remain running
                    And all file handles should be properly released