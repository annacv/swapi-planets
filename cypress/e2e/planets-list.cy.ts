describe('Planet list', () => {
  beforeEach(() => {
    cy.intercept('GET', 'https://swapi.dev/api/films/', { fixture: 'films.json' }).as('getFilms')
    cy.intercept('GET', 'https://swapi.dev/api/planets/?page=1', { fixture: 'planets-page1.json' }).as('getPage1')
    cy.intercept('GET', 'https://swapi.dev/api/planets/?page=2', { fixture: 'planets-page2.json' }).as('getPage2')

    cy.visit('/planets')
    cy.wait(['@getFilms', '@getPage1', '@getPage2'])
  })

  it('loads the first page with 10 planets and pagination', () => {
    cy.get('ul li').should('have.length', 10)
    cy.contains('Tatooine').should('be.visible')
    cy.contains('Kamino').should('be.visible')
    cy.get('nav[aria-label="Pagination"]').should('be.visible')
    cy.contains('Page 1 of 2').should('be.visible')
  })

  it('navigates to page 2 when clicking page button', () => {
    cy.get('button[aria-label="Page 2"]').click()
    cy.contains('Page 2 of 2').should('be.visible')
    cy.contains('Geonosis').should('be.visible')
    cy.contains('Mustafar').should('be.visible')
    cy.contains('Tatooine').should('not.exist')
  })

  it('shows the planet map section with dots', () => {
    cy.get('section[aria-label="Planet map"]').should('be.visible')
    cy.get('section[aria-label="Planet map"] .planet-dot').should('have.length', 10)
  })
})
