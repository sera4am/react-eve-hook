# Contributing to React Eve Hook

Thank you for your interest in contributing to React Eve Hook! We welcome contributions from everyone.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/sera4am/react-eve-hook.git
   cd react-eve-hook
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch** for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Building
```bash
npm run build
```

### Type Checking
```bash
npm run typecheck
```

### Linting
```bash
npm run lint
```

### Testing
```bash
npm test
```

## How to Contribute

### Reporting Bugs
- Use the [GitHub issue tracker](https://github.com/sera4am/react-eve-hook/issues)
- Check if the issue already exists
- Provide a clear description and reproduction steps
- Include relevant environment details (React version, TypeScript version, etc.)

### Suggesting Features
- Open an issue with the "enhancement" label
- Describe the use case and why it would be valuable
- Consider if it aligns with the library's scope (component-scoped event management)

### Pull Requests
1. **Ensure your code**:
   - Follows TypeScript best practices
   - Includes proper JSDoc comments
   - Maintains type safety
   - Doesn't break existing functionality

2. **Before submitting**:
   - Run `npm run typecheck` (must pass)
   - Run `npm run build` (must succeed)
   - Update documentation if needed

3. **Pull request guidelines**:
   - Write a clear description of what the PR does
   - Reference any related issues
   - Keep changes focused and atomic
   - Include tests for new functionality (when applicable)

## Code Style

- Use TypeScript for all code
- Follow the existing code style and patterns
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Maintain the component-scoped philosophy of the library

## Project Structure

```
src/
├── eve.tsx          # Main hook implementation
└── index.ts         # Public API exports
```

## Core Principles

This library follows these design principles:
- **Component-scoped**: Events are tied to component lifecycle
- **Automatic cleanup**: No manual cleanup required
- **Type safety**: Full TypeScript support
- **Simplicity**: Minimal API surface
- **React-friendly**: Designed for the hooks pattern

## Questions?

If you have questions about contributing, feel free to:
- Open an issue for discussion
- Start a discussion in the repository

## Recognition

Contributors will be acknowledged in the project's documentation and releases.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.