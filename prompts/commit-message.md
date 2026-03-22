# Subject Line Rules
- Imperative mood: "Add", "Fix", "Update", "Remove"
- Use present tense (e.g., "Add feature" not "Added feature")
- Start with a lowercase verb
- Limit the subject line to 70 characters
- Separate subject from body with a blank line (if body is needed)

## Feature prefix
- If current branch is not master, add current branch name as a prefix of title between brackets instead of feature_name example: [ $GIT_BRANCH_NAME ]

# Body Guidelines
- Avoid overly verbose descriptions or unnecessary details.
- Only write a Body if commit changes are non-trivial
- Write for a junior Ruby developer: simple language they can understand during debugging.
- Add any useful information that would help a junior Ruby developer understand the impact of the change, why the change was done.

WHY — motivation, problem, or user impact. Use context if it exists for this.
WHAT changed — make this brief; the diff already shows the HOW
HOW — only when there are details about the how that are not reflected by the code or the naming in the code
Call out tradeoffs when supported by context. Do not invent details.

# Common Mistakes

| Mistake | Fix |
|---------|-----|
| Body explains HOW without context | Only include HOW when it helps debugging |
| Subject describes implementation ("Changed X to Y") | Use imperative: "Fix X", "Add Y" |
| Body repeats what the diff shows | Explain WHY it was changed |
| Subject over 70 characters | Trim scope or rephrase |
