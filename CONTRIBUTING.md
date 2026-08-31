# Contributing to Foliate

First off, thank you for considering contributing to Foliate! It's people like you who make open-source tools better for everyone.

To ensure a smooth collaboration, please take a moment to review the following guidelines.

## Code Style & Guidelines

Consistency is key to keeping the codebase maintainable. Since Foliate is built with GJS and GTK4/Libadwaita, we follow these principles:

* **Language**: We use modern JavaScript (ES6+). Avoid legacy syntax where possible.
* **Indentation**: Use 4 spaces for indentation. No tabs.
* **Naming Conventions**:
  * PascalCase for classes and GNOME widgets.
  * camelCase for variables and functions.
  * snake_case is generally avoided unless interacting with specific GLib/GObject properties that require it.
* **Clean PRs**: Ensure your code is linted and free of commented-out blocks or `console.log` statements before submitting.
* **UI Files**: When editing `.ui` files (XML), keep the structure clean and use ID names that reflect the component's purpose.

## Workflow

We use GitHub to track issues and merge changes. Here is the best way to get your contribution through:

### Reporting Bugs & Opening Issues

* **Search First**: Check if the issue or feature request has already been reported. We highly encourage reading our `docs/faq.md` and `docs/troubleshooting.md` before opening an issue, as your problem might already have a documented workaround.
* **Be Specific**: Provide your OS version, Foliate version (flatpak, repo, etc.), and steps to reproduce the bug. 
  > **Tip:** You can easily copy your system and version details directly from the app by opening the main menu and navigating to **About > Troubleshooting > Debugging Information**, then clicking **Copy Text**.
* **Logs**: If the app crashes, run it from the terminal via `com.github.johnfactotum.Foliate` (if using Flatpak) and attach the output.

### Submitting Features or Fixes

* **Fork & Branch**: Create a descriptively named branch (e.g., `fix/sidebar-overlap` or `feat/custom-fonts`).
* **Commit Messages**: Use clear, imperative messages (e.g., "Add support for OPDS catalogs" instead of "I fixed some stuff").
* **One Change per PR**: Keep Pull Requests focused. If you have two unrelated fixes, please open two separate PRs.

## Translation Guide

Foliate aims to be accessible to everyone, regardless of the language they speak.

* **Platform**: Localization is handled via Poedit or by manually editing the `.po` files located in the `po/` directory.
* **How to help**:
  * Check the `po/` folder for your language's file (e.g., `pt_BR.po`).
  * If it doesn't exist, you can initialize a new one from the `foliate.pot` template.
  * Ensure that technical terms (like "Metadata" or "E-book") are translated consistently with the rest of the GNOME ecosystem.
* **Testing**: You can test your translations locally by compiling the project or using the provided build scripts to see how the strings look in the UI.

## Getting Started

If you are setting up your environment for the first time, make sure you have the following dependencies installed:

* `gjs`
* `gtk4` / `libadwaita`
* `webkitgtk-6.0`

> **Note**: For a detailed setup of the development environment, please refer to the `README.md` or our build documentation.
