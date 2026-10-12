describe('Login page', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display the login form', () => {
    cy.contains('h5', 'Login Form').should('be.visible');
  });

  it('should show the required errors when the form is empty', () => {
    cy.contains('button', 'Login').click();

    cy.contains('Login is required').should('be.visible');
    cy.contains('Password is required').should('be.visible');
  });

  it('should login and go to the students list', () => {
    cy.intercept('POST', '/api/login', { statusCode: 200, body: { token: 'TOKEN' } }).as('login');
    cy.intercept('GET', '/api/students', { statusCode: 200, body: [] });

    cy.get('input[formControlName="login"]').type('login');
    cy.get('input[formControlName="password"]').type('password');
    cy.contains('button', 'Login').click();

    cy.wait('@login');
    cy.url().should('include', '/students');
    cy.window().its('localStorage').invoke('getItem', 'token').should('eq', 'TOKEN');
  });

  it('should display an error when the credentials are wrong', () => {
    cy.intercept('POST', '/api/login', { statusCode: 400, body: 'Invalid credentials' });

    cy.get('input[formControlName="login"]').type('login');
    cy.get('input[formControlName="password"]').type('wrong');
    cy.contains('button', 'Login').click();

    cy.get('.text-danger').should('contain', 'Invalid credentials');
    cy.url().should('include', '/login');
  });

  it('should redirect to the login page when a protected page is opened without token', () => {
    cy.visit('/students');

    cy.url().should('include', '/login');
  });
});
