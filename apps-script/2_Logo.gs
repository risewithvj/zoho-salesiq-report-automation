/**
 * =====================================================================
 *  Website & WhatsApp Chatbot Report Automation for Google Sheets + Apps Script
 * =====================================================================
 *  Created by   : Vijaya Kumar L
 *  Nickname     : risewithvj
 *  GitHub       : https://github.com/risewithvj
 *  LinkedIn     : https://www.linkedin.com/in/vijayakumarl/
 *  Email        : risewithvj@gmail.com
 * -----------------------------------------------------------------------
 *  Generic placeholder logo, base64-encoded, so the email template is
 *  self-contained out of the box. REPLACE this with your own company
 *  logo's base64 string -- see README.md "Customizing your branding"
 *  section for how to convert your own PNG.
 * =====================================================================
 */
const LOGO_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAPAAAADwCAYAAAA+VemSAAAFY0lEQVR4nO3dS1IcRxSG0ZZhpfK6rJVCyAMZ05IaVI98/XXPmWpAhjK/vkkBUbcbAAAAAAAAAAAA53yZvYC9nr6+fJ+9Bq7t9dtzTBfLL1SwzLZy0EsuTLSsarWYl1mMaEmzQszTFyBc0s0MedoXFi5XMyPkv0Z/wdtNvFzTjHM99BNDuFQxahoPm8DipZJR531IwOKlohHnvuuYFy780OtK3W0Cixfe9eqhS8Dihd/16KJ5wOKFj7XuY8rPgYE2mgZs+sKfteykWcDihe1a9dIkYPHCfi268T0wBDsdsOkLx53t51TA4oXzznTkCg3BDgds+kI7R3sygSHYoYBNX2jvSFcmMAQTMATbHbDrM/Szty8TGIIJGILtCtj1Gfrb05kJDMEEDMEEDME2B+z7Xxhna28mMAQTMAQTMAQTMAQTMAQTMAQTMAQTMAQTMAQTMAQTMAQTMAQTMAQTMAQTMAQTMAQTMAQTMAQTMAQTMAQTMAQTMAQTMAQTMAQTMAR7nr2ANC//PM1ewuU9//06ewkxBLyBaMe6//8W8+cE/Anhzve2B0J+TMAPCHc9Qn7MQ6xfiHdt9udnAr7jcGSwT+8E/B+HIov9+kHAN4chlX0TsEMQrvr+lQ64+uZfReV9LB0wpCsbcOVP7Suqup9lA4YrKBlw1U/rq6u4ryUDhqsQMAQrF3DFa1Yl1fa3XMBwJQKGYAKGYAKGYAKGYAKGYAKGYAKGYAKGYAKGYAKGYAKGYAKGYAKGYAKGYF5u1tCjF2/N+vtUa6lBwA189sa8t38bdWCtpRZX6JO2vu5yxGsxraUeAZ+w9/D1PKzWUpOADzp66HocVmupS8AQTMAHnJ0WLaeNtdQmYAgmYAgmYAgmYAgm4APO/vZQy98+spbaBAzBBHzQ0WnRY8pYS10CPmHvoet5SK2lJgGftPXwjTik1lKPPyds4O0QrvB3r9ZSi4AbWulQWksNrtAQTMAQTMAQTMAQTMAQTMAQTMAQTMAQTMAQTMAQTMAQTMAQTMAQTMAQTMAQrFzAXt9xbdX2t1zAcCUChmAlA652zaqi4r6WDBiuomzAFT+tr6zqfpYNGK6gdMBVP7WvpvI+lg74dqu9+VdQff/KB3y7OQSp7JuA/+cwZLFfPwj4jkORwT69E/AvHI612Z+febnZA2+HxEu51iHcxwT8CSHPJ9zPCXiD+0Mk5v5Eu52Ad9pyuGZF7uDX4yHWRYi3JhM4nHBrM4GDiRcBhxIvt5uAI4mXNwIOI17ueYgVQrg8YgIHEC8fEfDixMtnBLww8fInAl6UeNnCQ6zFCJc9TOCFiJe9BLwI8XKEgBcgXo4S8GTi5QwPsSYRLi2YwBOIl1YEPJh4aUnAA4mX1gQ8iHjpwUOszoRLTyZwR+KlNwF3Il5GEHAH4mUUAUMwAUMwAUMwAUMwAUMwAUMwAUMwAUMwAUMwAUMwAUMwAUMwAUMwAUMwAUMwAUMwAUMwAUMwAUMwAUOwzQG/fnv+0nMhwLutvZnAEEzAEEzAEGxXwL4Phv72dGYCQzABQ7DdAbtGQz97+zKBIZiAIdihgF2job0jXZnAEOxwwKYwtHO0JxMYgp0K2BSG8850dHoCixiOO9uPKzQEaxKwKQz7teim2QQWMWzXqpemV2gRw5+17MT3wBCsecCmMHysdR9dJrCI4Xc9uuh2hRYxvOvVw5DInr6+fB/xdWA1vQfZkIdYpjEVjTj3w55Ci5hKRp33KVG5UnNVowfVlJ8Dm8Zc0YxzPT0k05h0MwfS9IDfCJk0K9wkpy/gETGzqhWivbfUYh4RM7OtFu29ZRf2EUHT28rBAgAAAAAAAACwqH8BNh+p2eF5EVAAAAAASUVORK5CYII=";
