describe('Register page', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('should display the registration form', () => {
    cy.contains('h5', 'Registration Form').should('be.visible');
    cy.get('input[formControlName="firstName"]').should('be.visible');
    cy.get('input[formControlName="password"]').should('be.visible');
  });

  it('should show the required errors when the form is empty', () => {
    cy.contains('button', 'Register').click();

    cy.contains('First Name is required').should('be.visible');
    cy.contains('password is required').should('be.visible');
  });

  it('should register a user', () => {
    cy.intercept('POST', '/api/register', { statusCode: 201 }).as('register');

    cy.get('input[formControlName="firstName"]').type('John');
    cy.get('input[formControlName="lastName"]').type('Doe');
    cy.get('input[formControlName="login"]').type('login');
    cy.get('input[formControlName="password"]').type('password');
    cy.contains('button', 'Register').click();

    cy.wait('@register').its('request.body').should('deep.equal', {
      firstName: 'John',
      lastName: 'Doe',
      login: 'login',
      password: 'password',
    });
    cy.url().should('include', '/login');
    cy.contains('Account created').should('be.visible');
  });

  it('should display an error when the login already exists', () => {
    cy.intercept('POST', '/api/register', { statusCode: 400, body: { message: 'User with login login already exists' } });

    cy.get('input[formControlName="firstName"]').type('John');
    cy.get('input[formControlName="lastName"]').type('Doe');
    cy.get('input[formControlName="login"]').type('login');
    cy.get('input[formControlName="password"]').type('password');
    cy.contains('button', 'Register').click();

    cy.get('.text-danger').should('contain', 'User with login login already exists');
  });

  it('should go to the login page from the register page', () => {
    cy.contains('a', 'Login').click();

    cy.url().should('include', '/login');
  });
});
