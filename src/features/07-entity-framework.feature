Feature: Entity Framework Core Storage Support
    Code generation for EF Core annotated entity model classes via the <<storage>> annotation.
    Produces entity classes with EF Core data annotations ([Key], [Column], [ForeignKey], etc.)
    and virtual navigation properties for lazy loading — without modifying class.csharp.hbs.
    Ensures <<class>> and <<storage>> remain independent and do not share annotation logic.

Background: Entity Framework code generation environment
    Test subject: Storage template and EF Core annotation handling
    Test tools: Template processor, code generator, file system validation
    Involved applications: Handlebars template engine, code generator, file I/O
    Test scope: Storage entity generation, EF model annotations, navigation properties

        Given Eve has prepared a clean test workspace
            And the file watching service is available
            And YAML files containing class definitions are available
            And the code generation engine is properly configured

    Scenario: Generate a basic EF Core entity using the built-in storage template
        Produce an entity class from <<storage>> with EF Core usings included

            Given Eve has created a file "vehicle-storage.yml" with content:
            """
            Name: Vehicle
            Namespace: Company.VTC.Models
            Type: storage
            Attributes:
              Id:
                Type: int
                Scope: Public
              Make:
                Type: String
                Scope: Public
              Year:
                Type: Number
                Scope: Public
            """
            When Eve runs "mermaid-codegen generate -i vehicle-storage.yml -o output/code -t Templates/C#"
            Then a file "output/code/Models/Vehicle.Generated.cs" should be created
                And the file "output/code/Models/Vehicle.Generated.cs" should contain:
                """
                using System;
                using System.Collections.Generic;
                using System.ComponentModel.DataAnnotations;
                using System.ComponentModel.DataAnnotations.Schema;
                using Microsoft.EntityFrameworkCore;

                namespace Company.VTC.Models;

                public partial class Vehicle
                {

                    public int Id { get; set; }

                    public string Make { get; set; }

                    public int Year { get; set; }

                }
                """

    Scenario: Generate an EF Core entity with [Key] and [DatabaseGenerated] annotations
        Produce a primary-key property decorated with [Key] and [DatabaseGenerated]

            Given Eve has created a file "vehicle-key.yml" with content:
            """
            Name: Vehicle
            Namespace: Company.VTC.Models
            Type: storage
            Attributes:
              Id:
                Type: int
                Scope: Public
                Annotations:
                  Key: true
                  DatabaseGenerated: Identity
              Make:
                Type: String
                Scope: Public
                Annotations:
                  Required: true
                  MaxLength:
                    Length: 100
                    ErrorMessage: "Make cannot exceed 100 characters"
            """
            When Eve runs "mermaid-codegen generate -i vehicle-key.yml -o output/code -t Templates/C#"
            Then a file "output/code/Models/Vehicle.Generated.cs" should be created
                And the file "output/code/Models/Vehicle.Generated.cs" should contain:
                """
                using System;
                using System.Collections.Generic;
                using System.ComponentModel.DataAnnotations;
                using System.ComponentModel.DataAnnotations.Schema;
                using Microsoft.EntityFrameworkCore;

                namespace Company.VTC.Models;

                public partial class Vehicle
                {

                    [Key]
                    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
                    public int Id { get; set; }

                    [Required]
                    [MaxLength(100, ErrorMessage="Make cannot exceed 100 characters")]
                    public string Make { get; set; }

                }
                """

    Scenario: Generate an EF Core entity with [Column] and [ForeignKey] annotations
        Produce property-level column and foreign-key decorations

            Given Eve has created a file "driver-annotations.yml" with content:
            """
            Name: Driver
            Namespace: Company.VTC.Models
            Type: storage
            Attributes:
              Id:
                Type: int
                Scope: Public
                Annotations:
                  Key: true
              LicenseNumber:
                Type: String
                Scope: Public
                Annotations:
                  Column:
                    Name: license_number
                  Required: true
              AssignedVehicleId:
                Type: int
                Scope: Public
                Annotations:
                  ForeignKey:
                    Name: AssignedVehicle
            """
            When Eve runs "mermaid-codegen generate -i driver-annotations.yml -o output/code -t Templates/C#"
            Then a file "output/code/Models/Driver.Generated.cs" should be created
                And the file "output/code/Models/Driver.Generated.cs" should contain:
                """
                using System;
                using System.Collections.Generic;
                using System.ComponentModel.DataAnnotations;
                using System.ComponentModel.DataAnnotations.Schema;
                using Microsoft.EntityFrameworkCore;

                namespace Company.VTC.Models;

                public partial class Driver
                {

                    [Key]
                    public int Id { get; set; }

                    [Column("license_number")]
                    [Required]
                    public string LicenseNumber { get; set; }

                    [ForeignKey("AssignedVehicle")]
                    public int AssignedVehicleId { get; set; }

                }
                """

    Scenario: Generate an EF Core entity with [Table] class-level annotation
        Produce a class-level [Table] attribute mapping the entity to a named table and schema

            Given Eve has created a file "vehicle-table.yml" with content:
            """
            Name: Vehicle
            Namespace: Company.VTC.Models
            Type: storage
            Annotations:
              Table:
                Name: vehicles
                Schema: fleet
            Attributes:
              Id:
                Type: int
                Scope: Public
                Annotations:
                  Key: true
              Make:
                Type: String
                Scope: Public
            """
            When Eve runs "mermaid-codegen generate -i vehicle-table.yml -o output/code -t Templates/C#"
            Then a file "output/code/Models/Vehicle.Generated.cs" should be created
                And the file "output/code/Models/Vehicle.Generated.cs" should contain:
                """
                using System;
                using System.Collections.Generic;
                using System.ComponentModel.DataAnnotations;
                using System.ComponentModel.DataAnnotations.Schema;
                using Microsoft.EntityFrameworkCore;

                namespace Company.VTC.Models;

                [Table("vehicles", Schema = "fleet")]
                public partial class Vehicle
                {

                    [Key]
                    public int Id { get; set; }

                    public string Make { get; set; }

                }
                """

    Scenario: Generate an EF Core entity with [NotMapped] annotation
        Exclude a computed property from EF Core mapping

            Given Eve has created a file "vehicle-notmapped.yml" with content:
            """
            Name: Vehicle
            Namespace: Company.VTC.Models
            Type: storage
            Attributes:
              Id:
                Type: int
                Scope: Public
                Annotations:
                  Key: true
              Make:
                Type: String
                Scope: Public
              FullLabel:
                Type: String
                Scope: Public
                Annotations:
                  NotMapped: true
            """
            When Eve runs "mermaid-codegen generate -i vehicle-notmapped.yml -o output/code -t Templates/C#"
            Then a file "output/code/Models/Vehicle.Generated.cs" should be created
                And the file "output/code/Models/Vehicle.Generated.cs" should contain:
                """
                using System;
                using System.Collections.Generic;
                using System.ComponentModel.DataAnnotations;
                using System.ComponentModel.DataAnnotations.Schema;
                using Microsoft.EntityFrameworkCore;

                namespace Company.VTC.Models;

                public partial class Vehicle
                {

                    [Key]
                    public int Id { get; set; }

                    public string Make { get; set; }

                    [NotMapped]
                    public string FullLabel { get; set; }

                }
                """

    Scenario: <<class>> annotation does NOT include EF Core annotations
        Confirm that class.csharp.hbs is unchanged and does not emit EF Core attributes

            Given Eve has created a file "vehicle-class.yml" with content:
            """
            Name: Vehicle
            Namespace: Company.VTC.Models
            Type: class
            Attributes:
              Id:
                Type: int
                Scope: Public
              Make:
                Type: String
                Scope: Public
            """
            When Eve runs "mermaid-codegen generate -i vehicle-class.yml -o output/code -t Templates/C#"
            Then a file "output/code/Models/Vehicle.Generated.cs" should be created
                And the file "output/code/Models/Vehicle.Generated.cs" should contain:
                """
                using System;
                using System.Collections.Generic;

                namespace Company.VTC.Models;

                public partial class Vehicle 
                {

                    public int Id { get; set; }

                    public string Make { get; set; }

                }
                """

    Scenario: End-to-end: Mermaid diagram transforms to EF entities and Custom.yml adds Required and Range constraints
        Full pipeline: <<storage>> Mermaid diagram -> transform -> Custom.yml with validation annotations -> generate -> compile
        Verifies that annotations defined in Custom.yml are merged with the Generated.yml and rendered in the final C# entity

            Given Eve has created a file "fleet-vehicles.md" with content:
            """
            ```mermaid
            classDiagram

            namespace Company.VTC.Models {
                class Vehicle {
                    <<storage>>
                    +String Make
                    +String Model
                    +Number Year
                    +String Status
                }
            }
            ```
            """
            When Eve runs "mermaid-codegen transform -i fleet-vehicles.md -o output/yml"
            Then a file "output/yml/Company/VTC/Models/Vehicle.Generated.yml" should be created
            When Eve has created a file "output/yml/Company/VTC/Models/Vehicle.Custom.yml" with content:
            """
            Name: Vehicle
            Namespace: Company.VTC.Models
            Type: storage
            Attributes:
              Make:
                Annotations:
                  Required: true
                  MaxLength:
                    Length: 100
                    ErrorMessage: "Make cannot exceed 100 characters"
              Year:
                Annotations:
                  Range:
                    Min: 1900
                    Max: 2100
                    ErrorMessage: "Year must be between 1900 and 2100"
            """
            When Eve runs "mermaid-codegen generate -i output/yml -o output/code -t Templates/C#"
            Then a file "output/code/Models/Vehicle.Generated.cs" should be created
                And the file "output/code/Models/Vehicle.Generated.cs" should contain:
                """
                using System;
                using System.Collections.Generic;
                using System.ComponentModel.DataAnnotations;
                using System.ComponentModel.DataAnnotations.Schema;
                using Microsoft.EntityFrameworkCore;

                namespace Company.VTC.Models;

                public partial class Vehicle
                {

                    [Required]
                    [MaxLength(100, ErrorMessage="Make cannot exceed 100 characters")]
                    public string Make { get; set; }

                    public string Model { get; set; }

                    [Range(1900,2100, ErrorMessage = "Year must be between 1900 and 2100")]
                    public int Year { get; set; }

                    public string Status { get; set; }

                }
                """
                And Eve can compile the generated code with "dotnet build output/code" successfully

    Scenario: End-to-end: Mermaid diagram transforms to EF entities and Custom.yml adds ForeignKey and Column annotations
        Full pipeline: <<storage>> Mermaid diagram -> transform -> Custom.yml with FK/column annotations -> generate -> compile
        Verifies that FK and column annotations defined in Custom.yml are merged and rendered in the Driver entity

            Given Eve has created a file "fleet-drivers.md" with content:
            """
            ```mermaid
            classDiagram

            namespace Company.VTC.Models {
                class Vehicle {
                    <<storage>>
                    +String Make
                    +Number Year
                }

                class Driver {
                    <<storage>>
                    +String Name
                    +String LicenseNumber
                }
            }
            ```
            """
            When Eve runs "mermaid-codegen transform -i fleet-drivers.md -o output/yml"
            Then a file "output/yml/Company/VTC/Models/Vehicle.Generated.yml" should be created
                And a file "output/yml/Company/VTC/Models/Driver.Generated.yml" should be created
            When Eve has created a file "output/yml/Company/VTC/Models/Driver.Custom.yml" with content:
            """
            Name: Driver
            Namespace: Company.VTC.Models
            Type: storage
            Attributes:
              AssignedVehicleId:
                Type: int
                Scope: Public
                Annotations:
                  ForeignKey:
                    Name: AssignedVehicle
              LicenseNumber:
                Annotations:
                  Column:
                    Name: license_number
                  Required: true
                  MaxLength:
                    Length: 50
                    ErrorMessage: "License number cannot exceed 50 characters"
            """
            When Eve runs "mermaid-codegen generate -i output/yml -o output/code -t Templates/C#"
            Then a file "output/code/Models/Vehicle.Generated.cs" should be created
                And a file "output/code/Models/Driver.Generated.cs" should be created
                And the file "output/code/Models/Driver.Generated.cs" should contain:
                """
                using System;
                using System.Collections.Generic;
                using System.ComponentModel.DataAnnotations;
                using System.ComponentModel.DataAnnotations.Schema;
                using Microsoft.EntityFrameworkCore;

                namespace Company.VTC.Models;

                public partial class Driver
                {

                    public string Name { get; set; }

                    [Column("license_number")]
                    [Required]
                    [MaxLength(50, ErrorMessage="License number cannot exceed 50 characters")]
                    public string LicenseNumber { get; set; }

                    [ForeignKey("AssignedVehicle")]
                    public int AssignedVehicleId { get; set; }

                }
                """
                And Eve can compile the generated code with "dotnet build output/code" successfully
