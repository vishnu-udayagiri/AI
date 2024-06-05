# Common Functions

Author: Aromal

A collection of common utilities and functions to simplify your JavaScript/Node.js projects.

## Modules

#### 1. Captcha

The Captcha module provides utilities to generate and validate captchas.

#### Functions

| Sl.No.|Dependencies           |
|--|-------------------------|
| 1.| svgCaptcha |
| 2.| express-session |


| Function Name           | Description                                  | Parameter Description                                          | Returns                                                                                                    |
|-------------------------|----------------------------------------------|----------------------------------------------------------------|------------------------------------------------------------------------------------------------------------|
| generateCaptcha(length?)| Generate Captcha for a given length.         | `length` is the no. of letters that should be available in captcha. | @returns `{Object}` { `text`: Generated captcha text, `data`: Generated captcha svg image data (string) }   |
| validateCaptcha(session, captchaInput) | Validates captcha.                 | `session` and `captcha input` should be passed                | @returns `{Object}` Contains two fields - `Success` = True/False and `Message` = String                     |

---

**Note:** Always ensure to handle the captcha validation securely in your application.

