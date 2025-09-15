# React Eve Hook

🎯 **Component-scoped event management with automatic cleanup for React**

A lightweight React hook that provides clean event handling with automatic cleanup when components unmount. Built on top of [mitt](https://github.com/developit/mitt) with full TypeScript support.

## ✨ Features

- 🧹 **Automatic cleanup** on component unmount
- 🎭 **Anonymous function support** - no more handler reference management
- 🔧 **Flexible removal options** - remove all, by event, or specific handlers
- 🚫 **Duplicate prevention** - prevents accidental double registration
- 📘 **Full TypeScript support** with type-safe events
- ⚡ **Lightweight** - only 200 bytes (mitt) + minimal wrapper
- ⚛️ **React-friendly** - designed for the hooks pattern

## 📦 Installation

```bash
npm install react-eve-hook
# or
yarn add react-eve-hook
# or
pnpm add react-eve-hook
```

## 🚀 Quick Start

```tsx
import useEve, { eve } from 'react-eve-hook';

function MyComponent() {
  const { on, off, emit } = useEve();

  useEffect(() => {
    // Register events with anonymous functions (no cleanup needed!)
    on('user-login', (user) => console.log('User logged in:', user));
    on('notification', (msg) => showToast(msg));
    on('data-update', (data) => updateUI(data));
    
    // All events are automatically cleaned up on unmount
    return () => off(); // Clean up all events from this component
  }, []);

  const handleClick = () => {
    emit('user-login', { name: 'Alice', id: 123 });
  };

  return <button onClick={handleClick}>Login</button>;
}

// Emit events from anywhere in your app
function OtherComponent() {
  const handleSomething = () => {
    eve('notification', { message: 'Hello!', type: 'success' });
  };
}
```

## 🎯 Type-Safe Events

Define your event types for full type safety:

```tsx
interface AppEvents {
  'user-login': { name: string; id: number };
  'user-logout': undefined;
  'notification': { message: string; type: 'info' | 'error' | 'success' };
}

function TypeSafeComponent() {
  const { on, emit } = useEve<AppEvents>();

  useEffect(() => {
    on('user-login', (user) => {
      // user is automatically typed as { name: string; id: number }
      console.log(user.name, user.id);
    });

    on('notification', (notif) => {
      // notif is typed as { message: string; type: 'info' | 'error' | 'success' }
      if (notif.type === 'error') {
        // Type narrowing works!
      }
    });
  }, []);

  const handleLogin = () => {
    emit('user-login', { name: 'Bob', id: 456 }); // ✅ Type checked
    // emit('user-login', { invalid: true }); // ❌ TypeScript error
  };
}
```

## 📚 API Reference

### `useEve<T>()`

Returns an object with event management functions:

#### `on(event, handler)`
Register an event listener.

```tsx
on('event-name', (data) => console.log(data));
```

#### `off(event?, handler?)`
Remove event listeners with flexible options:

```tsx
off()                          // Remove all events from this component
off('user-login')              // Remove all 'user-login' handlers
off('user-login', handleLogin) // Remove specific handler
off(null, handleLogin)         // Remove handler from all events
```

#### `clear()`
Remove all event listeners registered by this component (alias for `off()`).

#### `emit(event, data?)`
Emit an event with optional data.

```tsx
emit('user-login', { name: 'Alice' });
emit('simple-event'); // No data
```

### `useEveListen<T>(event, handler)`

Simple hook for direct event listening (manual cleanup required):

```tsx
useEveListen('user-login', (user) => {
  console.log('User:', user);
});
```

### `eve<T>(event, data?)`

Global function to emit events from anywhere:

```tsx
import { eve } from 'react-eve-hook';

eve('notification', { message: 'Global event!' });
```

## 🔄 Migration from DOM Events

**Before (DOM events):**
```tsx
useEffect(() => {
  const handler1 = (e) => console.log(e);
  const handler2 = (e) => console.log(e);
  
  element.addEventListener('click', handler1);
  element.addEventListener('scroll', handler2);
  
  return () => {
    element.removeEventListener('click', handler1);
    element.removeEventListener('scroll', handler2);
  };
}, []);
```

**After (react-eve-hook):**
```tsx
useEffect(() => {
  on('click', (e) => console.log(e));
  on('scroll', (e) => console.log(e));
  
  return () => off(); // One line cleanup!
}, []);
```

## 🤝 Why This Hook?

This hook solves common React event handling pain points:

1. **Manual cleanup complexity** - No more managing handler references
2. **Anonymous function support** - Write cleaner, more readable code
3. **Component-scoped events** - Events are automatically tied to component lifecycle
4. **Type safety** - Full TypeScript support with custom event types

## 🙏 Acknowledgments

This project was developed with assistance from Claude AI for TypeScript refinements, documentation, and build configuration. The core concept and implementation were human-driven!

## 📄 License

MIT © [Naoto Sera](https://github.com/sera4am)

## 🤝 Contributing

Contributions welcome! Please read our [contributing guide](CONTRIBUTING.md) first.

## 🐛 Issues

Found a bug? Please [open an issue](https://github.com/sera4am/react-eve-hook/issues).