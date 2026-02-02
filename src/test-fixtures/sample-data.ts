export const SAMPLE_MERMAID_DIAGRAMS = {
    SIMPLE_CLASS: `
\`\`\`mermaid
classDiagram
class Vehicle {
    +String Make
    +String Model
    +Number Year
}
\`\`\`
    `,

    WITH_NAMESPACE: `
\`\`\`mermaid
classDiagram
namespace Company.VTC.Models {
    class Vehicle {
        +String Make
        +String Model
        +Number Year
        +String Status
    }
}
\`\`\`
    `,

    WITH_CONTROLLER: `
\`\`\`mermaid
classDiagram
namespace Company.VTC.Controllers {
    class VehicleController {
        <<endpoint>>
        +GetVehicles(): List~Vehicle~
        +GetVehicle(id: int): Vehicle
        +AddVehicle(vehicle: Vehicle): Vehicle
    }
}
\`\`\`
    `,

    COMPREHENSIVE: `
\`\`\`mermaid
classDiagram

namespace Company.VTC.Models {
    class Vehicle {
        <<class>>
        +String Make
        +String Model
        +Number Year
        +String Status
    }
    
    class Driver {
        <<class>>
        +String Name
        +String LicenseNumber
        +Date ExpiryDate
    }
}

namespace Company.VTC.Controllers {
    class VehiclesController {
        <<endpoint>>
        +GetVehicleByMake(string make): Task~ActionResult~Vehicle~~
        +GetAllVehicles(): Task~ActionResult~List~Vehicle~~~
        +AddVehicle(Vehicle vehicle): Task~ActionResult~Vehicle~~
        +UpdateVehicle(int id, Vehicle vehicle): Task~IActionResult~
        +DeleteVehicle(int id): Task~IActionResult~
    }
    
    class DriversController {
        <<endpoint>>
        +GetDriver(int id): Task~ActionResult~Driver~~
        +GetAllDrivers(): Task~ActionResult~List~Driver~~~
    }
}

VehiclesController --> Vehicle : returns
DriversController --> Driver : returns
\`\`\`
    `,

    INVALID_SYNTAX: `
\`\`\`mermaid
classDiagram
class InvalidClass {
    invalid property without type
    +method_without_parentheses
    malformed: syntax here
\`\`\`
    `,
};

export const SAMPLE_YAML_FILES = {
    VEHICLE_CLASS: `
Name: Vehicle
namespace: Company.VTC.Models
type: class
description: Represents a vehicle in the fleet
properties:
  - name: Make
    type: String
    visibility: public
    description: The manufacturer of the vehicle
  - name: Model
    type: String
    visibility: public
    description: The specific model of the vehicle
  - name: Year
    type: Number
    visibility: public
    description: The year the vehicle was manufactured
  - name: Status
    type: String
    visibility: public
    description: Current status of the vehicle
    `,

    VEHICLE_CONTROLLER: `
Name: VehicleController
namespace: Company.VTC.Controllers
type: endpoint
description: API controller for vehicle operations
methods:
  - name: GetVehicles
    returnType: Task<ActionResult<List<Vehicle>>>
    visibility: public
    description: Get all vehicles
    httpMethod: GET
  - name: GetVehicle
    returnType: Task<ActionResult<Vehicle>>
    visibility: public
    description: Get a specific vehicle by ID
    httpMethod: GET
    parameters:
      - name: id
        type: int
        description: Vehicle ID
  - name: AddVehicle
    returnType: Task<ActionResult<Vehicle>>
    visibility: public
    description: Add a new vehicle
    httpMethod: POST
    parameters:
      - name: vehicle
        type: Vehicle
        description: Vehicle to add
    `,
};

export const TEMPLATE_FILES = {
    CSHARP_CLASS: `
using System;
using System.ComponentModel.DataAnnotations;

namespace {{namespace}} {
    /// <summary>
    /// {{description}}
    /// </summary>
    public class {{name}} {
{{#each properties}}
        /// <summary>
        /// {{description}}
        /// </summary>
        public {{type}} {{name}} { get; set; }

{{/each}}
    }
}`,

    CSHARP_CONTROLLER: `
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace {{namespace}} {
    /// <summary>
    /// {{description}}
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class {{name}} : ControllerBase {
{{#each methods}}

        /// <summary>
        /// {{description}}
        /// </summary>
        [Http{{httpMethod}}{{#if parameters}}("{id}"){{/if}}]
        public async {{returnType}} {{name}}({{#each parameters}}{{type}} {{name}}{{#unless @last}}, {{/unless}}{{/each}}) {
            // TODO: Implement {{name}}
            throw new NotImplementedException("{{name}} not yet implemented");
        }
{{/each}}
    }
}`,

    DOCUMENTATION: `
# {{name}}

**Namespace:** {{namespace}}  
**Type:** {{type}}

{{description}}

{{#if properties}}
## Properties

{{#each properties}}
### {{name}}
- **Type:** {{type}}
- **Visibility:** {{visibility}}
- **Description:** {{description}}

{{/each}}
{{/if}}

{{#if methods}}
## Methods

{{#each methods}}
### {{name}}
- **Return Type:** {{returnType}}
- **Visibility:** {{visibility}}
- **HTTP Method:** {{httpMethod}}
- **Description:** {{description}}

{{#if parameters}}
**Parameters:**
{{#each parameters}}
- \`{{name}}\` ({{type}}): {{description}}
{{/each}}
{{/if}}

{{/each}}
{{/if}}
`,
};

export const CONFIG_FILES = {
    CUCUMBER_CONFIG: `
const config = {
    default: {
        require: ['features/step_definitions/**/*.js', 'features/support/**/*.js'],
        format: ['progress-bar', 'html:cucumber-report.html', 'json:cucumber-report.json'],
        paths: ['features/**/*.feature'],
        failFast: false,
        parallel: 1,
        retry: 0,
        timeout: 60000
    },
    dev: {
        require: ['features/step_definitions/**/*.ts', 'features/support/**/*.ts'],
        requireModule: ['ts-node/register'],
        format: ['progress-bar'],
        paths: ['features/**/*.feature'],
        failFast: true,
        parallel: 1,
        retry: 1
    }
};

module.exports = config;`,

    JEST_INTEGRATION_CONFIG: `
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/features/**/*.steps.ts'],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/__tests__/**',
        '!src/features/**'
    ],
    coverageDirectory: 'coverage-cucumber',
    coverageReporters: ['text', 'lcov', 'html'],
    setupFilesAfterEnv: ['<rootDir>/features/support/jest.setup.ts']
};`,
};

export function createMermaidFile(name: string, content: string): string {
    return `# ${name}

## Description

Test mermaid file for integration testing.

## Diagram

${content}
`;
}

export function createCustomTemplate(templateType: string, customizations: any): string {
    const base = TEMPLATE_FILES[templateType as keyof typeof TEMPLATE_FILES];

    // Apply customizations
    let customized = base;
    if (customizations.addTimestamps) {
        customized = customized.replace(
            '{{#each properties}}',
            `        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

{{#each properties}}`,
        );
    }

    if (customizations.prefix) {
        customized = customized.replace(/{{name}}/g, `{{prefix}}{{name}}`);
    }

    return customized;
}
