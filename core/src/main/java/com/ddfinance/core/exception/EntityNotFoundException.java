package com.ddfinance.core.exception;

/**
 * Exception thrown when a requested entity cannot be found in the database.
 * This is a runtime exception to allow for cleaner repository and service code.
 * Provides multiple constructors for different use cases.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
public class EntityNotFoundException extends RuntimeException {

    private String entityType;
    private Long entityId;
    private String entityIdentifier;

    /**
     * Constructs a new EntityNotFoundException with the specified message.
     *
     * @param message the detail message
     */
    public EntityNotFoundException(String message) {
        super(message);
    }

    /**
     * Constructs a new EntityNotFoundException for an entity with a numeric ID.
     *
     * @param entityType the type of entity (e.g., "UserAccount", "Client")
     * @param id the numeric ID of the entity
     */
    public EntityNotFoundException(String entityType, Long id) {
        super(String.format("%s not found with id: %d", entityType, id));
        this.entityType = entityType;
        this.entityId = id;
    }

    /**
     * Constructs a new EntityNotFoundException for an entity with a string identifier.
     *
     * @param entityType the type of entity
     * @param identifier the string identifier (e.g., email, username)
     */
    public EntityNotFoundException(String entityType, String identifier) {
        super(String.format("%s not found with identifier: %s", entityType, identifier));
        this.entityType = entityType;
        this.entityIdentifier = identifier;
    }

    /**
     * Creates an EntityNotFoundException for complex search criteria.
     *
     * @param entityType the type of entity
     * @param criteria the search criteria description
     * @return a new EntityNotFoundException
     */
    public static EntityNotFoundException withCriteria(String entityType, String criteria) {
        EntityNotFoundException exception = new EntityNotFoundException(
                String.format("%s not found with criteria: %s", entityType, criteria)
        );
        exception.entityType = entityType;
        return exception;
    }

    /**
     * Gets the type of entity that was not found.
     *
     * @return the entity type
     */
    public String getEntityType() {
        return entityType;
    }

    /**
     * Gets the numeric ID of the entity that was not found.
     *
     * @return the entity ID, or null if not applicable
     */
    public Long getEntityId() {
        return entityId;
    }

    /**
     * Gets the string identifier of the entity that was not found.
     *
     * @return the entity identifier, or null if not applicable
     */
    public String getEntityIdentifier() {
        return entityIdentifier;
    }
}
