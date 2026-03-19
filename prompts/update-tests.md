Run the tests in `[tests-file]` and determine whether any failures are caused by a code regression or by outdated tests.

If you are 100% certain a test is outdated, update only the outdated test, then re-run the same test file to confirm it passes.

If you are not fully certain the test is outdated, do not change the test. Instead, create a concise report that includes:
- which test(s) failed,
- the most likely cause of each failure,
- whether the failure appears to come from production code or test expectations,
- and your recommended next step.
