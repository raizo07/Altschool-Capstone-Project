# AltSchool of Backend Engineering (NodeJs) Tinyuka 2023 Capstone Project
**Name:** UrlShortener-(Scissors Capstone) <br>

## Tools Used
- [Nextjs](https://nextjs.org/)
- [Next auth v5](https://authjs.dev/getting-started/migrating-to-v5)
- [Prisma ORM](https://www.prisma.io/nextjs)
- [Postgresql](https://www.postgresql.org/)
- [Node.js v20.15.1 ](https://nodejs.org/en)
- [Socket.io](https://socket.io)
- [Redis](https://redis.io)


## Getting Started
1. Clone repo locally.

    ```sh
    git clone https://github.com/raizo07/UrlShortener.git
    ```

2. create a .env file using the .env.sample.

    ```sh
    cp .env.sample .env
    ```

3. Run locally.

    ```sh
    npm install
    npx prisma generate
    npx prisma migrate dev
    npm run dev
    ```
  
4. Run test locally
   ```sh
   npm run test:coverage
   ```


## Key Frontend Routes

### Unprotected Routes
- **/** - Sign In/Register page, this also allows unauthorized users to create short links.
- **/api-docs** - Displays the Stoplight element page based on OpenAPI 3.1.0 specifications, which enables users to test the API using the development or production server.
- **/[custom suffix]** - Redirects to the saved link URL.

### Protected Routes (/dashboard/*)
- **/dashboard** - Analytics overview for the user.
- **/dashboard/link** - List of all links created by the user.
- **/dashboard/link/[custom suffix]** - Analytics page for a specific link.

## Features

- Creation of short links, with or without a custom suffix.
- Comprehensive user analytics for all created links.
- Detailed analytics for individual links.
- Direct social media sharing, currently supporting X (formerly Twitter), Facebook, and Reddit.
- QR code generation and download for individual links.
- Downloadable analytics reports for individual links (CSV format only).







