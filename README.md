After Cloning the repo, in order to run docker-compose.yaml
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




consistentbyte/api-gateway:v1
consistentbyte/auth-microservice:v1

consistentbyte/leave-manager-microservice:v1
consistentbyte/notifications-microservice:v1