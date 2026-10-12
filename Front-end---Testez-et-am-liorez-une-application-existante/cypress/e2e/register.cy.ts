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
    const alertStub = cy.stub();
    cy.on('window:alert', alertStub);

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
    cy.wrap(alertStub).should('have.been.calledWith', 'SUCCESS!! :-)');
  });
});
