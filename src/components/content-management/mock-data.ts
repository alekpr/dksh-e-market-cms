import type { Content } from './types'

export const initialContent: Content[] = [
  {
    id: '1',
    title: 'Getting Started with React',
    excerpt: 'Learn the basics of React development and build your first component.',
    content: 'React is a powerful JavaScript library for building user interfaces. In this comprehensive guide, we will explore the fundamental concepts of React development including components, props, state management, and lifecycle methods. We\'ll start with creating your first component and gradually build more complex applications.\n\nReact\'s component-based architecture makes it easy to build reusable UI elements. Each component encapsulates its own state and logic, making your code more maintainable and scalable.\n\nKey concepts covered:\n- JSX syntax and how it works\n- Component props and state\n- Event handling in React\n- Conditional rendering\n- Lists and keys\n- Form handling\n\nBy the end of this tutorial, you\'ll have a solid foundation in React development and be ready to build your own applications.',
    status: 'published',
    category: 'Tutorial',
    author: 'John Doe',
    publishDate: '2024-01-15',
    tags: ['React', 'JavaScript', 'Frontend'],
    views: 1250,
    featured: true
  },
  {
    id: '2',
    title: 'Advanced TypeScript Patterns',
    excerpt: 'Discover advanced TypeScript patterns for scalable applications.',
    content: 'TypeScript provides powerful type system features that can help you build more robust applications. This article covers advanced patterns including conditional types, mapped types, template literal types, and utility types. Learn how to leverage these features to create more maintainable and type-safe code.\n\nAdvanced patterns covered:\n- Conditional types and type inference\n- Mapped types for transforming existing types\n- Template literal types for string manipulation\n- Utility types like Pick, Omit, and Record\n- Generic constraints and type guards\n- Declaration merging and module augmentation\n\nThese patterns will help you write more expressive and type-safe TypeScript code, reducing runtime errors and improving developer experience.',
    status: 'published',
    category: 'Programming',
    author: 'Jane Smith',
    publishDate: '2024-01-20',
    tags: ['TypeScript', 'JavaScript', 'Patterns'],
    views: 890,
    featured: false
  },
  {
    id: '3',
    title: 'Building Modern UI with ShadCN',
    excerpt: 'Create beautiful and accessible user interfaces with ShadCN UI.',
    content: 'ShadCN UI is a collection of beautifully designed components that you can copy and paste into your apps. Built on top of Radix UI and Tailwind CSS, it provides a complete design system for building modern web applications. In this guide, we\'ll explore how to set up ShadCN UI and use its components effectively.\n\nWhat makes ShadCN UI special:\n- Copy-paste component library\n- Built on Radix UI primitives\n- Fully customizable with Tailwind CSS\n- Accessible by default\n- TypeScript support\n- Dark mode ready\n\nWe\'ll cover installation, customization, and best practices for using ShadCN UI in your projects.',
    status: 'draft',
    category: 'UI/UX',
    author: 'Mike Johnson',
    publishDate: '2024-01-25',
    tags: ['ShadCN', 'UI', 'Components'],
    views: 0,
    featured: false
  },
  {
    id: '4',
    title: 'State Management in React',
    excerpt: 'Compare different state management solutions for React applications.',
    content: 'Managing state in React applications can be challenging as your app grows. This comprehensive comparison covers various state management solutions including Context API, Redux Toolkit, Zustand, and Jotai. Learn when to use each solution and how to implement them effectively in your projects.\n\nState management solutions covered:\n- React Context API - Built-in solution\n- Redux Toolkit - Predictable state container\n- Zustand - Small, fast, and scalable\n- Jotai - Primitive and flexible\n- SWR/React Query - Server state management\n\nChoosing the right state management solution depends on your application size, complexity, and team preferences.',
    status: 'archived',
    category: 'Tutorial',
    author: 'Sarah Wilson',
    publishDate: '2023-12-10',
    tags: ['React', 'State Management', 'Redux'],
    views: 2100,
    featured: false
  },
  {
    id: '5',
    title: 'CSS Grid vs Flexbox',
    excerpt: 'When to use CSS Grid and when to use Flexbox for layout design.',
    content: 'Both CSS Grid and Flexbox are powerful layout systems, but they serve different purposes. Grid is excellent for two-dimensional layouts, while Flexbox excels at one-dimensional layouts. This article provides practical examples and guidelines for choosing the right tool for your layout needs.\n\nKey differences:\n- Grid: Two-dimensional layout (rows and columns)\n- Flexbox: One-dimensional layout (either row or column)\n- Grid: Better for overall page layout\n- Flexbox: Better for component layout\n\nPractical examples:\n- Using Grid for page layouts\n- Using Flexbox for navigation bars\n- Combining both for complex layouts\n- Responsive design considerations\n\nUnderstanding when to use each tool will make you more effective at creating layouts.',
    status: 'published',
    category: 'CSS',
    author: 'Alex Brown',
    publishDate: '2024-01-12',
    tags: ['CSS', 'Layout', 'Grid', 'Flexbox'],
    views: 1580,
    featured: true
  }
]
