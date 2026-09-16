describe('Favourites', () => {
  beforeEach(() => {
    cy.clearLocalStorage()

    cy.intercept('GET', 'https://swapi.dev/api/films/', { fixture: 'films.json' }).as('getFilms')
    cy.intercept('GET', 'https://swapi.dev/api/planets/?page=1', { fixture: 'planets-page1.json' }).as('getPage1')
    cy.intercept('GET', 'https://swapi.dev/api/planets/?page=2', { fixture: 'planets-page2.json' }).as('getPage2')

    cy.visit('/')
    cy.wait(['@getFilms', '@getPage1', '@getPage2'])
  })

  it('adds a planet to favourites when clicking the heart button', () => {
    cy.get('button[aria-label="Add Tatooine to favourites"]').click()
    cy.get('button[aria-label="Remove Tatooine from favourites"]').should('exist')
  })

  it('shows only favourited planets when LIKED is toggled on', () => {
    cy.get('button[aria-label="Add Tatooine to favourites"]').click()
    cy.get('button[aria-label="Add Alderaan to favourites"]').click()

    cy.get('button[role="switch"][aria-labelledby="favourites-filter-label"]').click()

    cy.get('ul li').should('have.length', 2)
    cy.contains('Tatooine').should('be.visible')
    cy.contains('Alderaan').should('be.visible')
  })

  it('shows empty state and "Show all" resets the filter', () => {
    cy.get('button[role="switch"][aria-labelledby="favourites-filter-label"]').click()

    cy.contains('No liked planets yet.').should('be.visible')
    cy.contains('Show all').should('be.visible')

    cy.contains('Show all').click()

    cy.get('ul li').should('have.length', 10)
    cy.get('button[role="switch"]').should('have.attr', 'aria-checked', 'false')
  })
})
