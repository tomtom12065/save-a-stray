This folder contains the core functionality of the Save a Stray project, including the backend API, frontend implementation, and utility scripts.

Structure
src/api
Contains the backend logic for the application.

__init__.py: Initializes the API module.
admin.py: Handles admin-specific tasks.
commands.py: CLI commands for managing the application.
models.py: Defines the database models.
routes.py: Defines API routes.
send_email.py: Manages email-sending functionality.
utils.py: Utility functions for common operations.
src/front
Contains the frontend implementation, split into subdirectories:

img: Images used in the frontend.
how-to.png: Instructional image.
rigo-baby.jpg: Placeholder/sample image.
js: JavaScript logic for the frontend.
component/: Reusable components such as navbar.js, footer.js, and chatbox.js.
pages/: Page-specific scripts like home.js, catUpload.js, and profilePage.js.
store/: Context and state management files (appContext.js, flux.js).
styles: CSS files for styling individual components and pages (e.g., login.css, catCard.css).
Top-Level Files
app.py: The main entry point for the backend application.
wsgi.py: WSGI entry point for deployment.