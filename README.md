# React Eve Hook

![CI](https://github.com/sera4am/react-eve-hook/workflows/CI/badge.svg)
[![npm](https://img.shields.io/npm/v/react-eve-hook)](https://www.npmjs.com/package/react-eve-hook)
![npm downloads](https://img.shields.io/npm/dm/react-eve-hook)
[![License](https://img.shields.io/npm/l/react-eve-hook)](https://github.com/sera4am/react-eve-hook/blob/main/LICENSE)

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

```typescript jsx
import useEve, { eve } from 'react-eve-hook';

function MyComponent() {
  const evn = useEve();

  useEffect(() => {
    // Register events with anonymous functions (no cleanup needed!)
    evn.on('user-login', (user) => console.log('User logged in:', user));
    evn.on('notification', (msg) => showToast(msg));
    evn.on('data-update', (data) => updateUI(data));
    
    // return () => evn.off(); // No cleanup is required—all events are automatically cleaned up on unmount
  }, []);

  const handleClick = () => {
    evn.emit('user-login', { name: 'Alice', id: 123 });
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

```typescript jsx
interface AppEvents {
  'user-login': { name: string; id: number };
  'user-logout': undefined;
  'notification': { message: string; type: 'info' | 'error' | 'success' };
}

function TypeSafeComponent() {
  const evn = useEve<AppEvents>();

  useEffect(() => {
    evn.on('user-login', (user) => {
      // user is automatically typed as { name: string; id: number }
      console.log(user.name, user.id);
    });

    evn.on('notification', (notif) => {
      // notif is typed as { message: string; type: 'info' | 'error' | 'success' }
      if (notif.type === 'error') {
        // Type narrowing works!
      }
    });
  }, []);

  const handleLogin = () => {
    evn.emit('user-login', { name: 'Bob', id: 456 }); // ✅ Type checked
    // evn.emit('user-login', { invalid: true }); // ❌ TypeScript error
  };
}
```

## 📚 API Reference

### `useEve<T>()`

Returns an event management object with the following methods:

#### `evn.on(event, handler)`
Register an event listener.

```typescript jsx
evn.on('event-name', (data) => console.log(data));
```

#### `evn.off(event?, handler?)`
Remove event listeners with flexible options:

```typescript jsx
evn.off()                          // Remove all events from this component
evn.off('user-login')              // Remove all 'user-login' handlers
evn.off('user-login', handleLogin) // Remove specific handler
evn.off(null, handleLogin)         // Remove handler from all events
```

#### `evn.clear()`
Remove all event listeners registered by this component (alias for `evn.off()`).

#### `evn.emit(event, data?)`
Emit an event with optional data.

```typescript jsx
evn.emit('user-login', { name: 'Alice' });
evn.emit('simple-event'); // No data
```

### `useEveListen<T>(event, handler)`

Simple hook for direct event listening (manual cleanup not required):

```typescript jsx
useEveListen('user-login', (user) => {
  console.log('User:', user);
});
```

### `eve<T>(event, data?)`

Global function to emit events from anywhere:

```typescript jsx
import { eve } from 'react-eve-hook';

eve('notification', { message: 'Global event!' });
```

## 🔄 Migration from DOM Events

**Before (DOM events):**
```typescript jsx
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
```typescript jsx
const evn = useEve();

useEffect(() => {
  evn.on('click', (e) => console.log(e));
  evn.on('scroll', (e) => console.log(e));
  
  return () => evn.off(); // One line cleanup!
}, []);
```
## 💡 Pro Tips

### No Manual Cleanup Needed (Most Cases)

When using `useEffect` with empty dependencies, manual cleanup is often unnecessary thanks to automatic cleanup on unmount:

```typescript jsx
function MyComponent() {
  const evn = useEve();

  useEffect(() => {
    // These events will be automatically cleaned up when component unmounts
    evn.on('user-login', (user) => console.log('User logged in:', user));
    evn.on('notification', (msg) => showToast(msg));
    evn.on('data-update', (data) => updateUI(data));
    
    // ✅ No cleanup needed! Automatic on unmount
    // return () => evn.off(); // Optional, but not required
  }, []); // Empty deps = mount once, cleanup on unmount

  return <div>My Component</div>;
}
```

### When Manual Cleanup IS Needed

Manual cleanup is useful when you want to remove listeners before component unmounts:

```typescript jsx
function ConditionalListeners() {
  const evn = useEve();
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (isListening) {
      evn.on('some-event', handleEvent);
      
      // Clean up when isListening changes to false
      return () => evn.off('some-event', handleEvent);
    }
  }, [isListening]); // Dependencies change = cleanup needed

  return (
    <button onClick={() => setIsListening(!isListening)}>
      {isListening ? 'Stop' : 'Start'} Listening
    </button>
  );
}
```

### Best Practices Summary

1. **Empty deps + anonymous functions** = No manual cleanup needed
   ```typescript jsx
   useEffect(() => {
     evn.on('event', () => { /* anonymous function */ });
     // Automatic cleanup on unmount ✅
   }, []);
   ```

2. **Changing deps** = Manual cleanup recommended
   ```typescript jsx
   useEffect(() => {
     evn.on('event', () => { /* uses changing state */ });
     return () => evn.off('event'); // Manual cleanup ✅
   }, [changingDependency]);
   ```

3. **Conditional listeners** = Always use manual cleanup
   ```typescript jsx
   useEffect(() => {
     if (condition) {
       evn.on('event', handler);
       return () => evn.off('event', handler); // Required ✅
     }
   }, [condition]);
   ```

## 🤔 Why This Hook?

This hook solves common React event handling pain points:

1. **Manual cleanup complexity** - No more managing handler references
2. **Anonymous function support** - Write cleaner, more readable code
3. **Component-scoped events** - Events are automatically tied to component lifecycle
4. **Type safety** - Full TypeScript support with custom event types

## 🙏 Acknowledgments

This project was developed with assistance from Claude AI for TypeScript refinements, documentation, build configuration, and rubber duck debugging sessions. The core concept and implementation were human-driven!

## 📄 License

MIT © [Naoto Sera](https://github.com/sera4am)

## 🤝 Contributing

Contributions welcome! Please read our [contributing guide](CONTRIBUTING.md) first.

## 🐛 Issues

Found a bug? Please [open an issue](https://github.com/sera4am/react-eve-hook/issues).