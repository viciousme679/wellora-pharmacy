# WELLORA Pharmacy Storefront

A responsive pharmacy storefront and separate demo admin dashboard built with plain HTML, CSS, and vanilla JavaScript. No build tools or framework are required.

## Project structure

```text
WELLORA/
├── index.html          # Storefront
├── admin.html          # Admin dashboard
├── css/
│   ├── style.css       # Storefront styles
│   └── admin.css       # Admin dashboard styles
├── js/
│   ├── app.js          # Storefront interactions and demo checkout
│   └── admin.js        # Admin inventory, orders, and prescription review
└── README.md
```

## Run locally

1. Extract the project folder.
2. Open `index.html` in a modern browser, or use a simple local static server/VS Code Live Server.
3. Open `admin.html` to access the demo admin dashboard.

The storefront and admin dashboard use the same `localStorage` keys in the same browser, so demo product, order, and prescription changes can be viewed between the two pages on the same origin. For the most reliable same-origin behavior, run both pages through the same local static server instead of opening files from different locations.

## Included demo features

- Product search, categories, sorting, and cart interactions
- Demo checkout and order listing
- Add/edit/delete products in the admin dashboard
- Inventory filters, low-stock indicators, and CSV exports
- Order status updates
- Prescription upload review and demo approval/rejection
- Responsive layouts and in-page notifications

## Important limitations

This is a front-end demo, not a production pharmacy system. There is no secure admin authentication, backend, shared online database, real payment processing, or actual email delivery. Browser storage is local to that browser and origin. Do not use it to store real customer details, payment data, or medical/prescription documents. Add a secure backend and database before handling real transactions or sensitive information.
