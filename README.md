# NodeJS microservice: Storage of nomenclatures of building systems and assemblies through REST API access

## Stack
* NodeJS + TypeScript + Express
* JWT Authentication
* Swagger
* Sequelize (MySQL/MongoDB compatible)
* Unit-tests
* MySQL

## With Docker
```
docker-compose up -d
```

## Without Docker
* MySQL or MongoDB must be installed into OS
* In App directory package.json must be inited
```
npm init
```
* App must be build, then test, then started.
```
npm run build && \
npm run test && \
npm run serve
```
* After test operation nomenclatures table would be empty, therefore
  your must load you nomenclature tree through UIUploader page.

## How to use
### CSV data uploading
The sample CSV-file with nomenclatures tree located in /uploads/nomenclature.csv 
this file must be uploaded once through UI uploader https://sminex.cvvrk.ru/upload.html

### API Docs
Swagger API Docs https://sminex.cvvrk.ru/api-docs/

### Authorization
User: testuser\
Pass: testpassword\
Link for POST authorization https://sminex.cvvrk.ru/auth/login
(request parameters available in API Docs) 

### Nomenclature workflow
Link for GET + JWT token https://sminex.cvvrk.ru/api/nomenclature
(request parameters available in API Docs)
#### Requests examples:
* https://sminex.cvvrk.ru/api/nomenclature?code=A1010100
* https://sminex.cvvrk.ru/api/nomenclature?parent_code=A1010100

## App directories map
````
.
├── build (result files)
│   ├── ...
│   ├── ...
│   └── ...
├── docker-files (Docker initial config files for database and web-server)
│   ├── init.sql (create database and user for app)
│   └── nginx.conf (web-server config)
├── html
│   └── upload.html (simple UI for nomenclature file uploading)
├── src
│   ├── database
│   │   ├── database.ts (settings of DB connection, engine control)
│   │   └── models
│   │       └── nomenclature.ts (Sequelize presentation of a nomenclature table)
│   ├── routes
│   │   └── nomenclature.ts (GET /api/nomenclature route handler)
│   ├── utils
│   │   ├── auth.ts (JWT token helper)
│   │   ├── uploader.ts (CSV-file stream upload helper)
│   │   └── user.ts (list of users with access to API)
│   └── index.ts (app file)
├── test
│   └── api.spec.ts (API unit tests)
├── uploads
│   ├── nomenclature.csv (example of nomenclature tree)
│   └── test.csv (test data for npm run test)
├── docker-compose.yml (docker enviropment file)
├── Dockerfile (instructions set for image creating)
├── package.json (packages and settings of the app)
├── swagger.json (swagger docs config)
├── tsconfig.json (TypeScript compilation config)
└── README.md (app description)
````

# App description
## The application implements the following features:
1) Hierarchy database structure for nomenclature tree storage.
2) API for getting nomenclature tree with paren_code filter.
3) JWT Authentication to API access.

###Source CSV data contain "Code", "Description" and "Level" columns.
|Code       |Description                        |Level|
|-----------|-----------------------------------|-----|
|A          |Foundation and foundations         |1    |
|A10        |Foundations                        |2    |
|A1010      |Standard foundations               |3    |
|A10100     |Foundation plates and grillages    |4    |
|A10110     |Strip foundations                  |5    |
|A10120     |Natural foundations                |5    |
|A10160     |Monolithic foundation slab         |5    |
|A10200     |Foundation walls                   |4    |
|A10210     |Monolithic foundation walls        |5    |
|A1020      |Special parts of foundations       |3    |
|A1020200   |Foundation beams, rand beams       |4    |
|A1020210   |Monolithic foundation beams        |5    |

### The data from this table will have the following tree-structure:
````
Foundation and foundations
└── Foundations
    └── Standard foundations
        ├── Foundation slabs and grillages
        │   ├── Strip foundations
        │   ├── Foundations on a natural basis
        │   └── Monolithic foundation slab
        ├── Foundation walls
        │   └── Monolithic foundation walls
        └── Special parts of foundations
            └── Foundation beams, rund beams
                └── Monolithic foundation walls
````
### Requirements for loading data into the database from a CSV file:
1. It is necessary to load the database from a CSV file
2. The structure of uploaded files is always the same and has the following columns: Code, Description and Level.
3. Database scheme must be developed with Sequelize ORM for SQL and noSQL support.

### Authorization requirements:
1. Must be implement JWT Authentication
2. Access to the API should only be available to authorized users

### Authorization requirements:
1. Must be implement JWT Authentication
2. Access to the API should only be available to authorized users

### API requirements for getting a list of classifiers:
1. The user should be able to get a list of classifiers from the database with all the parameters: Code, Description, Level, Path
2. The response for each classifier must contain a path parameter containing a list of codes of all parent elements plus its own in the correct order.
   For example:

|Code       |Description                        |Level|Path                                 |
|-----------|-----------------------------------|-----|-------------------------------------|
|A          |Foundation and foundations         |1    |[ "A" ]                              |
|A10        |Foundations                        |2    |[ "A", "A10" ]                       |
|A1010      |Standard foundations               |3    |[ "A", "A10", "A1010" ]              |
|A10100     |Foundation plates and grillages    |4    |[ "A", "A10", "A1010", "A1010100" ]  |


3. The user should be able to filter items by a specific parent. Thus, if you make a request to the data from the table from point 2 with the parent_code = "A10" parameter, then in the response it should receive a list of elements with the codes "A10", "A1010", "A1010100".
4. The code must be covered with Unit tests to check the operation of the API