Feature: Datepicker

  Background:
    Given the user navigates to "https://jqueryui.com/datepicker/"
    When the user opens the datepicker

  @datepicker
  Scenario: CP-01 - Seleccionar fecha del mes actual
    When the user selects day 15
    Then the datepicker field should contain day 15 of the current month

  @datepicker
  Scenario: CP-06 - Validar formato de fecha
    When the user selects day 10
    Then the datepicker field value should match the format MM/DD/YYYY

  @datepicker
  Scenario: CP-02 - Selección de una fecha específica en un mes diferente al actual
    When the user navigates to month "December"
    And the user selects day 15
    Then the datepicker field should show day 15 of month 12 of the current year
