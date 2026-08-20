# CMS Technical Standards Matrix Rule

All web applications and features built or modified in this workspace must strictly maintain compliance with the following technical standards matrix:

| Standard Domain | Primary Industry Specification | Mandatory Compliance Metric |
| :--- | :--- | :--- |
| **Accessibility** | W3C WCAG 2.2 Level AA / Section 508 | Clean, semantic HTML5 output with full keyboard/aria mapping. |
| **Security** | OIDC / SAML 2.0 / AES-256 / TLS 1.3 | Unified single sign-on federation with end-to-end payload encryption. |
| **Data Privacy** | GDPR / CCPA Protocols | Built-in functionality for data portability and automated user erasure. |
| **API** | OpenAPI Spec (OAS) / GraphQL / REST | Machine-readable, documented schemas and JSON payload standards. |
| **Performance** | Google Core Web Vitals (CWV) | Pre-rendered edge delivery hitting LCP < 2.5s and CLS < 0.1. |
| **Localization** | ISO 639-1 Language Keys / XLIFF | Native multi-language fallback logic and standard localization bundles. |

## Golden Orange Theme Standard

- In **Light Mode**, the color scheme must use a rich **Golden Orange Theme**:
  - Primary Gradients: Golden Amber (`#f59e0b` / `amber-500`) to Warm Deep Orange (`#ea580c` / `orange-600`).
  - Backgrounds: Warm Amber Cream (`#fffbeb`, `#fef3c7`, `#fff7ed`).
  - Text Colors: High-contrast Warm Dark Amber/Stone (`#451a03`, `#78350f`) satisfying WCAG 2.2 Level AA contrast ratio (> 4.5:1).
  - Cards & Panels: Golden Glassmorphism with amber-orange borders (`rgba(245, 158, 11, 0.3)`) and 3D glowing shadows.
