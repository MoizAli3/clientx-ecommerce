Generate and run tests for the current code.

Steps:
1. Read the code to understand what needs testing
2. Identify: unit tests needed, integration tests needed, edge cases
3. Write tests using the project's existing test framework (Jest, Vitest, Pytest, etc.)
4. Cover:
   - Happy path
   - Error/failure cases
   - Edge cases (empty, null, max values)
   - Auth/permission boundaries
5. Run the tests: `npm test` or `pytest` or whatever the project uses
6. Fix any failing tests
7. Report: X tests passed, Y failed, coverage %

Test naming: descriptive — `should return 404 when product not found`
Group with `describe` blocks by feature/component.

For React components: test user interactions, not implementation details.
For API routes: test status codes, response shape, auth enforcement.
For utils: test pure logic with table-driven tests.
