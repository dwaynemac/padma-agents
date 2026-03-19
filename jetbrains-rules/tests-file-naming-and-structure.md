---
apply: by model decision
instructions: When creating or renaming test files
---

Test File Structure & Naming Rules

- Test files must mirror the `app/` directory structure exactly.
- Each test file must have a 1:1 correspondence with the file it tests.
- The relationship between test and implementation should be immediately clear from the path and filename.

Mapping rule:
spec/<path>/<file_name>_spec.rb → app/<path>/<file_name>.rb

Examples:
spec/models/user_spec.rb → app/models/user.rb
spec/controllers/accounts_controller_spec.rb → app/controllers/accounts_controller.rb
spec/services/payment_processor_spec.rb → app/services/payment_processor.rb

Constraints:
- Do not group multiple classes/modules into a single spec file.
- Avoid creating specs that do not directly map to an implementation file.
- File and directory names should remain consistent (including namespaces).
