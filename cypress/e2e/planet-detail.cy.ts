describe('Planet detail', () => {
  beforeEach(() => {
    cy.intercept('GET', 'https://swapi.dev/api/films/', { fixture: 'films.json' }).as('getFilms')
    cy.intercept('GET', 'https://swapi.dev/api/planets/?page=1', { fixture: 'planets-page1.json' }).as('getPage1')
    cy.intercept('GET', 'https://swapi.dev/api/planets/?page=2', { fixture: 'planets-page2.json' }).as('getPage2')
    cy.intercept('GET', 'https://swapi.dev/api/planets/1/', { fixture: 'planet-detail.json' }).as('getPlanet')
  })

  it('navigates to the detail page when clicking a planet name', () => {
    cy.visit('/')
    cy.wait(['@getFilms', '@getPage1', '@getPage2'])

    cy.contains('a', 'Tatooine').click()
    cy.url().should('include', '/planets/1')
  })

  it('shows planet name, stats, films, and surface circle', () => {
    cy.visit('/planets/1')
    cy.wait('@getFilms')
    cy.wait('@getPlanet')

    cy.get('h1').should('contain', 'Tatooine')

    cy.contains('dt', 'Climate').parent().find('dd').should('contain', 'arid')
    cy.contains('dt', 'Terrain').parent().find('dd').should('contain', 'desert')
    cy.contains('dt', 'Population').parent().find('dd').should('contain', '200000')
    cy.contains('dt', 'Diameter').parent().find('dd').should('contain', '10465')
    cy.contains('dt', 'Gravity').parent().find('dd').should('contain', '1 standard')
    cy.contains('dt', 'Surface water').parent().find('dd').should('contain', '1')
    cy.contains('dt', 'Rotation period').parent().find('dd').should('contain', '23')
    cy.contains('dt', 'Orbital period').parent().find('dd').should('contain', '304')

    cy.contains('A New Hope').should('be.visible')
    cy.contains('Return of the Jedi').should('be.visible')

    cy.get('article div.rounded-full').should('exist')
  })

  it('renders unknown field values in italic', () => {
    cy.intercept('GET', 'https://swapi.dev/api/planets/4/', {
      fixture: 'planet-unknown-fields.json',
    }).as('getPlanetUnknown')

    cy.visit('/planets/4')
    cy.wait('@getFilms')
    cy.wait('@getPlanetUnknown')

    cy.contains('dd', 'unknown').should('have.class', 'italic')
  })

  it('returns to the list when clicking "Back to planets"', () => {
    cy.visit('/planets/1')
    cy.wait('@getFilms')
    cy.wait('@getPlanet')

    cy.contains('Back to planets').click()
    cy.location('pathname').should('eq', '/')
  })

  it('navigates to the next planet in the list', () => {
    cy.visit('/')
    cy.wait(['@getFilms', '@getPage1', '@getPage2'])

    cy.contains('a', 'Tatooine').click()
    cy.url().should('include', '/planets/1')

    cy.contains('Next planet').click()
    cy.url().should('include', '/planets/2')
    cy.get('h1').should('contain', 'Alderaan')
  })
})
