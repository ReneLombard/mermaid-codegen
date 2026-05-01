import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import * as os from 'os';
import * as path from 'path';

/**
 * Tests for the storage.csharp.hbs template.
 *
 * The <<storage>> annotation generates EF Core annotated entity model classes.
 * It differs from <<class>> in that it:
 *   - Includes EF Core usings (DataAnnotations, DataAnnotations.Schema, EntityFrameworkCore)
 *   - Supports [Table] at the class level
 *   - Supports [Key], [DatabaseGenerated], [Column], [ForeignKey], [NotMapped] on properties
 *   - Renders navigation properties as `virtual` for lazy loading
 */

// ---------------------------------------------------------------------------
// Helpers (mirror codeGenerator.ts registrations)
// ---------------------------------------------------------------------------

function registerHelpers() {
    Handlebars.registerHelper('isEq', (a: any, b: any) => a === b);
    Handlebars.registerHelper('xmlSummary', function (comment: string, indent: string = '') {
        if (!comment) return '';
        const lines = comment.split(/\r?\n/);
        const prefix = `${indent}/// `;
        return new Handlebars.SafeString(
            [`${prefix}<summary>`, ...lines.map((l) => `${prefix}${l}`), `${prefix}</summary>`].join(os.EOL),
        );
    });
}

function loadStorageTemplate(): HandlebarsTemplateDelegate {
    const templatePath = path.resolve(__dirname, '..', 'Templates', 'C#', 'storage.csharp.hbs');
    const raw = fs.readFileSync(templatePath, 'utf-8');
    return Handlebars.compile(raw);
}

function loadClassTemplate(): HandlebarsTemplateDelegate {
    const templatePath = path.resolve(__dirname, '..', 'Templates', 'C#', 'class.csharp.hbs');
    const raw = fs.readFileSync(templatePath, 'utf-8');
    return Handlebars.compile(raw);
}

function normalize(s: string): string {
    return s
        .replace(/\r\n/g, '\n')
        .replace(/\n\n\n+/g, '\n\n')
        .trim();
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('storage.csharp.hbs — EF Core entity model template', () => {
    let template: HandlebarsTemplateDelegate;

    beforeAll(() => {
        registerHelpers();
        template = loadStorageTemplate();
    });

    // -----------------------------------------------------------------------
    // Basic output
    // -----------------------------------------------------------------------

    it('should include EF Core usings by default', () => {
        const result = template({
            Name: 'Vehicle',
            Namespace: 'Company.VTC.Models',
            Attributes: {},
        });

        expect(result).toContain('using System.ComponentModel.DataAnnotations;');
        expect(result).toContain('using System.ComponentModel.DataAnnotations.Schema;');
        expect(result).toContain('using Microsoft.EntityFrameworkCore;');
    });

    it('should render namespace and class declaration', () => {
        const result = template({
            Name: 'Vehicle',
            Namespace: 'Company.VTC.Models',
            Attributes: {},
        });

        expect(result).toContain('namespace Company.VTC.Models;');
        expect(result).toContain('public partial class Vehicle');
    });

    it('should render a plain property without annotations', () => {
        const result = template({
            Name: 'Vehicle',
            Namespace: 'Company.VTC.Models',
            Attributes: {
                Make: { Type: 'string', Scope: 'public' },
            },
        });

        expect(result).toContain('public string Make { get; set; }');
    });

    it('should render multiple plain properties', () => {
        const result = template({
            Name: 'Vehicle',
            Namespace: 'Company.VTC.Models',
            Attributes: {
                Make: { Type: 'string', Scope: 'public' },
                Year: { Type: 'int', Scope: 'public' },
                Status: { Type: 'string', Scope: 'public' },
            },
        });

        expect(result).toContain('public string Make { get; set; }');
        expect(result).toContain('public int Year { get; set; }');
        expect(result).toContain('public string Status { get; set; }');
    });

    // -----------------------------------------------------------------------
    // Class-level [Table] annotation
    // -----------------------------------------------------------------------

    it('should render [Table] with only a table name', () => {
        const result = template({
            Name: 'Vehicle',
            Namespace: 'Company.VTC.Models',
            Annotations: { Table: { Name: 'vehicles' } },
            Attributes: {},
        });

        expect(result).toContain('[Table("vehicles")]');
    });

    it('should render [Table] with name and schema', () => {
        const result = template({
            Name: 'Vehicle',
            Namespace: 'Company.VTC.Models',
            Annotations: { Table: { Name: 'vehicles', Schema: 'fleet' } },
            Attributes: {},
        });

        expect(result).toContain('[Table("vehicles", Schema = "fleet")]');
    });

    it('should NOT render [Table] when annotation is absent', () => {
        const result = template({
            Name: 'Vehicle',
            Namespace: 'Company.VTC.Models',
            Attributes: { Id: { Type: 'int', Scope: 'public' } },
        });

        expect(result).not.toContain('[Table(');
    });

    // -----------------------------------------------------------------------
    // Property-level EF Core annotations
    // -----------------------------------------------------------------------

    it('should render [Key] when Annotations.Key is set', () => {
        const result = template({
            Name: 'Vehicle',
            Namespace: 'Company.VTC.Models',
            Attributes: {
                Id: { Type: 'int', Scope: 'public', Annotations: { Key: true } },
            },
        });

        expect(result).toContain('[Key]');
        expect(result).toContain('public int Id { get; set; }');
    });

    it('should render [DatabaseGenerated(DatabaseGeneratedOption.Identity)]', () => {
        const result = template({
            Name: 'Vehicle',
            Namespace: 'Company.VTC.Models',
            Attributes: {
                Id: {
                    Type: 'int',
                    Scope: 'public',
                    Annotations: { Key: true, DatabaseGenerated: 'Identity' },
                },
            },
        });

        expect(result).toContain('[Key]');
        expect(result).toContain('[DatabaseGenerated(DatabaseGeneratedOption.Identity)]');
    });

    it('should render [DatabaseGenerated(DatabaseGeneratedOption.Computed)]', () => {
        const result = template({
            Name: 'Vehicle',
            Namespace: 'Company.VTC.Models',
            Attributes: {
                LastModified: {
                    Type: 'DateTime',
                    Scope: 'public',
                    Annotations: { DatabaseGenerated: 'Computed' },
                },
            },
        });

        expect(result).toContain('[DatabaseGenerated(DatabaseGeneratedOption.Computed)]');
    });

    it('should render [Column("col_name")] when Column.Name is set', () => {
        const result = template({
            Name: 'Vehicle',
            Namespace: 'Company.VTC.Models',
            Attributes: {
                Make: {
                    Type: 'string',
                    Scope: 'public',
                    Annotations: { Column: { Name: 'vehicle_make' } },
                },
            },
        });

        expect(result).toContain('[Column("vehicle_make")]');
    });

    it('should render [Column] with Order when both Name and Order are set', () => {
        const result = template({
            Name: 'OrderItem',
            Namespace: 'Company.VTC.Models',
            Attributes: {
                PartA: {
                    Type: 'int',
                    Scope: 'public',
                    Annotations: { Column: { Name: 'part_a', Order: 1 } },
                },
            },
        });

        expect(result).toContain('[Column("part_a", Order = 1)]');
    });

    it('should render [ForeignKey("NavigationProp")] when ForeignKey.Name is set', () => {
        const result = template({
            Name: 'Driver',
            Namespace: 'Company.VTC.Models',
            Attributes: {
                VehicleId: {
                    Type: 'int',
                    Scope: 'public',
                    Annotations: { ForeignKey: { Name: 'Vehicle' } },
                },
            },
        });

        expect(result).toContain('[ForeignKey("Vehicle")]');
    });

    it('should render [NotMapped] when Annotations.NotMapped is set', () => {
        const result = template({
            Name: 'Vehicle',
            Namespace: 'Company.VTC.Models',
            Attributes: {
                ComputedLabel: {
                    Type: 'string',
                    Scope: 'public',
                    Annotations: { NotMapped: true },
                },
            },
        });

        expect(result).toContain('[NotMapped]');
    });

    it('should render [Required] without AllowEmptyStrings', () => {
        const result = template({
            Name: 'Vehicle',
            Namespace: 'Company.VTC.Models',
            Attributes: {
                Make: {
                    Type: 'string',
                    Scope: 'public',
                    Annotations: { Required: true },
                },
            },
        });

        expect(result).toContain('[Required]');
    });

    it('should render [Required(AllowEmptyStrings = true)] when AllowEmptyStrings is set', () => {
        const result = template({
            Name: 'Vehicle',
            Namespace: 'Company.VTC.Models',
            Attributes: {
                Notes: {
                    Type: 'string',
                    Scope: 'public',
                    Annotations: { Required: { AllowEmptyStrings: true } },
                },
            },
        });

        expect(result).toContain('[Required(AllowEmptyStrings = true)]');
    });

    it('should render [MaxLength] with length and error message', () => {
        const result = template({
            Name: 'Vehicle',
            Namespace: 'Company.VTC.Models',
            Attributes: {
                Make: {
                    Type: 'string',
                    Scope: 'public',
                    Annotations: { MaxLength: { Length: 100, ErrorMessage: 'Too long' } },
                },
            },
        });

        expect(result).toContain('[MaxLength(100, ErrorMessage="Too long")]');
    });

    it('should render [MaxLength] with only length when ErrorMessage is absent', () => {
        const result = template({
            Name: 'Vehicle',
            Namespace: 'Company.VTC.Models',
            Attributes: {
                Make: {
                    Type: 'string',
                    Scope: 'public',
                    Annotations: { MaxLength: { Length: 50 } },
                },
            },
        });

        expect(result).toContain('[MaxLength(50)]');
        expect(result).not.toContain('ErrorMessage=""');
    });

    it('should render [MinLength] with length and error message', () => {
        const result = template({
            Name: 'Vehicle',
            Namespace: 'Company.VTC.Models',
            Attributes: {
                Make: {
                    Type: 'string',
                    Scope: 'public',
                    Annotations: { MinLength: { Length: 2, ErrorMessage: 'Too short' } },
                },
            },
        });

        expect(result).toContain('[MinLength(2, ErrorMessage="Too short")]');
    });

    it('should render [MinLength] with only length when ErrorMessage is absent', () => {
        const result = template({
            Name: 'Vehicle',
            Namespace: 'Company.VTC.Models',
            Attributes: {
                Make: {
                    Type: 'string',
                    Scope: 'public',
                    Annotations: { MinLength: { Length: 3 } },
                },
            },
        });

        expect(result).toContain('[MinLength(3)]');
        expect(result).not.toContain('ErrorMessage=""');
    });

    it('should render [Range] with min, max, and error message', () => {
        const result = template({
            Name: 'Vehicle',
            Namespace: 'Company.VTC.Models',
            Attributes: {
                Year: {
                    Type: 'int',
                    Scope: 'public',
                    Annotations: { Range: { Min: 1900, Max: 2100, ErrorMessage: 'Bad year' } },
                },
            },
        });

        expect(result).toContain('[Range(1900,2100, ErrorMessage = "Bad year")]');
    });

    it('should render [Range] without an error message', () => {
        const result = template({
            Name: 'Vehicle',
            Namespace: 'Company.VTC.Models',
            Attributes: {
                Year: {
                    Type: 'int',
                    Scope: 'public',
                    Annotations: { Range: { Min: 1900, Max: 2100 } },
                },
            },
        });

        expect(result).toContain('[Range(1900,2100)]');
        expect(result).not.toContain('ErrorMessage');
    });

    // -----------------------------------------------------------------------
    // Navigation properties (Compositions / Aggregations)
    // -----------------------------------------------------------------------

    it('should render virtual ICollection navigation property for many composition', () => {
        const result = template({
            Name: 'Fleet',
            Namespace: 'Company.VTC.Models',
            Attributes: {},
            Compositions: {
                Vehicle: { Multiplicity: 'many' },
            },
        });

        expect(result).toContain('public virtual ICollection<Vehicle> Vehicle { get; set; } = new List<Vehicle>();');
    });

    it('should render virtual nullable navigation property for one-to-one composition', () => {
        const result = template({
            Name: 'Driver',
            Namespace: 'Company.VTC.Models',
            Attributes: {},
            Compositions: {
                License: { Multiplicity: '1' },
            },
        });

        expect(result).toContain('public virtual License? License { get; set; }');
    });

    it('should render virtual ICollection navigation property for many aggregation', () => {
        const result = template({
            Name: 'Fleet',
            Namespace: 'Company.VTC.Models',
            Attributes: {},
            Aggregations: {
                Driver: { Multiplicity: 'many' },
            },
        });

        expect(result).toContain('public virtual ICollection<Driver> Driver { get; set; } = new List<Driver>();');
    });

    // -----------------------------------------------------------------------
    // Combined annotations on a single property
    // -----------------------------------------------------------------------

    it('should render multiple annotations on the same property', () => {
        const result = template({
            Name: 'Vehicle',
            Namespace: 'Company.VTC.Models',
            Attributes: {
                Make: {
                    Type: 'string',
                    Scope: 'public',
                    Annotations: {
                        Column: { Name: 'make' },
                        Required: true,
                        MaxLength: { Length: 100, ErrorMessage: 'Too long' },
                    },
                },
            },
        });

        expect(result).toContain('[Column("make")]');
        expect(result).toContain('[Required]');
        expect(result).toContain('[MaxLength(100, ErrorMessage="Too long")]');
        expect(result).toContain('public string Make { get; set; }');
    });

    // -----------------------------------------------------------------------
    // class.csharp.hbs independence: must NOT emit EF Core annotations
    // -----------------------------------------------------------------------

    it('class template should NOT include EF Core usings', () => {
        const classTemplate = loadClassTemplate();
        const result = classTemplate({
            Name: 'Vehicle',
            Namespace: 'Company.VTC.Models',
            Attributes: {
                Id: { Type: 'int', Scope: 'public' },
            },
        });

        expect(result).not.toContain('using Microsoft.EntityFrameworkCore;');
        expect(result).not.toContain('using System.ComponentModel.DataAnnotations.Schema;');
    });

    it('class template should NOT render [Key] even when Annotations.Key is present', () => {
        const classTemplate = loadClassTemplate();
        const result = classTemplate({
            Name: 'Vehicle',
            Namespace: 'Company.VTC.Models',
            Attributes: {
                Id: { Type: 'int', Scope: 'public', Annotations: { Key: true } },
            },
        });

        expect(result).not.toContain('[Key]');
    });

    it('class template should NOT render [Column] even when annotation is present', () => {
        const classTemplate = loadClassTemplate();
        const result = classTemplate({
            Name: 'Vehicle',
            Namespace: 'Company.VTC.Models',
            Attributes: {
                Make: {
                    Type: 'string',
                    Scope: 'public',
                    Annotations: { Column: { Name: 'make' } },
                },
            },
        });

        expect(result).not.toContain('[Column(');
    });

    // -----------------------------------------------------------------------
    // Usings passthrough
    // -----------------------------------------------------------------------

    it('should emit additional Usings from the YAML', () => {
        const result = template({
            Name: 'Vehicle',
            Namespace: 'Company.VTC.Models',
            Usings: ['Company.VTC.Shared'],
            Attributes: {},
        });

        expect(result).toContain('using Company.VTC.Shared;');
        // Built-in EF usings still present
        expect(result).toContain('using Microsoft.EntityFrameworkCore;');
    });
});
