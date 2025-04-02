# Design session Vehicle management system

## Purpose

The design session is intended to cater for designing a Vehicle fleet mananagement tool

## Introduction

The design session is intended to cater for designing a Vehicle fleet mananagement tool

## Participants

| Participant   | Role             |
| ------------- | ---------------- |
| Alice Johnson | Project Manager  |
| Bob Smith     | Lead Developer   |
| Carol White   | UX Designer      |
| David Brown   | QA Engineer      |
| Eva Green     | Business Analyst |

## Logical view

The logical view of the Vehicle Management System (VMS) includes the following components:

1. **Vehicle Inventory**: Manages the list of vehicles, including their details such as make, model, year, and status.
2. **Fleet Management**: Handles the assignment of vehicles to drivers, scheduling maintenance, and tracking vehicle usage.
3. **Driver Management**: Manages driver information, including licenses, certifications, and driving history.
4. **Maintenance Management**: Tracks maintenance schedules, service history, and repair records for each vehicle.
5. **Reporting and Analytics**: Provides insights into fleet performance, vehicle utilization, and maintenance costs.

```mermaid
classDiagram
namespace Models {
    class Vehicle {
        <<class>>
        +String Make
        +String Model
        +String Model
        +int Year
        +String Status
    }

    class Fleet {
        <<class>>
        +List~Vehicle~ Vehicles
    }

    class Driver {
        <<class>>
        +String Name
        +String LicenseNumber
        +List~Vehicle~ AssignedVehicles
    }

    class Maintenance {
        <<class>>
        +Date ScheduleDate
        +String ServiceType
        +String ServiceCenter
    }

    class Report {
        <<class>>
    }
}
namespace Repository {
    class VehicleRepository {
        <<class>>
        +Task AddVehicleAsync()
        +Task RemoveVehicleAsync()
        +Task UpdateVehicleAsync()
        +Task GetVehicleByIdAsync()
    }

    class FleetRepository {
        <<class>>
        +Task AddFleetAsync()
        +Task RemoveFleetAsync()
        +Task UpdateFleetAsync()
        +Task GetFleetByIdAsync()
    }

    class DriverRepository {
        <<class>>
        +Task AddDriverAsync()
        +Task RemoveDriverAsync()
        +Task UpdateDriverAsync()
        +Task GetDriverByIdAsync()
    }

    class MaintenanceRepository {
        <<class>>
        +Task AddMaintenanceAsync()
        +Task RemoveMaintenanceAsync()
        +Task UpdateMaintenanceAsync()
        +Task GetMaintenanceByIdAsync()
    }

    class ReportRepository {
        <<class>>
        +Task AddReportAsync()
        +Task RemoveReportAsync()
        +Task UpdateReportAsync()
        +Task GetReportByIdAsync()
    }
}
namespace Controller {
    class VehicleController {
        <<class>>
        +Task CreateVehicleAsync()
        +Task DeleteVehicleAsync()
        +Task EditVehicleAsync()
        +Task GetVehicleAsync()
    }

    class FleetController {
        <<class>>
        +Task CreateFleetAsync()
        +Task DeleteFleetAsync()
        +Task EditFleetAsync()
        +Task GetFleetAsync()
    }

    class DriverController {
        <<class>>
        +Task CreateDriverAsync()
        +Task DeleteDriverAsync()
        +Task EditDriverAsync()
        +Task GetDriverAsync()
    }

    class MaintenanceController {
        <<class>>
        +Task CreateMaintenanceAsync()
        +Task DeleteMaintenanceAsync()
        +Task EditMaintenanceAsync()
        +Task GetMaintenanceAsync()
    }

    class ReportController {
        <<class>>
        +Task CreateReportAsync()
        +Task DeleteReportAsync()
        +Task EditReportAsync()
        +Task GetReportAsync()
    }
}
```
    Vehicle --> Fleet
    Fleet --> Driver
    Fleet --> Maintenance
    Fleet --> Report
    VehicleRepository --> Vehicle
    FleetRepository --> Fleet
    DriverRepository --> Driver
    MaintenanceRepository --> Maintenance
    ReportRepository --> Report
    VehicleController --> VehicleRepository
    FleetController --> FleetRepository
    DriverController --> DriverRepository
    MaintenanceController --> MaintenanceRepository
    ReportController --> ReportRepository
## Dynamic View
