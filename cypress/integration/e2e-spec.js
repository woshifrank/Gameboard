describe("end to end tests", () => {
  it("can login", () => {
    cy.visit("http://localhost:5000");
    cy.get(".navbar-burger").click();
    cy.get(".navbar-item > .button").click();
    // confirm the application is showing two items
    cy.get("#login").type("yy586@cornell.com");
    cy.get('[type="password"]').type("123456");
    cy.get("form > button").click();

    cy.get(".card");
  });
});
