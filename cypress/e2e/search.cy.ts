describe('Search', () => {
  beforeEach(() => {
    cy.intercept('GET', 'https://swapi.dev/api/films/', { fixture: 'films.json' }).as('getFilms')
    cy.intercept('GET', 'https://swapi.dev/api/planets/?page=1', { fixture: 'planets-page1.json' }).as('getPage1')
    cy.intercept('GET', 'https://swapi.dev/api/planets/?page=2', { fixture: 'planets-page2.json' }).as('getPage2')

    cy.visit('/')
    cy.wait(['@getFilms', '@getPage1', '@getPage2'])
  })

  it('filters the list and hides pagination while searching', () => {
    cy.get('#planet-search').type('Tat')
    cy.get('ul li').should('have.length', 1)
    cy.contains('Tatooine').should('be.visible')
    cy.get('nav[aria-label="Pagination"]').should('not.exist')
  })

  it('restores the full paginated list when search is cleared', () => {
    cy.get('#planet-search').type('Tat')
    cy.get('ul li').should('have.length', 1)

    cy.get('button[aria-label="Clear search"]').click()

    cy.get('ul li').should('have.length', 10)
    cy.get('nav[aria-label="Pagination"]').should('be.visible')
  })
})
