# Typescript-Typedefs

When using [Apollo GrapQL](https://www.npmjs.com/package/apollo-server) you need to define the typeDefs for your schema. When using [TypeScript](https://www.npmjs.com/package/typescript) you need to define interfaces to add proper typings. Because doing both of these things is rather a lot like code duplication, this package was created.

With this package you can simply define your model as a class, use the provided [TypeScript decorators](https://www.typescriptlang.org/docs/handbook/decorators.html) and call the `generateTypeDefs` function, which will automatically generate your typeDefs for you.

## Installation Guide

### Install the packages

```javascript
npm i typescript-typedefs
```

### Update tsconfig

Since we use decorators, [tsconfig must be configured](https://www.typescriptlang.org/docs/handbook/decorators.html) to work with them.

```javascript
{
  "compilerOptions": {
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true
  }
}
```

As well as some babel plugins.

```json
 "plugins": [
    "babel-plugin-transform-typescript-metadata",
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    ["@babel/plugin-proposal-class-properties", { "loose": true }]
  ]
```

## Exports

This package exports

- Type - used as @Type() to decorate a class or @Type({implements: OtherClass})
- Input - used as @Input() to decorate a class
- Field - used as @Field(), @Field(String) or @Field({type: Int, nullable: true}) to decorate a class property
- Interface - used as @Interface() to decorate a class which should result in an interface in the typeDefs
- Int - used in an @Field() decorator
- Float - used in an @Field() decorator
- ID - used in an @Field() decorator
- generateTypeDefs - function used to create a typeDefs string from the array of decorated classes it recieves as argument.

## Example

```javascript
import { Type, Field, ID, Int, generateTypeDefs } from 'typescript-typedefs';

@Type()
class Course {
  @Field()
  name: string;
}

@Type()
class Student {
  @Field(ID)
  id: string;

  @Field()
  name: string;

  @Field(String)
  friendNames: string[];

  @Field({ type: Int, nullable: true })
  room: number;

  @Field()
  gpa: number;

  @Field(Course)
  courses: Course[];
}

@Interface()
class Book {
  @Field()
  author: string;
}

// option 1 for implementing
@Type()
class CourseBook extends Book {
  @Field()
  author: string;

  @Field()
  course: string;
}

// option 2 for implementing
@Type({ implements: Book })
class ColoringBook implements Book {
  @Field()
  author: string;

  @Field()
  designer: string;
}

const generatedTypeDefs = generateTypeDefs([Course, Student, Book, CourseBook, ColoringBook]);
```

results in a string:

```javascript
`
interface Book {
  author: String!
}

type Course {
 name: String!
}

type Student {
  id: ID!
  name: String!
  friendNames: [String!]!
  room: Int
  gpa: Float!
  courses: [Course!]!
}

type CourseBook implements Book {
  author: String!
  course: String!
}

type ColoringBook implements Book  {
  author: String!
  designer: String!
}
`;
```

which can then be used in `makeExecutableSchema()` from [Apollo server.](https://www.npmjs.com/package/apollo-server)

## Directives

Directives can be used, either with or without params. The field `directive` must always be set, as many params as desired can be added afterwards.
Use something like [eslint-plugin-graphql](https://github.com/apollographql/eslint-plugin-graphql) to display your directives in your frontend.

```javascript
import { Type, Field, ID, Int, generateTypeDefs } from 'typescript-typedefs';
import { merge } from 'lodash';
import { SchemaDirectiveVisitor } from "graphql-tools";
import { GraphQLField, GraphQLEnumValue } from 'graphql';

@Type()
class Course {
  @Field()
  name: string;

  @Field({ directives: [{ directive: 'deprecated', reason: 'Use name instead' }] })
  courseName: string;

  @Field({ directives: [{ directive: 'deprecated' }] })
  longCourseName: string;
}

const generatedTypeDefs = generateTypeDefs([Course]);

const courseTypeDefs = `
  extend type Query {
    courses: [Course!]!
  }

  ${generatedTypeDefs}
  `;

const typeDefs = gql`
  directive @deprecated(reason: String = "No longer supported") on FIELD_DEFINITION | ENUM_VALUE

  type Query {
    _empty: string
  }

  type Mutation {
    _empty: String
  }
`;

class DeprecatedDirective extends SchemaDirectiveVisitor {
  public visitFieldDefinition(field: GraphQLField<any, any>) {
    field.isDeprecated = true;
    field.deprecationReason = this.args.reason;
  }
  public visitEnumValue(value: GraphQLEnumValue) {
    value.isDeprecated = true;
    value.deprecationReason = this.args.reason;
  }
}

const schema = makeExecutableSchema({
  typeDefs: [typeDefs, courseTypeDefs],
  resolver: merge(courseResolver),
  schemaDirectives: {
    deprecated: DeprecatedDirective,
  },
});
```

## FAQ

### How to deal with circular dependencies

This packages makes use of [reflect-metadata](https://www.npmjs.com/package/reflect-metadata) which has difficulties with circular references. To work around this, there are 2 options:

#### use forwardRef

```javascript
// ./course/courseTypeDefs
@Type()
export class Course {
  @Field(forwardRef(() => Student))
  students: Student[];
}

// ./student/studentTypeDefs
@Type()
class Student {
  @Field(Course)
  courses: Course[];
}

export const studentCourseTypeDefs = generateTypeDefs([Student, Course]);
```

#### manually write type definition

```javascript
// ./course/courseTypeDefs
@Type()
export class Course {
  @Field(Student)
  students: Student[]
}

// .student//studentTypeDefs
@Type()
class Student {
  courses: Course[]
}

// ./schema

const generatedTypeDefs = generateTypeDefs([Course, Student])

const extendTypeDefs = gql`
  extend type Student {
    courses: [Course!]!
  }
`
const schema = makeExecutableSchema({
  typeDefs: [generatedTypeDefs, extendedTypeDefs],
  resolvers: merge(...)
})

```

### Why classes and not interfaces

Interfaces are not available at runtime, classes are.

## Todo

- Add documentation to types/inputs
- Add enums
- Add nullable array elements
- Add nullables array elements: `Field({nullable: elementsAndArray})`
- Add syntax for explicit arrays: `Field([String])`
- investigate usage of 'string | undefined' instead of {nullable: true}
