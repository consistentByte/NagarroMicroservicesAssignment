After Cloning the repo, in order to run using docker-compose.yaml file.
Follow few steps:

1] npm i
2] npx nx run-many --target=build --projects=@org/api-gateway
3] npx nx run-many --target=build --projects=@org/notifications-microservice
4]  npx nx run-many --target=build --projects=@org/leave-manager-microservice
5] npx nx run-many --target=build --projects=@org/auth-microservice  

then docker-compose up.

Two compose files present:
    1] docker-compose.yaml (builds the microservices after above steps as it builds from dockerfile of each service)
    2] docker-compose.all-image.yaml (after cloning simply run docker-compose up and it will run as it runs via service images in dockerhub) ***USE THIS FOR SINGLE COMMAND START


## SINGLE COMMAND STARTUP:
    docker compose -f docker-compose.all-image.yaml up 

## Watch demo video to add mock data to test.
DEMO_VIDEO_URL.txt



RAW DATA:


** Insert these in auth-db

INSERT INTO "employee" ("employeeId", "password", "role") VALUES 
('MGR-001', '$2b$10$eI29y3xG7', 'MANAGER'),
('MGR-002', '$2b$10$eI29y3xG7', 'MANAGER'),
('EMP-001', '$2b$10$eI29y3xG7', 'EMPLOYEE'),
('EMP-002', '$2b$10$eI29y3xG7', 'EMPLOYEE');




** Insert these in leave-manager-db

-- Hierarchy: MGR-001 -> MGR-002 -> EMP-001/EMP-002

-- Employees/Managers
INSERT INTO "Employee" ("employeeId", "name", "role", "reportingManagerId") VALUES 
('MGR-001', 'Alice Senior Manager', 'MANAGER', 'MGR-001'), --  dummy root
('MGR-002', 'Brian Manager', 'MANAGER', 'MGR-001'),
('EMP-001', 'Charlie Employee', 'EMPLOYEE', 'MGR-002'),
('EMP-002', 'Diana Employee', 'EMPLOYEE', 'MGR-002');

-- Leave Balances
INSERT INTO "LeaveBalance" ("id", "employeeId", "type", "balance") VALUES 
-- MGR-001
(gen_random_uuid(), 'MGR-001', 'CASUAL', 12), (gen_random_uuid(), 'MGR-001', 'SICK', 10), (gen_random_uuid(), 'MGR-001', 'PRIVILEGE', 15),
-- MGR-002
(gen_random_uuid(), 'MGR-002', 'CASUAL', 12), (gen_random_uuid(), 'MGR-002', 'SICK', 10), (gen_random_uuid(), 'MGR-002', 'PRIVILEGE', 15),
-- EMP-001
(gen_random_uuid(), 'EMP-001', 'CASUAL', 12), (gen_random_uuid(), 'EMP-001', 'SICK', 10), (gen_random_uuid(), 'EMP-001', 'PRIVILEGE', 15),
-- EMP-002
(gen_random_uuid(), 'EMP-002', 'CASUAL', 12), (gen_random_uuid(), 'EMP-002', 'SICK', 10), (gen_random_uuid(), 'EMP-002', 'PRIVILEGE', 15);





Example of request body to login:
{
    // "employeeId":"MGR-002",
    "employeeId": "EMP-001",
    "password": "$2b$10$eI29y3xG7"       
}


Example of request body to apply leave:
    { "type": "SICK", "startDate": "2026-06-13", "endDate": "2026-06-13" }



# json based api docs for auth & leaves

http://localhost:3002/auth/docs-json

http://127.0.0.1:3002/leaves/docs-json


ACCESS TO BOTH EMPLOYEE & MANAGER
http://127.0.0.1:3002/leave-manager/view-balance


ACCESS TO BOTH EMPLOYEE & MANAGER
http://127.0.0.1:3002/leave-manager/view-balance/employee




http://127.0.0.1:3002/leave-manager/leaves/apply

Example of request body to apply leave:
    { "type": "SICK", "startDate": "2026-06-13", "endDate": "2026-06-13" }



http://127.0.0.1:3002/leave-manager/leaves/employees

http://127.0.0.1:3002/leave-manager/leaves/employees/approve?leaveId=cmq186qio000001mn0e8ex9zm

http://127.0.0.1:3002/leave-manager/leaves/employees/reject?leaveId=cmq186qio000001mn0e8ex9zm

http://127.0.0.1:3002/leave-manager/leaves/employees/cancel?leaveId=cmq186qio000001mn0e8ex9zm

http://127.0.0.1:3002/leave-manager/leaves/employees




## Docker Images of Microservices

consistentbyte/api-gateway:v1
consistentbyte/auth-microservice:v1

consistentbyte/leave-manager-microservice:v1
consistentbyte/notifications-microservice:v1


## Assumptions

1] No signup added assuming users to be added via mock data using adminer and then do testing.

2] Extra functionality: Cancel, employees can cancel their own leaves if they are in pending state.

3] If Role as a Employee required, go to /auth/login and login using employee (EMP-001), and paste the jwt token acquired to the required request.

    If Role as a Manager required, go to /auth/login and login using manager (MGR-002), and paste the jwt token acquired to the required request.

4] To see the notifications logs, 
    a] docker logs -f <notifications-microservice-container-name>
    OR
    b] in docker-compose click on notifications-microservice and see the logs.

5] 
## It is a monorepo, and cross-cutting concerns are added in shared/src.

    a. In `auth/`

    * JWTGuard and JwtStrategy to fetch `jwks.json` and validate JWTs
    * Guard to protect routes

    b. Global Exception Filter

    c. Pino Logger

    d. Distributed Tracing via OpenTelemetry setup in `tracing.ts`

    e. Circuit Breaker based on Opossum



6] To test circuit breaker 
    a. localhost:3002/auth/test/test-breaker
    
    * SAMPLE RESPONSE:
    *   {
            "statusCode": 503,
            "timestamp": "2026-06-08T17:07:19.754Z",
            "message": {
                "message": "circuit is currently in OPEN state. Wait for few mins.",
                "status": 503
            }
        }

    * Make sure to wait for a few mins.

    * For better experience in docker desktop, click on api-gateway, and in Logs CTRL+F  =>Search "OPEN",
        Now wait until HALF-OPEN log arrives, only after then try a health check point on any service, and if success then try other requests,
        as too many breaks can cause consistency issues or half success responses.

7] Files in repo:
    *
    a. API_Documentation.pdf

    b. MICROSERVICE_Diagram.drawio.html

    c. Inter-Service Communication Flow.pdf

    d. DEMO_VIDEO_URL.txt

    e. NagarroMicroservicesAssignment.postman_collection.json
