<p align="center" style="display: flex; align-items: center; justify-content: center; gap: 22px ">
  <img src="./assets/logo.svg" ="120" alt="Nest Logo"  />
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Jaudi Logo" />
</p>

<p align="center">
  <a href="https://nodejs.org/" target="_blank">
    <img src="https://img.shields.io/badge/node-v22.19.0-green?logo=node.js&logoColor=white" alt="Node Version" />
  </a>
  <a href="https://www.npmjs.com/" target="_blank">
    <img src="https://img.shields.io/badge/npm-10.9.3-blue?logo=npm&logoColor=white" alt="NPM Version" />
  </a>
  <a href="https://www.postgresql.org/" target="_blank">
    <img src="https://img.shields.io/badge/postgres-16-blue?logo=postgresql&logoColor=white" alt="PostgreSQL Version" />
  </a>
</p>

# Description

> A version 2 of the Core API for Jaudi projects.

## Project setup

1. Check that the `DATABASE connection` is working "PostgreSQL".
2. Create a new file called `.env` and copy the content from `.env.dest`.
3. **Fill in the `.env` file**.
   1. Add your `database` information

   ```.env
   # DATABASE
   DB_HOST=
   DB_PORT=5432
   DB_USERNAME=
   DB_PASSWORD=
   DB_NAME=
   ```

   2. Add `Cybrid` information <br />from <a href="https://id.sandbox.cybrid.app/">Cybrid IdP</a> create a new <ins>Account, Organization and Bank</ins> fill your info.

   ```.env
   # CYBRID
   CYBRID_CLIENT_ID=
   CYBRID_CLIENT_SECRET=
   CYBRID_ORGANIZATION_ID=
   CYBRID_BANK_ID=
   CYBRID_ID_API_URL=https://id.sandbox.cybrid.app
   CYBRID_BANK_API_URL=https://bank.sandbox.cybrid.app
   ```

   3. After running your app, you will get the `AWS Cognito` info in the console info, please add it.

   ```.env
   # AWS COGNITO
   COGNITO_USER_POOL_ID=
   COGNITO_CLIENT_ID=
   COGNITO_CLIENT_SECRET=
   COGNITO_ENDPOINT=http://localhost:9229
   COGNITO_TEMPORARY_PASSWORD=0000
   COGNITO_REGION=local# us-east-1
   ```

---

```bash
$ npm install
```

## Run the project

```bash
$ npm run dev
```

now, your app is working on
http://localhost:3000.
