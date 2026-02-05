# SpecFlow Feature File Guidelines - VS Code Copilot Instructions

## File Structure Requirements

When creating or modifying \*.feature files, follow this structure:

### 1. Feature/Requirement Section

- Start with `Feature:` followed by a short, clear title
- Include indented description (4 spaces/1 tab) limited to 3-4 lines

### 2. Background Section (Optional)

- Use `Background:` with short descriptive text
- Include generic background description covering:
    - Test subject: What is tested exactly
    - Test tools: Testing tools used
    - Involved applications: Other applications involved
    - Involved stubs: Stubs involved in testing
    - Other relevant factors
- Add background steps that apply to ALL scenarios

### 3. Scenarios/Test Cases

- Use `Scenario:` or `Scenario Outline:` with descriptive titles
- Include scenario-specific description (avoid duplicating background info)

## Step Guidelines

### Step Types and Usage

- **Given**: Initial context/preconditions (past perfect or present tense)
    - Example: `Given the computer has booted`
    - Example: `Given Bob logged into Windows`
- **When**: Actions/events being tested (present tense)
    - Example: `When Bob enters a username that consists of 2 characters`
- **Then**: Expected outcomes/results (present tense)
    - Example: `Then the software does not accept the username`
- **And**: Continue previous step type (indented one level more)
    - Example: `And Bob started the application`

### Writing Best Practices

#### Make Steps "Alive"

- Use person names (Bob, Alice) instead of "the user"
- Specify roles and permissions (admin, service engineer, clinical worker, physician)
- Example: `When the clinical worker loads the plan`

#### Keep Steps Easy to Understand

- Write for laypersons without domain knowledge
- Make steps self-explanatory
- Avoid technical jargon when possible

#### Be Specific

- Use sub-system names instead of generic "system"
- Specify exact properties being tested
- Example: `Then the GUIValues of the Positions of the Dwells in the 'OriginalPlan' should be`

#### Keep Implementation Simple

- If step implementation needs unit tests, split it up
- Use meaningful variable names (not auto-generated ones)
- Implementation should only affect entities mentioned in the step

### Common Pitfalls to Avoid

#### 1. Given vs When Confusion

- Given: Precondition (don't test this step)
- When: Action being tested
- Then: Must contain assertions, not actions

#### 2. Step Parameter Patterns

- Limit options when possible: `'(open|closed)'` instead of `'(.*)'`
- Balance between reusability and specificity

#### 3. Make Steps Reusable

- Prefer: `When Bob presses the '(.*)' button`
- Avoid: Multiple specific button steps for each dialog
- Ensure test executability without external help

#### 4. Avoid Misusing 'I'

- Be specific about user roles
- For API calls: `When a request for loading the plan is received by the treatment control service`

## Indentation Standards

Use consistent indentation (4 spaces or 1 tab per level):

- Level 0: Feature, Background, Scenario, Examples tables
- Level 1: Descriptions and generic text
- Level 2: Steps (Given, When, Then)
- Level 3: And steps (to group related steps visually)

## Scenario Outlines

Use for similar scenarios with different input/output combinations:

- Mark parameters as `<PARAMETER_NAME>`
- Add Examples table with parameter combinations
- Include descriptive example names in tables

## Input/Output Content Guidelines

### Inline Content Preference

When specifying input or output in files, include the actual content inline rather than referencing external files. This
improves readability and traceability.

**Preferred approach - inline Mermaid diagram:**

````gherkin
Given the following class diagram:
    ```mermaid
    classDiagram

    namespace Company.VTC.Models {
        class Vehicle {
            <<class>>
            +String Make
            +String Model
            +Number Year
            +String Status
        }
    }

    namespace Company.VTC.Controllers {
        class VehiclesController {
            <<endpoint>>
            +GetVehicleByMake(string make): Task~ActionResult~Vehicle~~
            +GetAllVehicles(): Task~ActionResult~List~Vehicle~~~
            +AddVehicle(Vehicle vehicle): Task~ActionResult~Vehicle~~
        }
    }

    VehiclesController --> Vehicle : returns
    ```
````

**Avoid file references:**

```gherkin
Given the class diagram from file "vehicle-model.mmd"
```

This approach ensures that:

- Content is visible without external dependencies
- Feature files are self-contained
- Review and debugging are easier
- Version control tracks content changes directly

## Example Structure Template

```gherkin
Feature: [Short descriptive title]
    [Feature description - 3-4 lines max]
    [Requirements specification details]

Background: [Short background description]
    [Generic background text covering test context]

        Given [initial system state]
            And [additional precondition]
            And [another precondition]

Scenario: [Descriptive scenario title]
    [Scenario-specific description]

        When [action being tested]
            And [additional action if needed]
        Then [expected outcome]
            And [additional verification if needed]

Scenario Outline: [Parameterized scenario title]
    [Description of what varies in this scenario]

        When [action with <parameter>]
            And [additional action]
        Then [expected <result>]

    Examples:
        | parameter | result |
        | value1    | outcome1 |
        | value2    | outcome2 |
```

## Review Checklist

Before completing feature files, verify:

- [ ] Feature title is clear and specific
- [ ] Requirements are properly covered
- [ ] Background applies to all scenarios
- [ ] Steps follow Given-When-Then pattern correctly
- [ ] Steps are reusable where appropriate
- [ ] Indentation is consistent
- [ ] Scenarios are human-readable and executable
- [ ] No overlap between background and scenario descriptions
- [ ] Input/output content is included inline, not referenced externally

## Integration Notes

- Features become requirements, scenarios become test cases
- Use proper work item linking for traceability
