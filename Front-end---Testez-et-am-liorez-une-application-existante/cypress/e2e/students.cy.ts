const students = [
  { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@mail.com' },
  { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@mail.com' },
];

function visitLoggedIn(url: string) {
  cy.visit(url, {
    onBeforeLoad: (window) => window.localStorage.setItem('token', 'TOKEN'),
  });
}

describe('Students list page', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/students', { statusCode: 200, body: students }).as('getStudents');
    visitLoggedIn('/students');
    cy.wait('@getStudents');
  });

  it('should display the students', () => {
    cy.get('tbody tr').should('have.length', 2);
    cy.contains('td', 'john.doe@mail.com').should('be.visible');
  });

  it('should delete a student', () => {
    cy.intercept('DELETE', '/api/students/1', { statusCode: 204 }).as('deleteStudent');
    cy.intercept('GET', '/api/students', { statusCode: 200, body: [students[1]] });

    cy.get('tbody tr').first().contains('button', 'Delete').click();

    cy.wait('@deleteStudent');
    cy.get('tbody tr').should('have.length', 1);
    cy.contains('john.doe@mail.com').should('not.exist');
  });

  it('should logout and go to the login page', () => {
    cy.contains('button', 'Logout').click();

    cy.url().should('include', '/login');
    cy.window().its('localStorage').invoke('getItem', 'token').should('be.null');
  });
});

describe('Student detail page', () => {
  it('should display the student', () => {
    cy.intercept('GET', '/api/students/1', { statusCode: 200, body: students[0] });
    visitLoggedIn('/students/1');

    cy.contains('h5', 'Student detail').should('be.visible');
    cy.contains('john.doe@mail.com').should('be.visible');
  });

  it('should go back to the list', () => {
    cy.intercept('GET', '/api/students/1', { statusCode: 200, body: students[0] });
    cy.intercept('GET', '/api/students', { statusCode: 200, body: students });
    visitLoggedIn('/students/1');

    cy.contains('a', 'Back to the list').click();

    cy.url().should('match', /\/students$/);
  });
});

describe('Student add page', () => {
  beforeEach(() => {
    visitLoggedIn('/students/new');
  });

  it('should show the required errors when the form is empty', () => {
    cy.contains('button', 'Add').click();

    cy.contains('First Name is required').should('be.visible');
    cy.contains('Email is required').should('be.visible');
  });

  it('should create a student and go to the list', () => {
    cy.intercept('POST', '/api/students', { statusCode: 201, body: { id: 3, firstName: 'Bob', lastName: 'Martin', email: 'bob.martin@mail.com' } }).as('createStudent');
    cy.intercept('GET', '/api/students', { statusCode: 200, body: students });

    cy.get('input[formControlName="firstName"]').type('Bob');
    cy.get('input[formControlName="lastName"]').type('Martin');
    cy.get('input[formControlName="email"]').type('bob.martin@mail.com');
    cy.contains('button', 'Add').click();

    cy.wait('@createStudent').its('request.body').should('deep.equal', {
      firstName: 'Bob',
      lastName: 'Martin',
      email: 'bob.martin@mail.com',
    });
    cy.url().should('match', /\/students$/);
  });

  it('should display the error when the email is already used', () => {
    cy.intercept('POST', '/api/students', { statusCode: 400, body: { message: 'Email already used by another student' } });

    cy.get('input[formControlName="firstName"]').type('Bob');
    cy.get('input[formControlName="lastName"]').type('Martin');
    cy.get('input[formControlName="email"]').type('john.doe@mail.com');
    cy.contains('button', 'Add').click();

    cy.get('.text-danger').should('contain', 'Email already used by another student');
  });
});

describe('Student edit page', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/students/1', { statusCode: 200, body: students[0] });
    visitLoggedIn('/students/1/edit');
  });

  it('should load the student in the form', () => {
    cy.get('input[formControlName="firstName"]').should('have.value', 'John');
    cy.get('input[formControlName="email"]').should('have.value', 'john.doe@mail.com');
  });

  it('should update the student and go to the list', () => {
    cy.intercept('PUT', '/api/students/1', { statusCode: 204 }).as('updateStudent');
    cy.intercept('GET', '/api/students', { statusCode: 200, body: students });

    cy.get('input[formControlName="firstName"]').clear().type('Johnny');
    cy.contains('button', 'Save').click();

    cy.wait('@updateStudent').its('request.body.firstName').should('eq', 'Johnny');
    cy.url().should('match', /\/students$/);
  });
});
