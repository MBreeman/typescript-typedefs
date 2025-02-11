import { Student, Book } from './specHelper';
import { Int, Float, ID } from './types';
import { Type, Input, Field, types, fields, inputs, Interface, interfaces } from './decorators';
import { expect } from 'chai';
import { generateTypeDefs } from './generateTypeDefs';

const removeWhiteSpace = (string: string): string => string.replace(/\s+/g, ' ');

describe('Type and Input', (): void => {
  beforeEach((): void => {
    types.length = 0;
    inputs.length = 0;
    fields.length = 0;
    interfaces.length = 0;
  });

  it('Type is expected to have at least 1 field', (): void => {
    let error: any = {};

    @Type()
    class TestClass {}

    try {
      generateTypeDefs([TestClass]);
    } catch (err) {
      error = err;
    }
    expect(error).to.exist;
    expect(error.message).to.equal('Class TestClass must contain at least 1 @Field');
  });

  it('Input is expected to have at least 1 field', (): void => {
    let error: any = {};

    @Input()
    class TestClass {}

    try {
      generateTypeDefs([TestClass]);
    } catch (err) {
      error = err;
    }

    expect(error).to.exist;
    expect(error.message).to.equal('Class TestClass must contain at least 1 @Field');
  });
});

describe('Strings and bools', (): void => {
  beforeEach((): void => {
    types.length = 0;
    inputs.length = 0;
    fields.length = 0;
    interfaces.length = 0;
  });

  it('can have a string or boolean field', (): void => {
    @Type()
    class TestClass {
      @Field()
      name: string;

      @Field()
      isTrue: boolean;
    }

    expect(removeWhiteSpace(generateTypeDefs([TestClass]))).to.equal(
      'type TestClass { name: String! isTrue: Boolean! }',
    );
  });

  it('can have a string array or a boolean array', (): void => {
    @Type()
    class TestClass {
      @Field(String)
      names: string[];

      @Field(Boolean)
      areTrue: boolean[];
    }

    expect(removeWhiteSpace(generateTypeDefs([TestClass]))).to.equal(
      'type TestClass { names: [String!]! areTrue: [Boolean!]! }',
    );
  });
});

describe('Floats and ints', (): void => {
  beforeEach((): void => {
    types.length = 0;
    inputs.length = 0;
    fields.length = 0;
    interfaces.length = 0;
  });

  it('can handle float and int fields', (): void => {
    @Type()
    class TestClass {
      @Field()
      someFloat: number;

      @Field(Int)
      someInt: number;

      @Field(Float)
      otherFloat: number;
    }

    expect(removeWhiteSpace(generateTypeDefs([TestClass]))).to.equal(
      'type TestClass { someFloat: Float! someInt: Int! otherFloat: Float! }',
    );
  });

  it('can handle float and int arrays', (): void => {
    @Type()
    class TestClass {
      @Field(Float)
      floatArray: number[];

      @Field(Number)
      otherFloatArray: number[];

      @Field(Int)
      intArray: number[];
    }

    expect(removeWhiteSpace(generateTypeDefs([TestClass]))).to.equal(
      'type TestClass { floatArray: [Float!]! otherFloatArray: [Float!]! intArray: [Int!]! }',
    );
  });
});

describe('Nested Types', (): void => {
  beforeEach((): void => {
    types.length = 0;
    inputs.length = 0;
    fields.length = 0;
    interfaces.length = 0;
  });

  it('can handle nested types fields and arrays', (): void => {
    @Type()
    class Child {
      @Field()
      name: string;
    }

    @Type()
    class Parent {
      @Field()
      child: Child;

      @Field(Child)
      children: Child[];
    }

    expect(removeWhiteSpace(generateTypeDefs([Parent, Child]))).to.equal(
      'type Child { name: String! } type Parent { child: Child! children: [Child!]! }',
    );
  });
});

describe('IDs', (): void => {
  beforeEach((): void => {
    types.length = 0;
    inputs.length = 0;
    fields.length = 0;
    interfaces.length = 0;
  });

  it('can handle IDs and ID arrays', (): void => {
    @Type()
    class TestClass {
      @Field(ID)
      id: string;

      @Field(ID)
      ids: string[];
    }
    expect(removeWhiteSpace(generateTypeDefs([TestClass]))).to.equal(
      'type TestClass { id: ID! ids: [ID!]! }',
    );
  });
});

describe('Nullable values', (): void => {
  beforeEach((): void => {
    types.length = 0;
    inputs.length = 0;
    fields.length = 0;
    interfaces.length = 0;
  });

  it('can handle object args', (): void => {
    @Type()
    class TestClass {
      @Field({ type: ID })
      id: string;
    }
    expect(removeWhiteSpace(generateTypeDefs([TestClass]))).to.equal('type TestClass { id: ID! }');
  });

  it('can handle nullable fields', (): void => {
    @Type()
    class TestClass {
      @Field({ type: ID, nullable: true })
      id?: string;
    }
    expect(removeWhiteSpace(generateTypeDefs([TestClass]))).to.equal('type TestClass { id: ID }');
  });
});

describe('Input', (): void => {
  beforeEach((): void => {
    types.length = 0;
    inputs.length = 0;
    fields.length = 0;
    interfaces.length = 0;
  });

  it('can handle Inputs with all fields', (): void => {
    @Input()
    class Course {
      @Field()
      name: string;
    }

    @Input()
    class TestClass {
      @Field(ID)
      id: string;

      @Field()
      name: string;

      @Field()
      gpa: number;

      @Field(Int)
      classRank: number;

      @Field(Course)
      classes: Course[];
    }
    expect(removeWhiteSpace(generateTypeDefs([TestClass, Course]))).to.equal(
      'input Course { name: String! } input TestClass { id: ID! name: String! gpa: Float! classRank: Int! classes: [Course!]! }',
    );
  });
});

describe('Interface', (): void => {
  beforeEach((): void => {
    types.length = 0;
    inputs.length = 0;
    fields.length = 0;
    interfaces.length = 0;
  });

  it('has an interface decorator', (): void => {
    @Interface()
    class TestClass {
      @Field()
      name: string;
    }

    expect(removeWhiteSpace(generateTypeDefs([TestClass]))).to.equal(
      'interface TestClass { name: String! }',
    );
  });

  it('can implement interfaces through  "extend"', (): void => {
    @Interface()
    class Book {
      @Field()
      title: string;

      @Field()
      author: string;
    }

    @Type()
    class CourseBook extends Book {
      @Field()
      title: string;

      @Field()
      author: string;

      @Field(Int)
      course: string;
    }

    expect(removeWhiteSpace(generateTypeDefs([Book, CourseBook]))).to.equal(
      'interface Book { title: String! author: String! } type CourseBook implements Book { title: String! author: String! course: String! }',
    );
  });

  it('can implement interfaces through explicit "implements" option', (): void => {
    @Interface()
    class Book {
      @Field()
      title: string;

      @Field()
      author: string;
    }

    @Type({ implements: Book })
    class CourseBook implements Book {
      @Field()
      title: string;

      @Field()
      author: string;

      @Field(Int)
      course: string;
    }

    expect(removeWhiteSpace(generateTypeDefs([Book, CourseBook]))).to.equal(
      'interface Book { title: String! author: String! } type CourseBook implements Book { title: String! author: String! course: String! }',
    );
  });
});

describe('Directives', (): void => {
  beforeEach((): void => {
    types.length = 0;
    inputs.length = 0;
    fields.length = 0;
    interfaces.length = 0;
  });
  it('can handle a directive without params', async (): Promise<void> => {
    @Type()
    class TestClass {
      @Field({ directives: [{ directive: 'deprecated' }] })
      author: string;

      @Field(String)
      authors: string[];
    }

    expect(removeWhiteSpace(generateTypeDefs([TestClass]))).to.equal(
      'type TestClass { author: String! @deprecated authors: [String!]! }',
    );
  });

  it('can handle a directive with params', async (): Promise<void> => {
    @Type()
    class TestClass {
      @Field({
        directives: [{ directive: 'deprecated', reason: 'use the authors array instead' }],
      })
      author: string;

      @Field(String)
      authors: string[];
    }

    expect(removeWhiteSpace(generateTypeDefs([TestClass]))).to.equal(
      'type TestClass { author: String! @deprecated(reason: "use the authors array instead") authors: [String!]! }',
    );
  });

  it('can handle a directive without params on types', async (): Promise<void> => {
    @Type({ directives: [{ directive: 'deprecated' }] })
    class TestClass {
      @Field()
      author: string;

      @Field(String)
      authors: string[];
    }

    expect(removeWhiteSpace(generateTypeDefs([TestClass]))).to.equal(
      'type TestClass @deprecated { author: String! authors: [String!]! }',
    );
  });

  it('can handle a directive with params on types', async (): Promise<void> => {
    @Type({
      directives: [{ directive: 'deprecated', reason: 'use the authors array instead' }],
    })
    class TestClass {
      @Field()
      author: string;

      @Field(String)
      authors: string[];
    }

    expect(removeWhiteSpace(generateTypeDefs([TestClass]))).to.equal(
      'type TestClass @deprecated(reason: "use the authors array instead") { author: String! authors: [String!]! }',
    );
  });
});

@Type()
export class Course {
  @Field()
  name: string;

  @Field(Student)
  students: Student[];
}
it('circular dependencies throw a meaningful error', (): void => {
  let error;
  try {
    generateTypeDefs([Course, Student]);
  } catch (err) {
    error = err;
  }
  expect(error.message).to.contain('circular dependency');
  expect(error.message).to.contain('forwardRef');
});

@Type()
export class Reader {
  @Field()
  name: string;

  @Field(Book)
  books: Book[];
}

it('can handle circular dependencies by using forwardref', (): void => {
  expect(removeWhiteSpace(generateTypeDefs([Reader, Book]))).to.equal(
    'type Book { name: String! readers: [Reader!]! moreReaders: [Reader!]! } type Reader { name: String! books: [Book!]! }',
  );
});
