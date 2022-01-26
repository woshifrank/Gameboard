describe("end to end tests", () => {
  it("can login", () => {
    cy.visit("http://localhost:8080");
    cy.get(".navbar-burger").click();
    cy.get(".navbar-item > .button").click();
    // confirm the application is showing two items
    cy.get("#login").type("danny@intricatecloud.io");
    cy.get('[type="password"]').type("Demo1234");
    cy.get("form > button").click();

    cy.get(".card");
  });
});
