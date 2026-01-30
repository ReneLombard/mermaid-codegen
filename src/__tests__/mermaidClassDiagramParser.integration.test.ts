import { MermaidClassDiagramParser } from '../mermaidClassDiagramParser';

describe('MermaidClassDiagramParser Integration Tests', () => {
    let parser: MermaidClassDiagramParser;

    beforeEach(() => {
        parser = new MermaidClassDiagramParser();
    });

    describe('Basic parsing functionality', () => {
        it('should parse simple class diagram', () => {
            const mermaidContent = `classDiagram

class Vehicle {
    +String Make
    +String Model
    +Number Year
    +String Status
}`;

            parser.parse(mermaidContent);
            const outcome = parser.getParseOutcome();

            expect(outcome.global).toBeDefined();
            expect(outcome.global.Vehicle).toBeDefined();
            expect(outcome.global.Vehicle.Name).toBe('Vehicle');
            expect(outcome.global.Vehicle.Type).toBe('Class');
        });

        it('should handle class with different attribute types', () => {
            const mermaidContent = `classDiagram

class Product {
    +String name
    +Number price
    +Boolean available
}`;

            parser.parse(mermaidContent);
            const outcome = parser.getParseOutcome();
            const product = outcome.global.Product;

            expect(product.Attributes.name).toBeDefined();
            expect(product.Attributes.price).toBeDefined();
            expect(product.Attributes.available).toBeDefined();
        });

        it('should handle class with methods', () => {
            const mermaidContent = `classDiagram

class VehiclesController {
    +GetAllVehicles(): List~Vehicle~
    +GetVehicleById(int id): Vehicle
    +AddVehicle(Vehicle vehicle): Vehicle
}`;

            parser.parse(mermaidContent);
            const outcome = parser.getParseOutcome();
            const controller = outcome.global.VehiclesController;

            expect(controller.Methods.GetAllVehicles).toBeDefined();
            expect(controller.Methods.GetVehicleById).toBeDefined();
            expect(controller.Methods.AddVehicle).toBeDefined();
        });

        it('should handle class type annotations', () => {
            const mermaidContent = `classDiagram

class VehiclesController {
    <<endpoint>>
    +GetAllVehicles(): List~Vehicle~
}`;

            parser.parse(mermaidContent);
            const outcome = parser.getParseOutcome();

            expect(outcome.global.VehiclesController.Type).toBe('endpoint');
        });
    });

    describe('Namespace handling', () => {
        it('should handle single namespace', () => {
            const mermaidContent = `classDiagram

namespace Company.VTC.Models {
    class Vehicle {
        +String Make
        +String Model
    }
}`;

            parser.parse(mermaidContent);
            const outcome = parser.getParseOutcome();

            expect(outcome['Company.VTC.Models']).toBeDefined();
            expect(outcome['Company.VTC.Models'].Vehicle).toBeDefined();
            expect(outcome['Company.VTC.Models'].Vehicle.Namespace).toBe('Company.VTC.Models');
        });

        it('should handle multiple namespaces', () => {
            const mermaidContent = `classDiagram

namespace Company.VTC.Models {
    class Vehicle {
        +String Make
    }
}

namespace Company.VTC.Controllers {
    class VehiclesController {
        +GetAllVehicles(): List~Vehicle~
    }
}`;

            parser.parse(mermaidContent);
            const outcome = parser.getParseOutcome();

            expect(outcome['Company.VTC.Models']).toBeDefined();
            expect(outcome['Company.VTC.Controllers']).toBeDefined();
            expect(outcome['Company.VTC.Models'].Vehicle).toBeDefined();
            expect(outcome['Company.VTC.Controllers'].VehiclesController).toBeDefined();
        });
    });

    describe('Comment handling', () => {
        it('should process comments and associate with classes', () => {
            const mermaidContent = `classDiagram

namespace Company.VTC.Models {
    %% representation of a vehicle
    class Vehicle {
        +String Make
    }
}`;

            parser.parse(mermaidContent);
            const outcome = parser.getParseOutcome();

            expect(outcome['Company.VTC.Models'].Vehicle).toBeDefined();
            expect(outcome['Company.VTC.Models'].Vehicle.Comment).toBe('representation of a vehicle');
        });

        it('should handle attribute comments', () => {
            const mermaidContent = `classDiagram

namespace Company.VTC.Models {
    class Vehicle {
        %% vehicle brand
        +String Make
        %% specific model  
        +String Model
    }
}`;

            parser.parse(mermaidContent);
            const outcome = parser.getParseOutcome();
            const vehicle = outcome['Company.VTC.Models'].Vehicle;

            expect(vehicle.Attributes.Make.Comment).toBe('vehicle brand');
            expect(vehicle.Attributes.Model.Comment).toBe('specific model');
        });
    });

    describe('Relationships', () => {
        it('should handle simple relationship', () => {
            const mermaidContent = `classDiagram

class VehiclesController
class Vehicle

VehiclesController --> Vehicle : returns`;

            parser.parse(mermaidContent);
            const outcome = parser.getParseOutcome();

            expect(outcome.global.VehiclesController).toBeDefined();
            expect(outcome.global.Vehicle).toBeDefined();
        });
    });

    describe('Edge cases', () => {
        it('should handle basic empty diagram', () => {
            const mermaidContent = `classDiagram

class EmptyClass`;

            expect(() => parser.parse(mermaidContent)).not.toThrow();
            const outcome = parser.getParseOutcome();
            expect(typeof outcome).toBe('object');
            expect(outcome.global.EmptyClass).toBeDefined();
        });

        it('should handle invalid content gracefully', () => {
            const invalidContent = `invalid mermaid content`;

            expect(() => parser.parse(invalidContent)).toThrow();
        });
    });

    describe('Class manipulation methods', () => {
        it('should add namespace correctly', () => {
            parser.addNamespace('test.namespace');
            parser.addClass('TestClass');

            const outcome = parser.getParseOutcome();
            expect(outcome['test.namespace']).toBeDefined();
            expect(outcome['test.namespace'].TestClass).toBeDefined();
        });

        it('should add multiple classes to namespace', () => {
            parser.addClassesToNamespace('test.package', ['Class1', 'Class2']);

            const outcome = parser.getParseOutcome();
            expect(outcome['test.package'].Class1).toBeDefined();
            expect(outcome['test.package'].Class2).toBeDefined();
        });

        it('should clean up labels', () => {
            const cleaned = parser.cleanupLabel('  spaced label  ');
            expect(cleaned).toBe('spaced label');
        });
    });

    describe('Real-world example', () => {
        it('should handle complex vehicle management example', () => {
            const complexMermaid = `classDiagram

namespace Company.VTC.Models {
    %% representation of a vehicle
    class Vehicle {
        <<class>>
        %% vehicle brand
        +String Make
        %% specific model
        +String Model
        %% production year
        +Number Year
        +String Status
    }
}

namespace Company.VTC.Controllers {
    class VehiclesController {
        <<endpoint>>
        +GetVehicleByMake(string make): Vehicle
        +GetAllVehicles(): List~Vehicle~
        +GetVehicleById(int id): Vehicle
        +AddVehicle(Vehicle vehicle): Vehicle
    }
}

VehiclesController --> Vehicle : returns`;

            parser.parse(complexMermaid);
            const outcome = parser.getParseOutcome();

            // Check namespaces
            expect(outcome['Company.VTC.Models']).toBeDefined();
            expect(outcome['Company.VTC.Controllers']).toBeDefined();

            // Check classes
            expect(outcome['Company.VTC.Models'].Vehicle).toBeDefined();
            expect(outcome['Company.VTC.Controllers'].VehiclesController).toBeDefined();

            // Check class types
            expect(outcome['Company.VTC.Models'].Vehicle.Type).toBe('class');
            expect(outcome['Company.VTC.Controllers'].VehiclesController.Type).toBe('endpoint');

            // Check comments
            expect(outcome['Company.VTC.Models'].Vehicle.Comment).toBe('representation of a vehicle');

            // Check attributes
            const vehicle = outcome['Company.VTC.Models'].Vehicle;
            expect(vehicle.Attributes.Make).toBeDefined();
            expect(vehicle.Attributes.Make.Comment).toBe('vehicle brand');
            expect(vehicle.Attributes.Model).toBeDefined();
            expect(vehicle.Attributes.Model.Comment).toBe('specific model');
            expect(vehicle.Attributes.Year).toBeDefined();
            expect(vehicle.Attributes.Year.Comment).toBe('production year');

            // Check methods
            const controller = outcome['Company.VTC.Controllers'].VehiclesController;
            expect(controller.Methods.GetVehicleByMake).toBeDefined();
            expect(controller.Methods.GetAllVehicles).toBeDefined();
            expect(controller.Methods.GetVehicleById).toBeDefined();
            expect(controller.Methods.AddVehicle).toBeDefined();
        });
    });
});
