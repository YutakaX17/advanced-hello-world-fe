# Changelog

## Unreleased

- Create GitHub Releases only after successful versioned image publication,
  with immutable image metadata, an SPDX SBOM, and SHA-256 checksums.

## 0.2.1

- Create the generated source directory during clean module installation so
  container builds do not depend on files copied later in the build.

## 0.2.0

- Install frontend core and feature modules from an authoritative manifest.
- Support immutable release sources and editable sibling overrides.
- Generate typed feature registration, routes, and stylesheet imports.
- Validate installed versions and generated registration.
- Build the selected packages automatically in CI and container builds.

## 0.1.0

- Publish the initial Vite assembler and frontend container.
