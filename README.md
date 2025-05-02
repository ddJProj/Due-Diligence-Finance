


- [x] 
- [ ]

# Defining System Requirements:


## Functional requirements:

### System Auth:
- [ ] System will authenticate users using JWT token authentication
- [ ] User actions within the system will be authorized based on their assigned role's permission list
- [ ] The system will automatically log out users after a period of inactivity
- [ ] The system will prevent actions from sources without the proper authorization
- [ ] The system will provide logs for authentication based actions / events
- [ ] 

### Application Front-end Requirements (React, JS/TS based):

- [ ] 
- [ ] The web application will provide a  login dashboard that can be accessed via the provided web-link once the application is live.
- [ ] The system will provide the user with a front end dashboard that is customized to display actions appropriate to their specific account's permissions.
- [ ] 
- [ ] 
- [ ] 
- [ ] 
- [ ] 
- [ ] 

### Application Core / Back-end Requirements (Java Spring Boot based):


#### Shared / General UserAccount requirements:
- [ ] The system will provide support for the following UserAccount role types, Guest, Client, Employee, and Admin. (Ideally using enum values)
- [ ] 
- [ ] A user of the system can create their initial UserAccount if they do not have one. They will use their email address, and provide the system with a password for the new UserAccount.
- [ ] Relevant password standards will be enforced for all UserAccount passwords
- [ ] 
- [ ] 
- [ ] A newly created UserAccount will automatically be set to the guest UserAccount role type.
- [ ] The system will provide the option for a user to register for a new UserAccount by providing their email, name, and a valid password.
- [ ] An authenticated user with an active session will be able to update their profile information
- [ ] The system will provide a mechanism for users to reset their UserAccount password
- [ ] 
- [ ] 
- [ ] 
- [ ] 

#### Guest Role UserAccount:
- [ ] 
- [ ] 
- [ ] 
- [ ] 
- [ ] 
- [ ] A UserAccount of the role type Guest can request that an admin or employee confirms their account creation and upgrades their UserAccount role from Guest to Client (or admin can directly set the account to employee etc as needed)

#### Client Role UserAccount:
- [ ] The system will provide the mechanism to assign/pair a Client UserAccount to an Employee UserAccount
- [ ] The system will provide the ability to sort and search for specific client UserAccounts based on relevant criterias
- [ ] The system will allow a Client UserAccount's information to be updated in the system
- [ ] The system will automatically provide a Client ID value to UserAccounts with the Client role
- [ ] The system will allow the creation of new Client accounts through the upgrade of a Guest account (managed/approved by an Employee or Admin account type)
- [ ] 

#### Employee Role UserAccount:
- [ ] A UserAccount of the role type Employee can approve a request submitted by a UserAccount of the Guest role type to have their account's role upgraded to the Client type.
- [ ] 
- [ ] 
- [ ] 
- [ ] 
- [ ] 

#### Admin Role UserAccount:
- [ ] A UserAccount of the role type Admin can approve a request submitted by a UserAccount of the Guest role type to have their account's role upgraded to the Client type.
- [ ] An Admin account will be able to view, update, and delete UserAccounts from the system manually in the dashboard
- [ ] The system will provide the mechanism for assigning role values to UserAccounts
- [ ] 
- [ ] 
- [ ] 
- [ ] 
- [ ] 


## Non-Functional Requirements:

#### Maintainability:
- [ ] The system should be developed using TDD based coding practices
- [ ] The system will contain a high percentage of automated test coverage
- [ ] The system will include detailed code documentation
- [ ] The system will implement and utilize logging for troubleshooting where necessary
- [ ] Coding will follow industry best practices for Java Spring boot
- [ ] 


#### System Usability:
- [ ] The user interface provided should be intuitive enough to be used without any prior knowledge of the system.
- [ ] The system should be efficient and usable across multiple platforms
- [ ] Error messages provided in the front end interface to users should be intuitive and give helpful responses related to the error occurring
- [ ] 


### Reliability
- [ ] Handles all errors gracefully (implements custom error handling)
- [ ] Data persistence properly utilizes transactions for rollbacks in the event of operation failures
- [ ] 


## Technical Requirements

### Architecture Requirements:
- [ ] Spring Boot
- [ ] RESTful APIs utilized for communication between layers
- [ ] Layered architecture (with core, backend, frontend modules)
- [ ] Front-end built & implemented using React JS/TS
- [ ] 



### Database & Data Persistence:
- [ ] The system will utilize MySQL / MariaDB for remote data persistence
- [ ] Data access for the core / backend application implemented using Spring Data JPA
- [ ] 
- [ ] 
- [ ] 
- [ ] 


### Testing:

- [ ] All system business logic should include unit tests
- [ ] All API endpoints should be adequately tested with integration tests
- [ ] Testing should appropriately implement mocking for isolation of tests
- [ ] The system should provide test coverage data metrics
- [ ] The system will implement continuous integration via GitHub Actions




### Additional:
- [ ] 
- [ ] 
- [ ] 
- [ ] 
- [ ] 
- [ ] 





