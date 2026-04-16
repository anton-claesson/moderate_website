# CLAUDE.md

# Project Overview
We are building a highly performant, mobile-first real estate visualization web application for the Stockholm Region. The aesthetic is "Google Maps x Sims," utilizing a 3D map with representative housing units driven by static data.

## Tech Stack
- **Frontend:** Next.js (React), standard CSS/Tailwind (use what is configured).
- **Map Engine:** Mapbox GL JS (rendering LOD1/LOD2 3D models and zoom animations).
- **Data Layer:** Static GeoJSON (no backend database).
- **Deployment:** Vercel.

---

# 1. Core Directives & Behavior
- **Simplicity First:** Keep implementations as simple as possible unless explicitly requested otherwise. Avoid over-engineering or premature abstraction.
- **Strict Scoping:** Only execute the specific tasks requested. Do NOT add extra features, UI elements, or "nice-to-haves" simply because you think they are good. If you have a recommendation for an improvement, stop, explain your reasoning, and ask for permission first.
- **Ask for Clarification:** If a task, requirement, or implementation detail is ambiguous, do not guess. Stop and ask me for refinements.
- **Honesty & Transparency:** Be extremely clear about what changes you are making and why. Do not silently modify configurations or unrelated files.

# 2. Performance Standards
- **Zero-Lag Mapping:** Performance is critical. Ensure Mapbox instances are properly initialized, cleaned up on unmount, and that GeoJSON data layers are optimized.
- **React Best Practices:** Prevent unnecessary re-renders. Use `useMemo` and `useCallback` appropriately, especially when passing data to the Mapbox instance. 
- **Lightweight:** Minimize external dependencies. Only install new npm packages if absolutely necessary and approved.

# 3. Code Quality & Formatting
- **Linting & Formatting:** Ensure all code adheres to the project's ESLint and Prettier rules before committing. Code must be clean, readable, and properly formatted.
- **TypeScript:** Use strict typing. Avoid `any` types; define clear interfaces for GeoJSON properties and component props.
- **Testing:** Add sufficient testing for all new logic. Write unit tests for utility functions and data transformations, and basic component tests for the UI elements.

# 4. Git & Development Workflow
You must strictly follow this iterative workflow for every single new feature request:

1. **Branching:** Start by creating a new, descriptively named branch (e.g., `feature/mapbox-init` or `feature/contact-form`).
2. **Atomic Commits:** Implement the feature step-by-step. Commit frequently after each logical step is completed and passes linting. Use clear, conventional commit messages.
3. **Documentation:** Update the `README.md` and this `claude.md` file if architectural decisions are made or new environment variables are added.
4. **Merge Protocol:** Once the feature is fully implemented and tested, prepare it for a Pull Request. **STOP.** Do not merge the branch. Notify me that the PR is ready and wait for my explicit permission to merge into the main branch.
