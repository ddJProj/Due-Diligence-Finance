
This system is built to manage the operations and business for a financial investment firm.

- The actions within the system will be organized based on the actions that need to be performed within the 
- 
- 

# Frontend Application (Components)

## 


##


# Core Application (Components)

## Domain Entities

### UserAccount

This is the primary user account entity used for the system. It should contain attributes for the user's name, their email address, an account id number, and a password for the account.


### Admin account type
This is a user account type that will add admin specific attributes such as an admin id number

### Employee account type
This is a user account type that will add employee specific attributes such as an admin id number

### Client account type
This is a user account type that will add client specific attributes such as an admin id number

### Guest account type
This is a user account type that will add admin guest specific attributes such as an admin id number

## Enums

### Permissions List
The list of all possible permissions (and a brief description) that can be associated with an account type within the system

### Guest Account Upgrade Status
The status of a guest account in the system if they have requested an upgrade into a client account 

### Account Roles
A list of the possible UserAccount role types within the system

## Exceptions
Core program custom exception definitions

## Services
Services that are associated with the various domain specific entities or permission related tasks

## Repositories
The repositories for individual permissions, and base UserAccounts

# Backend Application (Components)

## Controllers
Controller definitions for each of the entities and their relevant endpoints 

## Repositories
Repositories for the various client, guest, employee, and admin account type instances

## Services

### Authorization Services

### System Action Services

### Account Services

### Initialize Permissions Service

### Permission Handler Service

### UserDetail Service

## DTOs

### Accounts

### System Actions

### Authentication

### DTO Mapper

### Permissions DTO

## Config

### Bean related config files

## Exceptions