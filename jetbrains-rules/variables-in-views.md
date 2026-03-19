---
apply: by model decision
instructions: when editing view files
---

# Rule: Prefer Memoized Helper Methods for View Flow Decisions

## Intent

Ensure view logic remains:

-   Declarative and readable
-   Reusable across templates and partials
-   Testable in isolation
-   Consistent with Rails conventions

------------------------------------------------------------------------

## Core Guideline

When a view needs to make a **flow decision** (e.g. conditionals, branching, visibility):

-   ❌ Do NOT compute and store intermediate state in local variables inside the template
-   ✅ Extract the logic into a **helper method**
-   ✅ Memoize the result inside the helper if it may be reused

------------------------------------------------------------------------

## What Counts as a Flow Decision

-   Conditionals (`if`, `unless`, `case`)
-   Feature flags or permission checks
-   UI state (active tab, visibility, variants)
-   Derived states from models (e.g."has overdue invoices")

------------------------------------------------------------------------

## Anti-Pattern (Avoid)

``` erb
<% show_banner = current_user.plan == "pro" && !current_user.trial_expired? %>

<% if show_banner %>
  <%= render "banner" %>
<% end %>
```

### Issues

-   Logic embedded in the view
-   Not reusable
-   Harder to test
-   Encourages duplication

------------------------------------------------------------------------

## Preferred Pattern

``` ruby
# app/helpers/users_helper.rb
def show_pro_banner?
  @show_pro_banner ||= current_user.plan == "pro" && !current_user.trial_expired?
end
```

``` erb
<% if show_pro_banner? %>
  <%= render "banner" %>
<% end %>
```

------------------------------------------------------------------------

## Memoization Rules

### Use memoization when:

-   The method is called more than once per render
-   The logic is non-trivial (multiple conditions, DB calls, etc.)

``` ruby
def expensive_condition?
  @expensive_condition ||= begin
    # complex logic
  end
end
```

### Avoid memoization when:

-   The logic is trivial and used only once

------------------------------------------------------------------------

## Naming Conventions

Use predicate methods (`?`) for boolean decisions:

-   `show_banner?`
-   `can_edit?`
-   `active_tab?(tab)`

Avoid vague names:

-   ❌ `flag`, `condition`, `value`
-   ✅ `show_upgrade_cta?`

------------------------------------------------------------------------

## When NOT to Use Helpers

-   Pure formatting → use simple helpers (no memoization needed)
-   Heavy domain logic → move to model, presenter, or service
-   Controller-level orchestration → compute in controller

------------------------------------------------------------------------

## Heuristics for Agents

Refactor when you see:

-   Local variables used for conditionals in views
-   Inline logic with `&&`, `||`, or multiple method calls
-   Repeated conditional logic across templates or partials

------------------------------------------------------------------------

## Refactoring Checklist

-   [ ] Is a local variable controlling rendering?
-   [ ] Is the logic reusable or repeated?
-   [ ] Does it involve multiple conditions?
-   [ ] Is it called more than once?

### Decision Rule

-   If ≥1 → move to helper\
-   If ≥2 → memoize
